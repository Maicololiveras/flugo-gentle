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

## Platform boundary

Validated on 2026-09-20:

| Platform | Status | Boundary |
|---|---|---|
| Windows Observer | **PASS** | One credentialed read/edit/read task reached parent response and settlement. The complete harness is still **FAIL** because runtime-created fixture paths violated its post-settlement assertion. |
| Native Windows Workspace | **NOT APPLICABLE** | Explicitly declined by the current implementation. |
| WSL2 Ubuntu x86_64 Workspace | **PASS** | Real Pi 0.85.1 startup, PTY/browser interaction, resize, EN/ES, second-tab exclusion, reconnect and owned-process Stop; no model prompt. This is not native Linux acceptance. |
| Native Linux amd64 / arm64 | **NOT RUN** | No native hardware/distro acceptance evidence. |
| macOS amd64 / arm64 | **NOT RUN** | PTY behavior, native dialogs and Homebrew packaging remain unverified. |

Sources for upstream targets, not acceptance evidence: [release targets](https://github.com/Gentleman-Programming/gentle-ai/blob/main/.goreleaser.yaml), [installation](https://github.com/Gentleman-Programming/gentle-ai#-get-started), [Pi integration](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/pi.md), [node-pty](https://github.com/microsoft/node-pty), and [xterm.js](https://github.com/xtermjs/xterm.js).

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

The workspace smoke starts a real Pi with an isolated temporary profile and confirms PTY output plus the observed session_start event. It sends no model prompt. It passed here on Linux with isolated Pi 0.85.1, Node 24.18.0, node-pty 1.2.0-beta.15, ws 8.21.0 and xterm 6.0.0 / fit 0.11.0 installed locally. This does **not** validate a credentialed Gentle task, browser rendering, all Linux architectures or macOS.

The current Playwright browser suite passed all nine checks on Windows and its screenshots/video were manually inspected. Real WSL2 Workspace browser checks also passed for explicit Start, Unicode input, resize, EN/ES preservation, second-tab exclusion, reconnect/replay and owned-process Stop. The fixed-size recording's gray canvas after deliberate viewport resize is unused canvas, not clipping.

One credentialed Windows Observer task performed the intended README fix through actual read/edit/read calls, produced the parent response and reached settlement. Its complete harness remains **FAIL** because Gentle/Pi created `.atl/` and `.gitignore` and Pi Lens created `.pi-lens-probe-home`; no raw recording was retained. Delegation, human prompt, TDD, RDD, memory-unavailable, parallel-child and error cases remain **NOT RUN** in that real session. See `VISUAL_QA_REPORT.md` in the source repository for artifacts and the complete matrix.
