#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

import torch
import torchaudio
from chatterbox.tts import ChatterboxTTS

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / "narration" / "references" / "voice-reference.wav"
OUT = ROOT / "audio" / "voice-tests"

TEXT = (
    "Let's work through this clinically. A child arrives with vomiting and looks unwell. "
    "Before jumping to a diagnosis, ask what the physiology is telling us. "
    "Is this primarily a problem of fluid, electrolytes, metabolism, or something else? "
    "We'll build the answer step by step, and then come back to the child in front of us."
)

# A/B/C comparison. Chatterbox has no explicit British-accent selector; lowering
# CFG reduces how strongly pronunciation/prosody from the reference is carried over.
VARIANTS = {
    "A-current": {"exaggeration": 0.65, "cfg_weight": 0.35},
    "B-neutral-british-subtle": {"exaggeration": 0.55, "cfg_weight": 0.15},
    "C-neutral-british-stronger": {"exaggeration": 0.50, "cfg_weight": 0.00},
}

if not REFERENCE.exists():
    raise SystemExit(f"Missing reference voice: {REFERENCE}")

OUT.mkdir(parents=True, exist_ok=True)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = ChatterboxTTS.from_pretrained(device=device)

for name, settings in VARIANTS.items():
    print(f"Generating {name}: {settings}")
    wav = model.generate(
        TEXT,
        audio_prompt_path=str(REFERENCE),
        exaggeration=settings["exaggeration"],
        cfg_weight=settings["cfg_weight"],
    ).cpu()
    wav_path = OUT / f"{name}.wav"
    mp3_path = OUT / f"{name}.mp3"
    torchaudio.save(str(wav_path), wav, model.sr)
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
        "-codec:a", "libmp3lame", "-b:a", "128k", str(mp3_path)
    ], check=True)
    wav_path.unlink(missing_ok=True)

print("Generated A/B/C voice accent comparison in audio/voice-tests")
