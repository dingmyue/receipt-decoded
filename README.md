# Receipt Decoded

Every charge, explained.

An iPhone receipt checker built with Expo SDK 57, React Native and a server-only OpenAI Responses integration. V0 photographs or selects one receipt, previews it, asks for explicit AI consent, checks independent repeated product charges, and lets the shopper verify purchased quantities. Linked fees and discounts are included only when readable and attributable. Results are conditional estimates, not guaranteed refunds.

No accounts, ads, tracking, billing, receipt database or history. Receipt analysis and quantity answers stay in memory; temporary photo copies are removed on clear/new scan/next app launch. Provider retention is explained in the policy.

## Run locally

Use Node 24.19.0 (minimum 22.14), pnpm 9.0.0, and an SDK 57-compatible Expo Go. Local native builds use Xcode 26.4.1 and CocoaPods.

```sh
pnpm install --frozen-lockfile
cp -n .env.example .env
# Set OPENAI_API_KEY in .env (server only).
pnpm ai-server
```

In a second terminal:

```sh
pnpm start --go --ios --port 8082
```

For an iPhone, connect to the Mac’s Wi-Fi and open the Expo URL/QR. Development replaces `http://localhost:8787` with the Expo host’s LAN address. Restart Expo after changing public environment variables. Keep the backend and Metro running. Production builds require an HTTPS service and do not use this development fallback.

Scan Receipt uses the camera; Choose from Photos uses iOS’s selected-photo picker without asking for full-library access. The simulator has no camera; test that path on a physical iPhone. Check receipt opens an explicit OpenAI permission sheet on first use. The versioned choice is remembered on this device and can be turned off in About & privacy. No upload begins without valid permission. About & privacy contains offline policy, support and terms pages.

## Verification

```sh
pnpm typecheck
pnpm ai-server:test
pnpm exec expo install --check
pnpm dlx expo-doctor
pnpm exec expo export --platform ios
```

The automated tests are local and make no paid API requests. For a paid integration check, generated **synthetic** images contain no user receipts or personal information:

```sh
pnpm fixtures:generate
pnpm ai-server:test:live
```

The live script processes six synthetic cases via the complete HTTP upload → image validation → AI → normalization pipeline and writes aggregate results to `docs/live-validation.json`. These fixtures verify integration; they do not establish accuracy on real shopping receipts. Physical-device and real-receipt validation remain required before public distribution.

## Implementation

- `app/`: Home, review/analyzing, results, original-photo viewer, About, privacy, support and terms.
- `components/`: accessible controls, receipt viewer, duplicate product cards and legal pages.
- `lib/`: temporary photo handling, in-memory session, networking and formatting.
- `shared/`: strict response validation, integer-cent calculations, policy content and publisher placeholders.
- `server/`: bounded multipart uploads, image normalization and long-receipt close-ups, strict structured AI extraction, deterministic estimates, safe errors, rate/concurrency controls and durable daily aggregate reservations.
- `assets/`: selected opaque icon and original splash artwork. `icon-master.png` preserves the adapted owner-provided icon; `pnpm assets:generate` exports it to `icon.png` without restoring the previous design.

The app uploads one JPEG plus consent to `POST /api/receipt/analyze`. The backend accepts JPEG/PNG/WebP, strips metadata, retains no receipt database, requests `store:false`, validates output, and returns safe receipt data. Single quantity-two product rows, FSA summaries and duplicate fees alone are not duplicate product groups. Fully reversed product charges are accounted for. Unknown price/link/currency calculations are suppressed rather than invented.

Expanded duplicate-card Details optionally calls `POST /api/product/lookup` with only merchant/item identifiers and product descriptions. Responses web search uses a separately configured `OPENAI_PRODUCT_LOOKUP_MODEL`, validated source provenance and independent rate/cost protection. Results are cached only for the current receipt; checking items remains independent. See [product-identification API, configuration, privacy and tests](docs/PRODUCT_IDENTIFICATION.md).

`GET /health` reports availability without secrets. Public `/privacy`, `/support`, `/terms` pages use the same content as the app. No browser CORS is needed for the native client. A public mobile service cannot securely authenticate an installation with an embedded shared secret; operational caps bound use, and deployment guidance covers abuse controls.

Only EXPO_PUBLIC_AI_BASE_URL is bundled into mobile code. Keep OPENAI_API_KEY exclusively on the backend. Local `.env` is ignored by Git and excluded from EAS uploads. The production Receipt Decoded backend lives in the Little Moments repository; backend changes are synced and verified there alongside app changes.

## Release handoff

[App Store setup and listing](docs/APP_STORE.md), [deployment](docs/DEPLOYMENT.md), and [validation evidence](docs/VALIDATION.md) describe the release candidate and the remaining publication steps. Fill `shared/app-info.json` and policy placeholders, confirm this app’s unique identity, deploy HTTPS, configure EAS/Apple signing, then run:

```sh
pnpm release:check -- --online
```

Production EAS builds run the release configuration guard. No remote deployment, Git push, signing setup, TestFlight upload or App Store submission has been performed. A local export or unsigned simulator build is not a distributable IPA.

Dependencies use SDK 57 packages, with the core Expo version 57.0.28 and SDK runtime 57.0.0. The pnpm lockfile pins resolutions; `.npmrc` avoids installing incompatible optional Router drawer peers. The app uses Stack navigation only.
