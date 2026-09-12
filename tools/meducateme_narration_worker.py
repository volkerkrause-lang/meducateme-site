#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "local-narration" / "config.json"


def load_json(path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    tmp.replace(path)


def git(*args, check=True):
    return subprocess.run(["git", *args], cwd=ROOT, check=check, text=True, capture_output=True)


def device_name():
    import torch
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def normalize_space(text):
    text = text.replace("\u00a0", " ").replace("…", "...")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def apply_pronunciations(text, lang, dictionary):
    merged = {}
    merged.update(dictionary.get("common", {}))
    merged.update(dictionary.get(lang, {}))
    for source in sorted(merged, key=len, reverse=True):
        text = text.replace(source, merged[source])
    return text


def split_semantic(text, max_chars=360):
    text = normalize_space(text)
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    for paragraph in paragraphs:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", paragraph) if s.strip()]
        current = ""
        for sentence in sentences:
            if len(sentence) > max_chars:
                parts = [p.strip() for p in re.split(r"(?<=[;:—,])\s+", sentence) if p.strip()]
            else:
                parts = [sentence]
            for part in parts:
                candidate = f"{current} {part}".strip()
                if current and len(candidate) > max_chars:
                    chunks.append(current)
                    current = part
                else:
                    current = candidate
        if current:
            chunks.append(current)
            current = ""
    return chunks or [text]


def ensure_ffmpeg():
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("ffmpeg is not installed. Run tools/setup_macos_narration.sh first.")


def get_model(config):
    import torch
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    dev = device_name()
    print(f"Narration device: {dev}")
    model = ChatterboxMultilingualTTS.from_pretrained(
        device=dev,
        t3_model=config["model"].get("t3_model", "v3"),
    )
    return model, torch


def job_texts(job):
    texts = dict(job.get("texts", {}))
    source_file = job.get("source_file")
    if source_file:
        payload = load_json(ROOT / source_file)
        if isinstance(payload.get("texts"), dict):
            for lang, text in payload["texts"].items():
                texts.setdefault(lang, text)
        elif payload.get("stages") and not texts.get("en"):
            texts["en"] = " ".join(str(s.get("script", "")).strip() for s in payload["stages"] if s.get("script"))
    return texts


def output_path(config, slug, lang, test=False):
    audio_root = ROOT / config["paths"]["audio_root"]
    if test:
        return audio_root / "voice-tests" / lang / f"{slug}.mp3"
    return audio_root / lang / f"{slug}.mp3"


def render_one(model, torch, config, dictionary, text, lang, output, reference):
    import torchaudio
    ensure_ffmpeg()
    text = apply_pronunciations(normalize_space(text), lang, dictionary)
    chunks = split_semantic(text, int(config["model"].get("max_chunk_chars", 360)))
    pause_ms = int(config["model"].get("pause_ms", 140))
    rendered = []
    for index, chunk in enumerate(chunks, start=1):
        print(f"  {lang}: chunk {index}/{len(chunks)}")
        wav = model.generate(
            chunk,
            language_id=lang,
            audio_prompt_path=str(reference),
            exaggeration=float(config["model"].get("exaggeration", 0.5)),
            cfg_weight=float(config["model"].get("cfg_weight", 0.35)),
            temperature=float(config["model"].get("temperature", 0.8)),
        ).cpu()
        rendered.append(wav)
        if index < len(chunks):
            samples = int(model.sr * pause_ms / 1000)
            rendered.append(torch.zeros((wav.shape[0], samples), dtype=wav.dtype))
    combined = torch.cat(rendered, dim=-1)
    temp_root = ROOT / config["paths"]["temporary"]
    temp_root.mkdir(parents=True, exist_ok=True)
    wav_path = temp_root / f"{output.stem}-{lang}.wav"
    output.parent.mkdir(parents=True, exist_ok=True)
    torchaudio.save(str(wav_path), combined, model.sr)
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
        "-codec:a", "libmp3lame", "-b:a", "128k", str(output)
    ], check=True)
    wav_path.unlink(missing_ok=True)
    if not output.exists() or output.stat().st_size == 0:
        raise RuntimeError(f"Audio validation failed: {output}")


