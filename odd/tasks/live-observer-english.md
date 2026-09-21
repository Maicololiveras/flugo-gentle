# Live observer English integration

Status: complete
Branch: `feat/live-observer-english`
Baseline: `2aa79665c9700d735a429029ef0be762f67d2e26`

## Scope

Finish and validate the independent Pi extension compatible with Gentle, prioritizing:

- Observer mode for an existing Pi terminal session.
- Workspace mode with a locally embedded native Pi terminal.
- Local EN/ES UI switching without additional model calls or translation of native payloads.
- Repeatable staging into a local Gentle AI checkout without modifying Gentle AI to install the plugin.
- Automated, visual, and real Gentle/Pi evidence with honest platform limits.

## Constraints

- Preserve existing local changes and repository instructions.
- Do not present synthetic browser events as a real Gentle/Pi session.
- Do not commit credentials, access keys, or arbitrary real-project transcripts.
- Do not modify inherited legacy generator findings outside the integration scope.
- Do not commit, push, publish, or open a PR without explicit user authorization.
- Engram mirroring is unavailable in this session because the local provider identity could not be resolved.

## Tasks

- [x] T1 — Establish baseline and map implementation gaps
  - Confirm branch/worktree state, versions, repository instructions, architecture, and exact validation commands.
  - Evidence: source HEAD `2aa79665c9700d735a429029ef0be762f67d2e26`; clean clone before expected `odd/` tracking artifact; Windows 10 build 26200, Node 24.13.1, npm 11.10.0, Pi 0.85.1, Gentle AI 3.0.1, Go 1.26.1, Python 3.12.6; staging dry run resolved source paths from an external cwd and listed 22 plugin files; disposable Gentle AI checkout HEAD `f0782af2803a8192477c18d2186795e9c9daa6c3` remained clean.

- [x] T2 — Run focused automated and staging checks
  - Install pinned dependencies as required.
  - Run simulator, live adapter, Workspace smoke, and staging tests.
  - Stage into a disposable local Gentle AI checkout without using it as an installer.
  - Evidence: simulator PASS (1/1); live tests PASS (9/9 via both root and package scripts); demo build PASS with no tracked diff; Windows Workspace smoke NOT APPLICABLE because the implementation intentionally supports Linux/macOS only; WSL2 Linux x86_64 Workspace smoke PASS with Node 24.18.0, npm 11.16.0, isolated Pi 0.85.1, native PTY output, and `session_start`, with no model prompt; 22 files staged only under `../gentle-ai-local/plugins/gentle-live-observer`, second staging run reported all files unchanged; isolated Windows Pi 0.85.1 install/reinstall/remove PASS with one package entry, no duplicate, unrelated package/settings preserved, and no model session.

- [x] T3 — Run and inspect visual QA for Observer, Workspace, and EN/ES
  - Install Chromium if available, run the browser suite, inspect every generated screenshot/report/recording, and fix reproducible defects.
  - Evidence: Windows Playwright synthetic suite PASS with 8/8 checks; manually inspected four desktop demos, Spanish, iPad, mobile, live-feed, disconnected screenshots, and labeled video contact sheet; fixed Windows URL-to-path handling, same-document live navigation, incorrect exact heading selectors, mid-animation captures, real EN/ES transcript-count assertions, stable server port use, and an intermittent SSE reconnect/shutdown hang; final synthetic recording is `live/qa-artifacts/synthetic-playwright-qa.webm` and is explicitly labeled synthetic. Real WSL2 Workspace browser acceptance PASS with Pi 0.85.1: explicit Start, Unicode input without Enter, resize, EN/ES preserving native terminal contents, second-tab exclusion, reconnect/replay, and owned-process Stop; inspected EN/ES/reconnect screenshots and labeled recording/contact sheet. Workspace evidence is explicitly `REAL PI STARTUP / NO MODEL PROMPT / NOT A REAL GENTLE TASK`.

