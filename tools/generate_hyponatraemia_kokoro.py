import json
import pathlib
import subprocess
import os
import numpy as np
import soundfile as sf
from kokoro import KPipeline

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "narration" / "hyponatraemia.json"
OUTPUT_DIR = ROOT / "audio" / "hyponatraemia"
VOICE = os.getenv("KOKORO_VOICE", "bm_george")
SPEED = float(os.getenv("KOKORO_SPEED", "0.94"))


def main():
    spec = json.loads(SOURCE.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    pipeline = KPipeline(lang_code="b")

    for index, stage in enumerate(spec["stages"], start=1):
        target = OUTPUT_DIR / f"{stage['id']}.mp3"
        temp_wav = OUTPUT_DIR / f".{stage['id']}.wav"
        print(f"[{index}/{len(spec['stages'])}] {stage['id']} — {VOICE}")
        chunks = []
        for _, _, audio in pipeline(stage["script"], voice=VOICE, speed=SPEED, split_pattern=r"\n+"):
            chunks.append(np.asarray(audio, dtype=np.float32))
        if not chunks:
            raise RuntimeError(f"Kokoro produced no audio for {stage['id']}")
        combined = np.concatenate(chunks)
        sf.write(temp_wav, combined, 24000)
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(temp_wav),
            "-codec:a", "libmp3lame", "-b:a", "96k", str(target)
        ], check=True)
        temp_wav.unlink(missing_ok=True)

    print(f"Created {len(spec['stages'])} Kokoro narration files with {VOICE}")


if __name__ == "__main__":
    main()
