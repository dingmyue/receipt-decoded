# V0 UI/UX refinement

Designer review date: October 12, 2026. Status: **initial refinement and targeted uncertainty-state revision signed off**, with the validation scope and follow-up below.

## Evidence

Reviewed the PRD's V0 flow and the source for Home, Preview, Results, DuplicateCard, Settings, receipt viewer and shared UI. Visually reviewed the existing native Home and Preview screenshots in `docs/app-store/screenshots`. Results findings below are from source review, not a rendered results screenshot. The existing palette, receipt illustration, whitespace and rounded controls are appropriate; keep them.

The strongest problem is hierarchy: Preview asks the user to read a paragraph, a privacy card, a checkbox sentence and a policy link before finding Analyze. Results repeat caveats and show evidence before the user's most useful action: answering the purchased quantity. The refinement should change order and progressive disclosure, rather than add decoration or new features.

## P0 — Receipt preview and consent

Preview title: **Review receipt**. Above the photo, one sentence: **Make sure the whole receipt and prices are clear.** Photo remains tappable for the existing full-screen viewer; its short hint is **Tap to zoom**. Replace the two large photo replacement buttons with one quiet **Change photo** action that opens Camera / Photos / Cancel choices.

Place the one filled primary action, **Check receipt**, in a footer outside the scrolling content and above the bottom safe area. The photo and errors can scroll while this action stays reachable. Retry uses **Try again**. Show a short external-processing line in this footer: **Checked with OpenAI · Privacy**, with Privacy a real 44-point target. No repeated consent checkbox or long consent card on the ordinary preview.

On the first attempted check without a valid saved consent, open an iOS-style sheet. Do not upload when opening the sheet, previewing a photo, or changing a photo. The sheet must be scrollable at large text and on a small phone, with clear actions and no clipped content.

Suggested exact sheet content:

> **Allow receipt checks with OpenAI?**
>
> To find possible duplicate charges, we send your full receipt photo through our service to OpenAI. It may contain personal or payment details.
>
> OpenAI may retain content for abuse monitoring. We don't save receipt history.
>
> Your choice applies to future receipt checks on this device. You can turn it off in About & privacy.
>
> **Privacy Policy**
>
> **Allow and check receipt**
>
> **Not now**

Allow is the explicit opt-in and can start this requested analysis after acceptance. Not now, closing/dismissing, or opening Privacy sends nothing and preserves the preview. Policy navigation must allow returning to the sheet without granting consent. Store only the consent version, acceptance time and choice locally; no receipt history. Re-prompt after revocation, storage clearing, reinstall, or a meaningful disclosure/provider/purpose version change. A receipt reset, replacement, retry or second scan must not re-prompt while consent remains valid. A local storage failure must not falsely imply consent will be remembered across launches.

About & privacy must show **AI receipt checks — Allowed / Ask each time** (or **Not allowed** if that is the implemented state) with a clear **Turn off permission** action. Turning it off prevents further uploads, including an in-flight request if applicable; it does not promise deletion of OpenAI's retention logs. The next Check receipt asks again. Update the in-app and hosted privacy/terms wording that currently says permission is requested before each analysis. Update Home disclosure so it does not promise a repeated agreement.

This is a permission design recommendation. Apple's explicit third-party AI sharing permission requirement should be checked against the current published guideline; remembered consent is not a guarantee of App Review acceptance.

## P0 — Results hierarchy and item verification

Keep the result's meaning within the first viewport: compact merchant/date/total row, plain outcome, then a prominent potential amount when there is a supported amount. Drop the redundant uppercase RECEIPT OVERVIEW heading and separate currency token when currency is already present in the amount.

Prefer short outcome copy:

- Flagged: **Check 1 repeated item** / **Check 2 repeated items**. Amount label: **Potential extra charge**. Immediate qualifier: **Assumes one of each unchecked item was bought.** Once all relevant quantities are answered, use **Based on your quantities.**
- Clean: **No obvious duplicates**. Supporting sentence: **AI can miss charges. Check anything that looks unusual.**
- All expected: **Repeated charges match your quantities**. Supporting sentence: **This doesn't guarantee the receipt is error-free.**
- Partial: visible **Incomplete check** and **Some charges couldn't be read.** Do not place this only inside details. A quantity answer cannot make an incomplete analysis look like a clean check.
- Unreadable: **Try a clearer photo**. Supporting sentence: **Include the whole receipt in good light.** Offer replacement prominently.

