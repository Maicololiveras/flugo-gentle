# Visual QA outcome: core flows passed; the real-task harness reported a post-settlement failure

The independent plugin passed its 10 Node tests, simulator/build checks, idempotent 22-file staging, isolated Pi package lifecycle, no-model functional load from the staged Gentle AI checkout, synthetic Playwright suite (8/8), and real WSL2 Workspace browser checks. The staged package registered `/gentle-live`, returned its page with HTTP 200, and opened SSE in `mode: live` under isolated Pi 0.85.1. That functional load is **PASS**, while the temporary node-pty harness exit lifecycle is separately **FAIL** because it emitted PASS JSON but retained a Windows ConPTY/node-pty handle until timeout.

One credentialed Windows Observer task also completed its intended README fix and reached settlement. Its acceptance harness is still **FAIL**, not PASS, because startup created `.atl/` and `.gitignore` and Pi Lens created `.pi-lens-probe-home`; the harness rejected those additional fixture paths after settlement.

Review the real-task nuance and platform/packaging limits before treating this as release evidence. The package has not been integrated into Gentle AI's adapter or official release archives.

## Status legend

- **PASS** — executed and met the stated acceptance condition.
- **FAIL** — executed and did not meet the complete harness condition, even if a narrower behavior passed.
- **NOT RUN** — no execution evidence exists.
- **NOT APPLICABLE** — excluded by the current design or platform boundary.

## Environment

| Item | Exact value | Status |
|---|---|---|
| Source checkout | `feat/live-observer-english` at `2aa79665c9700d735a429029ef0be762f67d2e26` before the documented working-tree changes | PASS |
| Disposable Gentle AI checkout | `main` at `f0782af2803a8192477c18d2186795e9c9daa6c3` | PASS |
| Windows host | Windows 10 build `26200`, amd64 | PASS |
| Host Node / npm | Node `24.13.1`; npm `11.10.0` | PASS |
| Host Pi / Gentle AI | Pi `0.85.1`; Gentle AI `3.0.1` | PASS |
| Host build tools | Go `1.26.1 windows/amd64`; Python `3.12.6` | PASS |
| Browser tooling | Playwright `1.62.1`; installed Chromium bundle `chromium-1234` | PASS |
| WSL2 environment | Ubuntu under `Linux 6.6.87.2-microsoft-standard-WSL2 x86_64 GNU/Linux` | PASS |
| WSL2 test toolchain | Node `24.18.0`; npm `11.16.0`; isolated Pi `0.85.1` used by the smoke/acceptance harness | PASS |
| Current unrelated WSL2 Pi on `PATH` | Pi `0.80.10`; not the isolated `0.85.1` test install | NOT APPLICABLE |
| Plugin dependencies | `node-pty 1.2.0-beta.15`, `ws 8.21.0`, `@xterm/xterm 6.0.0`, `@xterm/addon-fit 0.11.0` | PASS |

## Commands and observed outcomes

Commands are shown at the package/repository level. One-off browser harnesses were temporary and were not retained as repository source; their retained JSON is the source of record.

