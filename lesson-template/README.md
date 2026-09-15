# MeducateMe modular lesson standard

Use this structure for every new lesson. Existing lessons remain legacy until deliberately migrated.

## Principle
Separate lesson content from website machinery without making lessons creatively rigid. The shared player is a technical shell, not a fixed teaching template.

## Permanent identity
- Every lesson gets one permanent `lessonId`. This is the identity used by metadata and future access/paywall logic. Never change it after publication.
- Every section gets one permanent `id`. Section IDs are for editing, narration, graphics, interactions, progress and analytics. They do not replace the lesson ID and do not create separate paywall products.

## Status without duplicate versions
Each canonical lesson has exactly one status: `draft`, `review` or `live`.
- `draft`: directly reviewable on the main site by URL, not publicly listed.
- `review`: directly reviewable on the main site by URL, not publicly listed.
- `live`: eligible for automatic listing in the appropriate public library.

Do not create separate draft/review/live copies of a lesson. Change the status of the same canonical lesson.

## Separate editable parts
For each section, keep the following separate wherever practical:
- visible teaching content
- narration script
- audio file
- graphics/diagrams
- interaction configuration
- optional custom section code

A small correction should change the smallest relevant component only. Do not rewrite the complete lesson merely to correct one fact, caption, question, narration sentence or graphic.

## Recommended folder shape

```
lessons/<lesson-id>/
  lesson.json
  content/
    <section-id>.json
  narration/
    <section-id>.json
  graphics/
    ...
  audio/
    <section-id>.mp3
  interactions/
    ...
  custom/
    ... optional bespoke section modules
```

## Flexibility rule
The shared player handles navigation, audio controls, captions, responsive behaviour, status, paywall metadata and section loading. It must not force every lesson into the same teaching design.

Most sections can use normal data-driven content. When a topic needs a unique animation, diagram or interaction, set that section's `customModule` to a lesson-specific JavaScript module in `custom/`. That module can render a completely bespoke section while the rest of the lesson still uses the shared technical shell.

Do not build a general medical graphics library unless a genuinely reusable need emerges. Medical graphics should normally be designed for the individual lesson.

## Editing rules
1. Lesson IDs and section IDs are immutable once published.
2. Titles, wording and appearance may change without changing IDs.
3. Changing one section must not require regenerating unrelated audio sections.
4. Old lesson URLs must redirect to the canonical lesson URL rather than retain independent stale copies.
5. `access` remains lesson-level (`free`, `preview`, `premium`) unless a future paywall deliberately supports section previews.
6. Graphics should be linked to section IDs so they can be replaced independently.
7. Narration generation should be section-scoped wherever possible.
8. Medical-content automation is advisory for nuanced clinical statements; structural failures can block publication.
9. Review warnings include missing references, placeholders and numerical/unit differences between narration and visible content.
10. Only `live` modular lessons should be automatically listed publicly.

## Creation and status tools
Create a new lesson with `tools/create_modular_lesson.py`. It creates the folders, permanent IDs, section files and registry entry. It removes clerical setup; it does not design the teaching content.

Use `tools/set_lesson_status.py <lesson-id> draft|review|live` to change status safely in both the lesson manifest and registry without creating another version.

## QA dashboard
`qa-dashboard.html` is an internal utility page for future modular lessons. It is intentionally not linked from normal public navigation and has `noindex,nofollow`. It shows status, section counts, content/narration/audio completeness, references and section-ID integrity.

Because MeducateMe is currently a public static site, this page is not cryptographically private: someone who already knows its URL could open it. Do not place secrets, patient data or confidential material in lesson manifests or the QA dashboard.

## Migration
Existing lessons do not need to be rewritten solely to adopt this standard. Migrate them gradually only when they next require substantial work. All newly created lessons should use the modular structure from the start.