A zero estimate is not a clean result when unknown amounts or incomplete analysis remain. Keep **Some amounts couldn't be estimated** adjacent to any known partial amount; if no supported amount exists, show **Amount unclear**, not an unqualified $0. AI warnings that affect reliability remain visible; lengthy additional explanation can live in expandable details.

Each item card should show, in this order:

1. Short status (Needs your check / Possible mistake / Likely expected).
2. Product name and **2 recorded on receipt**, with a compact original description reference when it differs from the readable product name.
3. Conditional **Potential extra $19.09**, or **Charges appear expected**, and one short qualifier: **If you bought one.** / **Based on 1 purchased.** The existing deterministic arithmetic stays unchanged.
4. **How many did you buy?** and the existing 1 / 2 or more / Not sure controls. Answer selection updates the card and total immediately. Not sure resets the answer and remains visibly selectable.
5. **Show charge details** disclosure, collapsed by default. Expanded content preserves the original description, item code, every related financial row, discounts/fees/corrections, the AI explanation and the estimate's scope. Use **Hide charge details** to collapse. Do not discard evidence to make the UI shorter.

Move the big evidence table, repeated explanatory paragraphs and item code into that disclosure. Keep a brief global estimate caveat available near the summary/details: **Estimates include readable linked fees and discounts, not tax adjustments. Verify with the store.** Never say refunded, saved, or confirmed overcharge.

Use **View receipt** as a quiet secondary action and **Scan another receipt** as the final filled action. These must not distract from the quantity question or silently discard the current check; preserve the existing discard confirmation.

## P1 — Home, loading, About and support

Home already has a strong primary CTA. Keep **Every charge, explained.** and only one supporting sentence: **Spot possible duplicate charges.** Remove the additional motivational sentence and the two-line account/receipt/permission footer. A quiet **Private by choice. Checked with OpenAI.** line is sufficient if Privacy/About remains accessible; the full permission decision occurs at the first check. Keep both Camera and Photos visible at standard text on the compact iPhone.

Loading: retain the real stage messages and spinner, remove the extra paragraph describing careful checking. **This may take a moment.** is enough if an additional hint is needed. Keep Cancel reachable.

About & privacy: app name/version, AI permission status/control, Privacy / Support / Terms rows, and one short accuracy sentence. Remove the second hero/tagline and the repeated marketing paragraph. The clear-current-receipt control remains conditional.

Full Privacy and Terms can remain long-form because their purpose is disclosure. Support should lead with the contact action, then concise troubleshooting rows that expand to details. Do not force users to read the legal text to reach support.

## Acceptance criteria for designer sign-off

- Preview's primary action is visible at default type on both compact iPhone and Pro Max without scrolling; large type permits scrolling and keeps actions usable.
- The normal preview contains no consent paragraph/card/checkbox. First-use permission is explicit, specific to OpenAI/full photo/future checks, dismissible, and not preselected.
- First acceptance starts one analysis; second scan/retry/relaunch bypass the sheet; revoke and version change restore it. Decline/cancel/policy navigation never uploads.
- Results communicates outcome and conditional amount before evidence; the first item reaches the quantity question without a large wall of prose. Evidence is reachable in one disclosure action.
- Partial/unreadable/unknown-amount states retain visible uncertainty. Expected quantity answers do not imply a refund or a globally error-free receipt.
- Buttons/links have at least 44-point touch targets, accessible labels and selected/expanded states. Dynamic Type does not clip critical text, amounts or actions. Avoid adding icons, cards or separators without a clear purpose.
- Designer visually reviews new Home, ordinary Preview, consent sheet, flagged Results with compact and expanded item, expected quantity state, and About permission state. Source-only review is insufficient for visual sign-off.
- Functional/type/test checks pass and saved-consent behavior is verified. Existing native screenshots must be replaced only with screenshots of the final release UI; old screenshots are no longer representative after this redesign.

## Iteration log

