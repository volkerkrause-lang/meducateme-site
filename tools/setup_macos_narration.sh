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
  echo "Homebrew is required for the Mac narration setup." >&2
  echo "Install it from https://brew.sh and run this script again." >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Installing ffmpeg with Homebrew..."
  brew install ffmpeg
fi

# Chatterbox currently requires Python >=3.10 and is most reliably used with Python 3.11.
# Do not use the older Python 3.9 that ships with some macOS installations.
PY311="$(brew --prefix python@3.11 2>/dev/null)/bin/python3.11"
if [[ ! -x "$PY311" ]]; then
  echo "Installing Python 3.11 with Homebrew..."
  brew install python@3.11
  PY311="$(brew --prefix python@3.11)/bin/python3.11"
fi

if [[ ! -x "$PY311" ]]; then
  echo "Python 3.11 installation could not be found." >&2
  exit 1
fi

echo "Using Python: $($PY311 --version)"

VENV="$ROOT/.venv-narration"
if [[ -d "$VENV" ]]; then
  EXISTING_VERSION="$($VENV/bin/python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || true)"
  if [[ "$EXISTING_VERSION" != "3.11" ]]; then
    echo "Replacing existing narration environment (Python ${EXISTING_VERSION:-unknown}) with Python 3.11..."
    rm -rf "$VENV"
  fi
fi

if [[ ! -d "$VENV" ]]; then
  "$PY311" -m venv "$VENV"
fi

source "$VENV/bin/activate"
python -m pip install --upgrade pip setuptools wheel
# Install NumPy explicitly first to avoid legacy dependency build failures.
python -m pip install 'numpy>=1.24,<2.0'
python -m pip install --upgrade chatterbox-tts

python - <<'PY'
import sys
import torch
print("Python:", sys.version.split()[0])
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
