# MeducateMe Draft Library

This area defines the development workflow for lessons that are not ready for the live site.

## States

1. Draft — active development; unlimited review/revision cycles.
2. Ready for review — coherent enough for full review, still unpublished.
3. Approved — explicitly approved for publication.
4. Published — merged into the live site.

Reviewing a lesson never changes its publication state automatically.

## Version history

Every revision is committed to Git. Previous versions remain recoverable from commit history.

## Publication safety

Publishing is performed by `.github/workflows/publish-approved-drafts.yml` and never by credentials embedded in the Draft Library page.

A PR is publishable only when all of these are true:
- it is open;
- it targets `main`;
- it is no longer a GitHub draft;
- it has the `approved-for-publish` label;
- the manual workflow is run with confirmation `PUBLISH`.

The workflow supports publishing one approved PR or all currently approved PRs. Draft and merely reviewed lessons are rejected.

## Preview convention

The Draft Library is the single entry point. Each lesson may use its own technical preview URL underneath, but the reviewer should not need to manage or remember those URLs.

## Current drafts

- Paediatric Tracheostomy — `draft-tracheostomy-clinical-concept` — PR #6 — Draft.
