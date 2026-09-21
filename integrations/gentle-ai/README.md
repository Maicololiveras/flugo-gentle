# Stage the independent plugin in Gentle AI

Gentle Live is a standalone Pi extension package. This integration copies it into `gentle-ai/plugins/gentle-live-observer` for local review; it does not modify Gentle AI's adapter, installer, TUI, or settings.

## Stage safely

From this repository:

```sh
node integrations/gentle-ai/stage-plugin.mjs /path/to/gentle-ai
node integrations/gentle-ai/stage-plugin.mjs /path/to/gentle-ai --apply
```

The first command previews. The second writes only missing plugin files. The script refuses symlinks and differing existing destination files; an identical reapply is idempotent. The verified disposable checkout reapply reported all 22 files unchanged.

Then, from the Gentle AI checkout:

```sh
pi install ./plugins/gentle-live-observer
```

Reload Pi and run `/gentle-live`. This is Pi's package route; no `gentle-ai plugin install` command is claimed.

## Verified scope

- **PASS:** 11 Node tests, simulator/build, staging apply/reapply, isolated Pi install/reinstall/remove, all nine current synthetic Playwright checks, WSL2 Workspace startup/browser checks, the functional behavior of one credentialed Windows Observer task, and a no-model staged-checkout load under isolated Pi 0.85.1 that registered `/gentle-live`, returned page HTTP 200, and opened SSE in `mode: live`.
- **FAIL:** the temporary node-pty load harness emitted PASS JSON but retained a Windows ConPTY/node-pty handle until timeout; separately, the complete real-task harness rejected `.atl/`, `.gitignore`, `.pi-lens-probe-home`, and the intentionally changed `README.md` after successful settlement.
- **NOT RUN:** native Linux, macOS, delegation, human prompt, configured TDD, native RDD, memory-unavailable recovery, parallel-child, and runtime-error real-session cases.
- **NOT APPLICABLE:** native Windows Workspace under the current design.

Read [LOCAL_AGENT_HANDOFF.md](LOCAL_AGENT_HANDOFF.md) for review steps and [TWO_MODES.md](TWO_MODES.md) for operation and visibility boundaries. The complete evidence and artifact classification are in [`../../VISUAL_QA_REPORT.md`](../../VISUAL_QA_REPORT.md).

Official Gentle AI release archives do not currently include `plugins/**`. This repository publishes the independent observer as a versioned Pi Git package; that does not imply upstream Gentle AI packaging, adapter integration, or full child-internal visibility. The staged source-checkout load PASS also does not prove official Gentle AI release packaging, and its temporary harness did not exit cleanly.
