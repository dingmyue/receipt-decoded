# App Store Connect setup status

Updated October 13, 2026. App: [Receipt Decoded, Apple ID 6822563840](https://appstoreconnect.apple.com/apps/6822563840/distribution/ios/version/inflight).

## Saved in App Store Connect

- iOS version 1.0.0; manual release after approval.
- English (U.S.) promotional text, description and keywords from `docs/APP_STORE.md`.
- Support URL: `https://little-moments-api.onrender.com/receipt-decoded/support`.
- Copyright: `2026 Mingyue Ding`.
- Sign-in not required; review instructions explain consent, quantity choices, temporary receipt handling and the synthetic sample.
- App Review contact provided by owner. The private phone number is saved only in Apple's review form.
- Subtitle: `Check for duplicate charges`.
- Primary category Utilities; secondary Shopping.
- Age-rating questionnaire completed from current receipt-only behavior. Apple calculated a global 4+ rating with regional exceptions. Made for Kids and rating override were not selected.
- Content-rights declaration saved after owner confirmed permission for supplied artwork.
- Privacy Policy URL saved; Payment Info, Photos or Videos and Purchase History fully configured in the privacy draft. Each is used for App Functionality, conservatively linked to the user, and not used for tracking.
- Three marketing PNGs uploaded in filename order to both iPhone with Dynamic Island medium and large display slots, each verified as 3 of 10 screenshots.
- Free price schedule with United States as base; worldwide availability selected for all 175 countries or regions on release. Regional requirements still apply.
- Apple Silicon Mac and Vision Pro distribution disabled for this iPhone-focused launch.

## Still to finish

- Review attachment: `tests/fixtures/duplicate-fees.png`. Notes refer to this synthetic sample, so attach it before submitting or revise that reference.
- App Privacy answers are complete, but final publication is waiting for the owner's action-time approval. Apple's “Publish Your App Privacy Responses?” dialog says publishing constitutes agreement about accuracy, compliance with guidelines/applicable law and keeping responses updated. The three declarations match the native manifest. Apple’s guidance for generic user-provided content was reviewed; incidental identifiers are not separately requested or extracted, and there is no cross-app tracking.
- A signed build must be uploaded and selected; no build was available in the version page.
- Review the existing account trader status and outstanding Paid Applications Schedule yourself before distribution. No agreements were accepted during metadata setup.
- The owner confirmed standard OpenAI API use with no processing region selected. Local app policy, exported HTML and Little Moments backend copy now state that regional data residency is not enabled and processing may occur outside the user's country. Redeploy Little Moments to replace the old public placeholder, and build the latest app so its offline policy also reflects this wording.

## Live service check

`node scripts/verify-shared-online.mjs`: Little Moments health and policy routes passed; Receipt Decoded health, support and terms passed. Receipt Decoded privacy returned branded HTML but failed the placeholder check. After owner confirmation, local `pnpm release:check` passes; `pnpm release:check -- --online` still fails only the deployed privacy placeholder. No paid analysis request was made during listing setup.

Existing app/server tests passed (57); release-check regression tests passed (5) after correcting a false positive that treated serialized JSON section arrays as policy placeholders. The checker now examines text values, and a nested unresolved placeholder still fails.

## Browser handoff

The upload shortcut continued to report missing file-URL access after the owner reported enabling it. Native pickers were used instead; the owner completed both screenshot selections and uploads were verified. A final picker was opened for `tests/fixtures/duplicate-fees.png`; its attachment is not yet verified. Both listing and settings tabs remain open for continuation.

No App Review submission or public release was performed.
