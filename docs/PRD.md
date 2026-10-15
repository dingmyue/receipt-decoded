# Receipt Decoded
## Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Planning  
**Platform:** iOS  
**Product Type:** AI-Powered Receipt Scanner  
**Tagline:** Every charge, explained.  
**Primary Technology:** Expo, React Native, TypeScript, OpenAI API  
**Reference Project:** [Little Moments](https://github.com/dingmyue/little-moments)

---

# 1. Product Overview

## 1.1 Vision

**Receipt Decoded helps shoppers understand their receipts and avoid unnecessary charges.**

Shopping receipts often contain abbreviated product names, confusing charges, and multiple line items that are difficult to interpret.

A particularly common frustration is discovering that the same product may have been accidentally scanned multiple times at checkout.

Receipt Decoded uses AI to analyze a receipt photograph, identify potentially duplicated charges, explain the affected products in plain English, and estimate how much money the customer may have been overcharged.

The long-term vision is to become a simple, intelligent receipt explainer that helps people understand exactly what they paid for.

However, the initial version will focus exclusively on **duplicate charge detection**.

### Core Product Promise

**Scan your receipt. Spot duplicate charges. Save money.**

The user should be able to:

1. Open the app.
2. Take or upload a receipt photo.
3. Receive an easy-to-understand analysis.
4. Identify potential duplicate charges and their amounts.
5. Confirm whether the duplicated items were actually purchased.

The entire experience should require minimal effort.

## 1.2 Product Philosophy

Receipt Decoded should be:

**Simple**

The app performs one primary task exceptionally well. No unnecessary features, configuration, or complicated navigation.

**Beautiful**

A polished, minimalist iOS experience with thoughtful typography, spacing, colors, and visual hierarchy.

**Fast**

Users should be able to scan a receipt and understand the result within seconds, depending on network and model response time.

**Intelligent**

AI should interpret receipt information rather than simply highlight identical text.

**Actionable**

The app should tell users what they need to check and how much money might be involved.

**Trustworthy**

The app must distinguish between potential duplicate charges and confirmed billing mistakes.

**Low Maintenance**

The architecture should be lightweight, inexpensive to operate, and easy for an independent developer to maintain.

---

# 2. Problem Statement

## 2.1 User Problem

Customers frequently receive shopping receipts containing:

- Abbreviated or unclear product descriptions.
- Multiple charges for identical products.
- Additional fees associated with certain products.
- Discounts and promotional adjustments.
- Different quantities and unit prices.

Manually reviewing receipts is tedious.

Even when a duplicate is detected, identifying the actual product and understanding the potential financial impact can be difficult.

### Example: Costco Receipt

A receipt contains:

| Receipt Description | Amount | Occurrences |
|---|---:|---:|
| CHIFORESTVTY | $17.89 | 2 |
| 2XA REDEMP VA | $1.20 | 2 |

The product is Chi Forest Sparkling Water.

The additional $1.20 charge is associated with the beverage's container redemption value (CRV).

A basic receipt scanner may highlight the repeated lines individually.

A more intelligent product should explain:

**Possible Duplicate Purchase**

Chi Forest Sparkling Water — 24 Pack

Recorded quantity: 2

Product charge: $17.89 each

Associated CRV: $1.20 each

**Potential extra charge: $19.09**

*If you purchased only one pack, you may have been charged for an extra pack and its associated deposit.*

The app should then ask:

**How many packs did you actually buy?**

This distinction is fundamental to the product.

Repeated charges are not necessarily mistakes. The app should identify suspicious charges and help the user verify them.

## 2.2 Existing Solutions

Two relevant competitors have been identified:

**DupeCatcher**
- Detects repeated receipt lines.
- Highlights duplicates on the original image.
- Uses an offline-first approach.
- Offers a one-time purchase.

**DupeDetective**
- Detects potentially duplicate charges.
- Supports receipt scanning and review.
- Also emphasizes avoiding unnecessary charges.

Both demonstrate that the basic functionality is technically feasible.

However, the product opportunity is not simply to reproduce text highlighting.

### Differentiation

Receipt Decoded should aim to provide:

| Existing Receipt Detection | Receipt Decoded |
|---|---|
| Highlights repeated text | Explains the actual product |
| Displays matching receipt lines | Groups related product charges |
| Identifies duplicates | Estimates potential financial impact |
| Requires users to interpret results | Provides actionable explanations |
| Primarily OCR-driven | AI-powered receipt understanding |

The product should prioritize **clarity and useful interpretation**, not simply detecting repeated strings.

These are proposed differentiators, not yet validated advantages over every competitor.

---

# 3. Target Audience

## 3.1 Primary Users

Everyday shoppers who want to verify their receipts without manually reviewing every line.

Especially relevant for:

- Costco shoppers.
- Grocery store shoppers.
- Customers who regularly purchase many items in one transaction.
- Families purchasing household supplies.
- Budget-conscious consumers.

## 3.2 User Characteristics

The ideal user:

- Shops regularly.
- Uses an iPhone.
- Does not want another complicated finance app.
- Occasionally suspects checkout mistakes.
- Wants to know whether they were overcharged.
- Prefers an immediate answer over detailed receipt management.

## 3.3 Primary User Story

**As a shopper, I want to scan my receipt and immediately see suspicious duplicate charges so I can verify whether I paid for something twice.**

Additional user stories:

**As a shopper**, I want to understand abbreviated product names so I can recognize what was charged.

**As a shopper**, I want to see the possible overcharge amount so I know whether the issue is worth investigating.

**As a shopper**, I want to confirm how many units I actually purchased so the app does not incorrectly report legitimate purchases as billing errors.

**As a shopper**, I want to see the original receipt information so I can verify the AI's interpretation.

---

# 4. Product Roadmap

The development will follow a phased approach.

The initial release should be intentionally narrow.

## Phase Overview

| Phase | Scope | Deliverable |
|---|---|---|
| **Phase 0** | Repository and infrastructure setup | Working Expo project and backend skeleton |
| **Phase 1** | UI implementation using mock data | Complete interactive scanning experience |
| **Phase 2** | OpenAI receipt analysis integration | Functional duplicate detection |
| **Phase 3** | Validation, polish, and release | TestFlight and App Store-ready V0 |
| **Phase 4** | Monetization experimentation | Optional ads or paid scan credits |
| **Phase 5** | FSA analysis | FSA amount and eligibility insights |
| **Phase 6** | Spending categorization | Receipt-level spending breakdown |
| **Phase 7** | Advanced receipt intelligence | Additional explanations and verification features |

**Phases 0–3 constitute the V0 product.**

Phases 4–7 are future opportunities and should not influence the initial implementation beyond reasonable extensibility.

---

# 5. V0 Functional Requirements

## 5.1 Scope

V0 supports one primary workflow:

**Receipt Photo → AI Analysis → Potential Duplicate Charges → User Verification**

### Included

- Photograph a receipt.
- Select a receipt image from the photo library.
- Preview the selected image.
- Submit the receipt for AI analysis.
- Extract merchant information when available.
- Identify potentially duplicated product charges.
- Interpret abbreviated product descriptions.
- Associate relevant fees with duplicate products when possible.
- Calculate estimated potential overcharges.
- Display results in a clear, polished interface.
- Allow users to verify quantities purchased.
- Display the original receipt for reference.
- Scan another receipt.

### Explicitly Excluded

- FSA analysis.
- Spending categorization.
- Receipt history.
- Receipt cloud storage.
- User accounts.
- Login.
- Subscriptions.
- In-app purchases.
- Advertising.
- Product price comparisons.
- Automatic refund requests.
- Product database integrations.
- AI chat interface.
- Monthly spending dashboards.

**Do not implement excluded functionality in V0.**

---

# 6. Information Architecture

The application should have minimal navigation.

There should be **no bottom tab bar**.

### Main User Flow

```text
Launch App
    |
    v
Home Screen
    |
    |-- Take Photo
    |-- Choose from Library
    |
    v
Receipt Preview
    |
    |-- Retake / Replace
    |-- Analyze Receipt
    |
    v
Analyzing State
    |
    v
Results Screen
    |
    |-- Review Potential Duplicates
    |-- Confirm Purchase Quantity
    |-- View Original Receipt
    |-- Scan Another Receipt
    |
    v
Home Screen
```

A minimal Settings/About screen is accessible from Home.

The preview and analyzing states may share the same navigation route if implementation is simpler.

---

# 7. Screen Requirements

## 7.1 Screen 1 — Home

### Purpose

Provide an immediate entry point to receipt scanning.

The experience should be intuitive without onboarding.

### Content

**App Name**

Receipt Decoded

**Main Heading**

Every charge, explained.

**Supporting Text**

Scan your receipt to spot possible duplicate charges and see how much you may have overpaid.

**Primary Action**

Scan Receipt

**Secondary Action**

Choose from Photos

**Additional Elements**

- Minimal illustration or icon, if needed.
- Small Settings button.
- Brief AI-processing disclosure.

### Interaction

**Scan Receipt**

Opens the device camera.

**Choose from Photos**

Opens the iOS photo picker.

After selecting or capturing an image, the app navigates to Receipt Preview.

### Design Requirements

- Large, prominent primary action.
- Generous whitespace.
- No login.
- No dashboard.
- No historical statistics.
- No advertising.
- No unnecessary onboarding.

The primary button must be visible without scrolling on standard iPhone screens.

---

## 7.2 Screen 2 — Receipt Preview

### Purpose

Allow users to verify that the selected receipt photo is readable before analysis.

### Content

**Heading**

Review Receipt

**Main Area**

Display the selected receipt image.

The image should support:
- Appropriate scaling.
- Zooming.
- Scrolling when necessary.

**Primary Action**

Analyze Receipt

**Secondary Actions**

Retake Photo

Choose Another Photo

### Interaction

When the user selects Analyze Receipt:

1. Validate that an image exists.
2. Check supported image format and size.
3. Resize or compress the image if necessary.
4. Send the image to the backend.
5. Transition to the analyzing state.

### Requirements

- Preserve sufficient image resolution for small receipt text.
- Avoid excessive compression that makes numbers unreadable.
- Support long, narrow receipt images.
- Avoid automatic cropping that could remove relevant information.

### Error Handling

If the image cannot be processed:

- Display a clear explanation.
- Allow users to retry.
- Allow users to choose another image.

---

## 7.3 Analyzing State

### Purpose

Communicate that the receipt is being processed.

### Content

Use a subtle loading animation.

Example messages:

**Reading your receipt...**

**Looking for duplicate charges...**

**Checking your results...**

### Requirements

- Display a loading indicator.
- Prevent duplicate submissions while a request is in progress.
- Allow recovery from errors.
- Do not show fabricated progress percentages.
- Avoid unnecessary animations or distracting effects.

### Failure States

Support:

- Network failure.
- Request timeout.
- Unsupported image.
- Receipt cannot be read.
- AI service unavailable.
- Invalid server response.

Every failure should offer an appropriate retry or replacement action.

---

## 7.4 Screen 3 — Results

This is the most important screen in the application.

**The user should understand the main result within approximately three seconds of viewing the completed analysis.**

The results page should be clear, visually appealing, and focused on actionable information.

### Section A — Receipt Overview

Display available information:

**Merchant**

Costco

**Purchase Date**

If readable.

**Receipt Total**

If confidently identified.

Avoid displaying invented information when values are missing.

### Section B — Duplicate Detection Summary

Three possible states are required.

#### State 1: Potential Duplicates Found

Example:

**Possible duplicate charges found**

Potential extra charge:

**$19.09**

This is the main financial figure on the screen.

The amount must be labeled as potential, not confirmed.

If more than one suspicious group exists, display the combined potential amount alongside individual details, without double counting associated fees.

#### State 2: No Duplicates Found

Example:

**No obvious duplicate charges found.**

We didn't identify any suspicious duplicate charges in this receipt.

The app must not claim that the receipt is guaranteed error-free.

#### State 3: Analysis Incomplete

Example:

**Some charges couldn't be verified.**

Part of this receipt was difficult to read. Review the original image or try another photo.

The app should distinguish incomplete analysis from a clean receipt.

### Section C — Duplicate Item Cards

Each suspicious duplicate group should be displayed as a card.

#### Example Card

**Chi Forest Sparkling Water**

24-pack · Costco Item #2022263

Original receipt description:

`CHIFORESTVTY`

**Detected Charges**

| Description | Amount |
|---|---:|
| Sparkling Water | $17.89 |
| Sparkling Water | $17.89 |
| Associated CRV | $1.20 × 2 |

**Potential Extra Charge**

### $19.09

**Why was this flagged?**

This product appears twice on your receipt. Each purchase also has an associated $1.20 container deposit.

If you only bought one pack, the second product charge and deposit may be incorrect.

#### Confirmation Interaction

**How many packs did you actually buy?**

Options:

- 1
- 2 or more
- Not sure

If the user selects **1**:

Display:

**Possible billing mistake**

Potential overcharge: $19.09

If the user selects **2 or more**:

Display:

**Likely expected charges**

The repeated charges may be correct.

If the user selects **Not sure**:

Keep the issue in its original unverified state.

The app should update the displayed potential-overcharge summary appropriately.

**Important:** User confirmation of quantity is not confirmation that a refund has been received.

### Section D — Original Receipt

Provide an expandable section or a separate lightweight view.

**View Original Receipt**

Users should be able to:

- View the original photo.
- Zoom into receipt details.
- See the original descriptions referenced by duplicate detection.
- Compare the AI interpretation against the printed receipt.

For V0, highlighting exact coordinates on the image is optional.

**It is not necessary to implement bounding-box detection or overlays in the first release.**

However, each flagged product should clearly reference its original receipt description.

### Section E — Bottom Action

**Scan Another Receipt**

Returns to Home or directly initiates another scan.

The current receipt analysis may be discarded when starting a new scan.

---

## 7.5 Screen 4 — Settings / About

### Purpose

Provide essential product and support information.

### Content

- App name.
- App version.
- Privacy Policy.
- Support / Contact.
- About Receipt Decoded.
- Brief AI accuracy disclaimer.

### Out of Scope

- Account management.
- Payment settings.
- Receipt history.
- Subscription management.
- Advanced preferences.

---

# 8. AI Receipt Analysis

## 8.1 Objective

Use OpenAI's image-understanding capabilities to transform a receipt photograph into structured, actionable information.

The AI should do more than perform OCR.

It should attempt to understand:

- Merchant names.
- Product descriptions.
- Item codes.
- Quantities.
- Unit and line amounts.
- Repeated product charges.
- Related fees.
- Discounts.
- Reversals and corrections.
- Whether repeated lines actually represent independent purchases.

## 8.2 AI Responsibilities

The AI should:

**1. Read the receipt**

Extract relevant text, prices, and line items.

**2. Interpret product descriptions**

Translate abbreviated receipt descriptions into understandable product names when supported by the evidence.

Example:

`CHIFORESTVTY`

Potential interpretation:

Chi Forest Sparkling Water

Do not fabricate exact product details when the receipt does not provide sufficient information.

**3. Detect potential duplicates**

Identify repeated product charges that may represent accidental double scanning.

**4. Associate relevant charges**

Recognize when an additional charge, such as CRV, is associated with a duplicated product.

**5. Explain the finding**

Generate a short, understandable explanation of why the charge is suspicious.

**6. Return structured data**

Produce validated JSON rather than free-form text.

## 8.3 Critical AI Rules

### Rule 1: Repeated Items Are Not Necessarily Mistakes

A receipt containing two identical items may represent an intentional purchase of two units.

The AI must not declare a billing mistake without user verification.

### Rule 2: Detect Quantity Expressions

A product represented as:

`2 × $10.00`

must appear as a quantity review with two units on the receipt, even when it is a single printed charge row. The shopper must be able to check the recorded count against what they bought.

It may be a legitimate quantity-two purchase; displaying it for review is not confirmation of a billing error. Keep the quantity annotation attached to its product rather than extracting it as a second charge. Pack sizes in product descriptions do not establish charged quantity.

### Rule 3: Handle Discounts and Reversals

A positive charge followed by a corresponding negative adjustment may represent a correction.

The app should avoid reporting corrected transactions as outstanding duplicate charges.

### Rule 4: Group Related Fees

A duplicated beverage and duplicated CRV should be grouped into one potential issue.

Do not report the associated deposit as an independent product duplicate.

### Rule 5: Preserve Source Information

Always preserve the original receipt description and associated amount.

### Rule 6: Do Not Invent Product Names

If the exact product cannot be determined, use a descriptive fallback.

Example:

"Unidentified grocery item"

Original description:

`ITEM 123456`

### Rule 7: Do Not Invent Savings

Only show amounts supported by identified charges.

Potential overcharges must remain estimates until verified.

### Rule 8: Respect Uncertainty

If part of the receipt is unreadable, indicate that clearly.

Do not silently fill missing information with assumptions.

---

# 9. AI Response Data Model

The backend should return structured, typed data.

The exact schema can evolve during implementation, but V0 should support the following conceptual structure.

```typescript
type ReceiptAnalysis = {
  receipt: {
    merchantName: string | null;
    purchaseDate: string | null;
    currency: string;
    totalCents: number | null;
  };

  lineItems: ReceiptLineItem[];

  duplicateGroups: DuplicateGroup[];

  analysis: {
    status: "complete" | "partial" | "unreadable";
    warnings: string[];
  };
};

type ReceiptLineItem = {
  id: string;

  originalDescription: string;

  interpretedName: string | null;

  productCode: string | null;

  quantity: number | null;

  amountCents: number | null;

  lineType:
    | "product"
    | "fee"
    | "discount"
    | "tax"
    | "reversal"
    | "summary"
    | "payment"
    | "unknown";
};

type DuplicateGroup = {
  id: string;

  productName: string;

  originalDescription: string;

  productCode: string | null;

  relatedLineItemIds: string[];

  recordedQuantity: number | null;

  potentialExtraCents: number | null;

  explanation: string;

  verificationStatus:
    | "unverified"
    | "possible_error"
    | "expected_purchase";
};
```

### Monetary Representation

All money should be represented using **integer cents**.

Example:

```typescript
potentialExtraCents: 1909
```

Avoid floating-point calculations for monetary values.

### Backend Validation

The backend must:

- Validate the AI response against a defined schema.
- Reject malformed or unsupported values.
- Compute monetary totals using deterministic application logic.
- Prevent duplicate counting across groups.
- Return warnings for incomplete or inconsistent receipt data.

The AI should identify relationships and candidate duplicates.

**The backend should own monetary calculations.**

---

# 10. Technology Stack

## 10.1 Design Principle

**Align as closely as practical with Little Moments.**

The goal is to maximize reuse of existing experience and minimize unnecessary technology decisions.

Reference repository:

https://github.com/dingmyue/little-moments

The existing repository has already established working patterns for Expo, Node.js, OpenAI integration, Render deployment, and EAS distribution.

## 10.2 Recommended Stack

| Component | Technology |
|---|---|
| Platform | iOS |
| Framework | Expo |
| Mobile UI | React Native |
| Language | TypeScript |
| Navigation | Expo Router |
| Package Manager | pnpm |
| Styling | React Native StyleSheet |
| Camera / Photo Library | expo-image-picker |
| Image Processing | expo-image-manipulator, if needed |
| State Management | React hooks and local state |
| Backend | Node.js native HTTP server |
| AI | OpenAI Responses API |
| AI Output | Structured Outputs |
| Hosting | Render |
| Build | EAS Build |
| Distribution | TestFlight / Apple App Store |
| Support / Privacy | Existing web-hosting infrastructure |

### Version Alignment

Little Moments currently uses the following versions in the reviewed repository:

- Expo SDK 54
- React Native 0.81.5
- React 19.1.0
- Expo Router 6
- TypeScript 5.9
- pnpm 9

Use these as a compatibility reference.

For the initial repository, prefer the established Little Moments versions unless a compatibility or platform requirement justifies upgrading.

Before App Store submission, verify the current Expo, EAS, and Apple build requirements.

Do not automatically introduce new frameworks simply because newer versions are available.

## 10.3 Repository Structure

Recommended structure:

```text
receipt-decoded/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── preview.tsx
│   ├── results.tsx
│   └── settings.tsx
│
├── components/
│   ├── PrimaryButton.tsx
│   ├── ReceiptPreview.tsx
│   ├── DuplicateCard.tsx
│   ├── ResultsSummary.tsx
│   └── LoadingState.tsx
│
├── lib/
│   ├── ai-client.ts
│   ├── types.ts
│   ├── theme.ts
│   └── receipt-utils.ts
│
├── server/
│   ├── index.mjs
│   ├── receipt-analyzer.mjs
│   └── validators.mjs
│
├── assets/
│
├── app.json
├── eas.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
└── PRD.md
```

This is a suggested structure, not a requirement to create every file immediately.

Codex should keep the repository small and avoid unnecessary abstraction.

## 10.4 Backend Architecture

The app should not call OpenAI directly from the mobile client.

Recommended architecture:

```text
Expo iOS App
     |
     | Receipt image
     v
Node.js Backend on Render
     |
     | OpenAI API Request
     v
OpenAI Vision Model
     |
     | Structured response
     v
Backend Validation
     |
     | Duplicate grouping
     | Monetary calculations
     v
Structured JSON
     |
     v
React Native Results UI
```

### Endpoint

```http
POST /api/receipt/analyze
```

Request:

- One receipt image.
- Optional anonymous installation identifier.

Preferred content type:

```http
multipart/form-data
```

Response:

```typescript
ReceiptAnalysis
```

### Additional Endpoint

```http
GET /health
```

Used for deployment and availability checks.

### Backend Responsibilities

- Validate file type and size.
- Reject oversized requests.
- Protect the OpenAI API key.
- Call the configured vision-capable model.
- Validate structured AI output.
- Perform deterministic monetary calculations.
- Apply rate limiting.
- Handle timeouts and upstream errors.
- Return typed error responses.

V0 does not require a database.

### Model Selection

Use a vision-capable OpenAI model that supports structured output.

The exact model should be configurable through an environment variable:

```text
OPENAI_RECEIPT_MODEL
```

Start with a reasonably priced model and compare accuracy with alternatives using a real receipt test set.

Do not select the cheapest model solely based on price.

**Correctly identifying charges is more important than saving a fraction of a cent per request.**

---

# 11. Data Storage and Privacy

## 11.1 V0 Storage

The application should not permanently store receipt photos or analysis history.

During a scan:

1. User selects a photo.
2. The photo is temporarily available to the app.
3. The photo is uploaded for AI analysis.
4. The result is displayed in memory.
5. Starting a new scan replaces the current analysis.

No user account or persistent receipt database is required.

## 11.2 Privacy Requirements

- Keep API keys exclusively on the server.
- Do not log receipt images.
- Do not log extracted receipt contents by default.
- Do not collect user identities.
- Avoid retaining photos after processing.
- Provide an accurate Privacy Policy.
- Disclose that receipt photos are transmitted to an AI processing provider.
- Confirm the provider's actual data-retention and processing policies before making privacy claims.

Use the existing Little Moments web-hosting experience to host Receipt Decoded's own Privacy Policy and Support pages.

## 11.3 Abuse Prevention

Because the app uses a paid AI API, the backend must implement reasonable protections.

At minimum:

- Request size limits.
- Rate limiting.
- Concurrent request limits.
- API usage monitoring.
- Configurable spending limits.
- Safe error responses.

An anonymous installation identifier may help with basic rate limiting, but it is not secure authentication.

A public secret embedded in the Expo app must not be treated as a reliable security boundary.

More advanced anti-abuse measures can be introduced if usage increases.

---

# 12. UI / UX Design Direction

## 12.1 Visual Identity

**Brand Name:** Receipt Decoded

**Tagline:** Every charge, explained.

### Desired Style

Minimalist, polished, modern, warm, and trustworthy.

The visual experience should resemble a thoughtfully designed iOS utility rather than a complicated financial management tool.

### Colors

Suggested palette direction:

| Purpose | Color Direction |
|---|---|
| Background | Warm off-white |
| Primary Text | Charcoal |
| Secondary Text | Muted gray |
| Primary Button | Dark charcoal |
| Potential Duplicate | Soft amber |
| Verified / Reassuring | Muted green |
| Cards | White or subtle neutral |

Exact color tokens should be finalized during the design phase.

### Typography

- Native-feeling iOS typography.
- Clear hierarchy.
- Large monetary figures.
- Readable product descriptions.
- Minimal decorative text.

### Components

Prefer:

- Rounded cards.
- Generous spacing.
- Simple buttons.
- Subtle dividers.
- Clean icons.
- Lightweight animations.

Avoid:

- Overly colorful dashboards.
- Complex charts.
- Excessive AI branding.
- Large illustrations that compete with the primary action.
- Too many nested menus.
- Unnecessary popups.

## 12.2 Results UI Priorities

The Results screen should communicate information in this order:

**First:** How much money might be involved?

**Second:** Which product appears to have been charged multiple times?

**Third:** Why was the charge flagged?

**Fourth:** How can the user verify whether it was an error?

Original receipt details should be available without dominating the main view.

## 12.3 Accessibility

V0 should support:

- Dynamic Type where practical.
- VoiceOver labels for primary controls.
- Sufficient color contrast.
- Text labels in addition to color indicators.
- Touch targets suitable for one-handed use.

---

# 13. Monetization Strategy

## 13.1 V0

**Completely free.**

Do not introduce monetization during initial implementation.

The first objective is to validate:

- Does the app reliably detect suspicious charges?
- Is it easier to use than ChatGPT?
- Do users understand the results?
- Will users scan receipts repeatedly?

## 13.2 Why Not Subscriptions?

Receipt scanning may be relatively infrequent for many users.

Users may not want a recurring subscription for a small utility that they use only after shopping.

Subscriptions should not be the default business model.

## 13.3 Why Not Unlimited One-Time Purchase?

If each receipt scan uses a paid OpenAI API, every scan generates an ongoing operating cost.

An unlimited lifetime purchase could create a long-term cost obligation without corresponding recurring revenue.

A traditional unlimited buyout is therefore not the preferred model.

## 13.4 Future Monetization Options

### Option A — Rewarded Ads

Users receive a limited number of free scans.

Additional scans can be unlocked by voluntarily watching an advertisement.

Example:

**You've used your free scans.**

Watch an ad to unlock another scan.

Advantages:

- No subscription.
- Users choose whether to watch.
- Revenue can be linked to additional AI usage.

Challenges:

- Ad revenue may be insufficient to cover API costs.
- Users may dislike waiting to scan.
- Ad SDK integration adds privacy and maintenance complexity.

### Option B — Scan Credit Packs

Users purchase additional scans through Apple In-App Purchase.

Example:

- Five additional scans.
- Twenty additional scans.

Exact prices and quantities should be determined through testing.

Advantages:

- No recurring subscription.
- Revenue corresponds more directly to API usage.
- Avoids unlimited future scanning liability.

### Option C — Hybrid Model

A limited free allowance, rewarded ads for optional additional scans, and paid scan packs.

This could eventually balance accessibility and operating costs.

### Monetization Decision

**Do not implement monetization until real usage and API costs are measured.**

In particular, do not introduce AdMob into the initial Expo project.

Advertising may require additional native dependencies and privacy disclosures.

---

# 14. Phase 0 — Repository Setup

## Objective

Create a clean, independent Expo application and backend foundation.

The setup should closely follow Little Moments.

### Deliverables

- New `receipt-decoded` repository.
- Expo application.
- TypeScript configuration.
- Expo Router configuration.
- pnpm setup.
- Basic Home placeholder.
- Node.js server skeleton.
- Health endpoint.
- Environment configuration.
- EAS configuration.
- README.

### Requirements

Proposed app configuration:

```text
App Name: Receipt Decoded
Slug: receipt-decoded
Bundle ID: com.mingyue.receiptdecoded
Platform: iOS
Orientation: Portrait
Theme: Light
```

The bundle identifier is a proposal and should be confirmed before App Store submission.

Create a fresh EAS project configuration.

Do not reuse Little Moments' bundle identifier or EAS project ID.

### Backend

Implement:

```http
GET /health
```

Prepare a placeholder for:

```http
POST /api/receipt/analyze
```

Do not call OpenAI yet.

### Acceptance Criteria

- Dependencies install successfully.
- Expo starts.
- Home placeholder renders.
- Backend starts.
- Health endpoint responds.
- TypeScript checks pass.
- Environment variables are documented.
- No secrets are committed.
- Little Moments remains unchanged.

### Codex Guidance

Use Little Moments as the reference implementation, but do not copy unrelated functionality.

Avoid importing:

- RevenueCat.
- Audio recording.
- Transcription.
- Family profiles.
- Existing analytics.
- Unneeded database infrastructure.

**Phase 0 should establish a clean foundation, not implement product functionality.**

---

# 15. Phase 1 — UI Implementation with Mock Data

## Objective

Implement the complete user experience before integrating AI.

This phase should focus on product design, visual quality, navigation, and interaction.

### Screens

- Home.
- Receipt Preview.
- Analyzing.
- Results.
- Settings / About.

### Mock Data

Use the Costco receipt example.

Example:

```typescript
const mockDuplicate = {
  productName: "Chi Forest Sparkling Water",
  originalDescription: "CHIFORESTVTY",
  productCode: "2022263",
  recordedQuantity: 2,
  productPriceCents: 1789,
  associatedExtraFeeCents: 120,
  potentialExtraCents: 1909,
  verificationStatus: "unverified",
};
```

Also provide mock states for:

- No duplicates.
- Multiple suspicious groups.
- Incomplete analysis.
- Network error.
- Unreadable receipt.

### Interactions

All buttons should behave realistically.

For example:

- Photo selection opens the appropriate picker.
- Analyze transitions into loading.
- Mock analysis returns Results.
- Quantity selection updates the result.
- Scan Another Receipt resets the flow.

### Acceptance Criteria

- End-to-end navigation works using mock data.
- All major UI states are implemented.
- Results are clear without additional explanation.
- Product names and amounts are easy to read.
- User confirmation interactions work.
- No backend connectivity is required.
- No real AI calls occur.
- UI is ready for review before proceeding.

### Phase Exit Gate

**Approve the design and interaction flow before Phase 2.**

The UI should not be redesigned automatically during AI integration.

---

# 16. Phase 2 — OpenAI Integration

## Objective

Replace mock results with real receipt analysis.

### Work Items

**Backend**

- Implement image-upload handling.
- Validate input.
- Integrate OpenAI Responses API.
- Implement structured AI output.
- Validate the returned schema.
- Normalize receipt line items.
- Detect and group suspicious duplicates.
- Calculate potential overcharges.
- Return typed responses.

**Mobile**

- Upload selected receipt image.
- Show loading state.
- Parse API response.
- Render real results.
- Handle API errors.
- Support retry.

### Receipt Analysis Logic

The AI should distinguish:

1. Identical products purchased legitimately.
2. Suspicious duplicate charges.
3. Quantity-based purchases.
4. Associated fees.
5. Discounts and reversals.
6. Informational receipt lines.

### Potential Overcharge Calculation

For an apparent duplicate purchase, the estimated extra amount should consider:

- Extra product charge.
- Directly associated extra fees.
- Relevant discounts or reversals.
- Tax uncertainty.

If the true quantity purchased is unknown, the result remains a conditional estimate.

The app must not count the same charges twice.

### Acceptance Criteria

- Real Costco receipts can be analyzed.
- Duplicate candidates are identified.
- Abbreviated product descriptions are explained when possible.
- CRV and similar related charges are grouped appropriately.
- Actual duplicate status remains unverified until user confirmation.
- Structured responses are validated.
- API keys remain server-side.
- Errors and timeouts are handled.
- The UI works without relying on fixed mock data.

---

# 17. Phase 3 — Testing, Polish, and Release

## Objective

Validate detection quality and deliver a stable initial iOS release.

## 17.1 Testing Dataset

Collect approximately **20–30 real receipt images** for initial testing.

Prefer a mix of retailers:

- Costco.
- Target.
- Safeway.
- Walmart.
- Other grocery or retail stores.

Include both receipts with and without known duplicate charges.

### Required Test Cases

| Test Case | Expected Behavior |
|---|---|
| Two identical products legitimately purchased | Flag as a candidate if appropriate, but require confirmation |
| Product accidentally charged twice | Identify a potential duplicate |
| Quantity expressed as `2 × price` | Interpret quantity correctly |
| Beverage with associated CRV | Group relevant fees |
| Duplicate charge followed by a reversal | Do not treat corrected charge as outstanding |
| Product discount | Avoid incorrect monetary calculations |
| Repeated informational summary | Do not report as a duplicate purchase |
| Blurry image | Return uncertainty or request a clearer photo |
| Partial receipt | Report incomplete analysis |
| Multiple suspicious products | Display separate groups without double counting |
| No duplicates | Show clean result state |
| Unknown product abbreviation | Preserve original description without inventing details |

### Specific Costco Regression Test

The previously discussed Costco receipt should be used as an important regression example.

Expected behavior:

- Recognize Costco.
- Detect two recorded charges for Chi Forest Sparkling Water.
- Identify the $17.89 product charge.
- Associate the $1.20 CRV with each purchase.
- Avoid creating a separate duplicate issue for CRV.
- Present $19.09 as a conditional potential extra charge if only one pack was purchased.
- Allow user confirmation.
- Avoid interpreting unrelated FSA summary lines as purchases.

The model must not assert that the customer was definitely overcharged.

## 17.2 Quality Evaluation

Measure:

**Detection Recall**

How often does the app identify known accidental duplicate charges?

**False Positive Rate**

How often does the app flag unrelated or correctly charged transactions?

**Amount Accuracy**

When a potential overcharge is identified, is the estimated amount calculated correctly?

**Interpretation Quality**

Can users recognize the product from its explanation?

**Analysis Completion Rate**

How often does the app produce a usable result?

**Latency**

How long does it take to analyze a receipt?

### Testing Requirement

Known errors should become reproducible regression tests.

Avoid repeatedly changing the AI prompt without recording whether the changes improve or worsen existing test cases.

## 17.3 Release Preparation

- Final app icon.
- App Store screenshots.
- App description.
- Privacy Policy.
- Support page.
- Appropriate permission descriptions.
- Error handling.
- Backend monitoring.
- TestFlight testing.
- App Store review.

### Acceptance Criteria

V0 is ready to release when:

- The entire scan workflow works reliably.
- The app can distinguish potential duplicates from confirmed errors.
- Known receipt examples are handled correctly.
- No significant arithmetic or double-counting bugs remain.
- The UI is polished.
- Privacy disclosures are accurate.
- The app does not require login.
- The backend has reasonable abuse protection.
- TestFlight testing is successful.

---

# 18. Phase 4 — Monetization

**Status: Future / Not Part of V0**

## Objective

Explore sustainable monetization without compromising the simplicity of the app.

### Experiments

Evaluate:

- Limited free scans.
- Rewarded ads for extra scans.
- Consumable scan-credit purchases.
- A combination of free usage and paid credits.

### Success Criteria

A monetization approach should:

- Cover the marginal cost of additional scanning.
- Avoid excessive friction.
- Preserve the minimal UI.
- Require little ongoing maintenance.
- Comply with Apple and advertising platform policies.

### Important

Do not introduce subscriptions or unlimited lifetime scanning by default.

Make the final decision using actual usage frequency, API costs, retention, and willingness-to-pay data.

---

# 19. Phase 5 — FSA Receipt Analysis

**Status: Future / Not Part of V0**

## Objective

Help users understand which portions of a receipt may be eligible for Flexible Spending Account reimbursement.

This is a distinct user need identified during product exploration.

### Features

**Explicit FSA Amount Extraction**

If the receipt provides an FSA total, display it clearly.

Example:

```text
FSA Merchandise: $24.98
FSA Tax:          $1.00
FSA Total:       $25.98
```

**Potentially Eligible Products**

When the receipt does not explicitly identify FSA amounts, the app may identify items that could qualify.

Examples include certain eligible over-the-counter medications and health products.

### Critical Rules

- Explicit retailer-reported FSA amounts must be distinguished from AI estimates.
- Eligibility depends on applicable rules and the user's particular plan.
- The app must not guarantee reimbursement.
- FSA summary lines must not be counted again as purchased products.

### UI

Add a compact **FSA Summary** section to the Results screen.

No separate FSA management system is required.

---

# 20. Phase 6 — Spending Categorization

**Status: Future / Not Part of V0**

## Objective

Provide a simple breakdown of spending on one receipt.

The feature should answer:

**Where did my money go during this shopping trip?**

### Categories

- Groceries & Food.
- Household.
- Clothing.
- Health & Personal Care.
- Other.

### UI

Display:

- Category totals.
- Percentage breakdown.
- Simple visual chart.
- Expandable products by category.

### Requirements

- Categorize actual purchased products.
- Account for discounts.
- Avoid double counting taxes, payment lines, FSA summaries, and other informational entries.
- Show unclassified charges when necessary.
- Reconcile totals where possible.

### Out of Scope

- Monthly budgeting.
- Bank account connections.
- Long-term financial analytics.
- Detailed expense management.

This feature should remain a **single-receipt explanation**, not evolve into a full personal finance app.

---

# 21. Phase 7 — Advanced Receipt Intelligence

**Status: Exploratory**

Potential future improvements include:

### Product Identification

Use merchant names, product descriptions, and item codes to identify the products shown on receipts.

Possible enhancements:

- More readable product names.
- Product images.
- Product descriptions.
- Retailer product links.

Any external product lookup must be verified and should not invent matching products.

### Additional Charge Detection

Potentially identify:

- Unusual quantities.
- Missing expected discounts.
- Incorrect promotional pricing.
- Repeated fees.
- Suspicious receipt calculations.

### Receipt Explanation

Explain unfamiliar receipt terminology:

- CRV.
- Discounts.
- Tax categories.
- Store credits.
- Refunds.
- Informational summaries.

### Refund Assistance

Possible future feature:

Help users prepare a clear explanation of a suspected duplicate charge to show customer service.

Do not automate refunds without explicit user authorization.

These capabilities are ideas for future validation, not commitments.

---

# 22. Success Metrics

## 22.1 V0 Product Success

V0 should be evaluated based on whether it solves the core user problem.

### Primary Metric

**Confirmed duplicate-charge discovery rate**

The percentage of analyzed receipts for which users identify a genuine accidental duplicate charge.

This metric requires user confirmation and may initially be measured through voluntary testing feedback.

### Supporting Metrics

| Metric | Purpose |
|---|---|
| Scan completion rate | Measures whether the workflow is usable |
| Analysis success rate | Measures technical reliability |
| Duplicate detection recall | Measures whether real duplicate charges are found |
| False positive rate | Measures how often legitimate charges are flagged |
| Estimated amount accuracy | Measures financial calculation correctness |
| Average analysis latency | Measures responsiveness |
| Repeat usage | Indicates whether users return after shopping |
| Cost per scan | Helps evaluate monetization feasibility |

### Important Product Distinction

The app should distinguish:

**Potential Overcharge**

AI identifies a suspicious charge.

**User-Confirmed Billing Error**

The user verifies that the actual purchased quantity differs from the receipt.

**Recovered Money**

The user confirms that a refund or correction was actually received.

V0 only needs the first two concepts.

Do not display cumulative money saved unless the app can meaningfully distinguish recovered money from unverified estimates.

---

# 23. Product Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AI incorrectly flags legitimate duplicates | Require user confirmation |
| AI misses actual errors | Test against known duplicate receipts |
| AI misreads small receipt text | Preserve image quality and show uncertainty |
| AI invents product names | Preserve original descriptions and use fallbacks |
| Monetary calculations are incorrect | Validate and calculate totals deterministically |
| Different retailer formats produce inconsistent results | Build a multi-retailer regression dataset |
| API costs grow unexpectedly | Rate limits, monitoring, model optimization |
| Anonymous endpoint is abused | Request limits and server-side protections |
| Users do not scan frequently | Validate repeat usage before monetization |
| Existing apps offer similar features | Differentiate through clarity, interpretation, and UX |
| Ads degrade usability | Delay advertising until product value is established |

---

# 24. Development Principles for Codex

These principles apply throughout implementation.

## 24.1 Keep It Small

Prioritize the smallest implementation that satisfies each phase.

Avoid speculative infrastructure.

## 24.2 Follow Little Moments Conventions

Use the existing repository as a reference for:

- Project organization.
- Coding patterns.
- Backend structure.
- Expo configuration.
- Environment handling.
- EAS workflows.

Do not modify Little Moments.

## 24.3 Separate UI from AI Logic

React Native components should receive typed analysis results.

They should not implement receipt parsing or model-specific logic.

## 24.4 Prefer Deterministic Calculations

Use AI for interpretation and candidate identification.

Use code for money calculations and validation.

## 24.5 Do Not Overbuild

Do not introduce:

- Authentication.
- Cloud databases.
- Complex state management libraries.
- Payment infrastructure.
- Background processing.
- Unnecessary analytics.
- Multiple backend services.

Unless an approved phase explicitly requires them.

## 24.6 Finish One Phase Before Starting Another

Codex should not automatically implement future phases.

At the end of each phase:

1. Run relevant verification commands.
2. Summarize changes.
3. Report known issues.
4. List any required configuration.
5. Identify the next recommended task.
6. Wait for approval before expanding scope.

---

# 25. Definition of Done — V0

V0 is complete when a user can:

**1. Open Receipt Decoded**

See a clean, minimal Home screen.

**2. Scan a Receipt**

Take or select a receipt photo.

**3. Analyze It**

Send the image securely to the backend for AI processing.

**4. Understand the Results**

See any suspicious duplicated products, readable descriptions, related charges, and potential extra amounts.

**5. Verify the Charges**

Confirm how many products were actually purchased.

**6. Review the Original Receipt**

Compare the interpretation with the source image.

**7. Scan Again**

Start another receipt analysis without creating an account.

### Technical Completion Criteria

- Expo iOS application builds successfully.
- TypeScript checks pass.
- Backend endpoints work.
- OpenAI analysis returns validated structured data.
- API keys are not exposed.
- No unnecessary receipt data is retained.
- Errors are handled gracefully.
- Known test cases pass.
- TestFlight build works.
- Privacy and support information is available.

---

# 26. Immediate Next Steps

The implementation should proceed in this order:

| Task | Description | Expected Output |
|---|---|---|
| **Task 1** | Initialize repository and infrastructure | Running Expo app and backend |
| **Task 2** | Design and implement UI | Complete mock-data experience |
| **Task 3** | Integrate OpenAI Vision | Functional receipt analysis |
| **Task 4** | Validate with real receipts | Reliable duplicate detection |
| **Task 5** | Prepare App Store release | Published V0 |

### First Codex Task

**Initialize the Receipt Decoded repository according to Phase 0 of this PRD.**

Use Little Moments as the technical reference.

Do not implement receipt analysis or advanced product functionality yet.

---

# 27. Final Product Summary

### Receipt Decoded

**Every charge, explained.**

Receipt Decoded is a minimalist AI-powered iOS app that helps shoppers quickly identify potentially duplicated charges on shopping receipts.

Users simply take a photo of their receipt.

AI reads the receipt, interprets abbreviated product descriptions, identifies suspicious repeated charges, groups relevant fees, and estimates potential overcharges.

The results are presented in a clean, intuitive interface that allows users to verify whether the charges are legitimate.

### Initial Product

**V0: Duplicate Charge Detection**

One receipt.

One scan.

One clear answer.

### Long-Term Direction

**AI Receipt Explainer**

Potential future capabilities:

- Duplicate charge detection.
- FSA amount extraction.
- Spending categorization.
- Product identification.
- Receipt charge explanations.
- Refund assistance.

### Product North Star

**Help people understand what they paid for, identify possible mistakes, and avoid unnecessary spending—with as little effort as possible.**

---

**End of PRD — Version 1.0**