| Command | Outcome | Status |
|---|---|---|
| `npm test` | Simulator: 1/1 passed. | PASS |
| `npm run test:live` | Final Node suite: 10/10 passed, including shutdown idempotence/authorization coverage. | PASS |
| `npm run build:live` | Standalone demo rebuilt without an unintended tracked diff. | PASS |
| `node integrations/gentle-ai/stage-plugin.mjs ../gentle-ai-local` | Dry run resolved the external checkout and listed 22 planned package files. | PASS |
| `node integrations/gentle-ai/stage-plugin.mjs ../gentle-ai-local --apply` | Initial apply wrote only `plugins/gentle-live-observer/**`; reapply reported all 22 files `UNCHANGED`. | PASS |
| Temporary no-model staged-checkout load harness | Under isolated Pi 0.85.1, the staged package registered `/gentle-live`, returned page HTTP 200, and opened SSE in `mode: live`. | PASS |
| Temporary node-pty harness exit lifecycle | The harness emitted PASS JSON after the functional checks, but a Windows ConPTY/node-pty handle remained open until the outer timeout. | FAIL |
| `PI_CODING_AGENT_DIR=<isolated-profile> pi install <absolute-plugin-path>` | Installed one local package entry while preserving unrelated settings. | PASS |
| `PI_CODING_AGENT_DIR=<isolated-profile> pi install <absolute-plugin-path>` | Reinstall remained a single entry; no duplicate was added. | PASS |
| `PI_CODING_AGENT_DIR=<isolated-profile> pi remove <absolute-plugin-path>` | Removed the local package while preserving unrelated packages/settings; no model session started. | PASS |
| `npm run test:workspace` on native Windows | The implementation deliberately rejects native Windows Workspace. | NOT APPLICABLE |
| `npm run test:workspace` inside the isolated WSL2 package | Real Pi `0.85.1` PTY output and `session_start` observed; no model prompt sent. | PASS |
| `npm run test:visual` | Synthetic browser QA passed all 8 checks and terminated cleanly. | PASS |
| Temporary real WSL2 Workspace browser harness | Start gate, Unicode input, resize, EN/ES preservation, second-tab exclusion, reconnect/replay, and owned-process Stop passed. The exact outer harness command was not retained; see `workspace-wsl-report.json`. | PASS |
| `node C:/Users/MAIX/AppData/Local/Temp/real-observer-acceptance.mjs` | Real credentialed Observer task reached `agent_settled` and made the exact README fix, then the harness rejected runtime-created fixture paths. | FAIL |

No credentials are recorded here.

## Defects fixed during QA

| Defect | Fix and evidence | Status |
|---|---|---|
| Windows URL `.pathname` produced invalid artifact paths | Convert file URLs with `fileURLToPath`; screenshots/report now write on Windows. | PASS |
| Same-document hash navigation did not reconnect the live feed reliably | Navigate to the base page, then to the keyed URL and reload for the live-feed case. | PASS |
| Exact text matched both event heading and detail text | Scope settlement waits to `#log .event h3` with an exact anchored filter. | PASS |
| Captures occurred mid-animation and EN/ES preservation was only implied | Wait before captures and assert the transcript count before/after each language switch. | PASS |
| Server authorization read a disappearing `server.address().port` during shutdown | Store the bound port once and use it for URLs and authorization. | PASS |
| SSE reconnect/shutdown could hang | Reject late requests with 503, close clients, and return one stable idempotent close promise; regression test added. | PASS |

## Artifact inventory and manual inspection

All retained artifacts are under `live/qa-artifacts/` and are ignored by Git.

### SYNTHETIC — scripted browser feed, no model

- `report.json` — **PASS**, 8/8 checks.
- `demo-1.png` through `demo-4.png`, `spanish.png`, `ipad.png`, `mobile.png`, `live-test-feed.png`, `disconnected.png`.
- `synthetic-playwright-qa.webm`, `latest-contact-sheet.png`.

Manual inspection found readable desktop/tablet/mobile layouts, no horizontal clipping, correct active/decision states, preserved transcript across EN/ES, visible disconnect state, and no browser JavaScript errors.

### REAL PI STARTUP / NO MODEL / NOT TASK

- `workspace-wsl-report.json` — **PASS**.
- `workspace-wsl-en.png`, `workspace-wsl-es.png`, `workspace-wsl-reconnect.png`.
- `workspace-wsl-real-startup.webm`, `workspace-wsl-contact-sheet.png`.

The fixed-size Workspace video contains a gray canvas after the deliberate viewport resize. Manual screenshot and contact-sheet inspection confirmed this is unused recording canvas caused by the resize, **not UI clipping**.

### REAL Gentle/Pi task / sanitized

- `real-observer-report.json` — **FAIL** at the complete harness level.
- `real-observer-session.png`, `real-observer-session.webm`, `real-observer-contact-sheet.png` — sanitized retained evidence.

