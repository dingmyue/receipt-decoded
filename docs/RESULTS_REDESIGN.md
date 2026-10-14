# Results checklist v1.1

Implements the approved Results UX Patch and translates the HTML prototype into native React Native components. This is a local UI change for a future build. No backend, prompts, models, API endpoints, scanning, monetization, release configuration, deployment, or store submission was changed by this patch.

## Implementation

- `app/results.tsx`: dynamic remaining-group headline, compact checklist, collapsed Reviewed group, undo, subordinate expandable analysis notes, and a safe-area footer.
- `components/DuplicateCard.tsx`: product name, useful printed description/code, gross unit price and recorded count; independent Details control; 46-point checkbox targets with accessible roles, checked states, labels, and hints. Reviewed rows share the checkbox control.
- `lib/session.tsx`: ephemeral review IDs replace the old quantity answers. Reset on a new photo, session reset, and successful analysis, even when the new result reuses group IDs. Photo viewing does not reset the session.
- `shared/results-presentation.mjs` and its declarations: presentation-only adapter and review reducer. Filters by stable group ID, retains source ordering, rejects missing/duplicate IDs (also rejected by the existing API validator), preserves warnings and unreadable recovery, and never modifies the API result. Unit prices exclude fees/discounts; mixed or missing prices stay unclear; unknown currency adds no assumed symbol. Unknown count remains explicitly unclear.
- `shared/results-presentation.test.mjs`: checklist, price, identity, uncertainty, immutability, and reset regressions.
- `tests/results-review-fixtures.mjs`, `tests/ui/results-*.yaml`, and `scripts/results-review-fixture-server.mjs`: synthetic UI fixtures and local native verification. No AI provider is used.

## Visual choices

Uses the app's existing warm background, green text, white cards, native header, and button styles. The existing full-screen receipt viewer replaces the prototype's browser dialog and retains native zoom. The existing clear-receipt confirmation remains. The footer sits outside the scroll view and above the bottom safe area. Details and undo have touch targets of at least 44 points. There is no demo reset control, toast, gradient, WebView, product imagery, or added dependency. These choices preserve the existing app's navigation and accessibility patterns; the prototype is the visual direction rather than a pixel-perfect mandate.

## Reproduce verification

Run from the repository root:

```sh
pnpm typecheck
pnpm ai-server:test
node scripts/results-review-fixture-server.mjs
```

In a separate terminal, start the local Expo UI against the fixture server. Do not use a production backend for the UI scenarios:

```sh
EXPO_NO_DOTENV=1 EXPO_PUBLIC_AI_BASE_URL=http://127.0.0.1:8791 REACT_NATIVE_PACKAGER_HOSTNAME=127.0.0.1 pnpm exec expo start --go --lan --port 8083
```

Open `exp://127.0.0.1:8083` in the iOS simulator's Expo Go. Seed/select a synthetic receipt image, use the existing preview/consent flow, and reach Results. The fixture server defaults to the approved three-product example. A generic synthetic receipt photo is used only to exercise the existing photo/zoom/upload journey; the returned product fixtures are deterministic and are not an analysis-accuracy evaluation.

With Maestro and Java 17+, run `maestro --udid DEVICE_ID test tests/ui/results-review.yaml`. This checks main-card taps, independent Details, check/move/collapse, singular and completion copy, photo zoom/back preservation, expanded Reviewed/undo, canceled new-scan preservation, and new-scan reset with reused IDs. The helper assumes the first photo-picker thumbnail is the synthetic fixture; do not run it against personal photos.

Select a fixture using a local POST, for example:

```sh
curl -X POST 'http://127.0.0.1:8791/__test/scenario?name=missingPrice'
maestro --udid DEVICE_ID test tests/ui/results-partial.yaml
```

The partial flow checks missing price, collapsed warnings, expansion, actual scrolling, and retry through the existing preview. `results-new-scan.yaml` is a helper, not an independent test. Use `results-state.yaml` with `HEADLINE` and `SCREENSHOT` environment values for `empty`, `emptyPartial`, or `unreadable` fixtures. The server's `/__test/status` reports fixture requests and confirms zero provider calls. These local test routes do not exist in the production server.

## Screenshots

Existing before captures: [old Results](ui-review/04-results.png) and [old uncertain Results](ui-review/uncertain/01-unknown.png). These predate this patch; the old quantity-based screen has no direct equivalent of the new Reviewed states.

New unedited simulator captures are in `docs/ui-review/results-v1.1/`. They are UI review evidence, contain Expo development controls, and are not App Store assets.

## Verification results and limits

- TypeScript and all 62 automated tests pass, including existing API, receipt analysis/math, consent, routing, and release-gate tests.
- Native Maestro flows pass for check/undo/details, photo zoom/back, new-scan reset, partial warnings and retry, complete/partial empty states, the unreadable state, and maximum accessibility text size. The iPhone 17 Pro Max runs iOS 26.4. The first partial-flow runs exposed two harness issues (a swipe starting on the footer and an image label hidden by its accessible parent); corrected selectors/gesture pass without production changes.
- Local fixture-server verification completed 11 synthetic analysis requests with zero AI provider calls.
- At the largest accessibility text size, text wraps and scrolls with the footer remaining visible. The simulator text size was restored to its original setting.
- A separate iPhone 13 mini simulator could not be installed because local disk space ran out. That temporary simulator was removed; compact-device verification remains outstanding.
- Checkbox roles/states/labels and scalable text are implemented. Full spoken VoiceOver and physical-device camera/zoom validation remain manual QA. No live AI analysis, release build, or deployment is needed for this UI patch.

## Capture index

| File | State |
| --- | --- |
| `review-sheet.png` | Four-state visual overview |
| `01-three-unchecked.png` | Initial approved three-product fixture |
| `02-mixed.png` | Two remaining, Reviewed (1) collapsed |
| `03-all-reviewed.png` | Completion with Reviewed (3) collapsed |
| `04-reviewed-expanded.png` | Compact checked rows and undo controls |
| `05-undo.png` | One item restored to the active list |
| `06-partial-missing-price.png` | Partial analysis, unknown price, notice collapsed |
| `07-partial-expanded.png` | Scrolled warnings and retry above the fixed footer |
| `08-empty-complete.png` | No repeated items found |
| `09-empty-partial.png` | No repeated items identified, uncertainty retained |
| `10-unreadable.png` | Existing unreadable recovery copy |
| `11-largest-text-top.png` | Maximum accessibility text, top of checklist |
| `12-largest-text-scrolled.png` | Maximum accessibility text, scrolled cards |
