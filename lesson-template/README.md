# MeducateMe modular lesson standard

Use this structure for every new lesson.

## Permanent identity
- Every lesson gets one permanent `lessonId`. This is the identity used by lesson metadata and future access/paywall logic. Never change it after publication.
- Every section gets one permanent `id`. Section IDs are for editing, narration, graphics, interactions, progress and analytics. They do not replace the lesson ID and do not create separate paywall products.

## Separate editable parts
For each section, keep the following as separate files or references wherever practical:
- visible teaching content
- narration script
- audio file
- graphics/diagrams
- interaction/MCQ configuration

A small correction should change the smallest relevant component only. Do not rewrite the complete lesson HTML/JS merely to correct one fact, caption, question, narration sentence or graphic.

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
```

The page/controller should render these components using reusable site code rather than embedding all lesson content directly inside one large HTML file.

## Editing rules
1. Lesson IDs and section IDs are immutable once published.
2. Titles and wording may change without changing IDs.
3. Changing one section must not require regenerating unrelated audio sections.
4. Old lesson URLs must redirect to the canonical lesson URL rather than retain independent stale copies.
5. `access` remains lesson-level (`free`, `preview`, `premium`) unless a future paywall deliberately supports section previews.
6. Graphics should be linked to section IDs so they can be replaced independently.
7. Narration generation should be section-scoped wherever possible.

## Migration
Existing lessons do not need to be rewritten solely to adopt this standard. Migrate them gradually when they next require substantial work. All newly created lessons should use the modular structure from the start.
