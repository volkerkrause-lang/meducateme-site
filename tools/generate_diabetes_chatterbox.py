#!/usr/bin/env python3
import json
import os
import re
import subprocess
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parents[1]
NARRATION = ROOT / "narration" / "diabetes.json"
OUT = ROOT / "audio" / "diabetes-chatterbox"
REFERENCE = ROOT / "narration" / "references" / "voice-reference.wav"
EXAGGERATION = float(os.environ.get("CHATTERBOX_EXAGGERATION", "0.62"))
CFG_WEIGHT = float(os.environ.get("CHATTERBOX_CFG_WEIGHT", "0.35"))
MAX_CHARS = int(os.environ.get("CHATTERBOX_MAX_CHARS", "280"))
PAUSE_MS = int(os.environ.get("CHATTERBOX_PAUSE_MS", "170"))

VIDEO_CUE_NAMES = [
    "01a-after-meal",
    "01b-pancreatic-sensing",
    "01c-receptor-signalling",
    "01d-negative-feedback",
]


def split_script(text, limit=MAX_CHARS):
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks, current = [], ""
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        pieces = re.split(r"(?<=[,;:])\s+", sentence) if len(sentence) > limit else [sentence]
        for piece in pieces:
            candidate = f"{current} {piece}".strip()
            if current and len(candidate) > limit:
                chunks.append(current)
                current = piece
            else:
                current = candidate
    if current:
        chunks.append(current)
    return chunks


def render_text(model, text):
    rendered = []
    chunks = split_script(text)
    for chunk_no, chunk in enumerate(chunks, 1):
        wav = model.generate(
            chunk,
            audio_prompt_path=str(REFERENCE),
            exaggeration=EXAGGERATION,
            cfg_weight=CFG_WEIGHT,
        ).cpu()
        rendered.append(wav)
        if chunk_no < len(chunks):
            silence_samples = int(model.sr * PAUSE_MS / 1000)
            rendered.append(torch.zeros((wav.shape[0], silence_samples), dtype=wav.dtype))
    return torch.cat(rendered, dim=-1)


def atempo_filter(speed):
    # ffmpeg atempo accepts 0.5–2.0 per stage, so chain stages if needed.
    factors = []
    while speed > 2.0:
        factors.append(2.0)
        speed /= 2.0
    while speed < 0.5:
        factors.append(0.5)
        speed /= 0.5
    factors.append(speed)
    return ",".join(f"atempo={f:.6f}" for f in factors)


def save_mp3(model, wav, stem, target_seconds=None):
    wav_path = OUT / f"{stem}.wav"
    mp3_path = OUT / f"{stem}.mp3"
    torchaudio.save(str(wav_path), wav, model.sr)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path)]
    if target_seconds:
        actual_seconds = wav.shape[-1] / model.sr
        speed = actual_seconds / target_seconds
        cmd += ["-filter:a", atempo_filter(speed)]
        print(f"Timing {stem}: {actual_seconds:.2f}s -> {target_seconds:.2f}s (speed {speed:.3f}x)")
    cmd += ["-codec:a", "libmp3lame", "-b:a", "128k", str(mp3_path)]
    subprocess.run(cmd, check=True)
    wav_path.unlink(missing_ok=True)
    print(f"Generated {mp3_path}")


with NARRATION.open(encoding="utf-8") as f:
    data = json.load(f)

if not REFERENCE.exists():
    raise SystemExit(f"Missing reference voice: {REFERENCE}")

OUT.mkdir(parents=True, exist_ok=True)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading Chatterbox on {device}")
model = ChatterboxTTS.from_pretrained(device=device)

requested = os.environ.get("CHATTERBOX_STAGE", "all").strip()
stages = data["stages"] if requested.lower() == "all" else [s for s in data["stages"] if s["id"] == requested]
if not stages:
    raise SystemExit(f"Unknown stage: {requested}")

for stage_no, stage in enumerate(stages, 1):
    print(f"[{stage_no}/{len(stages)}] {stage['id']}")
    if stage["id"] == "01-insulin-film" and stage.get("timed_cues"):
        for cue_no, cue in enumerate(stage["timed_cues"]):
            wav = render_text(model, cue["script"])
            target = float(cue["end"] - cue["start"])
            save_mp3(model, wav, VIDEO_CUE_NAMES[cue_no], target_seconds=target)
    else:
        wav = render_text(model, stage["script"])
        save_mp3(model, wav, stage["id"])

print(f"Completed {len(stages)} diabetes stage(s)")
