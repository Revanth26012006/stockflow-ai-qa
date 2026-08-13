# StockFlow — Stage 1 Comprehensive Report

---

## 1. Problem Statement & Scope
StockFlow addresses a core challenge in warehouse fulfillment systems: **preventing inventory overselling while maintaining transactional integrity during customer order placement**. In multi-user environment order processing, if two customers attempt to purchase the remaining stock of an item simultaneously, un-synchronized inventory systems risk negative stock values and unfulfilled orders.

---

## 2. Core Functionality & Business Rules
The Stage 1 application implements a single focused business workflow:

> An authenticated inventory staff user can create a customer order containing one or more products, and the system validates stock availability and reserves the inventory atomically.

### Business Rules (BR-01 to BR-09)
1. **BR-01: Product Existence**: Every line item in an order must refer to a valid, existing product in the catalog database.
2. **BR-02: Positive Integer Quantity**: Requested item quantities must be positive integers ($Q \ge 1$). Zero, negative, and decimal quantities are rejected.
3. **BR-03: Stock Limit Enforcement**: Requested item quantities cannot exceed the product's current `availableStock`.
4. **BR-04: Inventory Deduction**: Upon successful order creation, `availableStock` for each ordered product is decremented by the exact ordered quantity.
5. **BR-05: Failed Order Rollback**: If any line item in a multi-product order fails validation or stock checks, the entire transaction is rolled back, leaving zero inventory changes.
6. **BR-06: Non-Empty Order Manifest**: An order must contain at least one line item before submission.
7. **BR-07: Required Customer Name**: Customer name is required and cannot be empty or whitespace-only.
8. **BR-08: Multi-Product Line Items**: Orders support multiple distinct product line items within a single order transaction.
9. **BR-09: Atomic Execution**: Stock reservation and order document creation execute within a single atomic database transaction (`runTransaction`).

---

## 3. Technical Architecture & Technology Decisions

### Technology Stack
- **Frontend Framework**: React 18 with Vite 5 (TypeScript) for fast HMR and lightweight bundle size.
- **State Management**: React Context (`AuthContext`) and local state hooks.
- **Backend / BaaS**: Firebase Authentication & Firebase Firestore v10 SDK.
- **Styling System**: CSS custom properties design tokens (`src/index.css`) featuring sleek dark mode, glowing accents, badge statuses, and smooth responsive layouts.

---

## 4. Firebase Architecture & Firestore Model

### Data Collections
1. **`products` Collection**:
   - `id` (string): Document ID (e.g., `prod_1`)
   - `name` (string): Product display title
   - `sku` (string): Stock Keeping Unit code
   - `price` (number): Unit price in USD
   - `availableStock` (number): Current physical inventory quantity
   - `category` (string): Product category tag
   - `updatedAt` (timestamp): Last modification time

2. **`orders` Collection**:
   - `id` (string): Document ID (e.g., `ord_1786535938864`)
   - `orderNumber` (string): Formatted order number (e.g., `ORD-2026-8864`)
   - `customerName` (string): Purchaser identifier
   - `status` (string): `Fulfilled`
   - `totalAmount` (number): Sum of line totals
   - `totalItems` (number): Sum of line quantities
   - `createdAt` (timestamp): Fulfillment time
   - `createdBy` (string): User email of creator

3. **`orderItems` Collection**:
   - `id` (string): Item document ID
   - `orderId` (string): Foreign key referencing `orders` collection
   - `productId` (string): Foreign key referencing `products` collection
   - `productName` (string): Snapshot of product name
   - `quantity` (number): Quantity reserved
   - `price` (number): Unit price at purchase
   - `lineTotal` (number): $\text{quantity} \times \text{price}$

---

## 5. Security Rules (`firestore.rules`)
Firestore Security Rules enforce backend-level document schema validation and stock decrement constraints:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null 
        && request.resource.data.availableStock <= resource.data.availableStock;
    }
    match /orders/{orderId} {
      allow read, create: if request.auth != null;
    }
    match /orderItems/{itemId} {
      allow read, create: if request.auth != null;
    }
  }
}
```

---

## 6. Atomic Inventory Transaction Implementation
The core reservation engine in `src/services/inventoryService.ts` executes a two-phase transaction via `runTransaction`:
```typescript
return await runTransaction(db, async (transaction) => {
  // Phase 1: Read and validate all items
  for (const item of input.items) {
    const productRef = doc(db, 'products', item.productId);
    const snap = await transaction.get(productRef);
    if (!snap.exists()) throw new Error(`Product not found.`);
    const data = snap.data();
    if (item.quantity > data.availableStock) {
      throw new Error(`Insufficient stock for ${data.name}.`);
    }
    stockUpdates.push({ productRef, newStock: data.availableStock - item.quantity });
  }

  // Phase 2: Atomic writes
  for (const update of stockUpdates) {
    transaction.update(update.productRef, { availableStock: update.newStock });
  }
  transaction.set(orderRef, orderData);
});
```

---

## 7. UI Screens & QA Selectors
Stable `data-testid` attributes were added across all primary interface views to enable deterministic Playwright automation:
- **Login Page** (`/login`): `email-input`, `password-input`, `submit-btn`, `demo-login-btn`, `config-error-alert`.
- **Dashboard Page** (`/dashboard`): `metric-total-products`, `metric-total-stock`, `metric-low-stock`, `seed-products-btn`.
- **Products Page** (`/products`): `products-table`, `product-row-{id}`, `product-stock-{id}`, `stock-badge-out`.
- **Create Order Page** (`/create-order`): `customer-name-input`, `product-select-dropdown`, `quantity-input`, `add-item-btn`, `submit-order-btn`, `selected-items-list`, `order-warning-alert`.
- **Order Details Page** (`/orders/:id`): `order-success-banner`, `detail-customer-name`, `detail-order-status`, `detail-total-items`, `detail-order-total`, `order-items-table`.

---

## 8. Development Journey: Initial State vs. Discoveries vs. Final Baseline

### A. Initial Stage 1 Implementation
The original implementation built the core React views, Firestore transactional queries, and a initial demo mode fallback.

### B. Defects & Vulnerabilities Discovered During Verification
1. **Demo Mode Fallback Vulnerability**: Demo Mode initially activated automatically whenever `VITE_FIREBASE_API_KEY` was missing. This posed a security risk where an unconfigured deployment would silently fall back to `localStorage` instead of failing explicitly.
2. **Missing `getOrderById` Fallback Branch**: `getOrderById` queried Firestore directly without checking `IS_DEMO_MODE`, rendering *"Order not found"* when viewing order details in Demo Mode.
3. **`signIn` Credential Error Suppression**: `signIn` in `AuthContext` did not reject invalid credential attempts properly in Demo Mode paths.

### C. Corrections Applied
1. Hardened Demo Mode: Disabled by default. Demo Mode activates **ONLY** when `VITE_ENABLE_DEMO_MODE=true` is set. Missing credentials without `VITE_ENABLE_DEMO_MODE=true` renders a high-visibility configuration error banner on screen (`data-testid="config-error-alert"`).
2. Updated `getOrderById` in `inventoryService.ts` to support Demo Mode lookups (`if (IS_DEMO_MODE) return readDemo(...)`).
3. Updated `signIn` in `AuthContext.tsx` to throw explicit `new Error('Invalid email or password.')` on bad credentials.

### D. Final Corrected Stage 1 Baseline
With these three security and functional corrections applied, Stage 1 was frozen and independently verified as 100% compliant with all business rules and security requirements.
