# MeducateMe Draft Library

This area defines the development workflow for lessons that are not ready for the live site.

## States

1. Draft — active development; unlimited review/revision cycles.
2. Ready for review — content is coherent enough for a full review, but remains unpublished.
3. Approved — explicitly approved for publication.
4. Published — merged into the live site.

Reviewing a lesson never changes its publication state automatically.

## Version history

Every revision is committed to Git. Previous versions remain recoverable from commit history.

## Publication safety

- Never publish from a Draft or Ready-for-review state.
- Publication requires explicit approval.
- Individual lessons may be published independently.
- A batch publication may include Approved lessons only.
- Draft work must not be merged into `main` merely to obtain a preview.

## Preview convention

The Draft Library is the single entry point. Each lesson may use its own technical preview URL underneath, but the reviewer should not need to manage or remember those URLs.

## Current drafts

- Paediatric Tracheostomy — `draft-tracheostomy-clinical-concept` — Draft.
