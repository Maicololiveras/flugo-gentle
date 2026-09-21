# Community plugin installation

Status: blocked on upstream approval
Branch: `feat/live-observer-english`
Upstream issue: `Gentleman-Programming/gentle-ai#4823`

## Scope

Document the exact Gentle Live installation, activation, daily-use, stopping, and removal workflow. Propose a supported opt-in community Pi plugin path in Gentle AI and open an upstream PR only after the issue receives the required `status:approved` label.

## Constraints

- Keep Gentle Live independently owned and versioned.
- Do not vendor the plugin or add it to Gentle AI's default managed Pi package stack without maintainer approval.
- Preserve the distinction between Observer and Workspace modes.
- Keep native Linux and macOS validation gaps explicit.
- Follow Gentle AI's issue-first policy and 400-line PR review budget.

## Tasks

- [x] T1 — Discover upstream contribution policy and file the feature request
  - Evidence: no existing community Pi-plugin registry or duplicate issue found; feature request published and read back exactly as `https://github.com/Gentleman-Programming/gentle-ai/issues/4823`.
- [x] T2 — Publish a step-by-step installation and operation guide
  - Expanded the primary Live README with prerequisites, persistent and temporary installation, Observer/Workspace activation, normal use, stop, removal, troubleshooting, and platform boundaries.
  - Verification: `git diff --check` PASS; `npm test` PASS (1/1); `npm run test:live` PASS (10/10); required-section and Pi package-command readback PASS.
  - Commit evidence: `929cdbb` (`docs(live): add installation and activation guide`).
- [ ] T3 — Implement and open the Gentle AI community-plugin PR
  - Blocked until issue #4823 receives `status:approved` and maintainers select the supported catalog/installation model.
  - After approval, create a policy-compliant branch from current upstream `main`, implement only the approved scope, verify it, push to the contributor fork, and open a linked PR with exactly one `type:*` label.

## Progress log

- 2026-09-20 — Confirmed the current Gentle AI release does not ship `plugins/**`, its Pi adapter manages a fixed support stack, and community tools are external runtimes rather than vendored Pi plugins.
- 2026-09-20 — User explicitly confirmed the upstream issue-first approval gate.
- 2026-09-20 — Created upstream feature request #4823. It is open and awaiting maintainer review; no PR may be opened yet.
- 2026-09-20 — Published the primary step-by-step Live guide in work-unit commit `929cdbb`; independent verification passed all requested checks. Push remains pending.
- 2026-09-20 — Observer runtime/QA fixes were committed as `ecdf629`; acceptance evidence and integration documentation were committed as `5cd881c`.
