# Review handoff: independent Gentle Live plugin

The independent Pi plugin is implemented and staged successfully; it is **not** integrated into Gentle AI's adapter or official release packaging. Automated, synthetic browser, real WSL2 Workspace-startup, and one credentialed Windows Observer task have been exercised. Read the source repository's root `VISUAL_QA_REPORT.md` first for the complete PASS / FAIL / NOT RUN / NOT APPLICABLE record.

## Review path

1. Review `live/lib/server.mjs`, `live/qa/visual.mjs`, and `live/tests/observer.test.mjs` for the QA-driven fixes.
2. Review `VISUAL_QA_REPORT.md`, especially the real-task harness failure and platform matrix.
3. Confirm staging remains confined to `plugins/gentle-live-observer/**` in a disposable Gentle AI checkout.
4. Treat native Linux/macOS, official packaging, and deeper child visibility as remaining work—not as implied acceptance.

## Verified state

| Area | Outcome |
|---|---|
| Node tests | **PASS** — 10/10 |
| Simulator and demo build | **PASS** |
| Staging apply/reapply | **PASS** — 22 files; identical reapply reports all unchanged |
| Staged-checkout functional load | **PASS** — under isolated Pi 0.85.1, `/gentle-live` registered, its page returned HTTP 200, and SSE opened in `mode: live`; no model was used |
| Temporary node-pty harness exit | **FAIL** — it emitted PASS JSON for the functional checks but retained a Windows ConPTY/node-pty handle until timeout |
| Isolated Pi install/reinstall/remove | **PASS** — unrelated settings preserved; no model session |
| Synthetic Playwright | **PASS** — all nine current checks; screenshots/video manually inspected |
| WSL2 Workspace browser acceptance | **PASS** — real Pi startup/PTY, no model prompt, not a real task |
| Windows Observer credentialed task | Functional task **PASS**; complete harness **FAIL** after settlement because runtime-created fixture paths violated its strict assertion |
| Windows Workspace | **NOT APPLICABLE** by current design |
| Native Linux and macOS | **NOT RUN** |
| Adapter/installer/release integration | **NOT RUN**; no Gentle AI source changes |

The real task showed actual input, read/edit/read calls and results, parent response, `agent_end`, and `agent_settled`. It corrected only the intended README content. Gentle/Pi also created `.atl/` and `.gitignore`; Pi Lens created `.pi-lens-probe-home`. Sanitized browser evidence was retained; raw recording, PTY/session data, access key, and fixture were not.

## Modes and visibility boundary

Read [TWO_MODES.md](TWO_MODES.md) for operation details.

- **Observer** attaches a read-only browser feed to an existing Pi session.
- **Workspace** launches one owned Pi process in a browser-embedded terminal beside the graph.
- EN/ES is a bundled local UI dictionary. Native terminal and event payloads are not model-translated.
- No model call, subagent, or hidden reasoning channel is added by the visualizer.
- Child activity is visible only when the runtime surfaces it to the parent through progress, messages, or results. Full child-internal tool/token visibility is not claimed.

## Stage into a disposable Gentle AI checkout

From the `flugo-gentle` repository:

```sh
node integrations/gentle-ai/stage-plugin.mjs /absolute/path/to/gentle-ai
node integrations/gentle-ai/stage-plugin.mjs /absolute/path/to/gentle-ai --apply
```

The script validates `go.mod`, rejects symlink paths, previews by default, refuses to overwrite differing destination files, and writes only `plugins/gentle-live-observer/**`. Identical reapplication is safe. It does not edit Pi settings, Gentle AI adapters/installers, or start an agent.

The verified disposable target was Gentle AI `main` at `f0782af2803a8192477c18d2186795e9c9daa6c3`. The source baseline was `2aa79665c9700d735a429029ef0be762f67d2e26` on `feat/live-observer-english`. Loading from this staged source checkout passed functionally; the temporary node-pty harness did not shut down cleanly. Neither result is evidence of official release packaging.

## Load through Pi

From the staged package:

```sh
pi install ./plugins/gentle-live-observer
```

Restart Pi or run `/reload`, then run `/gentle-live`. Use `/gentle-live stop` to close the observer. This is Pi's package mechanism; there is no claimed `gentle-ai plugin install` command.

For Workspace:

```sh
cd plugins/gentle-live-observer
npm install
npm run workspace -- --cwd /absolute/path/to/project
```

Open the loopback URL and choose **Start Pi**. The plugin does not configure providers, send a prompt, or start the process before that action.

## Validation commands

```sh
npm test
npm run test:live
npm run build:live
npm --prefix live run test:visual
npm --prefix live run test:workspace
```

The first four applicable checks passed on Windows; Workspace intentionally declines native Windows. `test:workspace` and browser Workspace acceptance passed inside Ubuntu WSL2 with an isolated Pi 0.85.1. WSL2 is not native Linux hardware/distro acceptance.

Generated browser evidence lives in ignored `live/qa-artifacts/`. Labels distinguish:

- **SYNTHETIC** scripted browser feed;
- **REAL PI STARTUP / NO MODEL / NOT TASK** WSL2 Workspace evidence;
- **REAL Gentle/Pi task / sanitized** Windows Observer evidence.

The fixed-size Workspace video shows gray unused canvas after a deliberate viewport resize; screenshots confirm the UI itself is not clipped.

## Remaining acceptance work

| Case | State |
|---|---|
| Delegation and child identity in a credentialed task | NOT RUN |
| Human prompt/answer continuation | NOT RUN |
| Configured TDD RED/GREEN | NOT RUN |
| Native RDD consent/review | NOT RUN |
| Memory-unavailable recovery | NOT RUN |
| Parallel children and real error propagation | NOT RUN |
| Native Linux amd64/arm64 | NOT RUN |
| macOS amd64/arm64, PTY, native dialogs, Homebrew | NOT RUN |

Do not synthesize events into evidence labeled real. Keep human decisions in the terminal and retain only sanitized artifacts.

## Packaging and upstream boundary

Official Gentle AI release archives do not currently include `plugins/**`. A staged source checkout therefore does not prove binary-release installation. Any future opt-in discovery, install/update/remove UI, or bundled-path resolution belongs in Gentle AI and requires its own tests and maintainer review. No adapter/installer source changes, official upstream issue, approval, PR, or release are claimed here.
