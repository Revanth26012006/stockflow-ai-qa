import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZ2UO25f6oA4lZhMkJ8e2j5Xyl7WDADps",
  authDomain: "tactive-30014.firebaseapp.com",
  projectId: "tactive-30014",
  storageBucket: "tactive-30014.firebasestorage.app",
  messagingSenderId: "116207969631",
  appId: "1:116207969631:web:59cd86c6dba3f8c55882ea",
  measurementId: "G-RX3XZWCVBL"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const SEED_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Logitech MX Master 3S Wireless Mouse',
    sku: 'LOGI-MX3S-BLK',
    price: 99.99,
    availableStock: 45,
    category: 'Peripherals',
    description: 'Performance wireless ergonomic mouse with 8K DPI sensor.'
  },
  {
    id: 'prod_2',
    name: 'Keychron K2 Pro Mechanical Keyboard',
    sku: 'KEY-K2PRO-RGB',
    price: 119.50,
    availableStock: 25,
    category: 'Peripherals',
    description: 'QMK/VIA wireless mechanical keyboard with hot-swappable switches.'
  },
  {
    id: 'prod_3',
    name: 'Dell UltraSharp 27" 4K USB-C Monitor',
    sku: 'DELL-U2723QE',
    price: 549.99,
    availableStock: 12,
    category: 'Displays',
    description: '4K UHD IPS Black monitor with built-in USB-C hub.'
  },
  {
    id: 'prod_4',
    name: 'Anker PowerExpand 13-in-1 USB-C Dock',
    sku: 'ANK-DOCK-131',
    price: 179.99,
    availableStock: 30,
    category: 'Accessories',
    description: 'Triple-display USB-C dock with 85W pass-through charging.'
  },
  {
    id: 'prod_5',
    name: 'Sony WH-1000XM5 ANC Headphones',
    sku: 'SONY-WH1000M5',
    price: 399.00,
    availableStock: 18,
    category: 'Audio',
    description: 'Industry-leading noise-canceling wireless over-ear headphones.'
  },
  {
    id: 'prod_6',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'CHAIR-ERG-MESH',
    price: 289.00,
    availableStock: 0,
    category: 'Furniture',
    description: 'High-back mesh ergonomic desk chair with lumbar support.'
  }
];

async function seed() {
  console.log('Authenticating seed user...');
  const testEmail = 'admin@stockflow.com';
  const testPassword = 'Password123!';

  try {
    await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('Signed in as existing test user:', testEmail);
  } catch (e) {
    try {
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('Created and signed in as test user:', testEmail);
    } catch (createErr) {
      console.log('Proceeding with direct seed attempts:', createErr.message);
    }
  }

  console.log('Seeding products to Firestore project tactive-30014...');
  const batch = writeBatch(db);

  for (const prod of SEED_PRODUCTS) {
    const { id, ...data } = prod;
    const ref = doc(db, 'products', id);
    batch.set(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  console.log('Successfully seeded 6 products into Firestore collection "products"!');

  // Seed 1 sample initial order
  console.log('Seeding initial sample order...');
  const orderId = 'ord_seed_1001';
  const orderRef = doc(db, 'orders', orderId);
  await setDoc(orderRef, {
    orderNumber: 'ORD-2026-1001',
    customerName: 'Acme Corporation',
    status: 'Fulfilled',
    totalAmount: 319.48,
    totalItems: 3,
    createdAt: serverTimestamp(),
    createdBy: testEmail
  });

  const item1Ref = doc(db, 'orderItems', `${orderId}_item_1`);
  await setDoc(item1Ref, {
    orderId,
    productId: 'prod_1',
    productName: 'Logitech MX Master 3S Wireless Mouse',
    sku: 'LOGI-MX3S-BLK',
    price: 99.99,
    quantity: 2,
    lineTotal: 199.98
  });

  const item2Ref = doc(db, 'orderItems', `${orderId}_item_2`);
  await setDoc(item2Ref, {
    orderId,
    productId: 'prod_2',
    productName: 'Keychron K2 Pro Mechanical Keyboard',
    sku: 'KEY-K2PRO-RGB',
    price: 119.50,
    quantity: 1,
    lineTotal: 119.50
  });

  console.log('Successfully seeded sample order and order items!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
