# Product identification in expanded Details (v1.2)

Product lookup runs only when an existing duplicate card's Details is opened. Printed lines and explanations remain visible while it runs. The collapsed Results checklist, receipt analysis prompt/schema, duplicate math, review count, check/undo, navigation and receipt viewer are unchanged. No images, dependencies, database, automatic retries or initial-analysis searches were added.

## API

`POST /api/product/lookup`, or `/receipt-decoded/api/product/lookup` when hosted with that existing route prefix. Content-Type: `application/json`.

```json
{
  "merchantName": "Costco",
  "productCode": "2022263",
  "originalDescription": "CHIFORESTVTY",
  "interpretedName": "Chi Forest Sparkling Water"
}
```

Exactly these four fields are accepted. All except `originalDescription` may be null. Maximum lengths: merchant 100, code 60, original description 200, interpreted name 120 characters; body 4 KiB. Control characters, URLs, obvious personal/account identifiers and instruction payloads are rejected. The app constructs this request from the duplicate group, never the image or entire receipt. Unknown fields, including photos and arbitrary search-query fields, are rejected before any paid call.

A result is either `{ "status": "not_found" }` or:

```json
{
  "status": "possible",
  "product": { "name": "Chi Forest Sparkling Water", "brand": "Chi Forest", "size": null },
  "source": { "title": "Retailer product page", "url": "<actual HTTPS product-page URL from search>", "domain": "costco.com" },
  "matchReason": "Product name resembles the receipt description; the exact item could not be verified."
}
```

Examples are illustrative, not verified catalog matches. `matched` requires an official retailer source with the exact receipt item code in the source title or product URL path, plus supported identity and no unresolved contradiction. `possible` means supported product-name evidence without independently verified retailer code. No-match returns no product or source. Optional brand and size are null when unsupported. Transport/service failures use `{ "error": { "code": "…", "message": "…" } }`, independently of no-match. Relevant codes: `INVALID_REQUEST`, `REQUEST_TOO_LARGE`, `RATE_LIMITED`, `SERVER_BUSY`, `DAILY_LIMIT`, `MONTHLY_LIMIT`, `SERVICE_UNAVAILABLE`, `LOOKUP_TIMEOUT`, `INVALID_LOOKUP`, `CANCELED`.

## Search and provenance

Search priority is merchant + exact item code, merchant + original receipt description, then interpreted name + original description. Official retailer pages are preferred, with credible brand/alternative retailer pages permitted for possible matches.

A separate `PRODUCT_LOOKUP_PROMPT` uses the OpenAI Responses API with actual `web_search`, `tool_choice: required`, low search context and `include: [web_search_call.action.sources]`. It returns a short cited report. A second, tool-free Responses call normalizes that report with strict JSON schema; it does not search again. Output caps are 1,200 and 800 tokens. Provider bodies are streamed with a 256 KiB cap per response; reports and the source registry are bounded before normalization.

URLs come exclusively from tool source metadata or URL citation annotations. Normalization chooses a server-assigned source ID, never supplies a URL. The server checks product-name support, receipt resemblance, metadata support, contradictions, source presence and safe HTTPS syntax. Credentials, IP/local/invalid/example hosts, nonstandard ports, malformed percent encoding and unsafe schemes are rejected. Uncited prose cannot create provenance. Exact codes claimed only in generated report text or URL query parameters are downgraded to possible. Known social/search pages and generic search/login pages cannot support a match. Retrieved text is treated as untrusted data in both prompts; obvious adversarial instructions cause no-match. Retailer homepages are also rejected. No source page is fetched separately by this backend.

## Configuration and cost protection

