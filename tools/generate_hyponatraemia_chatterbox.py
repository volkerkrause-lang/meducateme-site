#!/usr/bin/env python3
import json
import os
import subprocess
import tempfile
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parents[1]
NARRATION = ROOT / "narration" / "hyponatraemia.json"
OUT = ROOT / "audio" / "hyponatraemia-chatterbox"
REFERENCE = ROOT / "narration" / "references" / "british-male-deep.wav"

STAGE_ID = os.environ.get("CHATTERBOX_STAGE", "01-reframe")
EXAGGERATION = float(os.environ.get("CHATTERBOX_EXAGGERATION", "0.65"))
CFG_WEIGHT = float(os.environ.get("CHATTERBOX_CFG_WEIGHT", "0.35"))

with NARRATION.open(encoding="utf-8") as f:
    data = json.load(f)

stage = next((s for s in data["stages"] if s["id"] == STAGE_ID), None)
if not stage:
    raise SystemExit(f"Unknown stage: {STAGE_ID}")
if not REFERENCE.exists():
    raise SystemExit(
        f"Missing reference voice: {REFERENCE}. Add a clean 5–20 second deep British male voice sample that you have permission to use."
    )

OUT.mkdir(parents=True, exist_ok=True)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = ChatterboxTTS.from_pretrained(device=device)

wav = model.generate(
    stage["script"],
    audio_prompt_path=str(REFERENCE),
    exaggeration=EXAGGERATION,
    cfg_weight=CFG_WEIGHT,
)

wav_path = OUT / f"{STAGE_ID}.wav"
mp3_path = OUT / f"{STAGE_ID}.mp3"
torchaudio.save(str(wav_path), wav.cpu(), model.sr)
subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
    "-codec:a", "libmp3lame", "-b:a", "128k", str(mp3_path)
], check=True)
wav_path.unlink(missing_ok=True)
print(f"Generated {mp3_path} with exaggeration={EXAGGERATION}, cfg_weight={CFG_WEIGHT}")
