# StockFlow — Stage 2 AI-Generated Test Automation

---

## 1. Overview & Framework Selection
Playwright was selected as the E2E test automation framework for StockFlow due to its native TypeScript support, fast out-of-the-box browser automation, strict actionability checks, built-in assertion retries, and comprehensive HTML test reporting.

---

## 2. AI-Assisted Test Suite Generation
- **AI Agent Tool Used**: Google Antigravity Agentic AI Assistant.
- **Generation Prompt Directives**: Construct a complete, modular, independent Playwright E2E test suite targeting `data-testid` selectors across the 5 core test categories specified in Stage 2 without altering application logic or bypassing UI workflows.
- **AI Outputs Generated**:
  - `tests/e2e/auth.spec.ts`
  - `tests/e2e/order-success.spec.ts`
  - `tests/e2e/edge-cases.spec.ts`
  - `tests/e2e/order-validation.spec.ts`
  - `tests/e2e/inventory-integrity.spec.ts`
  - `playwright.config.ts`

---

## 3. Test Organization & Isolation Strategy
- **File Organization**: Tests are grouped by functional domain in `tests/e2e/`.
- **Worker Configuration**: `playwright.config.ts` enforces `workers: 1` and `fullyParallel: false` to ensure single-threaded sequential execution.
- **Catalog Isolation & Reseeding**: Every test spec uses a `beforeEach` hook that logs into the application and triggers catalog re-seeding via `page.getByTestId('seed-products-btn').click()`. This restores inventory stocks to exact baseline values ($45, 25, 12, 30, 18, 0$) prior to every single test case.

---

## 4. Test Environment Strategy: Demo Mode vs Real Firebase

| Dimension | Stage 1 Manual Verification | Stage 2 Automated Playwright Testing |
| :--- | :--- | :--- |
| **Backend Target** | Live Cloud Firebase/Firestore (`tactive-30014`) | Explicit Offline Demo Mode (`VITE_ENABLE_DEMO_MODE=true`) |
| **Data Storage** | Cloud Firestore documents | In-memory / `localStorage` state |
| **Execution Speed** | Network dependent ($\sim 1.5\text{s}$ per query) | Instant local execution ($\sim 50\text{ms}$ per query) |
| **Deterministic Data** | Manual document cleanup required | Automated seeding via `seed-products-btn` in `beforeEach` |
| **UI Workflow Used** | Full browser DOM interaction | Full browser DOM interaction |
| **Validation Rules** | Full two-phase transactional verification | Full two-phase transactional verification |

---

## 5. Complete 18-Test Specification Table

| Test ID | Spec File | Category | Verification Objective |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | `auth.spec.ts` | Authentication | Valid credentials sign in user and navigate to `/dashboard` displaying user email. |
| **AUTH-02** | `auth.spec.ts` | Authentication | Invalid credentials display high-visibility error alert banner and block sign-in. |
| **AUTH-03** | `auth.spec.ts` | Authentication | Authenticated user clicking sign-out button terminates session and returns to `/login`. |
| **AUTH-04** | `auth.spec.ts` | Authentication | Direct unauthenticated URL access to protected routes redirects immediately to `/login`. |
| **ORD-01** | `order-success.spec.ts` | Normal Order Flow | Single-product order creates order document, shows confirmation banner, and decrements stock by exact quantity. |
| **ORD-02** | `order-success.spec.ts` | Normal Order Flow | Multi-product order reserves line items and decrements stock for all products atomically. |
| **ORD-03** | `order-success.spec.ts` | Normal Order Flow | Ordering exact available stock ($N$ units) depletes stock to 0 and renders `stock-badge-out`. |
| **EDGE-01** | `edge-cases.spec.ts` | Edge Cases | Order creation with minimum valid quantity ($Q = 1$). |
| **EDGE-02** | `edge-cases.spec.ts` | Edge Cases | Order creation where item quantity exactly equals current available stock. |
| **EDGE-03** | `edge-cases.spec.ts` | Edge Cases | Order creation with multiple products having varying quantities ($2$ and $4$). |
| **EDGE-04** | `edge-cases.spec.ts` | Edge Cases | Order summary calculation matches exact line total sums ($2 \times \$99.99 + 1 \times \$119.50 = \$319.48$). |
| **EDGE-05** | `edge-cases.spec.ts` | Edge Cases | Decremented inventory stock values persist accurately across full browser `page.reload()`. |
| **INVALID-01** | `order-validation.spec.ts` | Invalid Input | Quantity $= 0$ renders warning alert, disables submit button, and leaves stock unchanged. |
| **INVALID-02** | `order-validation.spec.ts` | Invalid Input | Negative quantity renders warning alert and leaves stock unchanged. |
| **INVALID-03** | `order-validation.spec.ts` | Invalid Input | Quantity exceeding available stock renders overstock error banner, disables submit button, and leaves stock unchanged. |
| **INVALID-04** | `order-validation.spec.ts` | Invalid Input | Blank or whitespace customer name disables submit button and leaves stock unchanged. |
| **INVALID-05** | `order-validation.spec.ts` | Invalid Input | Attempting to submit order with zero items is prevented by empty placeholder and disabled submit button. |
| **ATOMIC-01** | `inventory-integrity.spec.ts` | Data Integrity | Multi-product order containing one valid item and one overstock item fails submission; stock for ALL items remains 100% unchanged. |
