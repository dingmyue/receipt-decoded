# Receipt Decoded — remaining steps to distribute

Verified October 13, 2026. The shared-server candidate is compatible with Little Moments in local tests under the exact production Node version. Receipt Decoded's mobile client/server contract passes. The receipt extension is not deployed, enabled or connected to an EAS production build yet. No Git push, Render configuration change, EAS project creation, signing, upload or submission was performed.

## Information to provide

Already filled: publisher **Mingyue Ding**, support **littlemoments.support@gmail.com**, shared Render hostname, Oregon hosting region and Render dashboard's 7-day application-log retention. The selected launch is free, with no subscriptions or ads, in all available App Store territories.

| Needed | Where to find it / action |
| --- | --- |
| Confirm `com.mingyue.receiptdecoded` as this app's bundle ID | Apple Developer → Certificates, Identifiers & Profiles → Identifiers. Register a separate explicit App ID for Receipt Decoded if absent; check availability. It must match the EAS build and App Store app record. |
| Apple Team ID | Apple Developer → Membership details; the 10-character Team ID, not a password. |
| App Review contact phone and preferred email | Use Mingyue Ding and the support email unless you prefer another reachable review contact. Put the phone in App Store Connect, not public app code. |
| EU trader declaration | Complete your own declaration in App Store Connect; provide the verified public contact details Apple requests if declaring trader status. |
| OpenAI project processing region | Confirm the production project's data/region configuration before replacing `[OpenAI processing region]` in the Privacy Policy. The code uses the standard API endpoint; it does not configure regional residency. |
| Policy effective date | Use the date the finalized policy is published, in YYYY-MM-DD format. |

Later, provide the **numeric App Store Connect Apple ID** and **EAS project UUID** after creating those records. Keep passwords, verification codes, API keys and signing credentials in the relevant service's secure setup flow; no need to paste them into chat.

## 1. Finalize the local configuration

Save the reviewed app in its own Git repository and record the reviewed server changes in Little Moments. Receipt Decoded currently has no initial commit; make that commit before the distribution workflow prompts for it. A remote app repository is useful for backup, but it does not need a Render service. Only Little Moments' server repository is deployed to the existing service.

In `shared/app-info.json`, fill the Team ID, effective date and eventual App Store app ID, and set `bundleIdentifierConfirmed: true` after confirming the identifier. `publicSiteUrl` is already `https://little-moments-api.onrender.com/receipt-decoded`.

Complete the OpenAI processing-region placeholder in `shared/legal-copy.json`; confirm there is no additional hosting log forwarding requiring a separate retention disclosure. Then run from Receipt Decoded:

```sh
pnpm policies:export
pnpm backend:sync-little-moments
pnpm typecheck
pnpm ai-server:test
pnpm backend:verify-mobile
```

From Little Moments, run:

```sh
node --test server/index.test.mjs server/receipt-decoded-integration.test.mjs
```

The receipt source is maintained here; the runtime/policy copy is deployed from Little Moments. Sync after changing backend or policy files. Little Moments' root dependency files, mobile code, existing keys and business state are unchanged.

## 2. Deploy the shared server on Render

