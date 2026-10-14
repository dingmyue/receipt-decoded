# Receipt Decoded 1.0 — release handoff

The V0 app and backend are implemented on Expo SDK 57. The Expo project and Apple app record are linked, the server was deployed by the owner, and App Store listing setup is recorded in `docs/APP_STORE_SETUP_STATUS.md`. A signed distribution must still be uploaded and tested. No App Review submission or public release has been performed.

Use `docs/DISTRIBUTION_CHECKLIST.md` for the current ordered owner handoff and exact shared Render settings. The public base is `https://little-moments-api.onrender.com/receipt-decoded`; live Expo Go analysis against the deployed service passed. Publisher, support email, effective date (October 13, 2026), Render/Oregon hosting and Render dashboard retention are filled. The owner confirmed standard OpenAI API usage without a selected region. The local policy has no processing-region placeholder; its server copy must be redeployed before submission.

## Owner configuration to complete

| Field | Edit / action |
|---|---|
| Publisher legal name, support email, effective date | `shared/app-info.json` |
| Hosting provider, processing regions, log retention | `shared/legal-copy.json` — replace the three bracketed entries after configuring hosting |
| Public HTTPS site | `shared/app-info.json` publicSiteUrl; deploy the service’s `/privacy`, `/support` and `/terms` endpoints |
| Unique app identity | Confirm or replace `app.json` ios.bundleIdentifier, currently `com.mingyue.receiptdecoded`; then set bundleIdentifierConfirmed true |
| Apple Developer team ID | `shared/app-info.json` appleTeamId |
| App Store Connect numeric app ID | Create the app record, then fill appStoreConnectAppId |
| Expo project | Initialize an independent EAS project for Receipt Decoded; do not reuse Little Moments’ project |
| Production mobile backend | Set only `EXPO_PUBLIC_AI_BASE_URL=https://…` in the EAS production environment |
| Server key | Configure a dedicated OpenAI project/key on the backend only; confirm training/data-sharing settings remain off |
| App Review contact | `[Reviewer contact first name]`, `[Last name]`, `[Phone]`, `[Email]` in App Store Connect |
| Copyright | `2026 Mingyue Ding` |
| Territories and price | All available App Store countries and regions; free, no in-app purchases |
| EU trader status | `[Trader/non-trader declaration and required verified contact details]`, if distributing in the EU |

`pnpm release:check` intentionally fails until these details are completed. The production EAS pre-install hook uses `--build --online`: it checks secure connectivity, app identity, project linkage and excludes server keys, while reporting unfinished publication details as warnings for the first signed test build. The full public-submission check remains `pnpm release:check -- --online`; App Store metadata and policy placeholders must pass before submitting. Neither check attests Apple approval or real-receipt accuracy.

## App Store listing (English / US)

**Name:** Receipt Decoded

**Subtitle:** Check for duplicate charges

**Promotional text:** Take a photo of a shopping receipt, review possible repeated charges, and check the quantities you actually bought.

**Keywords:** receipt,scanner,duplicate,charge,shopping,checkout,grocery,checker

**Description:**

Every charge, explained.

Receipt Decoded helps you check shopping receipts for possible duplicate product charges. Take a receipt photo or choose one from Photos, then review the products and related fees that may need a closer look.

• Review your photo before sending it for analysis.
• Spot repeated product charges and readable related fees or discounts.
• Tell the app how many you actually bought to update the conditional estimate.
• View the receipt photo while you check the result.
• Start another scan when you’re done. No account or receipt history.

A repeated product can be a legitimate purchase. AI can miss or misread receipt details, and estimates are not confirmed refunds or money saved. Verify possible errors with the retailer. Tax adjustments are not estimated. Some receipts or currencies may need manual review.

An internet connection is required for analysis. Your selected receipt is sent through our service to OpenAI only after you agree. OpenAI’s provider retention can apply; see our Privacy Policy for details. Service usage limits may apply. The app is free, with no ads, subscriptions or in-app purchases.

**Primary category:** Utilities. **Secondary category:** Shopping (optional).

**Privacy Policy URL:** `[Public HTTPS site URL]/privacy`

**Support URL:** `[Public HTTPS site URL]/support`

**Marketing URL:** optional; omit until a real marketing page exists.

## App Review notes

No sign-in or demo account is required. The app’s receipt analysis service must stay live throughout review.

1. Open Receipt Decoded and tap Choose from Photos, or Scan Receipt on a physical iPhone.
2. Select a clear shopping receipt. Review receipt shows the photo and Check receipt action. Tap it to open the first-use permission sheet; opening the sheet sends nothing.
3. Read the OpenAI sharing disclosure, then tap Allow and check receipt. The explicit permission is saved locally for the current disclosure version and subsequent checks. Not now sends nothing. Turn off permission in About & privacy to cancel active processing and require a new choice for the next check. Meaningful disclosure changes or unavailable saved records also prompt again.
4. Results show receipt details when readable, possible duplicate products, linked fees/discounts and conditional estimates. Quantity choices distinguish a possible error from legitimate repeated purchases.
5. View Original Receipt opens the photo. Scan Another Receipt clears the app’s temporary copy, result and quantity answers.
6. About includes Privacy Policy, Support and Terms of Use. No purchases, tracking, account creation or account deletion flow exists.

Analysis is limited to duplicate product charges. Quantity-two on a single printed row is not automatically a duplicate. Amounts exclude tax adjustments and are not guaranteed refunds. If unreadable, the app asks for another clear photo. If service limits are reached, it explains that checking is temporarily unavailable.

