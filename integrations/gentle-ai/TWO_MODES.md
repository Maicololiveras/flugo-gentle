# Two real-work modes, one observable event stream

The preferred experience is **Workspace**: launch Pi in an embedded interactive terminal and watch the real task flow alongside it. **Observer** attaches a read-only browser to work already happening in the user's terminal. The existing scripted demo remains a teaching aid, not a third way to execute work.

| Mode | Launch | Where the user works | Execution boundary |
|---|---|---|---|
| Observer | `/gentle-live` inside an existing Pi session | Existing terminal | Web receives events only |
| Workspace | `node live/workspace.mjs --cwd /project` then **Start Pi** in the browser | Embedded native Pi terminal | Local PTY forwards keyboard/resize to the single launched Pi process |

Both use the same graph, event log and EN/ES selector. Parent messages and decisions, human prompts, delegations, tool results and settlement are visible when exposed by the runtime. The viewer does not reconstruct private reasoning or infer authority from a prose statement.

## Workspace quick start

Install Pi and the normal Gentle profile first; `gentle-ai install --agent pi` is the upstream setup entrypoint. This plugin does not configure providers or replace Gentle's install process.

From `flugo-gentle`:

```sh
npm --prefix live install
node live/workspace.mjs --cwd /absolute/path/to/project
```

From a staged plugin in a Gentle AI checkout:

```sh
cd plugins/gentle-live-observer
npm install
npm run workspace -- --cwd /absolute/path/to/project
```

Open the printed loopback URL. Click **Start Pi**, then type directly in the embedded terminal. Native Pi login/model controls and Gentle prompts remain there. The launcher loads the observer extension with `pi -e` and passes a bounded local event channel; it sends no task prompt automatically. Optional Pi arguments can follow `--`, for example `node live/workspace.mjs --cwd /project -- --help` for a harmless CLI check.

The browser does not capture an already-running terminal: it launches a **new Pi process** in the selected project. Use Observer for an existing session. On terminal disconnect, Pi continues; **Reconnect terminal** reattaches with bounded output replay. Only one browser controls input at a time. **Stop Pi** terminates that workspace's process. Ctrl+C in the launcher closes the workspace and its Pi process; do not use it to stop unrelated sessions. After process exit, start a new workspace to run a fresh Pi process.

## Local language and token cost

- EN/ES translates interface labels and scripted explanations with a bundled dictionary. Selection is stored locally and does not reset the transcript or terminal.
- Native terminal output, real user input and tool/agent payloads retain their original language. Translating these through a model is not enabled.
- The observer, graph, terminal transport and dictionary **add zero model calls**. They use local CPU/memory/network loopback, not model tokens.
- The task executed by Pi/Gentle consumes the provider's normal tokens, including any subagents that the existing workflow launches. Asking an agent for extra explanatory commentary would also consume tokens; the viewer does not do that.
- No extra subagent is launched to explain the workflow. Only observable messages, prompts and calls are represented. Private thinking blocks never enter the structured feed. The embedded terminal remains native Pi output: its own display settings apply.

## Linux and macOS support

Upstream was checked on 2026-09-20:

| Platform | Gentle AI upstream | This plugin |
|---|---|---|
| Linux amd64 / arm64 | Published binaries | Observer and Workspace target; real PTY/Pi startup smoke passed on Linux amd64 |
| macOS amd64 / arm64 | Published binaries; Homebrew route documented | Same Node/PTY implementation; local Mac acceptance still required |
| Windows | README documents source installation with Go 1.25.10+ | Workspace explicitly declines until separately validated; observer remains the existing portable Node approach |

Sources: [release targets](https://github.com/Gentleman-Programming/gentle-ai/blob/main/.goreleaser.yaml), [installation](https://github.com/Gentleman-Programming/gentle-ai#-get-started), [Pi integration](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/pi.md), [node-pty](https://github.com/microsoft/node-pty), [xterm.js](https://github.com/xtermjs/xterm.js).

Workspace uses Node 24+, `node-pty`, `ws`, `@xterm/xterm` and its fit addon. Browser assets are served locally; there is no CDN dependency. Native PTY compilation may require the platform's C++ build tools and Python. Exact dependency versions are pinned in `live/package.json`; the selected node-pty version is a prerelease and must be reviewed before an upstream release. Observer alone does not import the optional PTY dependencies.

## Coverage and session lifecycle

Pi starts only after an authenticated browser sends Start Pi. The workspace binds to 127.0.0.1 and checks WebSocket origin and a session key. The child extension publishes events through a separate ingest key. The server accepts ingestion only from the launched root Pi PID, preventing inherited observer instances in child processes from being rendered as the parent. This PID field is an attribution check, not an OS security boundary.

Child activity exposed to the parent appears through actual progress/results/messages. Full child-internal activity still requires the explicit upstream bridge described in the main handoff. UI controls do not grant tools permissions: native approvals remain in Pi. Prompt closure does not mean approval, tool request does not prove execution, and agent_end is not settlement.

There is no persistent terminal transcript. Reconnect replays up to 256 KiB of raw terminal output; this bounded buffer can start in the middle of an ANSI sequence and is not a complete terminal-state snapshot. The local agent must test long-output reconnection, resizing and Unicode under real Pi; a serialized terminal snapshot may be needed for exact redraw. Terminal output is raw native output and may contain local project data.

## Validation added

```sh
node --test live/tests/*.test.mjs
npm --prefix live run test:workspace
npm --prefix live run test:visual
```

The workspace smoke starts a real Pi with an isolated temporary profile and confirms PTY output plus the observed session_start event. It sends no model prompt. It passed here on Linux with Pi 0.85.1, Node 24.19.0, node-pty 1.2.0-beta.15, ws 8.21.0 and xterm 6.0.0 / fit 0.11.0 installed locally. This does **not** validate a credentialed Gentle task, browser rendering, all Linux architectures or macOS.

The browser suite now also checks EN/ES switching. Browser execution remains pending because Chromium was unavailable. Run the complete real-task and visual acceptance matrix in LOCAL_AGENT_HANDOFF.md, plus embedded terminal keyboard input, native approval interaction, resize, reconnect, two-tab controller exclusion, stop, session switch and both languages on Linux and macOS. Save sanitized screenshots/video and distinguish synthetic feeds, startup smoke, and real model execution.
