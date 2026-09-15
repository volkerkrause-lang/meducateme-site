from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ROOT / "lessons"
REGISTRY = LESSONS / "registry.json"
VALID_STATUS = {"draft", "review", "live"}
VALID_ACCESS = {"free", "preview", "premium"}
NUMBER_RE = re.compile(r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|kg|mmol/L|mmHg|mL|L|%|bpm|cm|mm|hours?|minutes?)\b", re.I)


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    errors: list[str] = []
    warnings: list[str] = []
    if not REGISTRY.exists():
        print("No modular lesson registry yet.")
        return

    registry = load(REGISTRY).get("lessons", [])
    seen = set()
    for entry in registry:
        lid = entry.get("lessonId")
        if not lid or lid in seen:
            errors.append(f"Registry has missing/duplicate lessonId: {lid!r}")
            continue
        seen.add(lid)
        manifest_path = ROOT / entry.get("manifest", f"lessons/{lid}/lesson.json")
        if not manifest_path.exists():
            errors.append(f"{lid}: manifest missing")
            continue
        m = load(manifest_path)
        if m.get("lessonId") != lid:
            errors.append(f"{lid}: manifest lessonId mismatch")
        if m.get("status") not in VALID_STATUS:
            errors.append(f"{lid}: invalid status")
        if m.get("access") not in VALID_ACCESS:
            errors.append(f"{lid}: invalid access")
        if entry.get("status") != m.get("status"):
            errors.append(f"{lid}: registry status differs from manifest")
        if entry.get("access") != m.get("access"):
            errors.append(f"{lid}: registry access differs from manifest")

        refs = m.get("references", [])
        if m.get("status") in {"review", "live"} and not refs:
            warnings.append(f"{lid}: no lesson references listed")

        section_ids = []
        for sec in m.get("sections", []):
            sid = sec.get("id")
            if not sid or sid in section_ids:
                errors.append(f"{lid}: missing/duplicate section ID {sid!r}")
                continue
            section_ids.append(sid)
            for key in ("contentRef", "narrationRef"):
                ref = sec.get(key)
                if not ref or not (manifest_path.parent / ref).exists():
                    errors.append(f"{lid}/{sid}: missing {key}")
            audio_ref = sec.get("audioRef")
            if m.get("status") == "live" and audio_ref and not (manifest_path.parent / audio_ref).exists():
                errors.append(f"{lid}/{sid}: live lesson audio missing")

            content_path = manifest_path.parent / sec.get("contentRef", "")
            narration_path = manifest_path.parent / sec.get("narrationRef", "")
            if content_path.exists() and narration_path.exists():
                content_text = json.dumps(load(content_path), ensure_ascii=False)
                narration_text = json.dumps(load(narration_path), ensure_ascii=False)
                nums_content = set(NUMBER_RE.findall(content_text))
                nums_narration = set(NUMBER_RE.findall(narration_text))
                if nums_content != nums_narration and (nums_content or nums_narration):
                    warnings.append(f"{lid}/{sid}: numbers/units differ between visible content and narration; review manually")
                if m.get("status") in {"review", "live"} and "Replace with" in content_text + narration_text:
                    errors.append(f"{lid}/{sid}: placeholder text remains")

        if m.get("status") == "live" and not m.get("sections"):
            errors.append(f"{lid}: live lesson has no sections")

    for w in warnings:
        print(f"WARNING: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors:
        raise SystemExit(1)
    print(f"QA complete: {len(registry)} modular lesson(s), {len(warnings)} advisory warning(s).")


if __name__ == "__main__":
    main()