**Review attachment:** include the generated `tests/fixtures/duplicate-fees.png` as an explicitly synthetic sample, if useful. It has two 17.89 product rows and two 1.20 related fees: the conditional estimate is 19.09 when one was purchased; buying two makes the repeated charges appear expected.

**Review contact:** `[Name / phone / email]`.

## Privacy declarations

Follow [Apple’s App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) and review the actual hosting and OpenAI account settings before publishing the labels. The app uploads full selected receipt photos. OpenAI may retain abuse-monitoring content, so “Data Not Collected” is not the default declaration. `store:false` does not guarantee zero provider retention; see [OpenAI’s API data controls](https://developers.openai.com/api/docs/guides/your-data).

The app configuration includes a conservative manifest for Photos or Videos, Purchase History and Payment Info, used for App Functionality, linked to the user, with tracking false. Receipt images can carry loyalty or payment identifiers; no anonymization of visible text occurs before sending the image. Having no app account alone does not establish that data is unlinked. The app does not extract card/account details into results, but that does not remove them from the uploaded image.

| Data | Handling | App Store decision |
|---|---|---|
| Selected receipt photo | Sent to backend and OpenAI after explicit consent; temporary device cache | Photos or Videos; App Functionality; linked conservatively; no tracking |
| Visible purchases and charge details | AI extraction, memory-only result | Purchase History; App Functionality; linked conservatively; no tracking |
| Visible payment information | May be incidentally present in a submitted receipt; excluded from interpreted result | Payment Info; App Functionality; linked conservatively; no tracking |
| Names/addresses/loyalty identifiers visible in receipt | Not requested or extracted; may remain inside the uploaded image | Review whether additional Contact Info / User ID declarations apply to the finalized service and intended receipts |
| IP addresses and hosting request metadata | Temporary rate limits; hosting retention depends on configuration | Review the hosting provider’s logging and retention before choosing applicable Other Data / Diagnostics declarations |
| Daily counters and token totals | Persisted aggregate accounting, no receipt or device ID | Aggregate operational counters; review logs if deployment adds identifiable diagnostics |
| Support messages | User may email publisher voluntarily outside the app | Review your support process and Apple’s optional-disclosure criteria; do not assume an exception applies |

No IDFA, advertising, cross-app tracking, third-party analytics, location permission, contacts permission or microphone permission is requested. The generated native privacy manifest also aggregates SDK required-reason APIs. Inspect the final Xcode privacy report after every dependency change. App Store privacy answers and manifests are separate responsibilities.

Apple’s [review guidelines](https://developer.apple.com/app-store/review/guidelines/) require disclosure and explicit consent for third-party AI sharing, a reachable privacy policy and support details, a complete functioning app, and truthful listing content. Policies are available offline in the app; their public equivalents are prepared in the backend and exported to `docs/app-store/*.html`. Run `pnpm policies:export` after replacing placeholders if publishing static copies.

## Age rating and content rights

Complete Apple’s current age-rating questionnaire based on the actual receipt-only product. There is no public user-generated content, social interaction, chat, browser, advertising, gambling, contests, violence or mature content in the app. AI output is restricted to a receipt schema, rather than a general-purpose chatbot. Do not invent an age rating before App Store Connect computes it. The app is not specifically directed to children. Confirm territory-specific requirements and whether pharmacy receipts affect your selected content descriptors. The app icon uses owner-provided artwork adapted into a full-square iOS asset; the splash artwork is code-generated. No retailer logos are bundled.

## Build and distribution

Apple currently requires Xcode 26 or later and the iOS 26 SDK for iOS uploads; see [upcoming requirements](https://developer.apple.com/news/upcoming-requirements/). Local validation uses Xcode 26.4.1 / iOS SDK 26.4. The minimum supported iOS deployment target is 16.4, and the app is iPhone-only.

After owner setup and approval to deploy/push, configure the backend per `docs/DEPLOYMENT.md`. Then:

```sh
pnpm dlx eas-cli init
# Set EXPO_PUBLIC_AI_BASE_URL in the production EAS environment.
pnpm release:check -- --online
pnpm dlx eas-cli build --platform ios --profile production
pnpm dlx eas-cli submit --platform ios --latest
```

The production profile builds for App Store distribution and uses a remotely incremented build number. Follow signing prompts with the correct Apple team. An unsigned local build is not a distributable IPA. TestFlight requires a signed upload, processing and tester enrollment. No signing credentials have been fabricated or copied from another app.

Test on physical iPhones and TestFlight before public release. Record 20–30 consented real receipts with human-verified expectations, including long receipts, glare, folds, legitimate repeated purchases, CRV fees, discounts and reversals. Test camera access/denial, offline retry, cancel/backgrounding, larger text and smaller screens. See `docs/VALIDATION.md`.

The three designer-approved marketing screenshots are in `docs/app-store/marketing/exports/`, with a download bundle at `docs/app-store/marketing/receipt-decoded-app-store-screenshots.zip`. Upload in filename order: possible duplicates, photo start, quantity confirmation. Each is an opaque 1320×2868 PNG, an accepted large Dynamic Island iPhone portrait size per [Apple’s screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/). They combine short marketing copy with current unedited native app screens and fictional receipt data, without Expo Go controls or development overlays. See `docs/APP_STORE_MARKETING.md` for designer sign-off and `docs/NATIVE_SCREENSHOT_CAPTURE.md` for accurate standalone Debug capture provenance. Verify these views against the final signed Release build before public submission; refresh the source images if the visible product changes. Editable inputs and refresh instructions are in `docs/app-store/marketing/README.md`. Existing plain Home/viewer captures remain supplementary. Do not use actual shopper data in listing screenshots.