The existing server-only `OPENAI_API_KEY` is reused. `OPENAI_RECEIPT_MODEL` remains independent. `OPENAI_PRODUCT_LOOKUP_MODEL` defaults to `gpt-4.1-mini`, explicitly confirmed in the [official web-search guide](https://developers.openai.com/api/docs/guides/tools-web-search). GPT-4.1 and GPT-4.1 mini aliases and their `2025-04-14` snapshots are allowed; unverified models fail configuration validation. This restricted set keeps cost reservations meaningful. The [official pricing page](https://developers.openai.com/api/docs/pricing) lists search tool fees and token billing. Model or pricing changes require revisiting the conservative reservation.

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `PRODUCT_LOOKUP_TIMEOUT_MS` | 20000 | Shared deadline for search, normalization and provider body reads; max 30000 |
| `PRODUCT_LOOKUP_MAX_SEARCH_CALLS` | 3 | Built-in tool calls per lookup; range 1–3 |
| `PRODUCT_LOOKUP_RATE_WINDOW_MS` | 60000 | Per-IP rate window, existing verified proxy-hop handling |
| `PRODUCT_LOOKUP_RATE_MAX` | 6 | Per-IP attempts per window |
| `PRODUCT_LOOKUP_MAX_CONCURRENT` | 2 | Separate lookup concurrency allowance, max 8 |
| `PRODUCT_LOOKUP_DAILY_LIMIT` | 100 | Maximum reserved attempts per UTC day |
| `PRODUCT_LOOKUP_DAILY_BUDGET_CENTS` | 500 | Daily lookup reservation budget |
| `PRODUCT_LOOKUP_MONTHLY_BUDGET_CENTS` | 2000 | Monthly lookup reservation budget |
| `PRODUCT_LOOKUP_BUDGET_CENTS` | 25 for mini, 110 for GPT-4.1 | Conservative per-attempt reservation, validated against model/tool ceiling |
| `PRODUCT_LOOKUP_USAGE_STATE_PATH` | `server-data/product-lookup-usage.json` | Separate aggregate accounting file; `:memory:` for tests only |

The existing usage guard is instantiated separately, with its own rate limiter, concurrency, daily/monthly allowances and durable ledger. Reservation occurs before the first paid call; failures still count and reservations are not refunded. Default daily/monthly budgets therefore allow at most 20/80 mini lookups, even though the daily request limit is 100. The reservation conservatively covers up to 128k search context tokens per allowed call, bounded normalization input, both outputs and tool fees; actual cost is normally lower. Configuration rejects a reservation below that ceiling or the same accounting path as receipt analysis. Production deployments must keep the lookup ledger durable and use one owning server process per ledger, matching the existing guard's architecture. Independent lookup exhaustion does not block scanning. No automatic retry loops run on either client or server.

Logs contain event name, duration, status/error code and aggregate token/tool counts only. Input text, images, item codes, membership/payment fields and source content are not logged. Client-side lookup timeout is 35 seconds. No new authentication mechanism or embedded secret is introduced.

## Session and privacy

The in-memory receipt provider owns state keyed by stable duplicate group IDs. First expansion loads immediately; concurrent requests coalesce; matched/possible/no-match results are cached. Errors stay cached until Try again. Card unmount, check/undo and receipt viewing preserve results. New photo, new analysis or clear receipt aborts/reset all lookups. Generation checks ignore stale success/failure even when the next receipt reuses IDs. Backgrounding cancels pending requests into a manually retryable error, while completed results survive. Consent revocation aborts and clears lookups.

The existing consent sheet now discloses optional product text and external web search. Consent version is 2, requiring a refreshed choice for prior grants. The shared privacy policy and exported public pages explain minimal lookup data, search providers, browser links, approximate matches and ephemeral caching. The policy effective date is October 14, 2026. These are disclosure-copy changes, not additional Results UI or a new consent flow.

## Tests and local UI fixtures

```sh
pnpm typecheck
pnpm ai-server:test
```

All automated tests use mocked provider responses. Backend tests cover exact/approximate/no-match, contradictions, source provenance, unsafe/fabricated URLs, adversarial content, provider failures, timeouts including stalled bodies, input/body bounds, independent rate/concurrency and durable accounting behavior. Client tests exercise the real compiled TypeScript with mocked Expo adapters, checking the wire fields, shared URL/prefix rules, result validation and typed errors. Session tests cover caching/coalescing, separate cards, review/undo, new scans and stale responses.

For native tests, use `scripts/results-review-fixture-server.mjs` on port 8791 and the existing simulator/Metro setup from `docs/NATIVE_SCREENSHOT_CAPTURE.md`, with `EXPO_PUBLIC_AI_BASE_URL=http://127.0.0.1:8791`. The server reads no key and calls no provider. Use only a seeded synthetic receipt. `/__test/lookup?name=matched|possible|not_found|error|long&delay=1200&reset=true` selects lookup behavior via POST. `/__test/status` reports per-product request counts and `providerCalls: 0`. These routes exist only in the fixture server. Its matched data and brand are synthetic; the fixture uses the real retailer homepage only to test browser opening, bypassing paid search/evidence evaluation.

The backend runtime and updated policy have been synced into Little Moments, including the source manifest. Its shared adapter forwards the namespaced lookup settings, defaults lookup accounting to its own persistent-disk file and caps shared-host lookup concurrency at one. Standing instructions in both root `AGENTS.md` files require future backend changes to be completed in Little Moments in the same task. No push, deployment, signed build, App Store screenshot change or submission is part of this implementation.

## Limitations

Catalog availability, receipt abbreviations and changing package sizes can prevent reliable identification. Metadata and search reports are AI interpreted; links establish provenance, not a guarantee of purchase identity. Exact-code validation is deliberately conservative: common retailer domains are recognized and the code must appear in source metadata/path; other retailer or report-only code evidence remains possible. Model/tool configuration is documentation verified and mocked; no live paid lookup was run. Physical-device, spoken VoiceOver and production provider latency/quality remain release QA.

## File inventory

Created: root `AGENTS.md` instructions in both repositories, `server/product-lookup.mjs`, `server/product-lookup.test.mjs`, `server/product-lookup-client.test.mjs`, `shared/product-lookup-contract.mjs` and its `.d.mts`, `shared/product-lookup-session.mjs` and its `.d.mts`/`.test.mjs`, `tests/ui/product-lookup.yaml`, `tests/ui/product-lookup-fallback.yaml`, `tests/ui/product-lookup-retry.yaml`, this document and synthetic captures in `docs/ui-review/product-identification/`.

Updated: `server/index.mjs`, `lib/ai-client.ts`, `lib/types.ts`, `lib/session.tsx`, `app/results.tsx`, `components/DuplicateCard.tsx`, `.env.example`, `README.md`, `app/consent.tsx`, `shared/ai-consent.mjs`, `shared/legal-copy.json`, `shared/app-info.json`, exported `docs/app-store/{privacy,support,terms}.html`, `scripts/results-review-fixture-server.mjs`, `scripts/sync-little-moments-backend.mjs`, `scripts/verify-shared-mobile.mjs`.

Unchanged: `server/receipt-analyzer.mjs` (including `RECEIPT_PROMPT` and extraction schema), `shared/receipt-contract.mjs`, `shared/receipt-math.mjs`, `shared/results-presentation.mjs`, review reducer and all collapsed-card/Results styling. Dependency manifests and lockfile are unchanged.

## Verification results

- `pnpm typecheck`: passed.
- `pnpm ai-server:test`: all 92 tests passed, with zero paid API calls.
- Native iPhone 17 Pro Max / iOS 26.4: existing checklist review/completion/undo/new-scan and partial-analysis notice/retry flows passed. Product checks included matched lookup, inline loading alongside printed lines, cached reopen, independent cards, receipt-viewer return, check/undo, source-link browser opening and return, new receipt reset, error/no-match, manual retry to possible, long names and omitted metadata passed with local fixtures.
- Fixture counters confirmed one request per product across reopening, viewing and check/undo; a manual error retry added exactly one request. The initial receipt analysis made no product lookup. All fixture routes reported `providerCalls: 0`.
- Largest accessibility text size: the new product name and source control wrap and remain available through scrolling, with the Scan another receipt footer available. The unchanged v1.1 printed-line rows crowd the original description column at this extreme size; this pre-existing layout limitation is recorded in `10-largest-text-printed.png` and was not redesigned in this scoped feature. Font size was restored to its original `large` value.
- Captures are unedited simulator screenshots under `docs/ui-review/product-identification/`, including `02-matched.png`. They contain synthetic product data and are UI verification evidence, not App Store marketing assets. Existing App Store screenshots were not changed.

The first native run exposed React Native's missing `AbortSignal.throwIfAborted` helper, which Node mocks did not expose. The session now uses the portable `aborted` property, with an automated regression test; the subsequent native flows passed. Picker-animation and scrolling-direction harness issues were corrected in temporary native adaptations of the existing UI flows, without changing production UI.

## Shared Little Moments backend handoff

The production host for this app is the Little Moments repository at `/Users/mingyueding/Projects/little-moments`, under `/receipt-decoded`. The integration uses `RECEIPT_DECODED_`-prefixed settings; see both repositories’ deployment guides and Little Moments’ `server/receipt-decoded/.env.example`. Its default lookup ledger is `/persistent/server-data/receipt-decoded-product-lookup-usage.json`, separate from the existing receipt-analysis ledger. The example lookup budget adds a separate $20/month reservation allowance to the unchanged $20/month analysis allowance; review the combined $40 example before any deployment. No live settings or budgets have been changed.

Shared-host validation passed after sync: both repositories’ typechecks, Receipt Decoded’s 92 automated tests, Little Moments’ 79 server tests and 14 shared-backend integration tests, plus `pnpm backend:verify-mobile` (real compiled client and shared HTTP listener, two synthetic analyses and one lookup, zero provider calls). Little Moments changes include its receipt adapter, namespaced environment example, integration tests, deployment guide and the eleven-file runtime/policy manifest. Its main server/auth/generation/pricing code and dependency manifests are unchanged.
