from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

LEGACY_BESPOKE = {
    'fundamental-cortisol.html',
    'fundamental-cortisol-guided.html',
    'fundamental-cortisol-session.html',
    'concept-diabetes.html',
    'concept-hyponatraemia.html',
    'case-hyponatremia.html',
    'lesson.html',
}

patterns = ('fundamental-*.html', 'concept-*.html', 'case-*.html')
found = set()
for pattern in patterns:
    found.update(p.name for p in ROOT.glob(pattern))

unexpected = sorted(found - LEGACY_BESPOKE)
if unexpected:
    print('ERROR: New bespoke lesson HTML detected:')
    for name in unexpected:
        print(f'  - {name}')
    print('New lessons must use lessons/<lesson-id>/lesson.json + lesson-player.html.')
    raise SystemExit(1)

print('OK: no new bespoke lesson HTML outside the legacy allowlist')
