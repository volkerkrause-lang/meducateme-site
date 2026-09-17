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
NARRATION = ROOT / "narration" / "tracheostomy-draft.json"
OUT = ROOT / "audio" / "tracheostomy-chatterbox"
REFERENCE = ROOT / "narration" / "references" / "voice-reference.wav"
EXAGGERATION = float(os.environ.get("CHATTERBOX_EXAGGERATION", "0.55"))
CFG_WEIGHT = float(os.environ.get("CHATTERBOX_CFG_WEIGHT", "0.35"))
MAX_CHARS = int(os.environ.get("CHATTERBOX_MAX_CHARS", "280"))
PAUSE_MS = int(os.environ.get("CHATTERBOX_PAUSE_MS", "180"))


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


def render(model, text, stem):
    rendered = []
    for idx, chunk in enumerate(split_script(text), 1):
        wav = model.generate(
            chunk,
            audio_prompt_path=str(REFERENCE),
            exaggeration=EXAGGERATION,
            cfg_weight=CFG_WEIGHT,
        ).cpu()
        rendered.append(wav)
        if idx < len(split_script(text)):
            rendered.append(torch.zeros((wav.shape[0], int(model.sr * PAUSE_MS / 1000)), dtype=wav.dtype))
    combined = torch.cat(rendered, dim=-1)
    OUT.mkdir(parents=True, exist_ok=True)
    wav_path = OUT / f"{stem}.wav"
    mp3_path = OUT / f"{stem}.mp3"
    torchaudio.save(str(wav_path), combined, model.sr)
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(wav_path),"-codec:a","libmp3lame","-b:a","128k",str(mp3_path)], check=True)
    wav_path.unlink(missing_ok=True)


with NARRATION.open(encoding="utf-8") as f:
    data = json.load(f)
if not REFERENCE.exists():
    raise SystemExit(f"Missing reference voice: {REFERENCE}")
requested = os.environ.get("CHATTERBOX_STAGE", "all").strip()
stages = data["stages"] if requested.lower() == "all" else [s for s in data["stages"] if s["id"] == requested]
if not stages:
    raise SystemExit(f"Unknown stage: {requested}")
model = ChatterboxTTS.from_pretrained(device="cuda" if torch.cuda.is_available() else "cpu")
for stage in stages:
    render(model, stage["script"], stage["id"])