def process_job(job_path, model=None, torch_mod=None):
    config = load_json(CONFIG_PATH)
    dictionary = load_json(ROOT / config["paths"]["pronunciations"])
    manifest_path = ROOT / config["paths"]["manifest"]
    manifest = load_json(manifest_path)
    job = load_json(job_path)
    if job.get("status", "pending") != "pending":
        return False, model, torch_mod

    slug = job.get("slug") or job_path.stem
    texts = job_texts(job)
    languages = job.get("languages") or list(texts.keys())
    force = bool(job.get("force", False))
    test = bool(job.get("test", False))
    if not languages:
        raise RuntimeError("Job contains no languages")

    job["status"] = "processing"
    job["started_at"] = datetime.now(timezone.utc).isoformat()
    save_json(job_path, job)

    completed = []
    try:
        for lang in languages:
            if lang not in config["languages"] or not config["languages"][lang].get("enabled"):
                raise RuntimeError(f"Language not enabled: {lang}")
            text = texts.get(lang)
            if not text:
                raise RuntimeError(f"No narration text supplied for {lang}")
            reference = ROOT / config["languages"][lang]["reference"]
            if not reference.exists():
                raise RuntimeError(f"Missing voice reference: {reference}")
            out = output_path(config, slug, lang, test=test)
            model_version = f"chatterbox-multilingual-{config['model'].get('t3_model','v3')}"
            fingerprint = sha256_text(json.dumps({
                "text": normalize_space(text),
                "lang": lang,
                "model": model_version,
                "exaggeration": config["model"].get("exaggeration"),
                "cfg_weight": config["model"].get("cfg_weight"),
                "temperature": config["model"].get("temperature"),
                "pronunciations": dictionary.get("common", {}) | dictionary.get(lang, {})
            }, sort_keys=True, ensure_ascii=False))
            key = f"{lang}/{slug}"
            existing = manifest["generated"].get(key)
            if out.exists() and existing and existing.get("fingerprint") == fingerprint and not force:
                print(f"Skipping unchanged {key}")
                completed.append({"language": lang, "output": str(out.relative_to(ROOT)), "skipped": True})
                continue
            if out.exists() and not force and not existing:
                print(f"Preserving existing untracked audio {out}; set force=true to replace it")
                completed.append({"language": lang, "output": str(out.relative_to(ROOT)), "skipped": True, "reason": "existing-untracked"})
                continue
            if model is None:
                model, torch_mod = get_model(config)
            print(f"Generating {key}")
            render_one(model, torch_mod, config, dictionary, text, lang, out, reference)
            manifest["generated"][key] = {
                "fingerprint": fingerprint,
                "source_hash": sha256_text(normalize_space(text)),
                "language": lang,
                "model": model_version,
                "output": str(out.relative_to(ROOT)),
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            save_json(manifest_path, manifest)
            completed.append({"language": lang, "output": str(out.relative_to(ROOT)), "skipped": False})

        job["status"] = "completed"
        job["completed_at"] = datetime.now(timezone.utc).isoformat()
        job["results"] = completed
        save_json(job_path, job)

        if config["git"].get("auto_commit", True):
            git("add", str(job_path.relative_to(ROOT)), str(manifest_path.relative_to(ROOT)))
            for item in completed:
                if not item.get("skipped"):
                    git("add", item["output"])
            staged = git("diff", "--cached", "--quiet", check=False)
            if staged.returncode != 0:
                git("commit", "-m", f"Generate narration: {slug}")
                if config["git"].get("auto_push", True):
                    git("push", config["git"].get("remote", "origin"), f"HEAD:{config['git'].get('branch','main')}")
        return True, model, torch_mod
    except Exception as exc:
        job["status"] = "failed"
        job["failed_at"] = datetime.now(timezone.utc).isoformat()
        job["error"] = str(exc)
        save_json(job_path, job)
        raise


def pending_jobs(config):
    jobs_dir = ROOT / config["paths"]["jobs"]
    jobs_dir.mkdir(parents=True, exist_ok=True)
    return sorted(p for p in jobs_dir.glob("*.json") if load_json(p).get("status", "pending") == "pending")


def run_once():
    config = load_json(CONFIG_PATH)
    jobs = pending_jobs(config)
    if not jobs:
        print("No pending narration jobs")
        return 0
    model = None
    torch_mod = None
    for path in jobs:
        try:
            _, model, torch_mod = process_job(path, model, torch_mod)
        except Exception as exc:
            print(f"FAILED {path.name}: {exc}", file=sys.stderr)
    return 0


def watch(interval):
    print(f"Watching for narration jobs every {interval} seconds. Ctrl-C to stop.")
    while True:
        try:
            git("pull", "--rebase", "origin", "main", check=False)
            run_once()
        except Exception as exc:
            print(f"Worker cycle error: {exc}", file=sys.stderr)
        time.sleep(interval)


def direct_generate(args):
    config = load_json(CONFIG_PATH)
    texts = load_json(ROOT / args.source).get("texts", {})
    job_path = ROOT / config["paths"]["jobs"] / f"manual-{int(time.time())}.json"
    job = {
        "status": "pending",
        "slug": args.slug,
        "languages": args.languages,
        "texts": texts,
        "force": args.force,
        "test": args.test
    }
    save_json(job_path, job)
    process_job(job_path)


def main():
    parser = argparse.ArgumentParser(description="MeducateMe local multilingual narration worker")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("once", help="Process all pending jobs once")
    p_watch = sub.add_parser("watch", help="Continuously pull GitHub and process pending jobs")
    p_watch.add_argument("--interval", type=int, default=60)
    p_gen = sub.add_parser("generate", help="Create and process a local job from a multilingual text JSON file")
    p_gen.add_argument("--source", required=True)
    p_gen.add_argument("--slug", required=True)
    p_gen.add_argument("--languages", nargs="+", default=["en"])
    p_gen.add_argument("--force", action="store_true")
    p_gen.add_argument("--test", action="store_true")
    args = parser.parse_args()
    if args.command == "once":
        raise SystemExit(run_once())
    if args.command == "watch":
        watch(args.interval)
    if args.command == "generate":
        direct_generate(args)


if __name__ == "__main__":
    main()