- [x] T4 — Exercise a real disposable Gentle/Pi task
  - Use the installed user profile only if already configured and authorized by the normal terminal flow.
  - Validate actual input, tool activity/result, final response, stop/reconnect/session behavior, and language preservation where exposed.
  - Evidence: one real credentialed Windows Pi 0.85.1 + Gentle Observer task ran in a disposable Git fixture and settled. Observed titles: Session connected; User → parent; Parent started; read/result; edit/result; read/result; Parent response; Agent ended (not settlement); Parent settled. The functional diff corrected only `README.md`; no delegation, human prompt, commit, remote, push, or publication occurred. Gentle/Pi startup separately created `.atl/` and `.gitignore`; Pi Lens created `.pi-lens-probe-home/`. The harness therefore reported FAIL after settlement because its top-level-file assertion was intentionally stricter than runtime behavior; the task outcome itself passed. Sanitized retained evidence: `real-observer-session.png`, `real-observer-session.webm`, `real-observer-contact-sheet.png`, and the original `real-observer-report.json`. Raw recording, PTY buffer, loopback key, session directory, and disposable fixture were deleted after verification. Real Observer EN/ES switching was not reached after the post-settlement harness assertion; local EN/ES preservation is covered by synthetic Observer QA and real Workspace startup QA.

- [x] T5 — Document integration evidence and remaining platform limits
  - Update integration documentation and create `VISUAL_QA_REPORT.md` with PASS/FAIL/NOT RUN/NOT APPLICABLE, versions, commands, defects/fixes, artifact classification, and Linux/macOS gaps.
  - Evidence: `VISUAL_QA_REPORT.md`, updated integration/live docs, byte-identical staged package docs/code, 22/22 staging files unchanged on final apply, final independent verification PASS (9 requested checks; simulator 1/1, live 10/10, visual 8/8, three retained videos probe successfully, no leftover processes), and explicit native Linux/macOS plus credentialed-matrix limitations.

## Progress log

- 2026-09-20 — Repository cloned into `flugo-gentle`, branch checked out and fast-forward confirmed current.
- 2026-09-20 — Read `integrations/gentle-ai/LOCAL_AGENT_HANDOFF.md` and `TWO_MODES.md`.
- 2026-09-20 — No separate local Gentle AI checkout was present, so a clean disposable upstream checkout was cloned as `../gentle-ai-local` for staging validation; it will not be patched as an installer.
- 2026-09-20 — Staging dry run passed from the parent directory. The verifier called `odd/` unexpected, but that directory is the ODD task artifact created by this session, not a pre-existing user change.
- 2026-09-20 — Automated Node tests and build passed. Workspace smoke correctly refused Windows and passed in Ubuntu WSL2 with an isolated Pi 0.85.1 and no prompt/model call.
- 2026-09-20 — Staging apply/reapply passed in the disposable Gentle AI checkout; no adapter or installer source was modified.
- 2026-09-20 — Native Pi local-package install/reinstall/remove passed in retained isolated profile `C:/Users/MAIX/AppData/Local/Temp/pi-local-package-lifecycle-QxKtxR`; unrelated configuration remained intact.
- 2026-09-20 — Playwright uncovered and the implementation fixed three QA-runner defects plus an observer shutdown race. Unit coverage increased from 9 to 10 passing tests; repeated visual runs terminate cleanly.
- 2026-09-20 — Synthetic visual artifacts and real WSL2 Workspace-startup artifacts were manually inspected. The Workspace recording intentionally contains a viewport resize that leaves gray canvas in the fixed-size video frame; the UI itself remains unclipped.
- 2026-09-20 — A real credentialed Gentle/Pi typo-fix task completed and reached `agent_settled`. The observer showed actual read/edit/read tool activity and final response; retained browser evidence is fully redacted and explicitly labeled real/not synthetic.
- 2026-09-20 — The real-task harness failed only after settlement because Gentle/Pi and Pi Lens created expected runtime state in the disposable fixture. This is documented as a harness limitation rather than misreported as a task failure.
- 2026-09-20 — The staged plugin loaded from `gentle-ai-local/plugins/gentle-live-observer` under isolated Pi 0.85.1, served HTTP 200 and SSE `mode: live`, with no model prompt. Its temporary Windows node-pty harness retained a ConPTY handle until timeout; functional load PASS and harness-exit FAIL are documented separately.
- 2026-09-20 — Final independent verification passed all requested checks. Native Linux/macOS and the remaining credentialed matrix stay explicitly NOT RUN.
- 2026-09-20 — After explicit user authorization, recorded the final work units as `ecdf629` (`fix(live): stabilize observer shutdown and visual QA`), `929cdbb` (`docs(live): add installation and activation guide`), and `5cd881c` (`docs(integration): record Gentle Live acceptance evidence`).
