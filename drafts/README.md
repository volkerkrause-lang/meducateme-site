# MeducateMe Draft Library

This area defines the development workflow for lessons that are not ready for the live teaching library.

## States

1. Draft — active development; unlimited review/revision cycles.
2. Ready for review — coherent enough for full review, still unpublished.
3. Approved — explicitly approved for publication.
4. Published — merged into the live teaching library.

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

The Draft Library at `/drafts/` is the single browser entry point. It is intentionally a public index page on the MeducateMe site. Individual unfinished lessons remain on their draft branches and are opened through their technical preview links. The reviewer does not need to remember those URLs.

## Current drafts

- Paediatric Tracheostomy — `draft-tracheostomy-clinical-concept` — PR #6 — Draft.
