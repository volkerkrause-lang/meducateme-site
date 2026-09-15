from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "lessons" / "registry.json"
VALID = {"draft", "review", "live"}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, data) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    p = argparse.ArgumentParser(description="Change one modular lesson status without creating another version")
    p.add_argument("lesson_id")
    p.add_argument("status", choices=sorted(VALID))
    args = p.parse_args()

    registry = load(REGISTRY)
    entry = next((x for x in registry.get("lessons", []) if x.get("lessonId") == args.lesson_id), None)
    if not entry:
        raise SystemExit(f"Lesson not found in registry: {args.lesson_id}")

    manifest_path = ROOT / entry["manifest"]
    manifest = load(manifest_path)
    manifest["status"] = args.status
    entry["status"] = args.status
    save(manifest_path, manifest)
    save(REGISTRY, registry)

    print(f"{args.lesson_id}: status -> {args.status}")
    if args.status == "live":
        print("The lesson is now eligible for automatic public library listing.")
    else:
        print(f"Review directly at lesson-player.html?lesson={args.lesson_id}")


if __name__ == "__main__":
    main()
