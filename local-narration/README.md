# MeducateMe local narration worker

This folder supports local multilingual narration generation on an Apple Silicon Mac, with finished MP3 files committed back to GitHub.

## First-time setup on the Mac mini

From the local `meducateme-site` repository:

```bash
bash tools/setup_macos_narration.sh
```

This creates `.venv-narration`, installs Chatterbox TTS, verifies Apple MPS acceleration where available, and checks ffmpeg.

## Run the queued test job once

```bash
source .venv-narration/bin/activate
python tools/meducateme_narration_worker.py once
```

The initial queued job generates English, German, French and Spanish test clips under:

- `audio/voice-tests/en/voice-test.mp3`
- `audio/voice-tests/de/voice-test.mp3`
- `audio/voice-tests/fr/voice-test.mp3`
- `audio/voice-tests/es/voice-test.mp3`

It does not overwrite existing MeducateMe lesson audio.

## Keep the Mac listening for jobs from GitHub

```bash
source .venv-narration/bin/activate
python tools/meducateme_narration_worker.py watch --interval 60
```

The worker pulls `main`, looks for `local-narration/jobs/*.json` with `"status": "pending"`, generates the requested audio, updates the manifest/job status, commits the result, and pushes it to GitHub.

## Job format

```json
{
  "status": "pending",
  "slug": "cortisol",
  "languages": ["en", "de"],
  "texts": {
    "en": "Narration text...",
    "de": "Translated narration text..."
  },
  "force": false,
  "test": false
}
```

Alternatively a job may point to a JSON source using `"source_file"`. A multilingual source should contain a `texts` object keyed by language. An existing English narration file with a `stages` array can be used for English generation; translated text must still be supplied explicitly for other languages.

## Safety rules

- Existing untracked audio is preserved unless `force` is true.
- A fingerprint in `manifest.json` prevents unchanged narration from being regenerated.
- Temporary WAV files live in `.local-narration-tmp` and are removed after MP3 conversion.
- Existing GitHub Actions narration remains separate and is not removed by this worker.
- The source narration text is used for generation; rendered HTML is not scraped.

## Voice and pronunciation

`config.json` controls the Chatterbox model/settings and reference file. `pronunciations.json` is the reusable pronunciation dictionary. Add pronunciation fixes there instead of hand-editing individual audio files.

For better German voice transfer later, a dedicated German reference recording can be added and the `de.reference` entry in `config.json` changed without altering the rest of the workflow.
