import {
  collection,
  doc,
  getDocs,
  getDoc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, IS_DEMO_MODE, IS_FIREBASE_CONFIGURED } from './firebase';

// ── Demo Mode Detection ────────────────────────────────────────────────────────
// Demo Mode activates ONLY when explicitly enabled via VITE_ENABLE_DEMO_MODE=true.
// Missing Firebase API Key does NOT automatically trigger Demo Mode.

// localStorage keys
const DEMO_PRODUCTS_KEY = 'sf_products';
const DEMO_ORDERS_KEY   = 'sf_orders';
const DEMO_ITEMS_KEY    = 'sf_order_items';

const readDemo = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const writeDemo = <T>(key: string, value: T): void => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
import { Product, Order, OrderItem, CreateOrderInput } from '../types';


// Seed Catalog Dataset
export const SEED_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    sku: 'LOGI-MX3S-BLK',
    price: 99.99,
    availableStock: 45,
    category: 'Peripherals',
    description: 'Performance wireless ergonomic mouse with 8K DPI sensor.'
  },
  {
    name: 'Keychron K2 Pro Mechanical Keyboard',
    sku: 'KEY-K2PRO-RGB',
    price: 119.50,
    availableStock: 25,
    category: 'Peripherals',
    description: 'QMK/VIA wireless mechanical keyboard with hot-swappable switches.'
  },
  {
    name: 'Dell UltraSharp 27" 4K USB-C Monitor',
    sku: 'DELL-U2723QE',
    price: 549.99,
    availableStock: 12,
    category: 'Displays',
    description: '4K UHD IPS Black monitor with built-in USB-C hub.'
  },
  {
    name: 'Anker PowerExpand 13-in-1 USB-C Dock',
    sku: 'ANK-DOCK-131',
    price: 179.99,
    availableStock: 30,
    category: 'Accessories',
    description: 'Triple-display USB-C dock with 85W pass-through charging.'
  },
  {
    name: 'Sony WH-1000XM5 ANC Headphones',
    sku: 'SONY-WH1000M5',
    price: 399.00,
    availableStock: 18,
    category: 'Audio',
    description: 'Industry-leading noise-canceling wireless over-ear headphones.'
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    sku: 'CHAIR-ERG-MESH',
    price: 289.00,
    availableStock: 0, // Out of stock to test validation rules!
    category: 'Furniture',
    description: 'High-back mesh ergonomic desk chair with lumbar support.'
  }
];

/**
 * Fetch all products from Firestore (or localStorage in demo mode)
 */
