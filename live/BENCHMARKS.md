# Benchmarks: passive accounting and evidence

The **Benchmarks** tab records observable activity without generating prompts, calling a model, requesting provider billing data, or changing Gentle policies. Both Observer and Workspace use the same accumulator. EN/ES translation, comparison and export happen locally.

This is an observability feature, not a claim that Gentle AI always saves tokens or that the system is perfect. A valid saving must be measured on comparable successful tasks. Parent measurements and optional child measurements are separate.

## Use this branch

```sh
pi install git:github.com/Maicololiveras/flugo-gentle@feature/passive-benchmarks
```

Reload Pi, run `/gentle-live`, open its complete local URL, and select **Benchmarks**. Start recording before your task. Workspace records once its Pi process emits events. The offline demo has no real usage and shows an explicit empty state.

Select a recording and, optionally, a baseline. Confirm that the tasks and acceptance results are comparable. Comparisons require matching project fingerprints, collection source and model sets. This is a minimum gate; matching these fields alone does not prove experimental equivalence. Reductions can be negative. A zero or unavailable baseline cannot produce a percentage.

## What is counted

| Metric | Evidence | Limits |
|---|---|---|
| Provider request hooks | `before_provider_request` | Counts observed hooks, not guaranteed HTTP attempts; provider-internal retries may be invisible |
| Final model messages | Assistant `message_end` | Includes tool-only, empty and error responses; custom subagent wrapper messages are excluded |
| Tool requests | `tool_call`, deduplicated by call identity | A policy hook can still block execution |
| Tool starts / finishes / errors | `tool_execution_start/end` | Distinct from requests and result observations |
| Tool results | `tool_result` | Not added to starts or finishes; progress updates do not count as additional executions |
| Human inputs | `input.source === interactive` | RPC, extension and unknown sources remain separate |
| Dialogs opened / closed | `ui_prompt_start/end`, where supported | Closing includes cancellation; not proof of an answered question |
| Agent runs / settlement | `agent_start`, `agent_settled` | `agent_end` does not prove settlement |
| Tokens | Whitelisted numeric fields of assistant `usage` | SDK measurements may contain default zeros; absent fields are unavailable |
| Mean response duration | Observed `message_start → message_end` interval | Local lifecycle time, not provider latency or time to first token |
| Tool duration | Matching start/end timestamps | Only matched executions contribute |
| Cost in USD | Positive `usage.cost.total` | SDK estimate, not an invoice, subscription allocation or live tariff lookup |

A repeated response ID is not billed twice. Replaying browser SSE does not touch the accumulator. `cacheWrite1h`, when supplied, is retained as a subset of cache writes and never added to the total. Reasoning tokens are a subset of output; they are never added again to `totalTokens`. Every token field and cost total reports how many final messages supplied a usable value. Missing costs and zero SDK costs are explicitly distinguished. A zero may mean an unpriced model or a subscription, so it is not advertised as free usage.

### Child coverage

Where Gentle already emits the local `gentle:runtime-metrics:child/v1` event, the extension accepts only events joined to the active parent session and records the bounded response measurements separately. Repeated child completion events are deduplicated. Missing child data means **unavailable**, not zero.

The observer does not enable Gentle telemetry or override its consent/configuration. This child event does not expose request attempts, child tool lifecycles or cost. Its response and dropped-response counts appear alongside separate model/token totals. Parent-only comparisons cannot establish whole-system savings when child usage is missing. Raw task and parent session identifiers are not exported; only project/session fingerprints and independently generated recording IDs are retained.

## Caching, with auditable formulas

Pi exposes `input`, `output`, `cacheRead`, `cacheWrite` and `totalTokens`. The tab preserves these fields rather than guessing from prompt length. Provider adapters normalize different provider schemas; these measurements are SDK evidence, not independent billing verification.

For responses with all three input-side fields:

```text
input-side tokens = input + cacheRead + cacheWrite
cache read share = cacheRead / input-side tokens × 100
response hit share = responses with cacheRead > 0 / measurable responses × 100
```

These denominators are shown through sample coverage. Token share and response hit share answer different questions. Neither shows cache capacity, eviction or per-entry retention/TTL or why a cache missed; those values are unavailable unless the runtime exposes them. Cached tokens are still processed/reused tokens, not tokens that ceased to exist.

The observer does not request prices. Where a final message supplies a positive uncached input cost and nonzero uncached input count, it derives the unit price from **that same response**:

```text
uncached unit price = usage.cost.input / usage.input
estimated read discount = cacheRead × unit price − usage.cost.cacheRead
estimated net cache discount = (cacheRead + cacheWrite) × unit price
                             − usage.cost.cacheRead − usage.cost.cacheWrite
```

The second formula includes the cache-write premium. For example, at $3 per million uncached input tokens, 8,000 cached reads costing $0.0024 give a hypothetical read discount of $0.0216. Writing 1,000 cache tokens at $0.00375 instead of $0.003 reduces the net discount to $0.02085. A cold run with cache writes and no reuse can have a **negative discount**. These are arithmetic examples, not measured Gentle performance.

