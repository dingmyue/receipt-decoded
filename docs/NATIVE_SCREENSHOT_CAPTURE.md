# Native marketing captures — checklist v1.1

The current set contains Home, receipt photo review/check, three unchecked Results groups, and one unchecked group with two Reviewed rows expanded. Source PNGs come from the actual standalone native iOS Debug app, without Expo Go controls or edited UI. Use only the matching fictional sample receipt.

## Local environment

Use the booted iPhone 17 Pro Max simulator `2A12F855-3888-478E-81B4-6C32A6B9D74E`, whose full screen is 1320×2868. Reuse the existing simulator Debug app at `/tmp/receipt-decoded-v0-debug/Build/Products/Debug-iphonesimulator/ReceiptDecoded.app` if available. The app installed on the simulator may be a Release build; explicitly install the Debug build for local HTTP fixtures. Do not change the Release client's HTTPS rule.

```sh
pnpm marketing:sample
pnpm marketing:capture-server
```

The sample is `docs/app-store/marketing/source/sample-receipt-v1.1.png`. The loopback backend on port 8790 uses the existing validated three-product fixture with explicit USD currency. It reads no API credential and calls no AI provider. Run an isolated Metro in another terminal:

```sh
EXPO_NO_DOTENV=1 EXPO_PUBLIC_AI_BASE_URL=http://127.0.0.1:8790 REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 pnpm exec expo start --go --lan --port 8084
```

Install and launch only the local simulator Debug app:

```sh
xcrun simctl install 2A12F855-3888-478E-81B4-6C32A6B9D74E /tmp/receipt-decoded-v0-debug/Build/Products/Debug-iphonesimulator/ReceiptDecoded.app
xcrun simctl launch --terminate-running-process 2A12F855-3888-478E-81B4-6C32A6B9D74E com.mingyue.receiptdecoded -RCT_jsLocation 127.0.0.1:8084
```

The bundle provider honors `RCT_jsLocation`; no AppDelegate edit is needed. If the existing Debug app is unavailable, build the installed native project/Pods for only this simulator with `xcodebuild -workspace ios/ReceiptDecoded.xcworkspace -scheme ReceiptDecoded -configuration Debug -destination 'platform=iOS Simulator,id=2A12F855-3888-478E-81B4-6C32A6B9D74E' -derivedDataPath /tmp/receipt-decoded-v0-debug ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build`. This is local simulator work, not a signed build or submission.

## Capture sequence

1. Add the fictional sample to simulator Photos. Override the status bar to 9:41 with full signal and a discharging 100% battery. If a return-to-Expo-Go breadcrumb appears, press Home and relaunch the native app without stopping it; do not paint out the breadcrumb.
2. Save Home as `source/01-home.png` and open Choose from Photos.
3. Select the matching sample. Save the ordinary Review receipt page before checking as `source/02-scan.png`.
4. Use Check receipt and the existing explicit consent flow if necessary. Save the three-item checklist as `source/03-results.png`.
5. Check Muffin Mix and Chk Enchilada, then expand Reviewed (2). Save `source/04-reviewed.png` with Pancake still active and the two checked undo controls visible.
6. Clear the simulator status-bar override. Verify `/__capture/status` reports a synthetic request and zero provider calls.

`tests/ui/marketing-capture.yaml` automates steps 3–5 with Maestro and Java 17+, assuming the matching sample is the first picker thumbnail and there is no Photos-access banner. Verify the thumbnail position before using coordinate selection. No personal receipt is used or uploaded.

## Artwork and packages

Run `pnpm marketing:render`, then `node scripts/marketing-medium-exports.mjs`. The config selects exactly four source PNGs. The renderer preserves source content, wraps it in the consistent device composition, checks dimensions/opacity, and records SHA-256 source hashes. Final sets are `exports/` (1320×2868) and `exports-medium/` (1206×2622). Package only the four configured PNGs in each ZIP; omit source, preview and manifest files.

Review full exports and the contact sheet for clipped copy, legible text, matching receipt data, complete native screen bounds, and development chrome. These are current native Debug captures; verify the signed app matches them before publishing this future UI update. No upload, listing change, or store submission is part of capture.
