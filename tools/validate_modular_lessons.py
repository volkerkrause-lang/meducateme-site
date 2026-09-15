from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ROOT / "lessons"
ALLOWED_ACCESS = {"free", "preview", "premium"}
ALLOWED_SECTIONS = {"fundamentals", "concepts", "cases"}


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def validate_manifest(path: Path) -> None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        fail(f"{path.relative_to(ROOT)} is not valid JSON: {exc}")

    lesson_id = data.get("lessonId")
    if not isinstance(lesson_id, str) or not lesson_id.strip():
        fail(f"{path.relative_to(ROOT)} needs a permanent lessonId")

    access = data.get("access")
    if access not in ALLOWED_ACCESS:
        fail(f"{lesson_id}: access must be one of {sorted(ALLOWED_ACCESS)}")

    section_group = data.get("section")
    if section_group not in ALLOWED_SECTIONS:
        fail(f"{lesson_id}: section must be one of {sorted(ALLOWED_SECTIONS)}")

    sections = data.get("sections")
    if not isinstance(sections, list) or not sections:
        fail(f"{lesson_id}: sections must be a non-empty list")

    seen = set()
    for index, section in enumerate(sections, start=1):
        sid = section.get("id") if isinstance(section, dict) else None
        if not isinstance(sid, str) or not sid.strip():
            fail(f"{lesson_id}: section {index} needs a permanent id")
        if sid in seen:
            fail(f"{lesson_id}: duplicate section id {sid}")
        seen.add(sid)

        for key in ("contentRef", "narrationRef", "audioRef"):
            ref = section.get(key)
            if not isinstance(ref, str) or not ref.strip():
                fail(f"{lesson_id}/{sid}: missing {key}")

    print(f"OK: {lesson_id} ({len(sections)} sections)")


def main() -> None:
    if not LESSONS.exists():
        print("No modular lessons directory yet; nothing to validate.")
        return

    manifests = sorted(LESSONS.glob("*/lesson.json"))
    if not manifests:
        print("No modular lesson manifests yet; nothing to validate.")
        return

    lesson_ids = set()
    for manifest in manifests:
        data = json.loads(manifest.read_text(encoding="utf-8"))
        lesson_id = data.get("lessonId")
        if lesson_id in lesson_ids:
            fail(f"Duplicate lessonId across manifests: {lesson_id}")
        lesson_ids.add(lesson_id)
        validate_manifest(manifest)


if __name__ == "__main__":
    main()