No uncached input price or incomplete cost breakdown means unavailable discount. No invented prices are substituted. Reported discounts sum only measurable responses and display sample counts. They compare an observed SDK estimate against a hypothetical no-cache input charge; they do not establish a causal saving from Gentle AI. Subscription charges, provider credits, tiered billing adjustments and tool infrastructure costs are not inferred.

## Demonstrating a Gentle AI improvement

Use an A/B experiment instead of selecting the cheapest unrelated session:

1. Fix the repository commit, task statement, acceptance tests, tool permissions, provider/model version, thinking effort and output constraints.
2. Run A without Gentle AI and B with Gentle AI. Start the observer before each task. Keep the observer enabled in both arms.
3. Test cold-cache and warm-cache conditions separately. Do not describe a run as cold merely because a terminal was restarted: the provider controls caching. If cache state cannot be established, mark it unknown.
4. Alternate/randomize A/B order and repeat several paired trials. Save model versions, dates, validation outcomes and cache conditions in the experiment notes. Do not change prompts to favor one arm.
5. Require equivalent acceptance-test success. Keep failed runs and repair costs in the record. Lower usage accompanied by an incorrect result is not an improvement.
6. Compare parent and child coverage, tokens, request hooks, tool executions, user interactions, elapsed intervals and estimated costs. Exclude no failures silently. If child data is incomplete, report only the measured scope.
7. Use `reduction = (baseline − candidate) / baseline × 100`. Report median, spread and all paired results in a separate experiment report; the tab currently compares individual recordings and does not pretend to calculate statistical confidence or certify quality.

Gentle orchestration and reviews can increase requests or tokens while improving correctness. Prompt caching can lower cost while leaving total token volume similar. These outcomes should be reported separately. A successful measurement suite validates the accounting implementation; it cannot certify that arbitrary Gentle tasks work perfectly.

## Historical records and exports

Summaries are written atomically about one second after activity and flushed on normal Observer shutdown. They persist independently of the 500-event UI replay buffer and browser state:

```text
~/.local/share/gentle-live/benchmarks/<recording-id>.json
```

Override the location with `GENTLE_LIVE_BENCHMARK_DIR`. No prompts, message content, tool arguments, headers or credentials are written by this recorder. Numeric counters, times, model/tool identifiers and project/session fingerprints are saved. Export JSON includes the complete selected summary; CSV exports its core counters and token/cost coverage. History lists the latest 200 recordings across local projects; older files remain on disk. Delete unwanted summary files locally while the observer is stopped.

Each activation creates a recording segment. Session switches are separated by runtime session identity; restarting observation creates another segment. Missing session identity is explicitly null. There is no automatic scan of old Pi sessions.

To import an explicitly selected existing Pi JSONL file, stop the observer, then run:

```sh
node live/import-benchmarks.mjs /absolute/path/to/session.jsonl
```

Restart the observer to load the imported history. The command reads local files only, accepts at most 64 MiB and requires a Pi session header. The same unchanged file is idempotent. Importing a changed file creates a new recording; do not sum overlapping exports. It counts all stored message entries, including branches retained in that file, rather than claiming to reconstruct an active branch. Old JSONL files can supply final-message usage and tool results, but do not establish request hooks, tool starts, human provenance or full timings. Imports compare with imports, not live recordings.

## Delivery, persistence and limits

- Event callbacks copy allowlisted metadata and update counters; disk writes and local transport run asynchronously. No model polling, provider calls or new tools are registered.
- Workspace uses the existing loopback-only, authenticated ingest channel. Dropped queue entries and failed sends are reported on the next successful delivery; affected recordings are flagged and comparisons disabled. An abrupt process exit can lose trailing telemetry before such a report arrives.
- Browser snapshots use authenticated SSE and a keyed GET endpoint. Disconnects show stale data explicitly. Export does not cause model requests.
- Persistence errors are visible. A crash can lose the last unflushed second; this is a best-effort observer, not a billing ledger. Observation stops at 100,000 distinct events per recording and marks it incomplete; start a fresh recording for longer work.
- Zero additional LLM tokens does not mean zero CPU, memory, local network or disk work. No remote analytics endpoint is introduced.

## Contracts and validation

Contracts checked against Pi's published `@earendil-works/pi-coding-agent` and `pi-ai` 0.87.1, and the existing Gentle Shell child protocol. Unsupported hooks simply provide no measurements; coverage remains explicit.

- [Pi extension event types](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/extensions/types.ts)
- [Pi usage and model types](https://github.com/earendil-works/pi/blob/main/packages/ai/src/types.ts)
- [Gentle child metrics contract at the inspected revision](https://github.com/Gentleman-Programming/gentle-shell/blob/54548321be8c8d60891e89ea13bf2b0ed10e1ac5/lib/runtime-metrics-children.ts)

```sh
node --test live/tests/*.test.mjs
node live/build.mjs
node live/qa/benchmarks.mjs
```

The last command requires Playwright and Chromium. `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` optionally select locally installed test dependencies. All automated benchmark fixtures are synthetic and do not call a model. No real A/B savings result is claimed by this implementation.

See the [validation evidence](../docs/BENCHMARK_VALIDATION.md) and [blank experiment template](../docs/BENCHMARK_EXPERIMENT_TEMPLATE.md). These repository links are available in a clone; the self-contained installed package retains this guide.
