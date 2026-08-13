# StockFlow — AI Tool Usage Log

---

## 1. Overview
This log documents all AI tools and agent workflows utilized during the software engineering lifecycle of **StockFlow** for the **Tactive AI-Powered QA Automation, Documentation & Software Engineering Assessment**.

---

## 2. Tool Profile: Google Antigravity Agentic AI Assistant

- **Tool Name**: Google Antigravity Agentic AI Assistant
- **Developer**: Google DeepMind Team
- **Capabilities Used**: Codebase research, file viewing/editing (`replace_file_content`, `write_to_file`), terminal execution (`run_command`), background task monitoring (`manage_task`), and interactive planning.

---

## 3. Workflow Breakdown by Assessment Stage

### Stage 1: Application Engineering & Security Hardening
- **Stage**: Stage 1 (Core Order-Fulfillment Application)
- **Purpose**: Build application, design system, Firestore database, and authentication.
- **Tasks & AI Inputs/Requests**:
  1. Scaffolded React 18 + Vite + TypeScript application architecture.
  2. Implemented custom CSS design token system (`src/index.css`) with responsive UI layouts.
  3. Integrated Firebase Authentication SDK and Firestore transaction service (`src/services/inventoryService.ts`).
  4. Added `data-testid` QA selectors across all forms, tables, and buttons.
  5. Implemented security hardening: Made Demo Mode explicit (`VITE_ENABLE_DEMO_MODE=true`), added unconfigured configuration error banner, and authored `firestore.rules`.
- **Primary AI Outputs**:
  - `src/services/inventoryService.ts`
  - `src/pages/CreateOrderPage.tsx`
  - `firestore.rules`
  - `.env.example`
- **Human Verification Performed**: Production Vite build verification (`npm run build`), Firebase configuration check, and manual browser UI testing.

---

### Stage 2A: AI-Generated Playwright Test Automation
- **Stage**: Stage 2 (Automated E2E Testing Baseline)
- **Purpose**: Generate Playwright test automation suite.
- **Tasks & AI Inputs/Requests**:
  1. Configured Playwright runner (`playwright.config.ts`) for single-worker sequential browser automation.
  2. Authored 18 modular Playwright test specs in `tests/e2e/` covering Auth, Order Flow, Edges, Validation, and Integrity.
  3. Implemented deterministic `beforeEach` catalog re-seeding hook.
- **Primary AI Outputs**:
  - `tests/e2e/auth.spec.ts` (AUTH-01..04)
  - `tests/e2e/order-success.spec.ts` (ORD-01..03)
  - `tests/e2e/edge-cases.spec.ts` (EDGE-01..05)
  - `tests/e2e/order-validation.spec.ts` (INVALID-01..05)
  - `tests/e2e/inventory-integrity.spec.ts` (ATOMIC-01)
- **Human Verification Performed**: Ran `npx playwright test` twice to verify 100% GREEN baseline repeatability ($18/18$ passed).

---

### Stage 2B: Deliberate Failure Diagnosis & Application Fix Loop
- **Stage**: Stage 2 (Regression Detection & Change Loop)
- **Purpose**: Demonstrate regression detection & AI self-correction loop.
- **Tasks & AI Inputs/Requests**:
  1. Introduced a controlled off-by-one stock calculation defect into `inventoryService.ts`.
  2. Ran Playwright test suite to confirm RED run ($14$ passed / $4$ failed).
  3. Analyzed test failure logs to diagnose the arithmetic root cause (`+1` off-by-one).
  4. Restored the exact application stock deduction logic without modifying any Playwright test files.
  5. Re-ran `npx playwright test` to verify complete return to GREEN ($18/18$ passed).
- **Primary AI Outputs**:
  - Failure diagnosis report.
  - Corrected `src/services/inventoryService.ts`.
  - Final GREEN verification report.
- **Human Verification Performed**: Terminal log inspection and HTML report verification (`playwright-report/index.html`).

---

### Stage 3: Order Cancellation & Cancellation Test Suite Generation
- **Stage**: Stage 3 (New Feature & Test Expansion)
- **Purpose**: Implement Order Cancellation feature and expand Playwright test coverage to 26 tests.
- **Tasks & AI Inputs/Requests**:
  1. Implemented `cancelOrderAtomic` in `inventoryService.ts` to restore stock and set status to `CANCELLED` atomically.
  2. Added UI cancellation controls, red status badges, and feedback alert banners to `OrderDetailsPage.tsx`.
  3. Ran existing 18 regression tests without modification (`18/18` passed on attempt 1, confirming zero regressions).
  4. Authored `tests/e2e/order-cancellation.spec.ts` containing 8 new E2E tests (`CANCEL-01..08`).
  5. Ran complete combined suite (`26/26` passed).
- **Primary AI Outputs**:
  - `src/services/inventoryService.ts` (`cancelOrderAtomic`)
  - `src/pages/OrderDetailsPage.tsx`
  - `tests/e2e/order-cancellation.spec.ts` (CANCEL-01..08)
  - `docs/evidence/stage-3-final.md`
- **Human Verification Performed**: Executed `npx playwright test` for regression verification and complete 26-test suite run.
