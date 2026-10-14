# Receipt Decoded — remaining steps to distribute

Updated October 13, 2026. The shared-server candidate passed compatibility tests with Little Moments under the production Node version, and the mobile client/server contract passed. After your Render deployment, a fictional receipt was verified through Expo Go against Render. The Expo project is linked and the Apple app record is created. A signed production build, TestFlight upload and App Review submission still require completion; recheck live server availability before building.

## Information to provide

Already filled: publisher **Mingyue Ding**, support **littlemoments.support@gmail.com**, effective date **October 13, 2026**, shared Render hostname, Oregon hosting region and Render dashboard's 7-day application-log retention. The selected launch is free, with no subscriptions or ads, in all available App Store territories.

| Needed | Where to find it / action |
| --- | --- |
| EU trader declaration | Complete your own declaration in App Store Connect; provide the verified public contact details Apple requests if declaring trader status. |

Confirmed and saved: bundle ID **`com.mingyue.receiptdecoded`**, Apple Team ID **`H58VQCUZ9J`**, App Store Connect Apple ID **`6822563840`**, and EAS project UUID **`b41c5690-5f18-40f7-a36f-b885fac3873c`**. Keep passwords, verification codes, API keys and signing credentials in the relevant service's secure setup flow.

App Review contact details are saved in Apple’s private review form. The owner confirmed standard OpenAI API usage with no selected processing region; the local policy now states that no regional data residency is enabled and processing may occur outside the user's country. Redeploy the synced Little Moments server copy before submission. See `docs/APP_STORE_SETUP_STATUS.md` for listing completion.

## 1. Finalize the local configuration

Save the reviewed app changes in its own Git repository and record reviewed server changes in Little Moments. Receipt Decoded has its initial commit. A remote app repository is useful for backup, but it does not need a Render service. Only Little Moments' server repository is deployed to the existing service.

`shared/app-info.json` now contains the verified Team ID and App Store app ID, with `bundleIdentifierConfirmed: true`. `publicSiteUrl` is `https://little-moments-api.onrender.com/receipt-decoded` and `effectiveDate` is `2026-10-13`. `eas.json` targets this Apple app under `submit.production.ios`.

The policy placeholder is resolved and exported HTML regenerated. Confirm there is no additional hosting log forwarding requiring a separate retention disclosure, then run from Receipt Decoded after any future changes:

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

## 3. Expo project configuration

Completed October 13: linked `@mingyueding/receipt-decoded`, project ID `b41c5690-5f18-40f7-a36f-b885fac3873c`, uploaded the selected icon and set project-scoped production `EXPO_PUBLIC_AI_BASE_URL` to the Render receipt base. The EAS profiles explicitly select the `sdk-57` iOS build image. No account-wide variables were changed.

The CLI is signed in to **mingyueding**. The existing project is already linked. For a fresh checkout, use the existing project ID rather than creating another project:

```sh
pnpm dlx eas-cli@latest init --id b41c5690-5f18-40f7-a36f-b885fac3873c
```

Ensure `app.json` contains the new `expo.extra.eas.projectId`. Because this app has a dynamic config file, copy the supplied project ID into the static config if EAS cannot write it automatically. Preserve the existing SDK 57 configuration and `eas.json` build profiles.

In this new Expo project's Environment Variables page, create a **project-scoped, plain-text** variable for the **production** environment:

```dotenv
EXPO_PUBLIC_AI_BASE_URL=https://little-moments-api.onrender.com/receipt-decoded
```

Use the same URL for `preview` if making a preview build against this service. Do not upload the OpenAI key, Little Moments' app secret or either local `.env` to EAS. Inspect account-wide variables too, so a server key is not inherited. The local `.env` remains for laptop development; it does not configure cloud builds. See [Expo's environment-variable guide](https://docs.expo.dev/eas/environment-variables/).

## 4. Create the Apple app record

Completed October 13: [Receipt Decoded, Apple ID 6822563840](https://appstoreconnect.apple.com/apps/6822563840/distribution). The explicit bundle identifier was registered on team `H58VQCUZ9J`; iOS, English (U.S.) and SKU `receipt-decoded-ios-001` were selected. Category, pricing, availability and submission declarations remain to be configured. Apple showed a user-access save warning after creation and reported that all existing users have access, matching the selected Full Access setting.

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

The production pre-install hook stops invalid build configuration, unreachable/wrong policy routes and insecure or missing backend setup. It warns about unfinished publication details so the first signed test build can be prepared before the App Store app record and policy metadata are finalized. Run the full `pnpm release:check -- --online` before submission; it still rejects these placeholders. During EAS signing, sign into the correct Apple account/team and approve provisioning for this app. Do not revoke Little Moments' certificates. EAS Submit uploads the binary to App Store Connect; it does not publish the public listing. After processing, add yourself as an internal TestFlight tester and install the build. See [Expo's iOS submission guide](https://docs.expo.dev/submit/ios/).

Test camera/Photos, first-use permission and remembered/revoked permission, duplicate results, quantity changes, legitimate repeats, unclear receipts, offline retry, cancellation, receipt clearing, policy links and readable text on your physical iPhone. Check several actual receipts against their printed charges, plus the synthetic example. Verify the final signed app's privacy report, icon and screenshots. `docs/VALIDATION.md` records checks still requiring physical-device/accessibility verification.

## 6. Complete the listing and submit for review

Copy listing text, keywords and review notes from `docs/APP_STORE.md`. Upload the three marketing PNGs in filename order. Complete the age-rating questionnaire, content-rights and encryption declarations, and App Privacy answers reflecting full receipt photos sent to OpenAI. Do not select Data Not Collected merely because the app has no accounts. Confirm the final provider/hosting settings before final privacy answers.

Use these public URLs after their online checks pass:

- Privacy: `https://little-moments-api.onrender.com/receipt-decoded/privacy`
- Support: `https://little-moments-api.onrender.com/receipt-decoded/support`
- Terms: `https://little-moments-api.onrender.com/receipt-decoded/terms`

Fill App Review contact details; no login or demo account is needed. Attach the fictional sample receipt if helpful. Select the tested build, choose manual release if you want control of launch timing, and submit for App Review. Keep the backend available through review. Once approved, release when ready.
