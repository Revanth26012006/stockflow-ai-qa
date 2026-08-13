# StockFlow — Final Test Inventory Specification

---

## 1. Overview
This document contains the complete test inventory of all **26 automated Playwright end-to-end tests** implemented in the StockFlow project.

---

## 2. Complete 26-Test Inventory Table

| ID | Category | Test Name | Verification Objective & Purpose |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | Authentication | Valid user can log in | Verifies valid credentials log in user and navigate to `/dashboard` displaying email. |
| **AUTH-02** | Authentication | Invalid credentials are rejected | Verifies invalid email/password shows error alert banner and blocks sign-in. |
| **AUTH-03** | Authentication | Authenticated user can sign out | Verifies clicking sign-out button terminates session and returns to `/login`. |
| **AUTH-04** | Authentication | Unauthenticated user cannot access protected pages | Verifies direct navigation to `/dashboard`, `/products`, `/create-order`, `/orders` redirects to `/login`. |
| **ORD-01** | Normal Order Flow | Single-product order | Verifies single-item order creation, confirmation banner, and exact stock decrement ($45 \to 44$). |
| **ORD-02** | Normal Order Flow | Multi-product order | Verifies multi-item order creation and stock decrements across multiple products ($45 \to 43$, $25 \to 22$). |
| **ORD-03** | Normal Order Flow | Exact available stock | Verifies ordering exact available stock ($N$ units) sets stock to $0$ and renders `stock-badge-out`. |
| **EDGE-01** | Edge Cases | Quantity = 1 | Verifies minimum valid item quantity order placement ($Q = 1$). |
| **EDGE-02** | Edge Cases | Quantity exactly equals available stock | Verifies order placement where requested quantity matches current available stock exactly. |
| **EDGE-03** | Edge Cases | Multiple products with different quantities | Verifies order placement with varying item quantities ($2$ and $4$). |
| **EDGE-04** | Edge Cases | Verify order summary totals calculation | Verifies calculated order totals match line sums ($2 \times \$99.99 + 1 \times \$119.50 = \$319.48$). |
| **EDGE-05** | Edge Cases | Verify inventory persistence after page reload | Verifies decremented stock values ($45 \to 40$) persist accurately after browser `page.reload()`. |
| **INVALID-01** | Invalid Input | Quantity = 0 is rejected | Verifies Qty $= 0$ renders warning alert, disables submit button, and leaves stock unchanged. |
| **INVALID-02** | Invalid Input | Negative quantity is rejected | Verifies negative quantity renders warning alert and leaves stock unchanged. |
| **INVALID-03** | Invalid Input | Quantity greater than available stock is rejected | Verifies overstock request renders error alert, disables submit button, and leaves stock unchanged. |
| **INVALID-04** | Invalid Input | Missing customer name is rejected | Verifies blank customer name disables submit button and leaves stock unchanged. |
| **INVALID-05** | Invalid Input | Empty order submission is prevented | Verifies 0 line items displays placeholder and disables submit button. |
| **ATOMIC-01** | Data Integrity | No partial inventory update on failure | Verifies multi-item order with overstock item fails; stock for ALL items remains 100% unchanged. |
| **CANCEL-01** | Order Cancellation | Cancel confirmed order | Verifies order cancellation flow, cancel button visibility, and success feedback banner. |
| **CANCEL-02** | Order Cancellation | Inventory restoration | Verifies through UI that order cancellation restores physical stock back to original $N$. |
| **CANCEL-03** | Order Cancellation | Status transition | Verifies status transitions to `CANCELLED` (red badge) and cancel button becomes hidden. |
| **CANCEL-04** | Order Cancellation | Double cancellation prevention | Verifies UI hides cancel button and API re-cancellation throws `"Order is already cancelled."`. |
| **CANCEL-05** | Order Cancellation | No double inventory restoration | Verifies stock returns to $N$ and does NOT become $N + Q$ on reload or second checks. |
| **CANCEL-06** | Order Cancellation | Multi-product atomic restoration | Verifies order with multiple products restores all line items back to exact original stock counts. |
| **CANCEL-07** | Order Cancellation | Order cancellation eligibility guard | Verifies cancelled orders cannot be cancelled again. |
| **CANCEL-08** | Order Cancellation | UI feedback and selector verification | Verifies button selectors, `cancel-success-banner` text, and badge rendering. |
