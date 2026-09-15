from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ROOT / "lessons"


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a modular MeducateMe lesson scaffold")
    parser.add_argument("lesson_id")
    parser.add_argument("title")
    parser.add_argument("section", choices=["fundamentals", "concepts", "cases"])
    parser.add_argument("--access", choices=["free", "preview", "premium"], default="free")
    parser.add_argument("--sections", nargs="+", required=True, help="Permanent section IDs")
    args = parser.parse_args()

    folder = LESSONS / args.lesson_id
    if folder.exists():
        raise SystemExit(f"Lesson already exists: {folder}")

    section_entries = []
    for sid in args.sections:
        section_entries.append({
            "id": sid,
            "title": sid.replace("-", " ").title(),
            "contentRef": f"content/{sid}.json",
            "narrationRef": f"narration/{sid}.json",
            "audioRef": f"audio/{sid}.mp3",
            "graphicRefs": [],
            "interactionRefs": []
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

    write_json(folder / "lesson.json", {
        "lessonId": args.lesson_id,
        "title": args.title,
        "section": args.section,
        "access": args.access,
        "version": 1,
        "sections": section_entries
    })

    (folder / "graphics").mkdir(parents=True, exist_ok=True)
    (folder / "audio").mkdir(parents=True, exist_ok=True)
    (folder / "interactions").mkdir(parents=True, exist_ok=True)

    print(f"Created {args.lesson_id}")
    print(f"Open with: lesson-player.html?lesson={args.lesson_id}")


if __name__ == "__main__":
    main()
