# Marketing screenshots — Results checklist v1.1

Created October 14, 2026. Four images requested: Home, scanning/photo review, and two Results states. The previous quantity-answer artwork and its review record are archived in `app-store/marketing/archive/pre-checklist/`.

| Image | Headline | Supporting copy | Actual app view |
| --- | --- | --- | --- |
| 01 Home | Make sense of / your receipt. | Spot possible duplicate charges. | Current Home, photo and camera entry points |
| 02 Scan | Start with / a photo. | Take a photo or choose one. | Existing receipt preview and Check receipt action |
| 03 Results | Repeated items. / One clear list. | See unit prices and repeat counts. | Three unchecked duplicate groups |
| 04 Reviewed | Check off. / Keep track. | Reviewed items stay easy to undo. | One unchecked group, two reviewed rows expanded |

## Visual treatment and provenance

Retains the established forest / warm paper / sage palette, 96-pixel text inset, 108-pixel two-line headlines, small wordmark, restrained phone border and shadow, and consistent phone geometry. Real native screenshots are framed without editing their contents. The final screenshot returns to forest green to close the sequence.

The source views are captured from the installed standalone native iOS Debug app on an iPhone 17 Pro Max simulator, using the current JavaScript app loaded from an isolated Metro on port 8084. There is no Expo Go gear or development menu in the captures. Status bar uses 9:41, full battery and signal, through the simulator's capture override; the override is cleared afterwards. No Release build or store submission is implied.

`source/sample-receipt-v1.1.png` and the local marketing fixture endpoint describe the same fictional Sample Market receipt: Muffin Mix 500g at $2.49 twice, Chk Enchilada 500g at $6.99 three times with three −$1.40 adjustments, and Pancake Choc 325g at $1.99 twice. Printed total $25.73; currency explicitly USD. The result uses the existing validated analysis data through the ordinary upload/consent flow. The fixture server reads no key and makes no provider call. Prices are illustrative, not accuracy, savings or retailer-error claims.

“Scanning” is represented by the real photo-review/check page, because this app uses the native system camera. No scanner screen or new controls were fabricated. The fourth image illustrates subjective review completion and available undo, rather than a guaranteed clean receipt.

## Outputs and verification

- Four opaque 1320×2868 PNGs and four opaque 1206×2622 derivatives.
- A ZIP for each size containing only its four image files.
- Native source captures, editable SVG compositions, configuration, source SHA-256 hashes, and a reduced contact sheet retained.
- Full-image and reduced-preview review checks typography, framing, no clipped copy, complete app-screen bounds, matching synthetic data, and no development controls.
- No existing application screen, AI/backend behavior, App Store configuration, or submitted release was changed to create these assets.

Primary outputs live under `app-store/marketing/exports/` and `app-store/marketing/exports-medium/`. The smaller derivatives use proportional resizing with background-color containment, preserving the entire design. Inspect against the final signed build before publishing assets for this future UI update. No upload or listing experiment was started.
