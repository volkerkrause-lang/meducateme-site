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

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required. Install it from https://brew.sh and run this script again." >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Installing ffmpeg with Homebrew..."
  brew install ffmpeg
fi

PYTHON_BIN="$(brew --prefix python@3.11)/bin/python3.11"
if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Installing Python 3.11 with Homebrew..."
  brew install python@3.11
  PYTHON_BIN="$(brew --prefix python@3.11)/bin/python3.11"
fi

echo "Using Python: $($PYTHON_BIN --version)"

VENV="$ROOT/.venv-narration"
rm -rf "$VENV"
"$PYTHON_BIN" -m venv "$VENV"
source "$VENV/bin/activate"

# Chatterbox currently depends on resemble-perth, which imports pkg_resources.
# setuptools 81+ removes pkg_resources and causes PerthImplicitWatermarker to be None.
python -m pip install --upgrade pip wheel
python -m pip install "setuptools<81" "numpy<2"
python -m pip install --upgrade chatterbox-tts
# Re-assert the compatible setuptools pin in case a dependency upgraded it.
python -m pip install --force-reinstall "setuptools<81"

python - <<'PY'
import torch
import perth
print("Python:", __import__('sys').version.split()[0])
print("PyTorch:", torch.__version__)
print("MPS built:", torch.backends.mps.is_built() if hasattr(torch.backends, "mps") else False)
print("MPS available:", torch.backends.mps.is_available() if hasattr(torch.backends, "mps") else False)
print("Perth watermarker available:", callable(getattr(perth, "PerthImplicitWatermarker", None)))
if not callable(getattr(perth, "PerthImplicitWatermarker", None)):
    raise SystemExit("ERROR: Chatterbox Perth watermark dependency did not initialise correctly.")
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
