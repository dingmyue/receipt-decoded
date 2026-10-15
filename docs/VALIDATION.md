# V0 validation record

This records checks actually performed. Synthetic integration checks are distinct from real receipt accuracy testing. An App Store submission is not yet validated: publisher/hosting/signing placeholders and physical-device/TestFlight checks remain.

## Automated checks

- Strict TypeScript: passed.
- Expo SDK 57 dependency check: passed.
- Expo Doctor: 21/21 passed.
- Production iOS JavaScript export: passed.
- Backend, shared calculation/contract and saved-consent, presentation-state and monthly usage tests: 53 passed.
- Live Responses integration: six synthetic images passed via the complete HTTP multipart upload pipeline. Aggregate timings/model are in `live-validation.json`; the successful run took approximately 1.1–15.4 seconds per case. Those timings describe this run only.

| Synthetic case | Expected / observed |
|---|---|
| Two CHIFORESTVTY rows + related CRV | One group, 1909 conditional cents |
| One row with quantity two | Historically no duplicate group; superseded by the quantity-review change in `QUANTITY_REVIEW.md` |
| Fully voided second product charge | No duplicate group |
| Two distinct repeated products | Two groups, 1149 conditional cents combined |
| An image that is not a receipt | Unreadable result, no fabricated groups |
| Long receipt with overlapping close-ups | One group, 1909 conditional cents, all 39 financial rows preserved; three consecutive live checks passed |

The live reversal fixture initially failed runtime validation because a legitimate negative unit amount on a reversal was rejected. The contract was corrected, a regression check added, and the complete live set rerun successfully.

The long-receipt test initially exposed AI deduplication of identical products at distinct physical positions. Position labels on close-up images and explicit instructions fixed the observed case; a printed-total reconciliation guard marks incomplete extractions partial instead of claiming a complete clean result. This does not establish accuracy on unseen receipts.

Local regression tests cover integer-cent arithmetic, discounts, product/fee reversals, conservative apportioning, linked fees, unknown amounts, ambiguous links, code mismatches, overlapping grouping proposals, multiple groups, unsupported non-cent currencies, total bounds, forged/malformed output, input images, consent enforcement, multipart limits, chunked uploads, spoofed proxy headers, timeout/cancel behavior, safe upstream errors, and accounting persistence/corruption/concurrency.

## Simulator verification

Verified using SDK 57-compatible Expo Go 57.0.9 on iPhone 17 and iPhone 17 Pro Max / iOS 26.4:

- Home screen renders the app branding and both entry actions.
- iOS selected-photo picker imports a generated receipt without a full-library permission prompt.
- Updated Preview preserves the whole receipt and keeps Check receipt in a fixed footer. First check opens an explicit OpenAI consent sheet; there is no per-scan checkbox.
- Not now preserves the photo. Privacy Policy opens and returns to the sheet without permission or upload. The durable request count remained unchanged through both paths. Allow and check receipt started exactly one live analysis.
- Permission survived a full app reload. About & privacy displayed Allowed, and Turn off permission changed the state to Permission needed before your next check. Saved-consent tests cover version mismatch, missing/malformed records, persistence failure and revoke/grant races.
- A live backend/OpenAI check returns the expected 19.09 USD estimate and linked CRV rows.
- Choosing one marks a possible billing mistake; choosing two or more marks the repeated charges likely expected; Not sure restores the unchecked state.
- Original-photo loading and Zoom in / Reset zoom are verified after a fresh scan.
- With the backend stopped, analysis shows a friendly network error and retains the photo; restarting the service and Try Again returns the correct live result.
- Canceling a long-receipt check returns to Preview with the photo and consent preserved; no late result replaced it.
- Denying camera access offers Open Settings or a Photos fallback and preserves the current receipt.
- Scan another receipt confirms clearing, returns Home and removes the cached JPEG: app-owned copies decreased from one to zero. The original synthetic image remains in Photos.

During development, a Fast Refresh cleared the existing cached image while React retained its session state. Startup cleanup was made idempotent across Fast Refresh and unmount cleanup adjusted. A fresh scan after the fix verified that the original photo loads, Zoom in enlarges it and Reset zoom restores the fit. The earlier blank viewer is recorded as a fixed development regression.