The actual task behavior passed: real input; read/edit/read calls and results; parent response; distinct `agent_end`; `agent_settled`; and an exact functional correction limited to the fixture `README.md`. No delegation, human prompt, commit, push, remote, or publication occurred.

The harness failed only after settlement because Gentle/Pi created `.atl/` and `.gitignore`, and Pi Lens created `.pi-lens-probe-home`. Its top-level-file assertion reported those paths plus the intentionally changed `README.md` as unexpected. No raw recording, raw PTY buffer, loopback key, session directory, or disposable fixture was retained.

## Requested-case matrix

| Requested case | Result | Notes |
|---|---|---|
| Small real edit | PASS | Credentialed Windows Observer task performed the exact README fix and settled. |
| Actual read/edit/read and parent response | PASS | Visible in the sanitized real-task evidence. |
| Real-task harness as a whole | FAIL | Post-settlement fixture-state assertion described above. |
| Observer stop/reconnect in synthetic browser suite | PASS | Disconnect and clean shutdown exercised. |
| Workspace start/resize/reconnect/two-tab/stop | PASS | Real WSL2 Pi startup, no model prompt. |
| EN/ES transcript/terminal preservation | PASS | Synthetic Observer plus real WSL2 Workspace startup evidence. Real credentialed Observer EN/ES was not reached after the harness failure. |
| Delegation | NOT RUN | No child task was requested or emitted in the credentialed session. |
| Human prompt | NOT RUN | No unresolved decision or approval prompt occurred. |
| Configured TDD lifecycle | NOT RUN | The credentialed task was a README typo fix; no RED/GREEN case was exercised. |
| Native RDD checkpoint | NOT RUN | No review transaction or consent flow was triggered. |
| Memory unavailable/recovery | NOT RUN | Not exercised in the credentialed session. |
| Parallel child work | NOT RUN | No simultaneous child tasks were launched. |
| Real runtime error propagation | NOT RUN | No harmless failed tool case was induced. |
| Full child-internal visibility | NOT APPLICABLE | Current observer shows only child information surfaced through parent-visible progress/results/messages. |

## Platform boundaries

| Platform | Result | Boundary |
|---|---|---|
| Windows Observer | PASS | Credentialed real task validated on Windows. |
| Native Windows Workspace | NOT APPLICABLE | Declined by design pending separate native PTY support/acceptance. |
| WSL2 Linux x86_64 Workspace | PASS | Real Pi startup and browser transport validated under Ubuntu/WSL2. This is not native Linux hardware or distro acceptance. |
| Native Linux amd64 | NOT RUN | No native hardware/distro acceptance. |
| Native Linux arm64 | NOT RUN | No execution evidence. |
| macOS amd64 | NOT RUN | PTY behavior, native dialogs, and Homebrew packaging remain unverified. |
| macOS arm64 | NOT RUN | PTY behavior, native dialogs, and Homebrew packaging remain unverified. |

## Packaging and upstream limits

- The package remains an independent Pi plugin staged under a clean Gentle AI checkout at `plugins/gentle-live-observer/**`; its no-model functional load passed there, while the temporary node-pty harness did not exit cleanly.
- No Gentle AI adapter, installer, TUI, settings, or other source was changed.
- Official Gentle AI release archives do **not** currently carry `plugins/**`; a source-checkout staging pass is not binary-release integration.
- The stage script validates the target, refuses source/destination symlinks, and refuses to overwrite a differing destination file. Identical reapplication is idempotent.
- `pi install ./plugins/gentle-live-observer` is the Pi package route; no `gentle-ai plugin install` command is claimed.
- No official upstream issue, maintainer approval, PR, release, or ownership transfer is claimed.
- No full child-internal event visibility is claimed. A deeper bridge would require explicit upstream work at the child-runner boundary.

## Review conclusion

The independent plugin is ready for review as a Windows Observer and WSL2 Workspace validation candidate, with synthetic visual coverage and one sanitized real task. It is **not** evidence of native Linux/macOS acceptance, official Gentle AI packaging, complete child internals, or a fully passing credentialed acceptance matrix.
