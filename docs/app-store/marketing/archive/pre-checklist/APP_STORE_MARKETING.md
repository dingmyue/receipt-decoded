# App Store marketing screenshots

Design brief date: October 13, 2026. Status: **designer sign-off granted for all three final marketing exports**.

Deliver exactly three opaque 1320 × 2868 PNGs. Each combines a real, current standalone iOS app screen with a short marketing message. Receipt examples may use synthetic sample data; they must not imitate a refund, a verified retailer error, or recovered money. Use actual app output and state, not invented controls or a reconstructed app mockup.

## Story and copy

| Order | Headline | Supporting line | Real app screen | Intended message |
| --- | --- | --- | --- | --- |
| 1 | Spot possible duplicates. | See repeated items and related charges. | Flagged Results with the conditional $19.09 sample, affected item and quantity controls; expanded evidence if related charges remain legible | Lead with the useful outcome: items worth checking and their related fees |
| 2 | Start with a photo. | Take a photo or choose one. | Preview with an actual sample receipt photo and the primary check action | Show the app in use and make the process feel simple |
| 3 | Confirm what you bought. | Repeated purchases may be correct. | The same sample after choosing 2 or more, showing the qualified expected-charge state and selected answer | Users verify quantities; repeats are not automatically mistakes |

The first screenshot leads with value, the second explains the simple start, and the third builds trust through quantity verification. These promises depend on durable capabilities rather than exact button names or layout details. The word possible in screenshot 1 and may in screenshot 3 are meaningful qualifiers. Keep them. Do not substitute Save $19.09, Get money back, Find every mistake, or Guaranteed accuracy. The actual app's Potential extra and expected-state disclaimer must remain readable.

## Visual system

Use the existing warm paper background `#F7F5EF`, dark green text `#27332D`, muted green-gray `#657069`, with restrained accents from the app. Keep all three compositions visually consistent. The preferred variation is forest green `#27332D` with warm cream headline and `#DEE2D9` supporting text for screenshot 1, warm paper with dark green text for screenshot 2, and soft sage `#E7F0E8` with dark green text for screenshot 3. Framing, typography, spacing and wordmark treatment remain the same; color variation marks the value / process / verification story. No gradients, busy abstract shapes, floating badges, arrows, feature bullets, confetti or extra miniature screenshots.

- Small Receipt Decoded wordmark above the copy, not a large logo competing with the app screen.
- Large left-aligned headline, usually two lines; use deliberate line breaks so words are not split and qualifiers are not orphaned.
- One supporting sentence, significantly smaller than the headline but readable in the App Store preview. No extra explanatory footer or legal paragraph; the native app UI supplies the conditional context.
- Large centered phone frame below the message. A subtle dark border and restrained shadow can separate it from the paper background. The screenshot occupies most of the frame, with one consistent rounded mask across all three.
- Preserve native status/header/UI and the app's actual content. No Expo Go gear, development menus, fake purchase confirmation, or edited UI text. Do not crop away the quantity answer controls or a visible incomplete/accuracy qualifier to make a state look cleaner.

Suggested composition at 1320 × 2868: a 550–620-pixel top copy region with approximately 96-pixel horizontal padding, headline near 96–104 pixels with 1.05–1.12 line height, supporting copy approximately 38–44 pixels. The phone frame is approximately 960–1000 pixels wide, centered beneath it, allowing the complete native 1320 × 2868 screen to fit at useful scale. Adjust after rendered review rather than forcing these numbers when copy or device framing requires it.

Use the same phone-frame size and top baseline for all three unless a meaningful native state changes the visible content. Leave enough bottom spacing to avoid a heavy, clipped edge. A realistic frame may be drawn in vector code; the app screen inside is the actual screenshot.

## Production and maintainability

Keep source screenshots, text and layout inputs separate from final PNGs. Use editable source composition and a small ordered copy/config mapping so headlines, screenshot paths and margins can be changed without repainting the app UI. A rerender must preserve dimensions and opacity. The composition should continue to work after small UI changes by replacing the native screenshots.

