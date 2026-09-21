# Legacy Gentle session simulator

This archived simulator presents an animated Gentle Shell, Gentle AI, and Pi session—from the first user message to the final response—with ODD, TDD, and RDD examples. The interface itself remains in Spanish; this documentation is English.

![Parent session and worker return](../Portada_Flujo.png)

- **[Complete 5:57 video](../Gentle_Sesion_Completa.mp4):** four examples with animated typing, conversation, result cards, and SVG context handoffs. The video has no audio; its embedded on-screen copy is Spanish.
- **[Interactive simulator](../Simulador_Gentle.html):** download and open it directly in a browser. It runs offline and provides playback, pause, speed, stepping, expandable cards, and a user-decision control. The simulator UI is Spanish.
- **[Workflow contracts and source guide](GENTLE_ODD_TDD_RDD_GUIDE.md):** English documentation of the rules, exceptions, and verified discrepancies between documentation and code.

## Included examples

| Scenario | What it demonstrates |
|---|---|
| Small text correction | Proportional ODD, a bounded edit, and verification |
| CSV export | Exploration, an ODD document and Engram mirror, delegation, a worker → parent → user → worker decision, TDD, and review |
| Access authorization | High risk, RDD, refutation, bounded correction, directed validation, and ACK |
| Resume a task | Memory unavailable, document recovery, relaunch, and alternate verification |

The video follows the default responses. The HTML lets the viewer choose the export scope or decline review. All messages and outputs are illustrative: no model, memory service, or tool is connected. The simulator presents observable actions and contracts, never private reasoning. Consent dialogs are simplified for teaching.

## Editable source

- `simulador/create_scenarios.py` — script and alternatives; generates `scenarios.json`.
- `simulador/engine.js` — state, decisions, time, and separate parent/child history.
- `simulador/app.js` and `simulador/style.css` — terminal UI and animated SVG relationships.
- `simulador/build.py` — generates the standalone HTML.
- `simulador/render_session.py` — generates SVG scenes, rasterizes them, and exports the MP4 with typing and animated particles.
- `simulador/timeline.json` — timing for the 69 video steps.

## Regenerate the simulator

Prerequisites: Python 3, Node.js, and FFmpeg on `PATH`. Video rendering uses DejaVu Sans Mono on Linux (`/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf`).

```bash
python -m pip install -r requirements.txt
python simulador/create_scenarios.py
python simulador/build.py
node simulador/engine.test.cjs
python simulador/render_session.py
```

Use `python simulador/render_session.py --svg-only` to export only the SVG diagrams for each step. Use `--frames-only` to include PNG frames. Generated files go to `session-frames/`, which is excluded from Git because it is reproducible.

Validation covered blocking decisions, alternatives, parent/child separation, waiting for `agent_settled`, and closure of all four scenarios. Representative rasterized SVG scenes and the MP4 were inspected technically. The archived Spanish HTML was not exercised in a real browser in the original validation environment.

## References and limits

The simulator and source guide pin the consulted Gentle AI revision (`f0782af`) and Gentle Shell revision (`5454832`). The official ODD, RDD, orchestration, and review diagrams informed the script contracts; this is not presented as a literal application recording.

`Gentle_Flujo_Animado.html`, `Gentle_Flujo_Animado.svg`, and `fuentes/` retain an earlier diagram-first explanation as complementary material. See [regeneration notes](REGENERATION.md). The maintained deliverable is the English Live Observer documented in the repository root README.
