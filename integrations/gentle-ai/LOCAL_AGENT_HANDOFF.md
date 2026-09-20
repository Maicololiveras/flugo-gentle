# Finish Gentle Live integration and validate it visually

Continue the implementation from `Maicololiveras/flugo-gentle`, branch `feat/live-observer-english`, PR #1. The user wants an English simulator that also displays observable work from a real Gentle session, packaged for the Gentle AI repository. Finish the integration, run the browser checks, fix defects, and record evidence. Do not report success from mocked events alone.

## Updated requirement: two modes and EN/ES

Read [TWO_MODES.md](TWO_MODES.md) before implementation. Prefer Workspace (native Pi terminal embedded in the local browser with the live graph alongside), and preserve Observer for existing terminal sessions. EN/ES is a local UI/demo dictionary; native payloads keep their original language. No explanatory model calls may be added. Linux and macOS are the target platforms.

A real isolated Pi 0.85.1 startup smoke now passes on Linux: PTY output and session_start reach the workspace. No model prompt was sent. This does not replace visual or credentialed Gentle acceptance. Nine automated tests passed after these additions.

## Current state

| Area | Implemented | Remaining |
|---|---|---|
| Bilingual UI | EN/ES dictionary, four examples, scope decision, animated SVG, responsive CSS | Inspect actual screenshots and video; fix any overlap or motion defects |
| Pi plugin | `package.json` with `pi.extensions`, `/gentle-live` and stop | Load inside the user's installed Gentle profile; check compatibility |
| Event bridge | Input, visible messages, tool requests/progress/results, prompts, settlement | Validate real tool payloads and any blocked-call behavior |
| Child visibility | Parent-visible Gentle task IDs, messages, progress and results | Decide whether deeper child events are required; implement an explicit upstream bridge if so |
| Gentle AI integration | Repeatable staging into `plugins/gentle-live-observer` | Optional install/update/uninstall workflow in Gentle AI's actual adapter/TUI |
| Automated checks | Nine adapter/workspace/staging/dictionary tests and existing simulator tests passed | Run again after changes |
| Visual test runner | Playwright screenshots, recordings and JSON report | Not executed successfully here: no Chromium installation available |
| Real session | No model credentials or runtime session used here | Required before ready-for-review |
| Upstream | No official Gentle AI PR or approved issue established | Follow current repository contribution policy |

## 1. Inspect and stage

Read the target checkout's `AGENTS.md` and applicable skills first. Inspect uncommitted changes and preserve them. Review these source files in order:

1. `live/extensions/observer.ts`: passive Pi subscription lifecycle.
2. `live/lib/normalize.mjs`: visible content and task identity mapping.
3. `live/lib/server.mjs`: loopback server, key, replay and shutdown.
4. `live/web/app.js`: demo decisions and live graph rendering.
5. `integrations/gentle-ai/stage-plugin.mjs`: staging, not a runtime plugin loader.

From the `flugo-gentle` checkout:

```sh
node integrations/gentle-ai/stage-plugin.mjs /absolute/path/to/gentle-ai
node integrations/gentle-ai/stage-plugin.mjs /absolute/path/to/gentle-ai --apply
```

Windows PowerShell accepts a quoted target such as `"C:\dev\gentle-ai"`. The script validates `go.mod`, rejects symlink destinations, previews by default, and refuses to overwrite differing files. It copies a complete local development package, including this handoff and visual tests. It does not edit Pi settings or start an agent. Review differences manually before restaging an edited target.

## 2. Load the real plugin

From the target `gentle-ai` checkout:

```sh
pi install ./plugins/gentle-live-observer
```

Restart the existing Gentle session or `/reload`, then run `/gentle-live`. Open its generated URL in a local browser and keep the terminal visible beside it. `/gentle-live stop` must close the feed. A session switch reloads extensions: run `/gentle-live` again for the new URL.

This is a **Pi extension package hosted in the Gentle AI repository**. There is no invented `gentle-ai plugin install` command or Codex manifest. Gentle AI's current `internal/agents/pi/adapter.go` owns `managedPackageSources` and settings merging; inspect that implementation before integrating optional discovery/installation. Do not add an unpublished npm identifier to the managed list.

## 3. Finish repository integration

Implement an explicitly selected optional plugin using Gentle AI's existing component/adapter patterns. Verify current code rather than relying on stale line numbers.

- Resolve bundled package location independently of the caller's working directory. Document how release artifacts carry the plugin if installing from a binary rather than a source checkout.
- Add opt-in install, repeat-install, update and removal coverage. Preserve unrelated Pi settings and respect `PI_CODING_AGENT_DIR`.
- Keep the observer disabled until the user runs `/gentle-live`. Loading the plugin must not spawn a model, consume credentials or start a browser/server automatically.
- Ensure removal stops future loading without removing Gentle Shell, Engram or user configuration. Verify the installed Pi CLI's actual removal syntax before documenting it.
- Decide a source-of-truth policy: retain the package here and import versioned releases, or move ownership upstream. Avoid two silently diverging implementations.
- If adding child-internal observation, inspect Gentle Shell's `lib/agents-runner.ts`, `lib/agents-protocol.ts` and `extensions/gentle-agents.ts`. Add a bounded, opt-in visible-event bridge with parent/session/task/call identity. Do not repurpose restricted runtime metrics, read thinking blocks, infer RED/GREEN from prose, or mark completion on `agent_end`.