export async function getProducts(): Promise<Product[]> {
  if (IS_DEMO_MODE) {
    const cached = readDemo<Product[]>(DEMO_PRODUCTS_KEY, []);
    if (cached.length > 0) return cached;
    return await seedProducts();
  }

  const productsRef = collection(db, 'products');
  const snapshot    = await getDocs(productsRef);
  if (snapshot.empty) return await seedProducts();

  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

/**
 * Seed sample product catalog into Firestore (or localStorage in demo mode)
 */
export async function seedProducts(): Promise<Product[]> {
  const seededList: Product[] = SEED_PRODUCTS.map((data, idx) => ({
    id: `prod_${idx + 1}`,
    ...data,
    updatedAt: new Date().toISOString()
  }));

  if (IS_DEMO_MODE) {
    writeDemo(DEMO_PRODUCTS_KEY, seededList);
    return seededList;
  }

  const batch = writeBatch(db);
  seededList.forEach(prod => {
    const { id, ...rest } = prod;
    batch.set(doc(db, 'products', id), { ...rest, updatedAt: serverTimestamp() });
  });
  await batch.commit();
  return seededList;
}

/**
 * Atomic Order Creation & Stock Reservation via Firestore Transaction
 * 
 * BUSINESS RULES ENFORCED:
 * 1. Customer name is required.
 * 2. Order must contain at least one item.
 * 3. Every ordered product must exist in Firestore.
 * 4. Quantity must be a positive integer.
 * 5. Requested quantity cannot exceed available stock.
 * 6. Atomic execution: If any item fails, zero inventory is updated.
 * 7. Successful order decreases stock by ordered quantity.
 */
export async function createOrderAtomic(
  input: CreateOrderInput,
  currentUserEmail?: string
): Promise<Order> {
  const customerName = input.customerName?.trim();
  if (!customerName) {
    throw new Error('Customer name is required.');
  }

  if (!input.items || input.items.length === 0) {
    throw new Error('An order must contain at least one product item.');
  }

  // Validate duplicate products in order request
  const productIdsSeen = new Set<string>();
  for (const item of input.items) {
    if (productIdsSeen.has(item.productId)) {
      throw new Error('Duplicate products in order. Please consolidate quantities into a single line item.');
    }
    productIdsSeen.add(item.productId);
  }

  // Validate positive integer quantities
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity (${item.quantity}). Quantity must be a positive integer.`);
    }
  }

  const orderId     = `ord_${Date.now()}`;
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // ── DEMO MODE: in-memory localStorage transaction ──────────────────────────
  if (IS_DEMO_MODE) {
    const products = readDemo<Product[]>(DEMO_PRODUCTS_KEY, []);
    const prodMap  = new Map(products.map(p => [p.id, { ...p }]));

    let totalAmount = 0, totalItemsCount = 0;
    const resolvedItems: OrderItem[] = [];

    // Phase 1: Validate all items (all-or-nothing)
    for (const item of input.items) {
      const prod = prodMap.get(item.productId);
      if (!prod) throw new Error(`Product "${item.productId}" not found.`);
      if (item.quantity > prod.availableStock)
        throw new Error(`Insufficient stock for "${prod.name}". Requested: ${item.quantity}, Available: ${prod.availableStock}.`);
      const lineTotal = Number((prod.price * item.quantity).toFixed(2));
      totalAmount    += lineTotal;
      totalItemsCount += item.quantity;
      resolvedItems.push({ productId: item.productId, productName: prod.name, sku: prod.sku, price: prod.price, quantity: item.quantity, lineTotal });
    }

    // Phase 2: Commit stock deductions and save order
    for (const item of input.items) {
      const prod = prodMap.get(item.productId)!;
      prod.availableStock -= item.quantity;
    }
    writeDemo(DEMO_PRODUCTS_KEY, [...prodMap.values()]);

    const order: Order = {
      id: orderId, orderNumber, customerName,
      status: 'Fulfilled',
      totalAmount: Number(totalAmount.toFixed(2)),
      totalItems: totalItemsCount,
      items: resolvedItems,
      createdAt: new Date().toISOString(),
      createdBy: currentUserEmail || 'demo@stockflow.com'
    };
    const orders = readDemo<Order[]>(DEMO_ORDERS_KEY, []);
    writeDemo(DEMO_ORDERS_KEY, [order, ...orders]);
    return order;
  }

  // ── FIRESTORE TRANSACTION ─────────────────────────────────────────────────
  return await runTransaction(db, async (transaction) => {

    let totalAmount = 0;
    let totalItemsCount = 0;
    const resolvedItems: OrderItem[] = [];
    const stockUpdates: { productRef: any; newStock: number }[] = [];

    // STEP 1: Read products and validate stock levels inside transaction
    for (const itemInput of input.items) {
      const productRef = doc(db, 'products', itemInput.productId);
      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error(`Product with ID "${itemInput.productId}" does not exist in database.`);
      }

      const productData = productSnap.data() as Product;
      const currentStock = productData.availableStock;

      if (itemInput.quantity > currentStock) {
        throw new Error(
          `Insufficient stock for "${productData.name}". Requested: ${itemInput.quantity}, Available: ${currentStock}.`
        );
      }

      const lineTotal = Number((productData.price * itemInput.quantity).toFixed(2));
      totalAmount += lineTotal;
      totalItemsCount += itemInput.quantity;

      resolvedItems.push({
        productId: itemInput.productId,
        productName: productData.name,
        sku: productData.sku,
        price: productData.price,
        quantity: itemInput.quantity,
        lineTotal
      });

      stockUpdates.push({
        productRef,
        newStock: currentStock - itemInput.quantity
      });
    }

    // STEP 2: Write stock updates and order documents atomically
    for (const update of stockUpdates) {
      transaction.update(update.productRef, {
        availableStock: update.newStock,
        updatedAt: serverTimestamp()
      });
    }

    // Create Order document in Firestore
    const orderRef = doc(db, 'orders', orderId);
    transaction.set(orderRef, {
      orderNumber,
      customerName,
      status: 'Fulfilled',
      totalAmount: Number(totalAmount.toFixed(2)),
      totalItems: totalItemsCount,
      createdAt: serverTimestamp(),
      createdBy: currentUserEmail || 'admin@stockflow.com'
    });

    // Create Order Items in Firestore
    resolvedItems.forEach((resolvedItem, idx) => {
      const itemRef = doc(db, 'orderItems', `${orderId}_item_${idx + 1}`);
      transaction.set(itemRef, {
        orderId,
        ...resolvedItem
      });
    });

    return {
      id: orderId,
      orderNumber,
      customerName,
      status: 'Fulfilled',
      totalAmount: Number(totalAmount.toFixed(2)),
      totalItems: totalItemsCount,
      items: resolvedItems,
      createdAt: new Date().toISOString(),
      createdBy: currentUserEmail || 'admin@stockflow.com'
    };
  });
}

/**
 * Fetch all orders from Firestore (or localStorage in demo mode)
 */
export async function getOrders(): Promise<Order[]> {
  if (IS_DEMO_MODE) return readDemo<Order[]>(DEMO_ORDERS_KEY, []);

  const ordersRef = collection(db, 'orders');
  const q         = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot  = await getDocs(q);

  const orders: Order[] = [];
  for (const orderDoc of snapshot.docs) {
    const orderData = orderDoc.data();
    const createdAt = orderData.createdAt?.toDate?.()
      ? orderData.createdAt.toDate().toISOString()
      : (orderData.createdAt || new Date().toISOString());

    // Fetch line items for this order
    const itemsRef  = collection(db, 'orderItems');
    const itemsSnap = await getDocs(itemsRef);
    const items     = itemsSnap.docs
      .map(d  => d.data() as OrderItem)
      .filter(i => i.orderId === orderDoc.id);

    orders.push({
      id: orderDoc.id,
      orderNumber:  orderData.orderNumber,
      customerName: orderData.customerName,
      status:       orderData.status || 'Fulfilled',
      totalAmount:  orderData.totalAmount || 0,
      totalItems:   orderData.totalItems  || 0,
      items,
      createdAt,
      createdBy: orderData.createdBy
    });
  }

  return orders;
}

/**
 * Fetch order by ID directly from Firestore
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (IS_DEMO_MODE) {
    const orders = readDemo<Order[]>(DEMO_ORDERS_KEY, []);
    return orders.find(o => o.id === orderId) || null;
  }

  const orderDocRef = doc(db, 'orders', orderId);
  const orderDocSnap = await getDoc(orderDocRef);

  if (!orderDocSnap.exists()) {
    return null;
  }

  const orderData = orderDocSnap.data();
  const createdAt = orderData.createdAt?.toDate?.()
    ? orderData.createdAt.toDate().toISOString()
    : (orderData.createdAt || new Date().toISOString());

  const itemsSnap = await getDocs(collection(db, 'orderItems'));
  const items = itemsSnap.docs
    .map(d => d.data() as OrderItem)
    .filter(i => i.orderId === orderId);

  return {
    id: orderDocSnap.id,
    orderNumber: orderData.orderNumber,
    customerName: orderData.customerName,
    status: orderData.status || 'Fulfilled',
    totalAmount: orderData.totalAmount || 0,
    totalItems: orderData.totalItems || 0,
    items,
    createdAt,
    createdBy: orderData.createdBy
  };
}

/**
 * Cancel a confirmed order and restore inventory atomically.
 */
export async function cancelOrderAtomic(orderId: string): Promise<Order> {
  if (IS_DEMO_MODE) {
    const orders = readDemo<Order[]>(DEMO_ORDERS_KEY, []);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error(`Order with ID "${orderId}" not found.`);
    }

    const order = orders[orderIndex];
    if (order.status === 'CANCELLED' || order.status === 'Cancelled') {
      throw new Error('Order is already cancelled.');
    }

    // Phase 1: Restore inventory quantities for all products in demo state
    const products = readDemo<Product[]>(DEMO_PRODUCTS_KEY, SEED_PRODUCTS);
    const prodMap = new Map(products.map(p => [p.id, p]));

    for (const item of order.items) {
      const prod = prodMap.get(item.productId);
      if (prod) {
        prod.availableStock += item.quantity;
      }
    }

    // Phase 2: Update order status to CANCELLED
    const updatedOrder: Order = {
      ...order,
      status: 'CANCELLED'
    };

    orders[orderIndex] = updatedOrder;
    writeDemo(DEMO_PRODUCTS_KEY, [...prodMap.values()]);
    writeDemo(DEMO_ORDERS_KEY, orders);

    return updatedOrder;
  }

  // ── FIRESTORE TRANSACTION ─────────────────────────────────────────────────
  return await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(`Order with ID "${orderId}" does not exist.`);
    }

    const orderData = orderSnap.data() as Order;
    if (orderData.status === 'CANCELLED' || orderData.status === 'Cancelled') {
      throw new Error('Order is already cancelled.');
    }

    // Read orderItems for this order
    const itemsSnap = await getDocs(collection(db, 'orderItems'));
    const items = itemsSnap.docs
      .map(d => d.data() as OrderItem)
      .filter(i => i.orderId === orderId);

    // Read products and calculate restored stocks inside transaction
    const stockUpdates: { productRef: any; newStock: number }[] = [];
    for (const item of items) {
      const productRef = doc(db, 'products', item.productId);
      const productSnap = await transaction.get(productRef);
      if (productSnap.exists()) {
        const currentStock = (productSnap.data() as Product).availableStock || 0;
        stockUpdates.push({
          productRef,
          newStock: currentStock + item.quantity
        });
      }
    }

    // Write stock restorations and update order status
    for (const update of stockUpdates) {
      transaction.update(update.productRef, {
        availableStock: update.newStock,
        updatedAt: serverTimestamp()
      });
    }

    transaction.update(orderRef, {
      status: 'CANCELLED',
      updatedAt: serverTimestamp()
    });

    return {
      ...orderData,
      id: orderSnap.id,
      status: 'CANCELLED',
      items
    };
  });
}
