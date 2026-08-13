# StockFlow — Master Evidence & Artifact Index

---

## 1. Stage 1 Artifacts & Verification Evidence

| Evidence Item | Description / Status | Repository Location / Path |
| :--- | :--- | :--- |
| **Vite Production Build Output** | Verified Vite bundle output (`dist/index.html`, `dist/assets/`). | `dist/` |
| **Firebase Configuration** | Real Firebase project keys & auth domain configured. | [`src/services/firebase.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/src/services/firebase.ts) |
| **Authentication Flow** | Session context & credential error handlers. | [`src/context/AuthContext.tsx`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/src/context/AuthContext.tsx) |
| **Firestore Connectivity** | Firestore initialization & document CRUD handlers. | [`src/services/inventoryService.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/src/services/inventoryService.ts) |
| **Atomic Rollback Guarantee** | Two-phase `runTransaction` stock deduction logic. | [`src/services/inventoryService.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/src/services/inventoryService.ts) |
| **Firestore Security Rules** | Rules file enforcing auth & stock reduction limits. | [`firestore.rules`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/firestore.rules) |
| **Database Seeding Script** | Node CLI database seeder script. | [`scripts/seedFirestore.js`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/scripts/seedFirestore.js) |
| **Stage 1 Verification Report** | Stage 1 requirements & defect resolution document. | [`docs/stage-1-report.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/stage-1-report.md) |

---

## 2. Stage 2 Test Automation & Failure Change-Loop Artifacts

| Evidence Item | Description / Status | Repository Location / Path |
| :--- | :--- | :--- |
| **Playwright Configuration** | Single-worker sequential runner configuration. | [`playwright.config.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/playwright.config.ts) |
| **Auth Test Spec** | Playwright auth tests (AUTH-01 to AUTH-04). | [`tests/e2e/auth.spec.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/tests/e2e/auth.spec.ts) |
| **Order Flow Test Spec** | Playwright normal order flow tests (ORD-01 to ORD-03). | [`tests/e2e/order-success.spec.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/tests/e2e/order-success.spec.ts) |
| **Edge Cases Test Spec** | Playwright edge case tests (EDGE-01 to EDGE-05). | [`tests/e2e/edge-cases.spec.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/tests/e2e/edge-cases.spec.ts) |
| **Order Validation Spec** | Playwright invalid input tests (INVALID-01 to INVALID-05). | [`tests/e2e/order-validation.spec.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/tests/e2e/order-validation.spec.ts) |
| **Data Integrity Spec** | Playwright atomic rollback test (ATOMIC-01). | [`tests/e2e/inventory-integrity.spec.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/tests/e2e/inventory-integrity.spec.ts) |
| **Stage 2 GREEN Baseline Log** | Documentation of initial 18/18 GREEN run. | [`docs/evidence/stage-2-green-baseline.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/evidence/stage-2-green-baseline.md) |
| **Deliberate RED Run Log** | Documentation of 14/18 RED run with off-by-one bug. | [`docs/evidence/stage-2-deliberate-red-run.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/evidence/stage-2-deliberate-red-run.md) |
| **AI Fix Loop Documentation** | Documentation of AI diagnosis and application fix loop. | [`docs/evidence/stage-2-ai-fix-loop.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/evidence/stage-2-ai-fix-loop.md) |

---

## 3. Stage 3 Order Cancellation & Final Suite Artifacts

| Evidence Item | Description / Status | Repository Location / Path |
| :--- | :--- | :--- |
| **Cancellation Test Spec** | Playwright cancellation tests (CANCEL-01 to CANCEL-08). | [`tests/e2e/order-cancellation.spec.ts`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/tests/e2e/order-cancellation.spec.ts) |
| **Stage 3 Change-Loop Log** | Change-loop documentation for Order Cancellation. | [`docs/evidence/stage-3-ai-change-loop.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/evidence/stage-3-ai-change-loop.md) |
| **Stage 3 Final Evidence Report** | Summary of 26/26 passed tests & cancellation feature. | [`docs/evidence/stage-3-final.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/evidence/stage-3-final.md) |
| **Final Test Inventory** | Table inventory of all 26 E2E test cases. | [`docs/final-test-inventory.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/final-test-inventory.md) |
| **Playwright HTML Report** | Standalone HTML test output report. | `playwright-report/index.html` |
| **Failure Screenshots & Contexts** | Captured PNG screenshots & Markdown context logs. | `test-results/` |

---

## 4. Documentation & Submission Deliverable Tracking

| Deliverable Item | Status | Location / Path |
| :--- | :--- | :--- |
| **Architecture Specification** | **COMPLETE** | [`docs/architecture.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/architecture.md) |
| **Technical Design Document** | **COMPLETE** | [`docs/design.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/design.md) |
| **User Operating Manual** | **COMPLETE** | [`docs/user-guide.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/user-guide.md) |
| **AI Tool Usage Log** | **COMPLETE** | [`docs/ai-tool-usage.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/ai-tool-usage.md) |
| **Final Baseline Manifest** | **COMPLETE** | [`docs/final-baseline-manifest.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/final-baseline-manifest.md) |
| **Project README** | **COMPLETE** | [`README.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/README.md) |
| **Submission Deliverables Checklist**| **COMPLETE** | [`docs/submission-checklist.md`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/submission-checklist.md) |
| **Presentation Slide Deck** | `MISSING — CAPTURE REQUIRED` | External deliverable for presentation |
| **5-Minute Video Recording** | `MISSING — CAPTURE REQUIRED` | External deliverable for video walkthrough |
