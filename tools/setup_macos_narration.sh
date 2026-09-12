#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "MeducateMe local narration setup"
echo "Repository: $ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This setup script is intended for macOS." >&2
  exit 1
fi

if [[ "$(uname -m)" != "arm64" ]]; then
  echo "Warning: this Mac is not Apple Silicon. The worker can still run, but MPS acceleration will not be available."
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required." >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Installing ffmpeg with Homebrew..."
    brew install ffmpeg
  else
    echo "ffmpeg is missing and Homebrew is not installed." >&2
    echo "Install Homebrew from https://brew.sh and run this script again." >&2
    exit 1
  fi
fi

VENV="$ROOT/.venv-narration"
python3 -m venv "$VENV"
source "$VENV/bin/activate"
python -m pip install --upgrade pip setuptools wheel
python -m pip install --upgrade chatterbox-tts

python - <<'PY'
import torch
print("PyTorch:", torch.__version__)
print("MPS built:", torch.backends.mps.is_built() if hasattr(torch.backends, "mps") else False)
print("MPS available:", torch.backends.mps.is_available() if hasattr(torch.backends, "mps") else False)
if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
    print("SUCCESS: Apple Silicon GPU acceleration is available.")
else:
    print("WARNING: MPS is not available. Narration will fall back to CPU.")
PY

mkdir -p "$ROOT/.local-narration-tmp"
mkdir -p "$ROOT/local-narration/jobs"

echo
echo "Setup complete."
echo "Run the four-language test with:"
echo "  source .venv-narration/bin/activate"
echo "  python tools/meducateme_narration_worker.py generate --source local-narration/tests/voice-test.json --slug voice-test --languages en de fr es --test --force"
echo
echo "To process jobs created from your phone once:"
echo "  python tools/meducateme_narration_worker.py once"
echo
echo "To keep listening for new GitHub jobs:"
echo "  python tools/meducateme_narration_worker.py watch --interval 60"
