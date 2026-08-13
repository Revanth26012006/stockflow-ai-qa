# Stage 2 Evidence — AI Failure Diagnosis & Fix Loop

**Document Title**: Stage 2 Evidence — AI Failure Diagnosis & Fix Loop  
**Execution Date**: 2026-08-12  

---

## 1. Change Loop Flow Diagram

```mermaid
graph TD
    A[1. GREEN Baseline (18/18 Passed)] --> B[2. Deliberate Defect Introduced (+1 Off-by-One)]
    B --> C[3. Playwright Suite Execution]
    C --> D[4. RED Run Result (14 Passed / 4 Failed)]
    D --> E[5. AI Agent Receives Error Logs]
    E --> F[6. AI Root Cause Analysis]
    F --> G[7. AI Restores Correct Application Code]
    G --> H[8. Existing Playwright Suite Execution]
    H --> I[9. Final GREEN Result (18/18 Passed)]
```

---

## 2. AI Input & Failure Log Context
- **AI Tool Used**: Google Antigravity AI Assistant.
- **Input Received**: User prompt supplying Playwright RED run output (4 failing tests: `ORD-01`, `ORD-02`, `ORD-03`, `EDGE-05`).

---

## 3. AI Diagnosis & Root Cause Identification
- **Diagnosis**: All 4 test failures stem from a single arithmetic error in `createOrderAtomic` in `src/services/inventoryService.ts` where remaining stock was being calculated as `availableStock - item.quantity + 1`.
- **Root Cause**: The $+1$ term retained 1 extra unit of stock following every order fulfillment, causing stock assertion discrepancies ($45$ vs $44$, $44$ vs $43$, $41$ vs $40$) and preventing stock depletion to $0$.

---

## 4. Application Correction Applied

### Target File: `src/services/inventoryService.ts`

```diff
  // Phase 2: Commit stock deductions and save order
  for (const item of input.items) {
    const prod = prodMap.get(item.productId)!;
-   prod.availableStock = prod.availableStock - item.quantity + 1;
+   prod.availableStock -= item.quantity;
  }
```

- **Playwright Test Files Modified**: **NONE** (0 test files modified).
- **Test Expectations Changed**: **NONE** (0 assertions altered).

---

## 5. Verification & Final Result

- **Execution Command**: `npx playwright test`
- **Result Output**:
  ```text
  Running 18 tests using 1 worker

    ok  1 [chromium] › tests/e2e/auth.spec.ts:12:3 › AUTH-01 — Valid user can log in (4.2s)
    ...
    ok 18 [chromium] › tests/e2e/order-validation.spec.ts:98:3 › INVALID-05 — Empty order submission is prevented (1.2s)

    18 passed (35.4s)
  ```
- **Final Metrics**: `18 total / 18 passed / 0 failed / 0 skipped`
