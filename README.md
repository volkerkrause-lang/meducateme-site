# meducateme-site

## MeducateMe lesson standard

### Chunked narration
All new and substantially revised narrated lessons should use **small semantic narration chunks** rather than one audio file per whole lesson stage.

A stage should normally be split at natural teaching beats (for example: setup, mechanism 1, mechanism 2, feedback, synthesis). Each chunk has:
- a stable chunk ID;
- its own script text;
- its own generated audio file;
- its own visual/animation cue sequence;
- a content hash/checksum so unchanged chunks can reuse existing audio.

When wording changes, regenerate only the chunks whose script content changed. Do not regenerate unaffected narration.

The lesson player should play chunks seamlessly in sequence so the learner experiences continuous narration. Visual changes should be driven by chunk boundaries and optional within-chunk cues rather than estimating the position from one long MP3.

Keep chunks meaningful rather than sentence-by-sentence: typically one teaching idea per chunk. This is the default architecture for MeducateMe narration going forward.
