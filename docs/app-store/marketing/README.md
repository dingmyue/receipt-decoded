# Receipt Decoded marketing screenshots — checklist redesign

Four new marketing PNGs, in the requested order: Home, receipt photo review/check, Results checklist, and Results with reviewed items expanded. These use the current standalone native iOS Debug app, without development overlays or repainted UI. The sample receipt and result are fictional and match each other.

- `exports/`: four opaque 1320×2868 PNGs.
- `exports-medium/`: four opaque 1206×2622 PNGs plus a metadata manifest. The two sizes follow the project's existing listing workflow.
- `receipt-decoded-marketing-1320x2868.zip` and `receipt-decoded-marketing-1206x2622.zip`: each contains only the four marketing PNGs for its size.
- `review-contact-sheet.png`: reduced preview of the four designs; not an upload asset.
- `source/01-home.png`, `02-scan.png`, `03-results.png`, `04-reviewed.png`: unedited full native captures.
- `source/sample-receipt-v1.1.png`: matching fictional receipt.
- `copy.json`: ordered messaging, backgrounds and layout.
- `source/layouts/`: editable SVG compositions; the source screenshots are embedded without modification.
- `render-manifest.json`: source checksums and output provenance.
- `archive/pre-checklist/`: previous export set and metadata retained for reference. Old source PNGs remain in `source/` and are not used by the new config.

The “scan” image uses the app's existing photo preview/check page. The camera itself is the system camera interface. The fourth image shows one remaining item, two reviewed items and checked undo controls. It does not claim the receipt is error-free, that an error was confirmed, or that money was recovered.

## Refresh

1. Use `../../NATIVE_SCREENSHOT_CAPTURE.md` to capture the real native UI with matching synthetic data. Never repaint app UI or use a real shopper's receipt for marketing.
2. Edit `copy.json` as needed, then run `pnpm marketing:render` and `node scripts/marketing-medium-exports.mjs`.
3. Review every full image and the contact sheet; check typography, framing, legibility, dimensions and opacity.
4. Rebuild each ZIP from the four configured PNGs only, excluding manifests, previews and sources.

These are assets for the updated checklist design. No upload, listing change, build submission, or release action was performed. Capture provenance and review notes are in `../../APP_STORE_MARKETING.md`.
