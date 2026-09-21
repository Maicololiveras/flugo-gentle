> Complementary material: this page describes the earlier diagram-based animation. The maintained Live Observer and the archived 5:57 terminal simulation are documented in the [root README](../README.md). The earlier MP4 can be regenerated but is not included.

# Gentle: from request to evidence

This archived 4:34 animation contains 34 scenes and four examples. Its rendered on-screen content is Spanish and it has no voice track; this documentation is English.

## Files

- `Gentle_ODD_TDD_RDD.mp4` — 1280 × 720 H.264 video at 24 fps.
- `Gentle_Flujo_Animado.html` — standalone offline player with pause, speed, chapters, scene stepping, and fullscreen when supported by the browser.
- `Gentle_Flujo_Animado.svg` — SMIL vector animation. Open it directly in a compatible browser; some previewers show only a static SVG or block animation.
- `fuentes/guion.json` — editable scenes, copy, relationships, and timing.
- `fuentes/fuentes.json` — source links pinned to the consulted revisions.

## Chapters

- 00:00 — What happens behind a request.
- 00:24 — Correcting text: small ODD and passive content.
- 00:48 — CSV export: delegation, task document, Engram, TDD, and medium review.
- 02:24 — Permissions: high risk, four perspectives, refutation, and bounded correction.
- 03:28 — Resume: memory unavailable, TDD disabled, and review declined.
- 04:16 — Final workflow integration.

## Scope

This is a teaching simulation, not a Pi execution or benchmark. Scenarios, commands, figures, and results are illustrative. Official diagrams guide the semantics; the animation uses its own script and SVG composition.

The source review covered Gentle AI ODD and RDD diagrams; Gentle Shell orchestration and review diagrams; the ODD protocol; the worker contract; RDD integration; and delegated verification. Exact references are stored in `fuentes/fuentes.json`.

The animation reflects the earlier review of `gentle-ai` at `f0782af2803a8192477c18d2186795e9c9daa6c3` and `gentle-shell` at `54548321be8c8d60891e89ea13bf2b0ed10e1ac5`.

RDD mode is queried rather than assumed. Examples that execute RDD assume it is effectively enabled and that applicable consent is granted. Observed TDD follows the worker's ODD contract; older documentation retains known contradictions. SDD appears only as an explicit choice and is not automatically integrated with RDD.

## Regenerate

Prerequisites: Python 3 with Pillow, Node.js, and FFmpeg on `PATH`. Install the archived renderer's pinned Node dependency without adding it to the Pi package manifest:

```bash
npm install --no-save sharp@0.35.4
```

Then run from the repository root:

```bash
python3 fuentes/crear_animacion.py
node fuentes/render_svg.cjs
python3 fuentes/render_video.py
```

The generator creates SVG scenes and the player, sharp rasterizes the scenes, and the exporter produces the video with node reveals, transitions, and particles following explicit relationships.

## Verification

The SVG was parsed as XML, JavaScript syntax was checked, text was measured inside the canvas, and representative frames were inspected visually. The player was not browser-tested in the original environment because Chromium was unavailable and the download timed out. The rendered video is the primary playback artifact and does not depend on SMIL or JavaScript at viewing time.
