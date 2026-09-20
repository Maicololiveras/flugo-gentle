# Gentle · Behind the session

See the conversation and the observable handoffs behind Gentle AI, Gentle Shell and Pi.

## English simulator and live observer

- **[Open the English demo](Gentle_Live_Demo.html)** — download and open in your browser. Four examples, an animated SVG graph, playback controls, inspectable events and a user decision that returns through the parent.
- **[Install the Live observer](live/README.md)** — connect the same interface to events from your real Pi session with Gentle Shell. User input, delegations, tool progress, questions, results and runtime settlement appear as they happen.

```sh
pi install ./live
```

Restart or reload your Gentle session, then run `/gentle-live` and open the local URL printed in the terminal. Send tasks and answer questions in the terminal. Stop with `/gentle-live stop`.

| Example | What it explains |
|---|---|
| A small change | Proportional ODD and a bounded documentation edit |
| CSV export | Exploration, intent, memory, delegation, worker → parent → user decision, configured TDD and review |
| Authorization fix | High-risk RDD, four perspectives, refutation, scoped repair, directed validation and ACK |
| Resume work | Memory unavailable, document recovery, relaunch and configured checks without claiming TDD |

Demo and Live are visibly distinct. Live shows evidence the runtime exposes; it does not fabricate private child activity, infer a review verdict, or expose private reasoning. The extension is passive and does not replace Gentle's execution or approval flow.

## Development

```sh
node live/build.mjs
node --test live/tests/*.test.mjs
node simulador/engine.test.cjs
node live/demo.mjs
```

The `live/` directory is a self-contained Pi extension package with no runtime dependencies beyond Node and Pi. Its `web/` assets also produce the standalone demo.

## Original Spanish material

The [original interactive simulation](Simulador_Gentle.html), [5:57 video](Gentle_Sesion_Completa.mp4), [source guide](docs/Guia_Gentle_ODD_TDD_RDD.md) and `simulador/` sources remain available in Spanish. The new English interface and examples are in `live/`; the original video has not been translated.

See [integration and coverage](live/README.md) for contracts, installation, data handling and the boundary between parent-visible events and child-internal execution.
