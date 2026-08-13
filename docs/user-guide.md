# StockFlow — User Operating Manual

Welcome to **StockFlow**, the inventory order-fulfillment management application designed for warehouse staff and inventory coordinators.

---

## 🧭 Navigation & Overview
StockFlow features a top navigation bar allowing easy access to the core sections:
- **Dashboard**: View overall inventory metrics and low-stock alerts.
- **Products**: View the complete product catalog and current stock levels.
- **Create Order**: Compose and submit customer inventory orders.
- **Orders**: View past order history and details.

---

## 🔐 1. Logging In & Logging Out
- **Signing In**: Navigate to the Login page (`/login`). Enter your authorized staff email and password, then click **Sign In**. Alternatively, click **Quick Demo Login** to log in instantly with demo credentials (`demo.admin@stockflow.com`).
- **Signing Out**: Click the **Sign Out** icon button located on the top navigation bar at any time to end your session.

---

## 📊 2. Dashboard
The Dashboard (`/dashboard`) provides an overview of warehouse inventory health:
- **Total Products**: Number of active product SKUs in the catalog.
- **Total Physical Stock**: Total combined count of all physical inventory units in stock.
- **Low Stock Items**: Count of products with stock levels below 10 units.
- **Reset / Seed Products Button**: Allows staff to re-seed demo inventory levels ($45$ Mice, $25$ Keyboards, $12$ Monitors, $30$ Docks, $18$ Cables, $0$ Chairs) whenever needed.

---

## 📦 3. Viewing Products Catalog
The Products page (`/products`) lists all warehouse catalog items in a clean table:
- **SKU & Name**: Product identification details and category.
- **Price**: Current unit selling price.
- **Available Stock**: Current real-time count of physical units available for fulfillment.
- **Status Badges**:
  - `In Stock` (Green): Stock level $\ge 10$ units.
  - `Low Stock` (Yellow): Stock level between $1$ and $9$ units.
  - `Out of Stock` (Red): Stock level is $0$.

---

## 🛒 4. Creating a Customer Order

### Step-by-Step Order Fulfillment
1. Click **Create Order** on the navigation bar (`/create-order`).
2. **Enter Customer Name**: Input the customer or business name into the **Customer Name** field (required).
3. **Select Product**: Choose an available item from the **Select Product** dropdown menu.
4. **Enter Quantity**: Input the desired quantity ($Q \ge 1$).
5. **Add Item to Order**: Click **Add Item**. The item will appear in your **Selected Line Items** manifest table.
6. **Adding Multiple Products**: Select additional products from the dropdown, enter their quantities, and click **Add Item**. You can adjust quantities directly in the line items table.
7. **Submit Order**: Review the **Order Summary** grand total. Click **Submit & Fulfill Order**.

---

## ⚠️ 5. Understanding Validation Alerts & Error Messages
StockFlow prevents invalid orders automatically:
- **Empty Customer Name**: The **Submit Order** button remains disabled until a customer name is entered.
- **Zero or Negative Quantities**: Entering $0$ or negative numbers displays a warning banner (*"Quantity must be a positive integer"*).
- **Overstock Requests**: Attempting to order more units than currently available displays a stock warning alert (*"Requested quantity exceeds available stock"*) and blocks submission.
- **Empty Line Items**: If no products are added to the manifest, an empty placeholder appears and submission is disabled.

---

## 📜 6. Order Details & Confirmation
Upon successful submission:
- You are automatically navigated to the **Order Details** view (`/orders/:id`).
- A green confirmation banner displays *"Order Created & Stock Reserved Successfully!"*.
- You can view the generated Order ID, customer name, status (`Fulfilled`), total items reserved, and total amount.
- Stock for all ordered items is automatically decremented across the warehouse catalog.

---

## ❌ 7. Cancelling an Order & Restoring Inventory

### How to Cancel an Order
1. Navigate to the **Order Details** page (`/orders/:id`) of an active order.
2. Click the red **Cancel Order** button (`cancel-order-btn`) in the top right control bar.
3. The system executes an atomic transaction that:
   - Restores all reserved product quantities back to physical inventory ($stock = currentStock + orderedQty$).
   - Changes the order status badge to a prominent red **`CANCELLED`** badge.
   - Displays a green confirmation banner (*"Order Cancelled — Inventory Restored Atomically"*).

### Eligibility & Restrictions
- **Availability**: Cancellation is available for active confirmed orders.
- **Double Cancellation Protection**: Once an order is cancelled, the **Cancel Order** button is automatically removed from the screen. If a cancellation is attempted a second time via API or network requests, the system rejects it with an explicit error message (*"Order is already cancelled"*), ensuring inventory is **never credited twice**.