Standalone Release app also launches on iPhone 17 Pro Max and iPhone SE (3rd generation), iOS 26.4. The compact Home screen renders both scan actions. Full maximum Dynamic Type and physical-device responsiveness remain in the TestFlight checklist.

The updated Home and unchanged original-photo viewer listing screenshots are in `docs/app-store/screenshots/` at 1320×2868 with no alpha. The outdated checkbox preview was moved to `docs/ui-review/legacy-native-preview.png`; replace it with a final standalone preview/consent capture before submission. Current UI review evidence is in `docs/ui-review/` and includes Expo Go controls; it is not listing artwork. Add a results listing screenshot from the finalized production HTTPS service.

## Native builds

Standalone Release simulator and unsigned iPhone archives succeeded using Xcode 26.4.1 / iOS SDK 26.4. Dependency warnings remain; these were not zero-warning builds.

- Updated UI Release simulator binary: passed, zero errors; incremental build reported 53 dependency/script warnings. Production iOS export and strict TypeScript also pass. The updated native Home renders both actions on Pro Max and iPhone SE (3rd generation).
- Unsigned physical-device archive: passed, zero errors, 207 dependency/script warnings. Saved at `artifacts/ReceiptDecodedV0.xcarchive`; compile validation only, not a signed distributable IPA. This archive predates the UI refinement; rebuild the final source when configuring signed distribution.
- Signed IPA / TestFlight: not attempted; requires the actual Apple team and app record.
- Required native privacy manifest: generated and plist-validated; archived app has Photos or Videos, Purchase History and Payment Info declarations, tracking false, plus SDK required-reason API declarations. Info.plist confirms iPhone-only, iOS 16.4 minimum, version 1.0.0, no microphone permission, and the encryption exemption flag.

## Real receipt and device launch gate

No real shopper receipts have been submitted during these checks. Before public release, run 20–30 consented, redacted where appropriate, human-reviewed receipts through the production service. Keep test photos outside Git; record anonymized expectations/results in the table below. Do not upload private receipts to OpenAI without the owner’s informed consent.

| ID | Receipt type / difficulty | Human expected groups and amount | Actual outcome | Review |
|---|---|---|---|---|
| `[R01]` | `[Store / clean receipt]` | `[Expected]` | `[Observed]` | `[Pass / fix]` |
| `[R02–R30]` | `[Continue per receipt]` | `[Expected]` | `[Observed]` | `[Pass / fix]` |

Include independent duplicate rows, legitimate repeated items, quantity-two single rows, CRV, discounts, product/fee reversals, multiple groups, missing prices, long receipts, glare, folds, low light and receipts with no obvious duplicates. Verify no duplicate charge or fee is counted twice. Record wrong flags and missed duplicates, not only successful examples.

Physical/TestFlight checklist:

- Camera permission granted and denied; choose-from-Photos fallback and iOS Settings recovery.
- Camera capture, HEIC library conversion, very long photo readability, pinch/button zoom and scrolling.
- No saved permission → no upload; first-use Allow, Not now and policy navigation; later checks remember permission; revoke, relaunch and disclosure-version changes prompt again; offline policy accessible.
- Cancel during upload/AI; background/foreground; app switcher obscures receipt; retry cannot show stale results.
- Offline/server-busy/daily-limit/timeouts and recovery; repeated taps cause one request.
- Smaller iPhone and maximum Dynamic Type; labels remain readable, controls at least 44 points.
- VoiceOver navigation, consent sheet actions, quantity selection/disclosure state and live result/error announcements.
- Clearing/new scan removes the app-owned cached file; original Photos image remains; relaunch clears interrupted-session cache.
- Production HTTPS from cellular network, persistent daily accounting across host restart, live service throughout review.
- Final signed archive privacy report, correct unique identity, icon/splash and no development controls in listing screenshots.

Fill unknown publisher/deployment details, run `pnpm release:check -- --online`, upload a signed build to TestFlight, complete these checks, then submit the finalized listing. No public release or submission is implied by passing local tests.

## Dependency audit

The first audit reported two high and two moderate transitive advisories. The runtime URL-decoding denial-of-service issue is addressed with decode-uri-component 0.5.0 plus a small query-string CommonJS compatibility patch. Xcode project tooling uses patched uuid 11.1.1. The final audit reports zero moderate and two high advisories; both remaining entries are described below. TypeScript, routing regression test, Expo Doctor and the production export pass with the updated dependency resolution.

