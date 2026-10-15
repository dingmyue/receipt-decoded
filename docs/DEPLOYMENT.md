# Receipt Decoded on the existing Little Moments Render service

October 14 quantity-review update: single product rows with explicit quantities of two or more now join the review checklist. See `QUANTITY_REVIEW.md` for behavior, retained guards and validation. The runtime is synced locally into Little Moments; existing routes, environment settings and separate analysis/lookup accounting need no change. Deploy the shared backend before expecting production scans to show this behavior.

Owner choice: reuse Little Moments' existing Render web service, with a **$20 monthly Receipt Decoded AI allowance**. The integration is implemented and tested locally, but has not been pushed, deployed or enabled. Publishing requires the owner's final review. No existing Little Moments environment file, key, root dependencies/lockfile or mobile configuration was changed.

## Prepared integration

Little Moments routes only `/receipt-decoded/**` to the optional receipt backend. Existing `/health`, `/privacy`, `/terms`, `/support`, voice/AI, pricing, subscription webhooks and analytics retain their existing implementation and contracts. Receipt traffic bypasses Little Moments' body parsers, app-secret authentication and pricing quotas; it retains its own explicit consent field, image validation, IP rate limits and durable reservations. It does not need or receive Little Moments' private key or app shared secret.

The extension is **disabled by default**. It imports the image backend lazily on receipt traffic only. Missing Sharp, invalid receipt configuration or a missing dedicated receipt key returns a safe 503 for receipt routes while Little Moments routes continue. Invalid optional lookup configuration disables only `/receipt-decoded/api/product/lookup`; receipt analysis, health and policies remain available. Configuration changes require a server restart. Health for the existing Render service remains `/health`; receipt readiness is checked separately at `/receipt-decoded/health`.

The Receipt Decoded backend runtime is vendored into Little Moments at `server/receipt-decoded/`. Sharp 0.35.5 has a separate nested package and npm lockfile. The small routing adapter is `server/receipt-decoded-route.mjs`; the integration adds nine lines to Little Moments' server entry point. The receipt source remains in this repository. After a backend or policy edit, run `pnpm backend:sync-little-moments` here, review the copied files and `source-manifest.json`, then run both suites. The sync script copies eleven known runtime/policy files only; it never copies `.env` or credentials.

## Render changes to review before deployment

Read-only inspection on October 13, 2026 confirmed the existing service at `https://little-moments-api.onrender.com`, GitHub `dingmyue/little-moments` branch `main`, deployed revision `152f716`, Starter compute, Hobby workspace, Oregon (US West), Node **24.14.1**, and a 1 GB disk mounted at **`/persistent`**. Current build command is `pnpm install`, start command is `pnpm ai-server`, and Auto-Deploy is **On Commit**. The health-check path field is currently blank. Little Moments' pricing/events files already use `/persistent/server-data/`. No `RECEIPT_DECODED_*` variables are configured. The receipt namespace currently returns 404; the integration remains local and uncommitted. Render dashboard application-log retention is 7 days for this [Hobby workspace](https://render.com/docs/logging#retention-period). External log forwarding and the proxy chain were not verified. No Render settings were changed.