Open [the existing service settings](https://dashboard.render.com/web/srv-d7pev4jeo5us73en6jng/settings). It currently auto-deploys `main` on commit. Coordinate the push and settings, or temporarily use manual deployment while preparing them. No new service is needed.

Record current revision `152f716` and back up existing persistent business state before the normal release. Push the reviewed Little Moments changes, including the route adapter, nested backend package/lockfile, runtime and policies. Do not include local `.env` files or `node_modules`.

| Render setting | Value |
| --- | --- |
| Repository / branch | Existing `dingmyue/little-moments` / `main` |
| Root directory | Leave blank |
| Node | Keep existing 24.14.1; no upgrade needed |
| Build command | `pnpm install && npm ci --prefix server/receipt-decoded --omit=dev` |
| Start command | Keep `pnpm ai-server` |
| Health-check path | Set `/health` (currently blank), which checks Little Moments |
| Persistent disk | Keep existing `/persistent` mount |
| Existing Little Moments variables | Keep unchanged |

In Render Environment, add these receipt-only variables:

```dotenv
RECEIPT_DECODED_ENABLED=true
RECEIPT_DECODED_OPENAI_API_KEY=<enter the production Receipt Decoded key securely in Render>
RECEIPT_DECODED_OPENAI_RECEIPT_MODEL=gpt-4.1-mini
RECEIPT_DECODED_USAGE_STATE_PATH=/persistent/server-data/receipt-decoded-usage.json
RECEIPT_DECODED_MONTHLY_AI_BUDGET_CENTS=2000
RECEIPT_DECODED_DAILY_AI_BUDGET_CENTS=500
RECEIPT_DECODED_MAX_SCAN_BUDGET_CENTS=10
RECEIPT_DECODED_MAX_CONCURRENT_REQUESTS=1
```

Other defaults are already correct: 8 MiB upload ceiling, six receipt attempts per IP/minute, 90-second analysis timeout and proxy trust 0. Use a dedicated OpenAI project/key for separate spending visibility. The $20 allowance reserves nominal amounts before paid attempts, permitting at most 200/month under defaults; it is not a guarantee of the provider bill. Set provider budget alerts and monitor actual usage.

Save the reviewed configuration and deploy the candidate. The new build must contain the nested package before its install step can run. Render will install the Linux Sharp binaries from the nested lockfile. Its [attached persistent disk means a brief restart interruption](https://render.com/docs/disks#disk-limitations-and-considerations), already part of this service's deployment behavior.

After deployment, run `pnpm backend:verify-online` from Receipt Decoded. Both apps' health and policy routes must pass. Then check one fictional receipt through the app with consent and create one ordinary Little Moments entry with AI from the installed app. Confirm existing subscription/pricing state remains correct. Check that the receipt usage file exists under `/persistent` and preserves its aggregate counts across a subsequent normal restart; never reset business/usage files to make a test pass. Receipt health alone does not prove the key can make a provider request or the disk is writable.

If receipt configuration needs fixing, set `RECEIPT_DECODED_ENABLED=false` and restart; Little Moments routes continue. The full rollback is the recorded previous revision and original `pnpm install` build command. Preserve both apps' persistent state.

## 3. Create this app's Expo project

The CLI is already signed in to **mingyueding**. From Receipt Decoded, initialize a new EAS project for this app; do not link Little Moments' project. Use a current EAS CLI:

```sh
pnpm dlx eas-cli@latest init
```

Ensure `app.json` contains the new `expo.extra.eas.projectId`. Because this app has a dynamic config file, copy the supplied project ID into the static config if EAS cannot write it automatically. Preserve the existing SDK 57 configuration and `eas.json` build profiles.

In this new Expo project's Environment Variables page, create a **project-scoped, plain-text** variable for the **production** environment:

```dotenv
EXPO_PUBLIC_AI_BASE_URL=https://little-moments-api.onrender.com/receipt-decoded
```

Use the same URL for `preview` if making a preview build against this service. Do not upload the OpenAI key, Little Moments' app secret or either local `.env` to EAS. Inspect account-wide variables too, so a server key is not inherited. The local `.env` remains for laptop development; it does not configure cloud builds. See [Expo's environment-variable guide](https://docs.expo.dev/eas/environment-variables/).

## 4. Create the Apple app record

Sign into [App Store Connect](https://appstoreconnect.apple.com). Accept any outstanding Apple agreements yourself, then Apps → + → New App, per [Apple's app-record guide](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/).

| Field | Value |
| --- | --- |
| Platform | iOS |
| Name | Receipt Decoded, subject to availability |
| Primary language | English (U.S.) |
| Bundle ID | The confirmed `com.mingyue.receiptdecoded` |
| SKU | Suggested unique internal value: `receipt-decoded-ios-001` |
| Category | Utilities; Shopping optionally secondary |
| Price | Free |
| Availability | All available countries/regions, subject to Apple's regional requirements |

Copy the numeric Apple ID from App Information into `shared/app-info.json`. Follow Apple's [EU trader requirements](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/). If selecting China mainland, complete any applicable [filing requirements](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/); selecting worldwide does not waive regional documentation. No regional filings or declarations have been made for you.

## 5. Build, upload and test

With the service live and all local placeholders filled, run:

```sh
EXPO_PUBLIC_AI_BASE_URL=https://little-moments-api.onrender.com/receipt-decoded pnpm release:check -- --online
pnpm dlx eas-cli@latest build --platform ios --profile production
pnpm dlx eas-cli@latest submit --platform ios --latest
```

The production pre-install hook intentionally stops incomplete builds. During EAS signing, sign into the correct Apple account/team and approve provisioning for this app. Do not revoke Little Moments' certificates. EAS Submit uploads the binary to App Store Connect; it does not publish the public listing. After processing, add yourself as an internal TestFlight tester and install the build. See [Expo's iOS submission guide](https://docs.expo.dev/submit/ios/).

Test camera/Photos, first-use permission and remembered/revoked permission, duplicate results, quantity changes, legitimate repeats, unclear receipts, offline retry, cancellation, receipt clearing, policy links and readable text on your physical iPhone. Check several actual receipts against their printed charges, plus the synthetic example. Verify the final signed app's privacy report, icon and screenshots. `docs/VALIDATION.md` records checks still requiring physical-device/accessibility verification.

## 6. Complete the listing and submit for review

Copy listing text, keywords and review notes from `docs/APP_STORE.md`. Upload the three marketing PNGs in filename order. Complete the age-rating questionnaire, content-rights and encryption declarations, and App Privacy answers reflecting full receipt photos sent to OpenAI. Do not select Data Not Collected merely because the app has no accounts. Confirm the final provider/hosting settings before final privacy answers.

Use these public URLs after their online checks pass:

- Privacy: `https://little-moments-api.onrender.com/receipt-decoded/privacy`
- Support: `https://little-moments-api.onrender.com/receipt-decoded/support`
- Terms: `https://little-moments-api.onrender.com/receipt-decoded/terms`

Fill App Review contact details; no login or demo account is needed. Attach the fictional sample receipt if helpful. Select the tested build, choose manual release if you want control of launch timing, and submit for App Review. Keep the backend available through review. Once approved, release when ready.