1. Initial review: redesign required. Specification above issued to developer. Visual sign-off pending implementation.
2. Source re-review: the implemented preview footer, first-use saved consent sheet, About permission control, concise outcomes and collapsed evidence match the intended hierarchy. Two small revisions requested: hide an unanswerable quantity question when recorded quantity is unknown; allow the textual unknown-amount status to wrap at larger type. Visual sign-off still pending new screenshots and the first-use/remembered/revoked flow checks.
3. Both requested source revisions applied; source design review approved. Visually reviewed refreshed Expo Go `docs/ui-review/02-preview.png` and `03-consent.png`: the anchored preview action and first-use sheet hierarchy pass at default text. Root verified Not now preserves the photo and that decline/Privacy navigation did not increment the backend request count. These are review evidence, not App Store listing screenshots. Results, Home, About and remembered/revoked permission checks remain pending.
4. Final visual re-review: reviewed `01-home.png`, `04-results.png`, `05-expected.png`, `06-expanded.png` and `07-about-allowed.png` in `docs/ui-review`. Home has one supporting sentence and two clear entry actions. The result and conditional amount are immediately legible; the quantity controls precede evidence and are visible in the first item at default type. The expected state shows the selected quantity and a qualified result. Expanded details preserve source evidence without cluttering the ordinary card. About clearly presents permission status and the revoke action. No additional visual revisions requested.

## Sign-off and validation scope

**The designer signs off this implemented refinement.** The developer completed the specification, addressed both re-review requests, and passed the reported 42 automated tests and TypeScript checks. Sign-off covers source review and the seven rendered iPhone 17 Pro Max Expo Go views at default text listed above. It approves the information hierarchy, concise copy, first-use permission interaction and progressive evidence disclosure.

Root verified the live $19.09 result; quantity 1 shows Possible mistake, quantity 2 or more shows Likely expected, and Not sure resets the result. Root reported that all four linked financial rows and the item code were present in the expanded accessibility tree. Root also verified permission persisted after a full reload, revocation changed the state and saved a false record, decline/policy navigation sent no request, and the clear-receipt confirmation remained. These functional observations are root's verification, not independent designer UI interaction.

This is not a blanket release or accessibility certification. The UI automation tool could not perform a coordinate scroll reliably; the expanded screenshot shows a viewport, not the complete table. Full scrolling, compact-phone complete flow, maximum Dynamic Type, VoiceOver, physical-device camera behavior and signed TestFlight validation remain release QA. The incomplete/unreadable/unknown-amount branches were reviewed in source, not newly captured visually. Review PNGs contain Expo development controls and are not final App Store listing assets.

## Follow-up — uncertainty states

Status: targeted redesign completed and signed off after source and screenshot re-review. The earlier sign-off covered the captured ordinary/expected states. The user's actual unclear-receipt screenshot exposed a state that had only received source review: a large Amount unclear headline, a second incomplete card and five raw warning paragraphs push the item and its controls below the first viewport. That state failed the intended low-clutter hierarchy and prompted the revision below.

### Single summary, clear next step

Priority is **unreadable → partial or unknown → ordinary/expected**. Use exactly one amber summary for an incomplete check or an estimate whose amount/currency cannot be established.

- Title: **Some charges are unclear**.
- With candidate items: **Check the repeated item below or try a clearer photo.** Use items for multiple groups.
- Without candidates: **Try a clearer photo or review the original receipt.** Do not present a clean result.
- With all quantities expected but the overall check incomplete: **Repeated quantities match, but other charges need review.** Keep the amber state; no $0 headline.
- Actions in the summary: **View receipt** and **Try a clearer photo**, each a real 44-point target. They should be quiet actions when a candidate quantity question is available; do not add competing large buttons above it.

When no supported monetary estimate exists, omit the monetary headline entirely: no giant Amount unclear, Potential extra charge label, Based on your quantities caption or one-unit assumption. The short uncertainty summary already explains the limitation. Suppress a calculated financial headline when currency is unknown; retain the printed receipt total with a currency-unclear qualifier in compact metadata and preserve source charges in evidence.

