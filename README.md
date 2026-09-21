# Gentle · Behind the session

![Gentle Live — Pi terminal and live event observer, in the Gentleman theme](docs/assets/gentle-live-gentleman-cover.png)

*Brand illustration in the Gentleman palette; not a runtime screenshot.*

See the conversation and the observable handoffs behind Gentle AI, Gentle Shell and Pi. Switch EN/ES locally without extra model calls.

## Two live modes, English and Spanish

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

### Workspace: Pi terminal and graph together

```sh
npm --prefix live install
node live/workspace.mjs --cwd /absolute/path/to/project
```

Open the local URL and click **Start Pi**. Work in the embedded terminal while the graph follows observable events. Linux and macOS are the target platforms. Use `/gentle-live` for read-only observation of an existing terminal session. See [two modes, platforms and token cost](integrations/gentle-ai/TWO_MODES.md).

The viewer adds no model calls. Pi/Gentle tasks retain their normal token usage; native responses remain in their original language.

## Gentle AI repository integration

See [plugin staging](integrations/gentle-ai/README.md) and the [local-agent handoff](integrations/gentle-ai/LOCAL_AGENT_HANDOFF.md). The handoff includes remaining installer work, automated visual tests, real-session cases and acceptance evidence.

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
