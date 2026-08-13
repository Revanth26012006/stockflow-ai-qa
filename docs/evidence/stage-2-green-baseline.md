# Stage 2 Baseline Evidence — Green Run Log

**Document Title**: Stage 2 Baseline Evidence — Green Run Log  
**Verification Date**: 2026-08-12  
**Baseline Status**: **100% GREEN**  

---

## 1. Test Execution Metadata
- **Execution Command**: `npx playwright test`
- **Test Framework**: Playwright v1.42.1 (Chromium Engine)
- **Node.js Version**: v22.14.0
- **Development Server**: Vite v5.4.14 (`http://localhost:3000`)
- **Environment Configuration**: `VITE_ENABLE_DEMO_MODE=true` (Explicit Offline Demo Mode in `.env`)
- **Reporter**: List & HTML (`playwright-report/index.html`)

---

## 2. Baseline Test Results Summary

```text
Running 18 tests using 1 worker

  ok  1 [chromium] › tests/e2e/auth.spec.ts:12:3 › AUTH-01 — Valid user can log in (2.2s)
  ok  2 [chromium] › tests/e2e/auth.spec.ts:24:3 › AUTH-02 — Invalid credentials are rejected (1.0s)
  ok  3 [chromium] › tests/e2e/auth.spec.ts:34:3 › AUTH-03 — Authenticated user can sign out (1.1s)
  ok  4 [chromium] › tests/e2e/auth.spec.ts:47:3 › AUTH-04 — Unauthenticated user cannot access protected pages (1.3s)
  ok  5 [chromium] › tests/e2e/edge-cases.spec.ts:13:3 › EDGE-01 — Quantity = 1 (3.5s)
  ok  6 [chromium] › tests/e2e/edge-cases.spec.ts:27:3 › EDGE-02 — Quantity exactly equals available stock (1.9s)
  ok  7 [chromium] › tests/e2e/edge-cases.spec.ts:44:3 › EDGE-03 — Multiple products with different quantities (1.8s)
  ok  8 [chromium] › tests/e2e/edge-cases.spec.ts:66:3 › EDGE-04 — Verify order summary totals calculation (1.9s)
  ok  9 [chromium] › tests/e2e/edge-cases.spec.ts:88:3 › EDGE-05 — Verify inventory persistence after page reload (2.1s)
  ok 10 [chromium] › tests/e2e/inventory-integrity.spec.ts:13:3 › ATOMIC-01 — No partial inventory update on multi-product order failure (1.7s)
  ok 11 [chromium] › tests/e2e/order-success.spec.ts:13:3 › ORD-01 — Single-product order (1.4s)
  ok 12 [chromium] › tests/e2e/order-success.spec.ts:53:3 › ORD-02 — Multi-product order (1.7s)
  ok 13 [chromium] › tests/e2e/order-success.spec.ts:94:3 › ORD-03 — Exact available stock (1.8s)
  ok 14 [chromium] › tests/e2e/order-validation.spec.ts:13:3 › INVALID-01 — Quantity = 0 is rejected (2.1s)
  ok 15 [chromium] › tests/e2e/order-validation.spec.ts:35:3 › INVALID-02 — Negative quantity is rejected (1.9s)
  ok 16 [chromium] › tests/e2e/order-validation.spec.ts:53:3 › INVALID-03 — Quantity greater than available stock is rejected (2.0s)
  ok 17 [chromium] › tests/e2e/order-validation.spec.ts:76:3 › INVALID-04 — Missing customer name is rejected (2.6s)
  ok 18 [chromium] › tests/e2e/order-validation.spec.ts:98:3 › INVALID-05 — Empty order submission is prevented (1.5s)

  18 passed (37.3s)
```

---

## 3. Repeatability Verification

To guarantee test suite determinism and confirm zero state contamination, the complete test suite was executed twice consecutively:

- **Consecutive Run 1**: `18 passed (37.3s)` — Code: `0`
- **Consecutive Run 2**: `18 passed (39.1s)` — Code: `0`

### Aggregate Result Table
| Total Tests | Passed | Failed | Skipped | Repeatable | Status |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **18** | **18** | **0** | **0** | **YES (2/2)** | **GREEN** |
