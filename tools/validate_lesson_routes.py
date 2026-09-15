from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

CANONICAL = {
    "fundamental-cortisol-physiology": "fundamental-cortisol-guided.html",
}

ALIASES = {
    "fundamental-cortisol.html": "fundamental-cortisol-guided.html",
    "fundamental-cortisol-session.html": "fundamental-cortisol-guided.html",
}

TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".yml", ".yaml", ".py"}
EXCLUDE_DIRS = {".git", "audio"}
EXCLUDE_FILES = {
    "tools/validate_lesson_routes.py",
}

errors = []

for lesson_id, canonical in CANONICAL.items():
    if not (ROOT / canonical).is_file():
        errors.append(f"{lesson_id}: canonical lesson is missing: {canonical}")

for alias, canonical in ALIASES.items():
    path = ROOT / alias
    if not path.is_file():
        errors.append(f"Legacy lesson alias is missing: {alias}")
        continue
    text = path.read_text(encoding="utf-8")
    if canonical not in text or "window.location.replace" not in text:
        errors.append(f"{alias} must redirect to {canonical}")

metadata = ROOT / "lesson-metadata.js"
if metadata.is_file():
    text = metadata.read_text(encoding="utf-8")
    for lesson_id, canonical in CANONICAL.items():
        if lesson_id not in text or f"href: '{canonical}'" not in text:
            errors.append(f"lesson-metadata.js must map {lesson_id} to {canonical}")
else:
    errors.append("lesson-metadata.js is missing")

for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    rel = path.relative_to(ROOT).as_posix()
    if rel in EXCLUDE_FILES or any(part in EXCLUDE_DIRS for part in path.relative_to(ROOT).parts):
        continue
    if rel in ALIASES:
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    for alias, canonical in ALIASES.items():
        if alias in text:
            # lesson-metadata.js deliberately records aliases so old URLs can still be identified.
            if rel == "lesson-metadata.js":
                continue
            errors.append(f"{rel} references retired lesson URL {alias}; use {canonical}")

if errors:
    print("Lesson route validation failed:\n")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Lesson route validation passed.")
