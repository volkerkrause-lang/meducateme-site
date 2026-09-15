from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ROOT / "lessons"
REGISTRY = LESSONS / "registry.json"


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a modular MeducateMe lesson scaffold")
    parser.add_argument("lesson_id")
    parser.add_argument("title")
    parser.add_argument("section", choices=["fundamentals", "concepts", "cases"])
    parser.add_argument("--access", choices=["free", "preview", "premium"], default="free")
    parser.add_argument("--status", choices=["draft", "review", "live"], default="draft")
    parser.add_argument("--sections", nargs="+", required=True, help="Permanent section IDs")
    args = parser.parse_args()

    folder = LESSONS / args.lesson_id
    if folder.exists():
        raise SystemExit(f"Lesson already exists: {folder}")

    if len(set(args.sections)) != len(args.sections):
        raise SystemExit("Section IDs must be unique")

    section_entries = []
    for sid in args.sections:
        section_entries.append({
            "id": sid,
            "title": sid.replace("-", " ").title(),
            "contentRef": f"content/{sid}.json",
            "narrationRef": f"narration/{sid}.json",
            "audioRef": f"audio/{sid}.mp3",
            "graphicRefs": [],
            "interactionRefs": [],
            "customModule": None
        })
        write_json(folder / "content" / f"{sid}.json", {
            "eyebrow": args.title,
            "title": sid.replace("-", " ").title(),
            "blocks": [{"type": "paragraph", "text": "Replace with teaching content."}],
            "graphic": None
        })
        write_json(folder / "narration" / f"{sid}.json", {
            "sectionId": sid,
            "text": "Replace with narration for this section."
        })

    manifest = {
        "lessonId": args.lesson_id,
        "title": args.title,
        "section": args.section,
        "access": args.access,
        "status": args.status,
        "version": 1,
        "references": [],
        "sections": section_entries
    }
    write_json(folder / "lesson.json", manifest)

    for name in ("graphics", "audio", "interactions", "custom"):
        (folder / name).mkdir(parents=True, exist_ok=True)

    registry = {"lessons": []}
    if REGISTRY.exists():
        registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    if any(x.get("lessonId") == args.lesson_id for x in registry.get("lessons", [])):
        raise SystemExit("Lesson ID already exists in registry")
    registry.setdefault("lessons", []).append({
        "lessonId": args.lesson_id,
        "title": args.title,
        "section": args.section,
        "status": args.status,
        "access": args.access,
        "manifest": f"lessons/{args.lesson_id}/lesson.json"
    })
    write_json(REGISTRY, registry)

    print(f"Created {args.lesson_id} as {args.status}")
    print(f"Review directly at: lesson-player.html?lesson={args.lesson_id}")
    print("Only lessons marked live are eligible for public listing.")


if __name__ == "__main__":
    main()