1. Back up Little Moments' persistent pricing/subscription state and record the deployed revision and settings above. Keep start command `pnpm ai-server`; set the blank health-check path to `/health` when configuring the deployment. Auto-Deploy is On Commit: coordinate the push and Render configuration, or temporarily use manual deployment so an unreviewed main-branch push does not start a deploy.
2. Keep the existing Node **24.14.1** runtime; no upgrade is necessary. Both suites were re-run successfully with this exact Node version on macOS. Linux native dependency installation remains a first-deploy check.
3. Set build command to `pnpm install && npm ci --prefix server/receipt-decoded --omit=dev` after the nested package/lockfile is present in the deployed Git revision. This preserves the existing root install step. The nested lock includes Linux optional binaries; do not omit optional dependencies. Keep root directory blank and start command unchanged.
4. Set the namespaced variables below in Render, using a **dedicated Receipt Decoded OpenAI project/key**. Do not reuse or change the existing `OPENAI_API_KEY`, `APP_SHARED_SECRET`, pricing, webhook or analytics settings. Do not put the receipt key in the mobile app or EAS environment.
5. Set receipt usage to **`/persistent/server-data/receipt-decoded-usage.json`** on the verified disk. This is a new receipt-only file; do not change or delete Little Moments' pricing/events files. [Render's ordinary filesystem is ephemeral](https://render.com/docs/disks); accounting belongs under the persistent mount.
6. Complete publisher/privacy/support placeholders in `shared/app-info.json` and `shared/legal-copy.json`, regenerate policies and sync them. Verify host/proxy body logging is off, complete processing-region/log-retention disclosures, and verify the X-Forwarded-For chain before changing the default proxy trust of 0.
7. Review and deploy only after owner approval. Enable `RECEIPT_DECODED_ENABLED=true` with the complete namespaced configuration. Validate existing Little Moments routes and receipt routes separately before directing a distribution build at it.

| Render variable | Value / purpose |
| --- | --- |
| `RECEIPT_DECODED_ENABLED` | `true` only when enabling after review; absent/false disables receipt routes |
| `RECEIPT_DECODED_OPENAI_API_KEY` | Dedicated receipt project key; server only |
| `RECEIPT_DECODED_OPENAI_RECEIPT_MODEL` | `gpt-4.1-mini` |
| `RECEIPT_DECODED_USAGE_STATE_PATH` | `/persistent/server-data/receipt-decoded-usage.json` |
| `RECEIPT_DECODED_MONTHLY_AI_BUDGET_CENTS` | `2000` ($20 nominal allowance per UTC calendar month) |
| `RECEIPT_DECODED_DAILY_AI_BUDGET_CENTS` | `500` nominal cents/day |
| `RECEIPT_DECODED_DAILY_ANALYSIS_LIMIT` | `100` |
| `RECEIPT_DECODED_MAX_SCAN_BUDGET_CENTS` | `10` nominal cents reserved per paid attempt |
| `RECEIPT_DECODED_MAX_CONCURRENT_REQUESTS` | `1` (shared adapter caps this at one regardless of a higher setting) |
| `RECEIPT_DECODED_MAX_REQUEST_BYTES` | `8388608` (8 MiB) |
| `RECEIPT_DECODED_RATE_LIMIT_MAX_REQUESTS` | `6` per IP/minute by default |
| `RECEIPT_DECODED_ANALYSIS_TIMEOUT_MS` | `90000` |
| `RECEIPT_DECODED_TRUST_PROXY_HOPS` | `0` until the proxy chain is verified |

Other standalone receipt configuration keys can be supplied with the same `RECEIPT_DECODED_` prefix; only the documented receipt keys are passed to its loader. An example is in Little Moments' `server/receipt-decoded/.env.example`.

The mobile public base is **`https://little-moments-api.onrender.com/receipt-decoded`**. Set `EXPO_PUBLIC_AI_BASE_URL` to this exact value in Receipt Decoded's own EAS production environment. `shared/app-info.json` now uses the same verified namespaced base. The mobile client appends `/api/receipt/analyze`; do not include that endpoint in the base value. Public policy paths are `/receipt-decoded/privacy`, `/receipt-decoded/support` and `/receipt-decoded/terms`. Little Moments' mobile base remains the origin without the receipt prefix. Its policy pages remain at their original addresses.

## Product identification in Details — local integration update (October 14, 2026)

The product-lookup runtime and updated privacy policy are now synced into Little Moments. The existing `/receipt-decoded/**` adapter serves `POST /receipt-decoded/api/product/lookup` without changing the main Little Moments routing, auth, pricing or generation code. It accepts bounded merchant/item/product-description JSON, never a receipt photo. Results are `matched`, `possible` or `not_found`, with separately typed errors. It searches only after a Details expansion; receipt analysis does not trigger search. Actual `web_search`, strict normalization and source validation are implemented in the vendored backend. All changes are local; no hosted environment, push, deployment or release has been performed in this update.

Always implement Receipt Decoded backend changes in Little Moments in the same task as app/source changes. This standing requirement is saved in both repositories' root `AGENTS.md` files. Keep the source runtime in Receipt Decoded, sync it with `pnpm backend:sync-little-moments` from that repository, and update the shared adapter, examples, docs and integration tests here as needed. The sync never copies `.env` or credentials.

The adapter forwards these additional **namespaced** server settings. Unprefixed Little Moments credentials/model/budget values are not inherited. The dedicated `RECEIPT_DECODED_OPENAI_API_KEY` is used for lookup too; no new key, package or build command is required.

| Render variable | Default / purpose |
| --- | --- |
| `RECEIPT_DECODED_OPENAI_PRODUCT_LOOKUP_MODEL` | `gpt-4.1-mini` default; also supports `gpt-6-luna`, GPT-4.1 and the GPT-4.1 models' 2025-04-14 snapshots; independent of receipt analysis |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_TIMEOUT_MS` | `20000`, maximum `30000`; covers both provider calls |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_MAX_SEARCH_CALLS` | `3`, maximum `3` |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_RATE_WINDOW_MS` | `60000` |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_RATE_MAX` | `6` per IP/window |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_MAX_CONCURRENT` | `1`; the shared adapter caps lookup at one, independently of analysis |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_DAILY_LIMIT` | `100` attempts, additionally bounded by budget |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_DAILY_BUDGET_CENTS` | `500` reserved cents/day |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_MONTHLY_BUDGET_CENTS` | `2000` reserved cents/month, independent of analysis |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_BUDGET_CENTS` | `25` per Luna/mini attempt, `110` for GPT-4.1; validated conservative minimum, failures count |
| `RECEIPT_DECODED_PRODUCT_LOOKUP_USAGE_STATE_PATH` | `/persistent/server-data/receipt-decoded-product-lookup-usage.json` |

The adapter supplies that distinct persistent lookup path by default. Tests use `:memory:` or isolated temporary files. Using the same accounting path as receipt analysis fails closed. Lookup rate, concurrency and budget exhaustion do not consume receipt-analysis or Little Moments allowances. Existing analysis limits and accounting files remain unchanged.

**Budget review before deployment:** the example retains the existing $20/month analysis allowance and adds a separate $20/month lookup reservation allowance. Together those defaults permit $40/month in Receipt Decoded reservations. This does not spend or change any live budget until deployment. Set the lookup allowance explicitly during the authorized deployment review if a different combined ceiling is desired; never clear or merge accounting files to bypass caps. At the default 25-cent reservation, the lookup budget permits at most 20/day and 80/month. Actual provider cost and catalog-match quality remain live verification items.

The policy now discloses optional product text and external web search; app consent version 2 refreshes prior grants. Lookup reports are not stored as receipt history and logs contain only aggregate usage/status fields. No Little Moments policy was changed.

## $20 monthly operational allowance

The backend durably reserves 10 nominal cents **before** each paid attempt, with at most 500/day and 2000/month. Defaults permit at most 50 paid attempts/day and **200/month**. Failed or canceled paid attempts still consume reservations. UTC midnight resets daily counters only; the UTC calendar-month boundary resets the monthly allowance. Reservations survive process restarts on the persistent disk. Corrupt files, unsafe counters and a backwards clock fail closed for receipt analysis. Images/results are not stored in this accounting file.

This is an operational reservation cap, **not a guaranteed $20 OpenAI bill**. Actual prices and image/token accounting vary; configurable models can cost more than the reservation. Configure separate provider project budgets/alerts and allowed models, monitor actual usage, and revisit the per-scan reservation when changing models/limits. [OpenAI pricing](https://developers.openai.com/api/docs/pricing/). Provider project budgets may be alerts; do not assume they are hard billing caps. Little Moments' billing and quotas are independent of these receipt counters.

A legacy daily-only receipt usage file cannot establish spend on earlier days of the current month. Its migration preserves the daily counters and conservatively reserves the entire current monthly allowance; receipts remain paused until the next UTC month. To resume earlier, the owner must review actual provider usage, back up the file, and explicitly establish a conservative monthly baseline. **Do not delete or reset the file just to bypass the limit.** A new namespaced receipt file on the existing host has no legacy receipt counters and starts with a fresh allowance. Little Moments' pricing state is never migrated by this code.

## Validation and rollback

October 14 product-lookup verification passed: TypeScript in both repositories; all 92 Receipt Decoded automated tests; all 79 Little Moments server tests; all 14 shared-backend integration tests; and the actual compiled mobile-client/shared-server contract check (two synthetic analyses and one synthetic lookup, zero provider calls). Integration tests exercise the real prefixed lookup endpoint with mocked Responses web search, namespaced model/key settings, independent lookup/analysis/LM quotas, concurrency isolation, durable lookup reservations across restarts and all 11 source-manifest hashes. No main Little Moments generation/auth/pricing code, dependency manifest or lockfile was modified. Deployment and live provider verification remain pending.

October 13 verification passed: 56 Receipt Decoded tests (including three new release-configuration checks), strict mobile TypeScript, 79 existing Little Moments server tests and six shared-service integration tests. All tests also passed under Node 24.14.1, matching Render. The added sixth integration test generates authenticated Little Moments results before, during and after a receipt request, verifies the unchanged Little Moments credential, and confirms only its own quota is consumed. Existing tests cover voice/AI, pricing, subscription webhooks and analytics. All nine copied runtime/policy files match the source and SHA-256 manifest.

`pnpm backend:verify-mobile` exercises the actual compiled `lib/ai-client.ts` against Little Moments' shared HTTP listener, using native adapter shims and synthetic providers. It verifies the exact production HTTPS URL and prefix, first-use consent gate, real multipart JPEG upload, full validated response and development LAN URL resolution. The check now also exercises product-only JSON lookup through the real shared route and validates a typed lookup rate-limit response. Two synthetic analyses and one synthetic lookup made zero provider calls. This is a client/server contract check, not a physical-device or deployed TLS check.

For the owner's expected low traffic, this single-service integration is suitable to deploy after configuration. No service split or load-test project is required for this launch. Before release, let Render install the nested Linux dependencies, run `pnpm backend:verify-online`, perform one consented synthetic check from the app, verify receipt accounting survives a service restart, and generate one ordinary Little Moments result from its installed app. Existing Little Moments pricing/subscription state must be preserved. These production checks remain pending because no deployment was authorized in this verification pass.

Both apps share a deploy/restart. Render's attached disk causes a [brief service interruption during deployment](https://render.com/docs/disks#disk-limitations-and-considerations); this already applies to Little Moments today. Receipt requests have separate limits/accounting, and Little Moments' existing upload timeouts remain unchanged. A receipt provider call has its own 90-second timeout. A future service split can wait until normal observed usage warrants it.

Rollback: set `RECEIPT_DECODED_ENABLED=false` and restart to disable receipts without changing Little Moments routes. For a full code rollback, redeploy the recorded previous Little Moments revision with its original build/start settings. Preserve both business-state and receipt accounting files; do not overwrite them from a source checkout. Keep the prepared mobile release unsubmitted until the correct HTTPS backend is stable.

An independent Render service remains a future isolation option, but is not the owner's selected deployment for this version. No Render setting, Git remote or deployment was changed by this local preparation.

## Reproduce the local checks

From Receipt Decoded, run `pnpm typecheck` and `pnpm ai-server:test`. From Little Moments, install the nested backend dependencies with `npm ci --prefix server/receipt-decoded --omit=dev`, then run `pnpm ai-server:test` and `node --test server/receipt-decoded-integration.test.mjs`. These suites use synthetic data and mock providers, not real AI calls.
