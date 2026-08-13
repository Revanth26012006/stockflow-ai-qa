# Stage 2 Evidence — Deliberate RED Run Log

**Document Title**: Stage 2 Evidence — Deliberate RED Run Log  
**Experiment Date**: 2026-08-12  
**Purpose**: Demonstrate that the Playwright test suite detects genuine application regressions.  

---

## 1. Defect Specification

- **Target File**: `src/services/inventoryService.ts`
- **Location**: Line 192 (Demo Mode loop) and Line 251 (Firestore transaction).
- **Defect Category**: Arithmetic off-by-one calculation error in stock reservation.
- **Original Implementation**:
  ```typescript
  prod.availableStock -= item.quantity;
  newStock: currentStock - itemInput.quantity
  ```
- **Deliberately Broken Implementation**:
  ```typescript
  prod.availableStock = prod.availableStock - item.quantity + 1;
  newStock: currentStock - itemInput.quantity + 1
  ```
- **Intended Business Rule**: $\text{remainingStock} = \text{currentStock} - \text{orderedQuantity}$.

---

## 2. Test Execution & Failure Output

- **Execution Command**: `npx playwright test`
- **Test Summary**: `18 total / 14 passed / 4 failed / 0 skipped`

```text
  x   9 [chromium] › tests/e2e/edge-cases.spec.ts:88:3 › EDGE-05 — Verify inventory persistence after page reload (6.7s)
  x  11 [chromium] › tests/e2e/order-success.spec.ts:13:3 › ORD-01 — Single-product order (4.1s)
  x  12 [chromium] › tests/e2e/order-success.spec.ts:53:3 › ORD-02 — Multi-product order (1.8s)
  x  13 [chromium] › tests/e2e/order-success.spec.ts:94:3 › ORD-03 — Exact available stock (6.8s)

  4 failed
  14 passed (57.7s)
```

---

## 3. Detailed Failure Assertions

1. **`ORD-01 — Single-product order`**:
   - *Failure*: `expect(received).toBe(expected)`. Expected: `44`, Received: `45`.
   - *Analysis*: Ordered $1$ Mouse (initial stock $45$). Off-by-one logic computed $45 - 1 + 1 = 45$.

2. **`ORD-02 — Multi-product order`**:
   - *Failure*: `expect(received).toBe(expected)`. Expected: `43`, Received: `44`.
   - *Analysis*: Ordered $2$ Mice (initial stock $45$). Off-by-one logic computed $45 - 2 + 1 = 44$.

3. **`ORD-03 — Exact available stock`**:
   - *Failure*: `expect(locator).toBeVisible() failed` on `stock-badge-out`.
   - *Analysis*: Ordered all $12$ Monitors. Stock became $12 - 12 + 1 = 1$. Because stock remained at $1$, `stock-badge-out` was not rendered.

4. **`EDGE-05 — Verify inventory persistence after page reload`**:
   - *Failure*: `expect(received).toBe(expected)`. Expected: `40`, Received: `41`.
   - *Analysis*: Ordered $5$ Mice (initial stock $45$). Stock persisted as $45 - 5 + 1 = 41$ instead of $40$.

---

## 4. Evidence Artifacts
- **Log Output**: Recorded in task log `task-377.log`.
- **HTML Report**: Saved at `playwright-report/index.html`.
- **Screenshots**: Saved under `test-results/`.