Two high advisories currently have no published patched release in the registry: [node-forge signature validation](https://github.com/advisories/GHSA-86w9-cpqp-85rv) and [braces nested-pattern exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). The installed versions were the registry’s latest (node-forge 1.4.0, braces 3.0.3). Dependency-path inspection places them in Expo code-signing/CLI and Metro build tooling, outside the receipt backend’s request-processing imports. Neither is used to verify uploaded receipts or provider HTTPS; Node handles TLS. This is a scoped assessment, not a claim that the dependency tree is vulnerability-free. Keep Metro private to your development network, use trusted build inputs, and re-audit for upstream fixes before signed distribution. Do not suppress the advisories or claim a clean audit.

## UI refinement sign-off

Designer/developer iteration completed with two requested revisions and designer sign-off in `docs/UI_UX_REVIEW.md`. Seven Pro Max screens were visually reviewed. Live conditional amounts, quantity 1 / 2 or more / Not sure, expandable evidence, consent decline/policy/acceptance, reload persistence and revocation were verified. The automation tool returned windowNotFoundAtPosition for coordinate clicks and scrolling; a human selected the synthetic photo. Full touch scrolling, maximum Dynamic Type, VoiceOver and compact-phone complete flow remain unverified release checks.

## Unclear-receipt follow-up

The user's screenshot revealed repeated uncertainty cards and raw analysis warnings pushing the item controls out of view. The revised screen uses one concise uncertainty summary, keeps source warnings in an expandable section after the items, suppresses unsupported monetary headlines, and offers photo recovery without an automatic upload. Partial checks remain amber when repeated quantities match.

Five refreshed review captures are in `docs/ui-review/uncertain/`: unknown amount/currency with quantity 1, expanded notes, a readable partial estimate, partial with expected quantities, and unreadable recovery. The designer re-reviewed the source and all five images and signed off in `docs/UI_UX_REVIEW.md`.

For deterministic visual checks, a temporary local synthetic backend and separate Expo session returned validated fixtures from `tests/ui-results-fixtures.mjs`. Three requested checks completed with zero provider calls. No private receipt was uploaded for this regression. The five original warning messages remained in the expanded accessibility tree; Try a clearer photo preserved the current photo and left the request counter unchanged, and View receipt/Back remained functional. The temporary backend and Expo session were stopped afterwards; the live development session on port 8082 remains.

The updated iOS production export, strict TypeScript, 53 automated tests and Release simulator build passed. Touch scrolling, maximum Dynamic Type, VoiceOver and physical-device checks remain separate release checks; the control tool did not produce a verifiable scroll movement during this pass.

## Shared Little Moments backend preparation

Owner selected the existing Render service and a $20 monthly Receipt Decoded allowance. Local integration uses an optional lazy `/receipt-decoded/**` route, dedicated receipt configuration/key, one receipt request at a time, and a separate persistent usage file. It is disabled by default. Nine runtime/policy files were synchronized and their hashes matched the source. Little Moments root package/lockfile, mobile configuration and local environment file remain unchanged.

The combined Little Moments suite passed 84 tests (79 existing plus five integration tests). Integration checks verify original health/policies/app-secret protection/pricing, receipt namespace links and consent, missing-key/dependency/configuration isolation, receipt concurrency, and monthly exhaustion without changing Little Moments quotas. Receipt Decoded's 53 tests include month/day rollover, restart durability, legacy accounting migration and corrupt-state handling. The $20 value bounds nominal reservations, not a guaranteed provider bill.

All 25 production export files, including compiled bundles, were inspected for the actual private server credential; no match was found. No Git push, Render change, deployment, live backend restart or production accounting migration occurred. Render runtime, persistent disk, resource capacity, proxy/logging, dedicated project configuration and signed distribution still require release validation. See `docs/DEPLOYMENT.md` for exact setup and rollback.

## Mobile and shared-server recheck — October 13, 2026

Read-only Render inspection confirmed Starter compute, Hobby workspace, Oregon, Node 24.14.1, existing 1 GB disk at `/persistent`, `main` branch, `pnpm install` build and `pnpm ai-server` start. The health-check path is blank and no receipt variables are configured. GitHub comparison confirmed remote `main` equals Render's deployed revision `152f716`; the receipt integration is still local. Public Little Moments health and three policy pages passed. All four receipt health/policy routes returned 404, correctly identifying deployment as pending.

Both suites passed on Node 24.14.1 matching Render: 56 Receipt Decoded tests (53 existing plus three release-configuration checks) and 85 Little Moments/shared tests (79 existing plus six integration checks). The added shared-service check verifies successful authenticated Little Moments generation before, during and after a receipt request with unchanged Little Moments credentials and correct independent quota accounting. Little Moments' root dependency/lockfile, EAS config, app config and mobile AI client have no diff from HEAD.

The actual mobile client's compiled source passed `pnpm backend:verify-mobile` against the shared HTTP listener using Expo native adapter shims and mock AI. This verified consent before upload, production HTTPS enforcement, exact namespaced endpoint, actual multipart JPEG upload, response validation and development LAN URL resolution. Two synthetic checks made no provider call. All nine backend/policy copies match the source SHA-256 manifest.

The known public base, Render hosting region and dashboard application-log retention were filled, policies regenerated and server copies synchronized. Release validation now also rejects a missing receipt prefix on the shared hostname and another app's HTML policy pages. Release setup intentionally remains blocked by missing owner/Apple/EAS details and undeployed receipt routes. Production Linux Sharp installation, a real provider-backed mobile scan, persistent accounting through restart and installed Little Moments smoke verification remain deployment checks. Docker was unavailable, so no Linux execution is claimed. No production setting or traffic data was changed.

See `docs/DISTRIBUTION_CHECKLIST.md` for remaining steps. This assessment uses normal low traffic; no server split is required for this launch.

## Live Expo Go → Render verification — October 13, 2026

After the owner deployed/enabled the shared backend, local `.env` was updated to `EXPO_PUBLIC_AI_BASE_URL=https://little-moments-api.onrender.com/receipt-decoded`, preserving other settings and mode 0600. Expo Go Metro was restarted on port 8082 and the app explicitly reloaded. Its served launch bundle contains the Render receipt URL.

One live check in Expo Go on the iPhone 17 Pro Max simulator submitted the fictional Sample Market receipt to the production HTTPS service. The result read total $38.18, two Sparkling water charges at $17.89 and two linked Container deposit fees at $1.20. It displayed a conditional $19.09 extra. Selecting 1 purchased retained $19.09; selecting 2 or more changed to qualified expected charges. Expandable details and original receipt viewer/Back worked. The sample was cleared through the ordinary confirmation flow. The Mac locked before a final Home-screen observation could be completed; Metro was separately confirmed still running. No real shopper receipt was used. Native result evidence is `docs/ui-review/render/live-result.png`; it contains Expo Go controls and is not listing artwork.

Receipt health returned 200 with `analysisAvailable: true`. Little Moments health and its three policy pages passed; its health remained 200/ok after the live receipt check. Receipt policy pages are reachable but still contain publication placeholders, so the full online release gate correctly fails those pages. Persistent accounting through a restart, signed-build/physical-device checks and an installed Little Moments generation remain separate release checks; they were not performed in this pass. Metro is left running for the owner at `exp://192.168.1.116:8082`, using Render.

## Marketing artwork validation

Three composed App Store screenshots were exported as opaque, sRGB, three-channel 1320×2868 PNGs. The ZIP contains exactly these three images. Source screenshots came from the current standalone native Debug app through ordinary product flows, with fictional Sample Market receipt data. The loopback capture backend reported one synthetic check and zero provider calls. No app UI was reconstructed or repainted.

The designer reviewed the quarter-size contact sheet and all three full exports and granted sign-off without further revisions. Conditional amount and expected-state accuracy qualifiers remain visible. Editable copy/layout, source hashes, renderer and refresh guidance are saved with the artwork. Verify visible screens against the final signed Release app before public submission. See `docs/APP_STORE_MARKETING.md`.

After capture, the synthetic receipt was cleared from the native app, temporary AI permission revoked, screenshot status-bar overrides cleared, and the capture backend/Metro stopped. The current Release simulator app was reinstalled and ordinary Expo Go development session reopened; the user's normal backend and Metro were preserved.
