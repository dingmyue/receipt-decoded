# Receipt Decoded listing artwork

Deliverables: three opaque 1320×2868 PNGs in `exports/`, ordered by filename. The ZIP contains only these three upload images. `review-contact-sheet.png` is a preview, not an upload asset. Designer sign-off and copy rationale are in `../../APP_STORE_MARKETING.md`.

## Refreshing the artwork

1. Keep the core promises: possible duplicates, a photo to start, and quantity confirmation. Preserve conditional language; never imply guaranteed accuracy, a refund, or typical savings.
2. When the visible product changes, replace the three native screenshots in `source/` using `../../NATIVE_SCREENSHOT_CAPTURE.md`. Use fictional data and the ordinary product UI. Never repaint the interface.
3. Edit `copy.json` for messaging, colors or layout. Run `pnpm marketing:render` from the repository root. This writes the PNG exports, editable SVG layouts, source SHA-256 manifest and reduced contact sheet.
4. Review all full images and the contact sheet for clipped text, readable qualifiers, consistent framing and accurate visible features. The renderer checks image dimensions and opacity. Verify against the final signed Release app before submission.
5. Rebuild the ZIP from only the three current export PNGs after any revision. Do not include source files or the contact sheet in the upload set.

Small layout or button-label changes should not require new marketing copy. Refresh screenshots when their appearance or shown behavior no longer matches the shipped app. All current captures use one matching fictional Sample Market receipt; the capture backend made zero provider calls.

## Iteration after launch

Use the current value-first order as the baseline. A useful first experiment is to swap only screenshots 1 and 2, comparing value-first against photo-first while keeping artwork, copy and other listing elements constant. Use App Store Connect product page optimization when available; choose a success metric and sufficient duration before starting, then record results and keep the better-supported order. No test or upload has been started. Avoid changing copy and order together, and do not treat a few downloads as conclusive evidence.
