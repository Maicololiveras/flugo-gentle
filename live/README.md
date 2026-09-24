# Gentle Live Observer

An EN/ES event visualizer installed alongside Gentle Shell and Pi. Two real-work modes:

- **Observer**: a local read-only browser subscribes to an existing Pi session. Questions and approvals stay in the existing terminal.
- **Workspace**: a local browser embeds a native Pi terminal next to the live event flow. Start Pi explicitly and perform the task inside that terminal.

The four scripted demos remain available for teaching without running a model or tools.

> **Distribution:** Gentle Live is published as a versioned Pi Git package from this repository. It remains independently owned and is not part of the official Gentle AI release. The upstream Gentle AI community-plugin request is tracked separately in [Gentleman-Programming/gentle-ai#4823](https://github.com/Gentleman-Programming/gentle-ai/issues/4823).

## Quick path

Install the pinned public release, reload Pi, start the observer, and open the exact URL Pi prints:

```sh
pi install git:github.com/Maicololiveras/flugo-gentle@v1.0.0
pi list
```

Restart Pi or run `/reload`, then use:

```text
/gentle-live
```

Open the complete printed loopback URL, including its generated fragment (for example, the entire `http://127.0.0.1:<port>/#<session-key>` value; do not type this placeholder). Continue normal work in the original Pi terminal. When finished:

```text
/gentle-live stop
```

## Complete guide

### 1. Check prerequisites and trust the source

You need:

- Node.js 24 or newer.
- Pi with the event API used by Gentle Shell 3.3.0.
- Your existing Gentle Shell / Gentle AI setup.
- A local clone containing this `live` directory.

Gentle Live does not install a model or change model credentials. Pi packages and extensions execute code with your user account's permissions. Review this package's source before installing or launching it, especially `extensions/observer.ts`, `lib/`, and the package metadata.

### 2. Choose a versioned release, local development install, or temporary launch

#### Option A — versioned Git release (recommended)

```sh
pi install git:github.com/Maicololiveras/flugo-gentle@v1.0.0
pi list
```

The tag pins the exact reviewed source. To move to a later published tag, install that exact new ref; `pi update --extensions` does not move pinned Git refs automatically.

#### Option B — persistent local development install

Use the path to a cloned repository's `live` directory. Relative and absolute paths are supported.

POSIX shell (Linux/macOS, or WSL when Pi runs inside WSL):

```sh
pi install ./live
# Or from another directory:
pi install /absolute/path/to/flugo-gentle/live
pi list
```

Windows PowerShell:

```powershell
pi install .\live
# Or from another directory:
pi install 'C:\absolute\path\to\flugo-gentle\live'
pi list
```

Confirm the local package appears in `pi list`. Restart Pi so it discovers the extension, or run `/reload` in an existing Pi session.

#### Option C — temporary launch without installation

Start Pi from the project you want to work in and load the observer extension for that process only:

```sh
pi -e /absolute/path/to/flugo-gentle/live/extensions/observer.ts
```

Windows PowerShell:

```powershell
pi -e 'C:\absolute\path\to\flugo-gentle\live\extensions\observer.ts'
```

If a Windows launcher reports `0x80070002` or path/wrapper resolution is uncertain, resolve both paths explicitly and invoke `pi.cmd` directly:

```powershell
$pi = (Get-Command pi.cmd -ErrorAction Stop).Source
$observer = (Resolve-Path 'C:\absolute\path\to\flugo-gentle\live\extensions\observer.ts').Path
& $pi -e $observer
```

Windows Terminal is not required; PowerShell in any suitable terminal is enough.

### 3. Start and connect the Observer

1. In the Pi terminal, run `/gentle-live`.
2. Pi prints `Open the live observer in your browser:` followed by a loopback URL.
3. Copy and open that **exact, complete** URL. It has the form `http://127.0.0.1:<port>/#<session-key>`; the port and fragment are generated values. Never substitute the example markers or omit/redact the fragment.
4. Wait for **LIVE · CONNECTED** in the browser. This means the browser's local event stream is connected. A **Session connected** event means the observer received Pi's session start or switch event; neither label means that a model task has completed.
5. Keep the browser and original terminal side by side. Enter prompts, answer questions, and approve actions in the original terminal. The Observer is a read-only view of that normal workflow.

Use the EN/ES selector in the browser to change interface labels. The selection is stored locally, uses a local dictionary, does not reset the transcript, preserves unmatched/native output in its original language, and makes no additional model call.

If the browser reconnects, buffered events are replayed when available. Each Observer URL is session-local: changing Pi sessions or exiting invalidates the old lifecycle, so run `/gentle-live` again and open the newly printed complete URL. Do not reuse or share the old URL.

### 4. Stop the Observer

In the same Pi session, run:

```text
/gentle-live stop
```

Pi reports `Live observer stopped.` Closing only the browser tab does not stop the local server; use the command when the Pi session remains open.

### 5. Optional Workspace mode

Workspace embeds a native Pi terminal beside the graph. It requires the optional local dependencies and a working native PTY toolchain for the target environment.

- **Targets:** Linux and macOS.
- **Windows native:** **NOT APPLICABLE** by current design. Use Observer mode on native Windows.
- **WSL2:** validated under Ubuntu WSL2 x86_64, but this is not native Linux hardware/distro acceptance.

From the cloned repository:

```sh
cd live
npm install
npm run workspace -- --cwd /absolute/path/to/project
```

Then:

1. Open the exact complete `Gentle Workspace:` loopback URL printed in the terminal.
2. Click **Start Pi** in the browser.
3. Perform the task in the embedded Pi terminal. Workspace events appear beside it.
4. Use **Stop** for the Workspace-owned Pi process, or press `Ctrl+C` in the terminal that launched Workspace to close the workspace and its Pi process.

`npm run test:workspace` performs an isolated real-Pi startup smoke without a model prompt. EN/ES still uses the local dictionary and adds no model calls; native output keeps its original language.

Workspace browser acceptance passed under Ubuntu WSL2 x86_64 with Pi 0.85.1, including resize, reconnect, second-tab exclusion and owned-process Stop. This is not native Linux hardware/distro acceptance. Native Linux amd64/arm64 and macOS amd64/arm64 remain **NOT RUN**; macOS PTY behavior, native dialogs and Homebrew packaging are unverified. Native Windows Workspace is **NOT APPLICABLE** by current design, while Windows Observer is validated. Read `integrations/gentle-ai/TWO_MODES.md` (copied to the plugin root when staged) for lifecycle and coverage details.

### 6. Remove an installation

For the versioned Git package:

```sh
pi remove git:github.com/Maicololiveras/flugo-gentle@v1.0.0
pi list
```

For a local development installation, use the **exact same local package source** used during installation:

POSIX example:

```sh
pi remove ./live
pi list
```

Windows PowerShell example:

```powershell
pi remove .\live
pi list
```

If installation used an absolute path, pass that same absolute path to `pi remove`. Restart Pi or run `/reload` after removal. A temporary `pi -e .../observer.ts` launch installs nothing and needs no removal; exit that Pi process when finished.

## Troubleshooting

### `pi`: command not found

Confirm Pi is installed and that the directory containing its launcher is on `PATH`. Open a new shell after changing `PATH`, then run `pi list`. On Windows PowerShell, `Get-Command pi.cmd` should resolve the launcher; if it does, invoke the returned `.Source` path directly.

### Windows launch error `0x80070002`

This generally indicates a launcher/wrapper or path-resolution problem, not a requirement for Windows Terminal. Use the resolved `pi.cmd` PowerShell fallback in step 2, verify that `Resolve-Path` finds `observer.ts`, and keep paths quoted. Also confirm that you launched Pi from the intended project directory.

### The URL is invalid, forbidden, or shows no live feed

Do not open documentation placeholders such as `<port>` or `<session-key>`, and do not use a redacted URL. Run `/gentle-live` and copy the entire URL printed by that Pi session, including `127.0.0.1`, the allocated port, `/`, and the `#...` fragment. Treat the URL as sensitive session-local access; do not paste its key into logs, issues, screenshots, or support messages.

### The browser says `DISCONNECTED · RETRYING`

Keep the originating Pi session running. If it is still active, leave the page open briefly for automatic reconnect and buffered replay. If Pi exited, the session changed, or `/gentle-live stop` was used, start `/gentle-live` again and open the new complete URL. An old tab cannot attach itself to a new Observer lifecycle.

### Port or key questions

There is no fixed port to configure: the Observer binds an available port on `127.0.0.1`. A fresh key and URL are generated for each Observer instance. Do not manually edit, expose, or publish the key. Stop and restart the Observer to rotate both lifecycle and URL.

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

Contract references: [Pi extension events](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), [Gentle Shell delegation implementation at 5454832](https://github.com/Gentleman-Programming/gentle-shell/blob/54548321be8c8d60891e89ea13bf2b0ed10e1ac5/extensions/gentle-agents.ts).

Validation now includes 11 passing Node tests, a passing nine-check synthetic Playwright suite, real WSL2 Workspace startup/browser checks without a model prompt, and one credentialed Windows Observer task. The real task showed actual read/edit/read activity, parent response and settlement, and made the exact intended README fix. Its complete harness is still **FAIL** because Gentle/Pi and Pi Lens created `.atl/`, `.gitignore`, and `.pi-lens-probe-home` in the disposable fixture; sanitized evidence was retained, but no raw recording was kept.

## Visual acceptance

From this directory run `npm install`, `npx playwright install chromium`, then `npm run test:visual`. Inspect `qa-artifacts/` screenshots, recordings and report. These tests use a **synthetic** feed and passed all nine current checks on Windows; they are not a substitute for the separately labeled real-task evidence. See the repository `VISUAL_QA_REPORT.md` and integration handoff for artifact classification and remaining cases.

## Passive benchmarks

The new **Benchmarks** tab keeps local numeric recordings, displays request hooks, tool execution and user interactions, and explains token, cache and cost coverage. It performs no additional LLM requests. See [BENCHMARKS.md](BENCHMARKS.md) for formulas, historical imports, limitations, exports and a reproducible Gentle AI A/B experiment. This functionality lives on `feature/passive-benchmarks`.
