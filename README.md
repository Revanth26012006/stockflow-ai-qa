# StockFlow 📦 — Inventory Order Fulfillment System

StockFlow is a streamlined, atomic inventory order fulfillment web application built for the **Tactive AI-Powered QA Automation, Documentation & Software Engineering Assessment**.

---

## 🎯 Project Purpose

StockFlow provides a reliable inventory reservation workflow for customer orders. When a customer order is placed, the application verifies product existence, quantity validity, and real-time stock availability, reserving inventory **atomically**. 

If any line item cannot be fulfilled due to insufficient stock or invalid quantity, the **entire transaction aborts**, preserving 100% data consistency without partial updates.

---

## 🏗️ Architecture & Data Model

### Tech Stack
- **Frontend**: React 18 + Vite (TypeScript)
- **Styling**: Vanilla CSS custom design system (Dark slate glassmorphism, responsive grid, micro-animations)
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **E2E Testing**: Playwright (`@playwright/test`)

### Data Model Architecture
- `products`:
  - `id`: Unique product ID
  - `name`: Product display name
  - `sku`: Stock Keeping Unit string (e.g. `LOGI-MX3S-BLK`)
  - `price`: Unit price in USD
  - `availableStock`: Integer available stock units
  - `category`: Category string
- `orders`:
  - `id`: Unique order ID
  - `orderNumber`: Human readable order code (e.g. `ORD-2026-8419`)
  - `customerName`: Mandatory customer entity name
  - `status`: Order status (`Fulfilled`, `CANCELLED`)
  - `totalAmount`: Sum total of all line items
  - `totalItems`: Total units reserved
  - `createdAt`: ISO Timestamp / Firestore `serverTimestamp()`
  - `createdBy`: User identifier
- `orderItems`:
  - `id`: Item record ID (`{orderId}_item_{index}`)
  - `orderId`: Foreign key to `orders` collection
  - `productId`: Foreign key to `products` collection
  - `productName`, `sku`, `price`: Item snapshot attributes
  - `quantity`: Ordered positive integer quantity
  - `lineTotal`: Calculated item price × quantity

---

## 🔒 Business Rules & Atomic Transaction Logic

1. **Every ordered product must exist** in the catalog.
2. **Quantity must be a positive integer** ($> 0$).
3. **Requested quantity cannot exceed available stock**.
4. **Successful order decreases stock** by ordered quantity.
5. **Failed order does not modify stock** (Atomic transaction rollback).
6. **Order must contain at least 1 item**.
7. **Customer name is required**.
8. **Orders support multiple distinct products**.
9. **Atomic reservation transaction**: Executed via Firestore `runTransaction` (with offline fallback transaction guard).
10. **Order Cancellation & Stock Restoration (Stage 3)**: Confirmed orders can be cancelled. Cancelling an order restores all reserved line item quantities atomically ($stock = currentStock + orderedQty$) and updates status to `CANCELLED`.
11. **Double Cancellation Protection**: A cancelled order cannot be cancelled again. Re-cancellation attempts are rejected before any stock changes occur.

---

## ⚙️ Prerequisites

- **Node.js**: v18.x or higher (v22.x recommended)
- **npm**: v9.x or higher

---

## 🔑 Firebase Setup & Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Add your Firebase credentials to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyCZ2UO25f...
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=1:100000000000:web:...
   VITE_FIREBASE_MEASUREMENT_ID=G-...
   ```

3. Deploy Firestore Security Rules to your Firebase project:
   ```bash
   firebase deploy --only firestore:rules
   ```
   *(Note: The repository includes [`firestore.rules`](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/firestore.rules) enforcing authentication and schema constraints).*

4. **Explicit Offline Demo Mode (Disabled by Default)**:
   Demo Mode is **disabled by default** to prevent production deployments with missing credentials from silently writing to `localStorage`.
   To explicitly enable offline evaluation mode without Firebase, set in `.env`:
   ```env
   VITE_ENABLE_DEMO_MODE=true
   ```
   If Firebase credentials are missing and `VITE_ENABLE_DEMO_MODE` is `false` (default), the application displays a clear configuration error on screen rather than silently falling back.

---

## 🚀 How to Run the Application & Seed Data

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Seed Initial Database**:
   - **CLI Method**: Run `node scripts/seedFirestore.js` to seed sample products and orders into Firestore.
   - **UI Method**: Click **"Seed Products"** on the Dashboard or Products page in the web app.

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Authentication**:
   - Log in using your Firebase user credentials, or click **"Quick Demo Login"** on the login page for immediate evaluation access.

---

## 🧪 Running Automated E2E Tests (Stage 2)

StockFlow includes a full Playwright automated test suite in `tests/e2e/`.

1. **Run All Playwright Tests**:
   ```bash
   npx playwright test
   ```

2. **View HTML Test Report**:
   ```bash
   npx playwright show-report
   ```

3. **Execution Modes**:
   - **Normal Firebase Mode**: `VITE_ENABLE_DEMO_MODE=false` (Runs against live Firebase project `tactive-30014`).
   - **Explicit Demo Mode**: `VITE_ENABLE_DEMO_MODE=true` (Runs against isolated deterministic local state for rapid E2E execution).

---

## 📚 Project Documentation & Reports

Detailed technical documentation and assessment deliverables are available in `docs/`:
- [Baseline Manifest](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/baseline-manifest.md)
- [Stage 1 Report](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/stage-1-report.md)
- [Stage 2 Test Automation](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/stage-2-test-automation.md)
- [Architecture Specification](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/architecture.md)
- [Technical Design Document](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/design.md)
- [User Operating Manual](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/user-guide.md)
- [AI Tool Usage Log](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/ai-tool-usage.md)
- [Evidence Index](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/evidence-index.md)
- [Submission Deliverables Checklist](file:///C:/Users/revan/.gemini/antigravity/scratch/stockflow/docs/submission-checklist.md)