Use a consistent synthetic receipt for screens 1 and 3, with a genuine current analysis-result model and quantity state. Screen 2 shows an actual synthetic receipt photo. The supported $19.09 number is an example conditional amount, not a claimed typical result or confirmed refund. Deterministic synthetic fixture results may drive the actual native views without making an external AI request. Do not upload a user's real receipt to produce marketing assets. Record the capture build accurately: current standalone native Debug captures are permitted if their actual product UI has no development chrome; do not label them Release captures.

## Designer acceptance criteria

1. Exactly three final PNGs, opaque, each 1320 × 2868, with consistent visual framing.
2. The three-image sequence communicates useful result → simple photo start → quantity verification at a glance.
3. Headline and supporting line remain legible at approximately one-quarter size. Native key result and quantity controls are large enough to recognize in the full screenshot preview.
4. The native app screens are current standalone native product views, with no development chrome or fabricated UI. Record Debug/Release capture provenance accurately. The marketing text does not overpromise accuracy, savings or refunds.
5. Screenshot 1 retains the visible conditional amount label; screenshot 3 retains the qualified expected state. No missing or unknown information is converted into a clean result.
6. Source inputs and final exports are clearly identified for later changes.
7. Designer reviews all rendered exports, requests any material adjustments and explicitly signs off before delivery.

## Iteration log

1. Initial concepts and durable copy issued to the GTM lead. Rendered compositions pending.
2. GTM lead and designer agreed to lead with the useful result, follow with Preview rather than Home to show the app in use, and finish with quantity verification. Approved the restrained forest / paper / sage background variation. Rendered compositions still pending.
3. Designer reviewed the quarter-size `docs/app-store/marketing/review-contact-sheet.png`, then individually reviewed all three rendered full PNGs in `docs/app-store/marketing/exports`. Headlines and supporting lines remain legible in the reduced preview. The value-first forest frame clearly presents a conditional $19.09 result; the paper frame shows the actual photo review/check workflow; the sage frame clearly shows the selected 2-or-more answer and the qualified expected-charge result. Device framing, headline baselines and spacing are consistent. No development chrome, clipped copy or hidden accuracy qualifier was visible. No revisions were needed after the first composed render.

## Final sign-off and editable inputs

**The designer signs off all three final exports.** They communicate useful result → easy photo start → quantity verification with concise, durable copy. The design keeps possible/conditional and may-be-correct meanings visible, without promising refunds, recovered money or perfect detection.

Final public assets, in App Store order:

1. `docs/app-store/marketing/exports/01-spot-duplicates.png`
2. `docs/app-store/marketing/exports/02-start-with-photo.png`
3. `docs/app-store/marketing/exports/03-confirm-quantity.png`

Root reported that each export is an opaque 1320 × 2868 PNG. The designer visually inspected each export and the quarter-size contact sheet; metadata validation and capture provenance are root's checks. The native screens were captured from the current standalone native Debug app with an actual synthetic sample receipt and deterministic result state, without an external AI call. The fictional Sample Market receipt shows two 17.89 product charges and two 1.20 deposits; the conditional extra amount is 19.09 when one was bought. The third screen shows two purchased and preserves the app's error-free disclaimer. These are illustrative product examples, not performance validation against the user's real receipt.

Editable inputs:

- Ordered messaging, colors and input paths: `docs/app-store/marketing/copy.json`.
- Native app screenshots and sample receipt: `docs/app-store/marketing/source/`.
- Editable composed vector layouts: `docs/app-store/marketing/source/layouts/`.
- Composition renderer: `scripts/marketing-screenshots.mjs`.
- Export metadata: `docs/app-store/marketing/render-manifest.json`.

The contact sheet and source files are review/maintenance assets. Upload the three final PNGs above; replace the native screen inputs and rerender if a later product change makes these views inaccurate. This sign-off approves the artwork and truthful messaging, not App Store approval of the full app.
