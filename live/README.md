# Gentle Live Observer

An EN/ES event visualizer installed alongside Gentle Shell and Pi. Two real-work modes:

- **Observer**: a local read-only browser subscribes to an existing Pi session. Questions and approvals stay in the existing terminal.
- **Workspace**: a local browser embeds a native Pi terminal next to the live event flow. Start Pi explicitly and perform the task inside that terminal.

The four scripted demos remain available for teaching without running a model or tools.

## Run on your machine

Prerequisites: Node.js 24+, Pi with the event API used by Gentle Shell 3.3.0, and your existing Gentle Shell / Gentle AI setup. This package does not install a model or change its credentials.

From the cloned `flugo-gentle` repository:

```sh
pi install ./live
```

Restart your existing Gentle session, or use `/reload`. In its terminal:

```text
/gentle-live
```

Open the local URL printed by Pi. Keep the terminal and browser side by side. Ask your real task in the terminal and watch input, delegations, tool progress, results, human prompts and settlement in the browser.

```text
/gentle-live stop
```

For a temporary installation instead, launch Pi from your target project with the absolute extension path:

```sh
pi -e /absolute/path/to/flugo-gentle/live/extensions/observer.ts
```

On Windows, use a quoted Windows path. `/gentle-live` opens a loopback server on an available port; there is no fixed port to configure. If you change Pi sessions or exit, reopen the observer with `/gentle-live`; each observer instance has a fresh URL.

## Try the English examples

Open `../Gentle_Live_Demo.html` directly in a browser, or run `node live/demo.mjs` from the repository root. Examples cover a small edit, CSV with a user decision and configured TDD, an authorization fix with RDD remediation, and resuming work without memory.

## What is actually observed

| Pi event | Browser behavior |
|---|---|
| `input` | User → parent |
| `agent_start` | Parent running |
| `tool_call` | Requested call, with bounded arguments; a request does not prove execution |
| `tool_execution_update` | Progress returned by the actual runtime, including subagent progress when provided |
| `tool_result` | Returned content, errors and Gentle task identity |
| `message_end` | Visible parent response or Gentle child message/query |
| `ui_prompt_start` / `ui_prompt_end` | Waiting for a person / prompt closed; closing does not prove approval |
| `agent_end` | Low-level run ended, settlement pending |
| `agent_settled` | Runtime settlement observed |

The graph uses tool names for routing (`subagent_*`, `mem_*`, `gentle_ai*`); it does not infer ODD/TDD/RDD verdicts from prose. Review evidence and commands remain inspectable as tool content. Custom tools without a recognized name appear under Tools.

A child is a separate RPC process. This observer sees child information surfaced to the parent through progress, tool results and Gentle messages, **not every child-internal token or tool call**. It does not poll for completion, read private reasoning or subscribe to restricted metrics channels. A deeper upstream integration should expose an explicit observer event at the child runner boundary, with task identity and policy-reviewed visible payloads.

## Local data and lifecycle

The server binds only to `127.0.0.1`. The event feed requires the generated session key and rejects foreign origins and Host headers. It retains at most 500 events in memory and replays them on reconnect, notifying the browser when older history is missing. The page shows the latest 200 events. There is no persistent log or remote transport. Observer has no browser execution endpoint. Workspace adds an authenticated local terminal channel for its explicitly launched Pi process.

Tool text may contain project data: the observer shows that text locally. Structured credential fields, private thinking blocks and image data are omitted; arbitrary free text is not guaranteed to be secret-free. Treat the observer URL as session-local access.

## Validation and source contracts

`node --test live/tests/*.test.mjs` checks visible-content filtering, task identity, query status, settlement, SSE authorization/replay and the passive extension lifecycle with a mocked Pi API. `node live/build.mjs` rebuilds the standalone English demo.

Contract references: [Pi extension events](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), [Gentle Shell delegation implementation at 5454832](https://github.com/Gentleman-Programming/gentle-shell/blob/54548321be8c8d60891e89ea13bf2b0ed10e1ac5/extensions/gentle-agents.ts). Tested without a credentialed model session; validate one real task in your installed Gentle profile before presenting it as an end-to-end runtime recording.

Browser visual validation was attempted but unavailable in the build environment (Chromium was absent and its download timed out). The automated adapter tests do not replace an end-to-end model-session or browser check.

## Visual acceptance

From this directory run `npm install`, `npx playwright install chromium`, then `npm run test:visual`. Inspect `qa-artifacts/` screenshots, recordings and report. These tests use a synthetic feed; a real model-session recording remains a separate acceptance check. See the repository integration handoff for that procedure.

## Workspace mode

For a native Pi terminal alongside the graph, install this directory’s optional dependencies with `npm install`, then run `npm run workspace -- --cwd /absolute/project`. Open the printed URL and click **Start Pi**. Targets Linux/macOS. `npm run test:workspace` performs an isolated real-Pi startup smoke without a model prompt. EN/ES uses a local dictionary and adds no model calls; native output keeps its original language. Read the repository’s `integrations/gentle-ai/TWO_MODES.md` (copied to the plugin root when staged) for lifecycle, dependency and coverage details.
