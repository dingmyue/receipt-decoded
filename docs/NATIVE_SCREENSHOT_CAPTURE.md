# Reproducing native screenshot inputs

Marketing inputs are captured from the current standalone iPhone simulator app using its ordinary Home → receipt preview → result → quantity-answer screens. This avoids Expo Go controls without changing the production UI, adding a hidden QA route or disabling the Release HTTPS requirement. Use synthetic receipt data only; do not upload a shopper's private receipt for marketing captures.

## Native Debug build

The existing iOS project and installed Pods are required. Build only the booted iPhone 17 Pro Max (1320 × 2868 screen); do not build generic simulator architectures:

```sh
xcodebuild \
  -workspace ios/ReceiptDecoded.xcworkspace \
  -scheme ReceiptDecoded \
  -configuration Debug \
  -destination 'platform=iOS Simulator,id=2A12F855-3888-478E-81B4-6C32A6B9D74E' \
  -derivedDataPath /tmp/receipt-decoded-v0-debug \
  ONLY_ACTIVE_ARCH=YES \
  CODE_SIGNING_ALLOWED=NO \
  'GCC_PREPROCESSOR_DEFINITIONS=$(inherited) RCT_METRO_PORT=8083' \
  build
```

Output: `/tmp/receipt-decoded-v0-debug/Build/Products/Debug-iphonesimulator/ReceiptDecoded.app`. This is a simulator Debug build, not a signed distribution archive or Release verification.

SDK 57 uses prebuilt React Native Core, which may retain its compiled default Metro port. The existing React Native bundle provider reads the `RCT_jsLocation` native user default, so select the isolated screenshot Metro explicitly when launching:

```sh
xcrun simctl install \
  2A12F855-3888-478E-81B4-6C32A6B9D74E \
  /tmp/receipt-decoded-v0-debug/Build/Products/Debug-iphonesimulator/ReceiptDecoded.app
xcrun simctl launch --terminate-running-process \
  2A12F855-3888-478E-81B4-6C32A6B9D74E \
  com.mingyue.receiptdecoded \
  -RCT_jsLocation localhost:8083
```

No AppDelegate change is needed. Keep screenshot Metro separate from the user's ordinary Expo Go server. Configure only its public backend URL to the local deterministic mock; never expose an OpenAI key to Metro, screenshots or mobile configuration. The Release client continues to reject HTTP backend URLs.

## Capture and honesty

Run `pnpm marketing:sample` to generate `docs/app-store/marketing/source/sample-receipt.png`, then `pnpm marketing:capture-server` for a loopback-only backend on port 8790. It normalizes and validates a matching fictional Sample Market receipt: two Sparkling water product rows at 1789 cents and two linked container deposits at 120 cents; the printed total is 3818 cents and the conditional extra is 1909 cents. It reads no API credential and makes no provider call. Start a separate Metro with `EXPO_PUBLIC_AI_BASE_URL=http://localhost:8790 pnpm exec expo start --go --localhost --port 8083`. The app receives the ordinary validated result through its existing consent-protected endpoint. Use the normal explicit permission flow, then normal quantity controls to create the “2 or more” expected state. No UI text, monetary values or controls are painted into the source screen capture.

Capture the full native screen after transient loading/debug notifications disappear. Keep conditional amount/accuracy text and quantity controls visible. Preserve source PNGs separately from marketing copy and framing so replacing a screenshot does not repaint the app UI. Identify these captures as standalone Debug inputs in internal evidence, and verify the final Release UI before public listing submission.

## The captured source set

Current source PNGs are in `docs/app-store/marketing/source/`: `01-duplicates.png`, `02-preview.png` and `03-quantity.png`. They were captured through Simulator Save Screen from the standalone Debug app, using the unchanged product components and the fictional sample. The temporary backend reported one synthetic check and zero provider calls. No real receipt or personal information was used.

Use the simulator's status-bar override for 9:41, full battery and signal before capture; clear it afterwards. If an iOS return-to-Expo-Go breadcrumb appears, use the simulator Home button then relaunch the native app without terminating it; this preserves the preview and clears that system breadcrumb. Never paint over the app's interface to hide development chrome. Keep the entire result and quantity qualification in frame.

`pnpm marketing:render` reads `docs/app-store/marketing/copy.json` and these raw inputs, then exports exactly three opaque PNGs to `docs/app-store/marketing/exports/`. Editable SVG layouts, a quarter-size contact sheet and a SHA-256 source manifest are saved alongside them. Replace the PNG inputs with fresh native captures for later product versions; do not use an AI image model to reconstruct the app's UI.
