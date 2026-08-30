import json
import os
import pathlib
import subprocess
import wave

from google import genai
from google.genai import types

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "narration" / "dka.json"
OUTPUT_DIR = ROOT / "audio" / "dka"
MODEL = os.getenv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
VOICE = os.getenv("GEMINI_TTS_VOICE", "Gacrux")


def write_wav(path: pathlib.Path, pcm: bytes, channels=1, rate=24000, sample_width=2):
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)


def main():
    if not os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
        raise SystemExit("GEMINI_API_KEY (or GOOGLE_API_KEY) is required")

    spec = json.loads(SOURCE.read_text(encoding="utf-8"))
    profile = spec["voice_profile"]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    client = genai.Client()

    for index, stage in enumerate(spec["stages"], start=1):
        target = OUTPUT_DIR / f"{stage['id']}.mp3"
        temp_wav = OUTPUT_DIR / f".{stage['id']}.wav"

        prompt = (
            f"Audio profile: {profile}\n\n"
            "Director's notes: Read the transcript exactly as written. "
            "Use natural sentence rhythm and short, thoughtful pauses. "
            "Sound like an experienced British medical lecturer speaking spontaneously, "
            "not like a synthetic announcer. Do not add words, sound effects, sighs, laughs, "
            "or other non-verbal noises.\n\n"
            f"Transcript:\n{stage['script']}"
        )

        print(f"[{index}/{len(spec['stages'])}] Generating {target.name} with {MODEL} / {VOICE}")
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=VOICE)
                    )
                ),
            ),
        )
        pcm = response.candidates[0].content.parts[0].inline_data.data
        write_wav(temp_wav, pcm)
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(temp_wav),
                "-codec:a", "libmp3lame", "-b:a", "96k", str(target),
            ],
            check=True,
        )
        temp_wav.unlink(missing_ok=True)

    print(f"Created {len(spec['stages'])} narration files in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
