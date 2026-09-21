# Redesign Live Observer

## Goal

Address PR #1 feedback by redesigning the existing live event diagram with Archify-informed hierarchy while preserving the real Observer and Workspace event stream. The viewer must inherit the active Pi theme, including custom themes such as `Gentleman-Sexy` and `wegcode-night`.

## Constraints

- Keep the browser read-only and local-only.
- Do not fabricate private reasoning, child-internal activity, or ODD/TDD/RDD transitions.
- Keep native event payloads in their original language.
- Preserve local EN/ES interface translation without model calls.
- Preserve the loopback/session-key security boundary.
- Do not commit or push without explicit authorization.

## Tasks

- [x] Inspect PR feedback, current event model, viewer, tests, visual QA, Pi extension/theme APIs, and applicable skills.
- [x] Create and validate an Archify workflow reference for the observable handoff model.
- [x] Add active Pi theme metadata to the real event stream with safe CSS color resolution and fallback.
- [x] Redesign actor/state rendering, routes, identity labels, observable context details, and motion.
- [x] Adapt desktop, iPad, and mobile layouts with reduced-motion and keyboard-accessible disclosure.
- [x] Extend unit and browser tests for themes, identities, states, live replay, EN/ES, and responsive behavior.
- [x] Run focused tests, build, Impeccable detector, and bounded visual QA in both languages.
- [x] Prepare the PR update summary and sanitized evidence inventory.

## Baseline evidence

- `npm test`: PASS.
- `npm run test:live`: PASS, 10/10.
- Active user setting: `theme: "wegcode-night"`.
- Pi exposes the active `ctx.ui.theme`, theme name/source, ANSI foreground/background accessors, all discovered themes, and theme switching APIs.

## Completion evidence

- `npm test`: PASS.
- `npm run test:live`: PASS, 11/11.
- `npm run build:live`: PASS; rebuilt `Gentle_Live_Demo.html`.
- `npm --prefix live run test:visual`: PASS across EN/ES, desktop, iPad, 390 px, 320 px, reduced motion, keyboard selection, live SSE replay, disconnects, identities, and inherited theme variables.
- Impeccable detector: PASS with `[]` findings on the changed web targets.
- Archify delivery/validation: showcase PASS, 9/9 checks, 0 errors, 0 warnings.
- `git diff --check`: PASS; only Git's existing LF→CRLF working-copy notices were emitted.
- No commit or push performed.

## Post-validation correction

- [x] Confirm the reported browser was still loading the legacy package from `C:/Users/maicolj/gentle-ai-live/plugins/gentle-live-observer`.
- [x] Prevent pre-start Pi events from consuming the first theme snapshot before a live sink exists.
- [x] Synchronize in-memory Pi theme changes while the Observer is running, without polling models, tools, or agent state.
- [x] Add focused coverage for initial `Gentleman-Sexy` publication followed by live `wegcode-night` publication.
- [x] Point Pi at the corrected local package, reload it, and visually confirm the real active theme.
- [x] Make inherited palettes monochrome: dark theme surfaces plus the active Pi `accent` color for every actor; retain warning/error state semantics.
- [x] Enlarge the diagram: allocate about 62% of desktop width to the right panel, remove the 480 px ceiling, and wrap crowded tool calls into two columns while keeping call identities distinct.

## Delivery authorization

- The maintainer explicitly approved merging the completed work to `main` and publishing an installable release.
- The maintainer explicitly approved `size:exception` for the existing integrated PR (34 files / 1,490 committed lines before this final update) instead of splitting it into chained PRs.
- Selected distribution: versioned Git package and GitHub release, not npm.
- Planned public install source: `git:github.com/Maicololiveras/flugo-gentle@v1.0.0`.

## Release preparation

- [x] Convert every maintained Markdown document reachable from the root README to English, rename the legacy Spanish documentation paths, update all links, and validate all 12 local Markdown link targets.
- [x] Add root Pi package metadata for Git installation, align root and observer versions at `1.0.0`, and verify local root install/list/remove under an isolated Pi profile.
- [ ] Commit the implementation, push the feature branch, merge PR #1 to `main`, tag the fetched merge commit, create the GitHub release, and verify the public installation path from the tag.