Keep the work modular. Changes to the Go installer belong in Gentle AI; child runner hooks belong in Gentle Shell; Pi events are the runtime boundary.

## 4. Execute automated visual QA

From the staged plugin directory (or from `live/` in the source repo):

```sh
npm install
npx playwright install chromium
npm test
npm run test:visual
```

For headed inspection: `HEADED=1 npm run test:visual` on POSIX; in PowerShell set `$env:HEADED='1'` before running it. Use a supported local browser environment; do not weaken execution restrictions to make a hosted test pass.

The runner writes `qa-artifacts/report.json`, desktop screenshots for all four examples, iPad/mobile screenshots, live test-feed and disconnected screenshots, and browser recordings. The live browser test uses **synthetic events** and labels them as such. Inspect every image and recording; passing assertions alone does not establish visual quality. If browser setup fails, keep the failed report and record the blocker.

Check readable typography, clipping, scroll behavior, graph directions, active states, long tool output, keyboard focus, reduced-motion behavior, pause behavior and mobile layout. Fix defects and rerun affected checks. Never commit credentials, the live access URL/key, or arbitrary real-project transcripts in artifacts.

## 5. Run real end-to-end cases

Create a disposable Git project with no secrets and use the user's already configured model profile. Record actual versions (`node --version`, `pi --version`, `gentle-ai --version`, installed gentle-pi version), OS, commit SHAs and effective TDD/RDD/memory configuration. Do not invent versions for tools lacking a version flag.

| Case | Exercise | Evidence required |
|---|---|---|
| Small edit | Ask to fix one typo in a fixture README | Input → tool call → actual result → final response; no forced delegation |
| Delegation | Ask Gentle to use an available exploration worker on the fixture | Actual task ID and returned result; correct parent/worker routing |
| Human question | Give a fixture task with a genuine unresolved export scope | Child query if emitted → parent prompt → answer in terminal → continuation |
| TDD | Enable configured TDD on a small executable fixture change | Actual failing and passing test output; no fabricated TDD phases |
| RDD | Exercise an applicable review checkpoint with native consent | Frozen candidate and returned verdict evidence, or honest not-triggered status |
| Memory unavailable | Use a disposable profile without a working memory connection | Actual failure and document-based recovery; no fake synchronization |
| Interruption | Stop observer, restart, reload browser; switch Pi session | Disconnection, fresh key, correct replay and no mixed-session history |
| Error/parallelism | Trigger a harmless failed read and simultaneous child tasks if supported | Error stays an error; separate task/call identities remain inspectable |

If the model does not naturally emit a required case, report that case as not exercised and adjust a legitimate fixture or configuration. Never insert synthetic events into a recording labeled real. Keep user decisions and action authorization in the terminal.

## Embedded-terminal acceptance (additional)

Run `npm run test:workspace` from the plugin first. Run the actual Workspace on Linux and macOS, then verify Start Pi is required, keyboard input reaches Pi, native dialogs work, resize/Unicode are correct, reconnect does not spawn a second Pi, a second tab cannot control input, and Stop Pi terminates only the owned process. Verify EN/ES switching preserves active decisions and terminal contents, and real output is never translated by a model. Inspect whether parent messages show enough observable decision context; document anything the runtime does not expose.

## 6. Evidence and completion

Create `VISUAL_QA_REPORT.md` in the integration branch with environment, commands, outcomes, artifact paths, defects/fixes and remaining limits. Use PASS / FAIL / NOT RUN / NOT APPLICABLE separately. Include a short real-session recording and sanitized screenshots for desktop and iPad; confirm generated browser test recordings are labeled synthetic.

Completion requires:

- [ ] Plugin loads from the Gentle AI checkout and the optional installation flow is documented/tested.
- [ ] Automated adapter and browser assertions pass.
- [ ] Every screenshot/recording has been manually inspected; discovered layout/interaction defects are fixed.
- [ ] A real credentialed Gentle/Pi session has been observed successfully.
- [ ] Parent/child identity, human prompts, errors and settlement match the actual session.
- [ ] Child-internal coverage gaps are fixed or explicitly documented and accepted; never claim full visibility when unavailable.
- [ ] Stop/restart/session switching and removal preserve normal Gentle behavior.
- [ ] Contribution checks pass before marking a PR ready.

At the inspected revision, `skills/branch-pr/SKILL.md` requires an issue with `status:approved` for an official Gentle AI PR and a 400-changed-line budget unless a maintainer-authorized exception applies. Recheck current policy. Do not self-assign protected approval labels or treat the Discord screenshot as an approved issue. Split delivery into reviewable units. The existing PR #1 is in the user's `flugo-gentle` repository, not upstream.