A supported, nonzero estimate for readable groups may remain in the same single summary under **Readable potential extra**. One-unit or answered-quantity qualifiers still apply to that number; a short **Other amounts couldn't be verified.** qualifier prevents it being mistaken for a full amount. Do not create a second incomplete card. Do not imply the unknown remainder is zero.

### Item controls before diagnostic detail

Move every raw analysis warning below all item cards into one collapsed **Why this check is incomplete** disclosure. Opening it reveals every warning and preserves the full evidence. The top-level uncertainty message and qualified known amounts provide the visible safety signal; raw parser/model wording must not occupy the ordinary first viewport. The diagnostic disclosure may be called Check notes when the analysis is otherwise complete.

An item with no supported estimate shows one quiet sentence: **Extra charge couldn't be estimated.** Remove its redundant If you bought one / Based on quantities caption when there is no amount to qualify. Keep the product, recorded quantity, purchased quantity controls and charge-details disclosure. Unknown currency uses the same treatment for the calculated extra amount; actual printed charges remain in details. Expected quantity items may retain Charges appear expected, without turning the overall partial check green.

**Try a clearer photo** returns to Preview while preserving the current photo/result; it does not clear data, open a picker unexpectedly or trigger an upload. The user chooses Change photo and explicitly checks the replacement. A clearer original can also be checked again. Preserve the existing consent decision.

### Dedicated unreadable state

Use **We couldn't read this receipt** and **Include the whole receipt and keep prices in focus.** Show a prominent **Try a clearer photo** action and quiet **View receipt**. Avoid empty merchant metadata, amounts, duplicate incomplete notices and raw warning paragraphs. Detailed notes remain accessible below the recovery choices when present.

### Revised acceptance criteria

- The user's partial/unknown/currency-unclear scenario has one concise uncertainty summary and an actionable item before diagnostic prose.
- No unsupported calculated amount, giant textual amount placeholder or unqualified zero is promoted.
- Partial with a supported number clearly labels that number as readable-only; partial/all-expected remains incomplete.
- Expanded check notes preserve all warnings; collapsed state contains no raw warning paragraphs above items.
- Photo recovery preserves the current receipt and never uploads automatically.
- Designer reviews the final source and rendered partial/unknown, partial/known, partial/all-expected and unreadable scenarios using synthetic UI fixtures. The user's receipt photo need not be sent anywhere for this UI verification.

### Follow-up iteration and sign-off

1. Visually reviewed the user's unclear-receipt screenshot and issued the targeted specification above. The screenshot was reviewed locally; no receipt photo was needed for external AI processing.
2. Developer implemented deterministic presentation-state precedence, one uncertainty summary, supported-only financial headlines, quiet unknown-item copy, expandable diagnostics after items and non-destructive photo recovery. Designer re-reviewed `app/results.tsx`, `components/DuplicateCard.tsx` and `shared/results-presentation.mjs`; no source revisions were required. Developer reported 49 automated tests and TypeScript checks passed.
3. Designer visually reviewed all five actual Expo Go synthetic-state screenshots in `docs/ui-review/uncertain`: `01-unknown.png`, `02-notes-expanded.png`, `03-readable-partial.png`, `04-expected-partial.png` and `05-unreadable.png`. The unclear state now shows one plain explanation, direct recovery choices and the quantity controls before warnings. The readable partial amount remains visibly qualified; the expected partial answer retains amber uncertainty without $0. Unreadable has one clear recovery action. Expanded diagnostics remain available after the item card.

**Designer sign-off granted for the targeted uncertainty-state revision. No further design changes requested.** The result addresses the clutter shown in the user's screenshot while keeping uncertainty and source evidence accessible.

Root reported three synthetic UI checks with zero AI-provider calls, all five warning notes preserved, photo-view/back/retry recovery retaining the current photo, and no automatic analysis on recovery. These functional observations are root's verification. The revised visual sign-off covers the captured iPhone 17 Pro Max default-text screens and source branches, not the user's original receipt's analysis accuracy. Full touch scrolling was not verified by the UI tool; compact-phone complete flow, maximum Dynamic Type, VoiceOver and physical/signed-release testing remain the previously stated release QA limits. Synthetic Expo Go screenshots are review evidence, not App Store listing assets.
