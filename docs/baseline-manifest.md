# StockFlow — Pre-Stage-3 Frozen Baseline Manifest

**Document Title**: Pre-Stage-3 Frozen Baseline Manifest  
**Freeze Date/Time**: 2026-08-12T18:16:00+05:30  
**Baseline Label**: `PRE-STAGE-3 FROZEN BASELINE`  

---

## 1. Project Overview & State
StockFlow is a small, reliable inventory order-fulfillment web application created for the **Tactive AI-Powered QA Automation, Documentation & Software Engineering Assessment**.

This manifest freezes the codebase at the end of Stage 2. Stage 1 (core application) and Stage 2 (AI-generated Playwright test automation & failure change loop) are **100% COMPLETE and VERIFIED**.

---

## 2. Technology Stack
- **Core Framework**: React 18
- **Build Tool / Bundler**: Vite 5 (TypeScript)
- **Styling**: Vanilla CSS with modern custom design system tokens & CSS variables
- **Authentication**: Firebase Authentication v10 (`signInWithEmailAndPassword`, `signOut`, `onAuthStateChanged`)
- **Database**: Firebase Firestore v10 (`runTransaction`, `collection`, `doc`, `getDoc`, `getDocs`)
- **Testing Framework**: Playwright v1.42 (Chromium browser engine, TS runner)
- **Local Dev Server**: Vite Dev Server (`http://localhost:3000`)

---

## 3. Major Application Components
- **`src/context/AuthContext.tsx`**: Manages authentication session state and credentials validation.
- **`src/services/firebase.ts`**: Firebase app initialization, Firestore reference, and `IS_DEMO_MODE` flag export.
- **`src/services/inventoryService.ts`**: Implements core inventory catalog reads, order history reads, and two-phase atomic order fulfillment with stock deduction.
- **`src/pages/LoginPage.tsx`**: Login page with explicit Demo Mode toggle banner and configuration error banner.
- **`src/pages/DashboardPage.tsx`**: Metrics dashboard displaying total stock, active items, low stock warnings, and fast action links.
- **`src/pages/ProductsPage.tsx`**: Product inventory catalog table with stock status badges (`In Stock`, `Low Stock`, `Out of Stock`).
- **`src/pages/CreateOrderPage.tsx`**: Form for composing multi-product customer orders with instant quantity & stock limit validation.
- **`src/pages/OrderDetailsPage.tsx`**: View reserved order manifest items, customer name, total price, and fulfillment timestamp.

---

## 4. Environment & Configuration
- **Firebase Mode**: Uses real Firebase credentials (`tactive-30014`) when `VITE_ENABLE_DEMO_MODE=false`.
- **Explicit Demo Mode**: Activated ONLY when `VITE_ENABLE_DEMO_MODE=true` is present in `.env`. Missing Firebase keys without explicit Demo Mode displays an error banner on screen.
- **Firestore Collections**:
  - `products`: Product ID, name, SKU, price, availableStock, category.
  - `orders`: Order ID, orderNumber, customerName, totalAmount, totalItems, status, createdAt.
  - `orderItems`: Line items linked by `orderId`.

---

## 5. Security Rules (`firestore.rules`)
Enforces document schema validity, user authentication, required fields, positive price/stock values, and strict stock decrement constraints (`request.resource.data.availableStock <= resource.data.availableStock`).

---

## 6. Business Rules Checklist
- **BR-01**: Product existence validation.
- **BR-02**: Positive integer quantity validation ($Q \ge 1$).
- **BR-03**: Available stock limit enforcement.
- **BR-04**: Inventory deduction ($remaining = current - Q$).
- **BR-05**: Failed order rollback (atomic transactional guarantee).
- **BR-06**: Non-empty order manifest requirement.
- **BR-07**: Customer name requirement.
- **BR-08**: Multi-product line item support in single order.
- **BR-09**: All-or-nothing atomic execution via Firestore transactions / local transactions.

---

## 7. Current Playwright Test Status
- **Total Test Count**: `18`
- **Passed**: `18`
- **Failed**: `0`
- **Skipped**: `0`
- **Status**: **100% GREEN Baseline**
- **Test Categories**: Auth (4), Order Success (3), Edge Cases (5), Invalid Input (5), Data Integrity (1).

---

## 8. Stage Status
- **Stage 1**: **COMPLETE & VERIFIED**
- **Stage 2**: **COMPLETE & VERIFIED**
- **Stage 3**: **NOT STARTED**
