import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, createOrderAtomic } from '../services/inventoryService';
import { Product, CreateOrderItemInput } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  ShoppingBag, Plus, Trash2, AlertCircle,
  PackageCheck, AlertTriangle, User, Boxes
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderRow {
  productId: string;
  quantity:  number;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const CreateOrderPage: React.FC = () => {
  const { user }        = useAuth();
  const { showToast }   = useToast();
  const navigate        = useNavigate();
  const location        = useLocation();

  // Form state
  const [products,      setProducts]      = useState<Product[]>([]);
  const [loadingProds,  setLoadingProds]  = useState(true);
  const [customerName,  setCustomerName]  = useState('');
  const [rows,          setRows]          = useState<OrderRow[]>([]);

  // Item picker state (before adding to order)
  const [pickedProduct, setPickedProduct] = useState('');
  const [pickedQty,     setPickedQty]     = useState(1);

  // Submission feedback
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState('');
  const [warning,       setWarning]       = useState('');

  // Load products from Firestore & handle pre-selection
  useEffect(() => {
    const load = async () => {
      setLoadingProds(true);
      try {
        const prods = await getProducts();
        setProducts(prods);
        const state = location.state as { preselectProductId?: string } | null;
        if (state?.preselectProductId) {
          const pre = prods.find(p => p.id === state.preselectProductId);
          if (pre && pre.availableStock > 0) {
            setRows([{ productId: pre.id, quantity: 1 }]);
          }
        }
      } catch (err) {
        showToast('Failed to load products', String(err), 'error');
      } finally {
        setLoadingProds(false);
      }
    };
    load();
  }, [location.state]);

  // ── Row Handlers ──────────────────────────────────────────────────────────────

  const addRow = () => {
    setError(''); setWarning('');
    if (!pickedProduct) { setWarning('Please select a product.'); return; }

    const prod = products.find(p => p.id === pickedProduct)!;
    if (!Number.isInteger(pickedQty) || pickedQty <= 0) {
      setWarning('Quantity must be a positive integer.'); return;
    }

    // Merge if same product already in order
    const existing = rows.find(r => r.productId === pickedProduct);
    const combined = (existing?.quantity ?? 0) + pickedQty;

    if (combined > prod.availableStock) {
      setWarning(`"${prod.name}" only has ${prod.availableStock} units. You tried to add ${combined}.`);
      return;
    }

    setRows(existing
      ? rows.map(r => r.productId === pickedProduct ? { ...r, quantity: combined } : r)
      : [...rows, { productId: pickedProduct, quantity: pickedQty }]
    );
    setPickedProduct(''); setPickedQty(1);
  };

  const updateQty = (productId: string, qty: number) => {
    setError(''); setWarning('');
    const prod = products.find(p => p.id === productId);
    if (prod && qty > prod.availableStock) {
      setWarning(`"${prod.name}" only has ${prod.availableStock} units available.`);
    }
    setRows(rows.map(r => r.productId === productId ? { ...r, quantity: qty } : r));
  };

  const removeRow = (productId: string) => setRows(rows.filter(r => r.productId !== productId));

  // ── Derived Order Summary ─────────────────────────────────────────────────────

  const enrichedRows = rows.map(row => {
    const prod  = products.find(p => p.id === row.productId);
    const price = prod?.price ?? 0;
    const isOverStock   = row.quantity > (prod?.availableStock ?? 0);
    const isInvalidQty  = !Number.isInteger(row.quantity) || row.quantity <= 0;
    return { ...row, prod, price, lineTotal: price * row.quantity, isOverStock, isInvalidQty };
  });

  const grandTotal     = enrichedRows.reduce((s, r) => s + r.lineTotal, 0);
  const totalUnits     = rows.reduce((s, r) => s + (Number.isInteger(r.quantity) && r.quantity > 0 ? r.quantity : 0), 0);
  const hasInvalidRow  = enrichedRows.some(r => r.isOverStock || r.isInvalidQty);

  // ── Submit Order ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setWarning('');

    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    if (rows.length === 0)    { setError('Add at least one item to the order.'); return; }
    if (hasInvalidRow)        { setError('Fix invalid quantities before submitting.'); return; }

    setSubmitting(true);
    try {
      const items: CreateOrderItemInput[] = rows.map(r => ({
        productId: r.productId,
        quantity:  Number(r.quantity)
      }));
      const order = await createOrderAtomic({ customerName: customerName.trim(), items }, user?.email ?? '');
      showToast('Order created!', `${order.orderNumber} — inventory reserved atomically.`, 'success');
      navigate(`/orders/${order.id}`, { state: { orderCreatedSuccess: true } });
    } catch (err: any) {
      setError(err.message || 'Order transaction failed. No inventory was changed.');
      showToast('Order failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" data-testid="create-order-title">Create Customer Order</h1>
          <p className="page-subtitle">Select products and reserve inventory with an atomic Firestore transaction</p>
        </div>
      </div>

      {/* Error / Warning Alerts */}
      {error   && <div className="alert alert-error"  data-testid="order-error-alert">   <AlertCircle size={18} /><span>{error}</span></div>}
      {warning && <div className="alert alert-warn"   data-testid="order-warning-alert"> <AlertTriangle size={18} /><span>{warning}</span></div>}

      <form onSubmit={handleSubmit} data-testid="create-order-form">
        <div className="grid-2">

          {/* LEFT: Form Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Step 1 — Customer Name */}
            <div className="card">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={18} color="var(--color-primary)" /> Customer Details
              </h2>
              <div className="form-group">
                <label className="form-label" htmlFor="customer-name-input">
                  Customer Name <span style={{ color: 'var(--color-red)' }}>*</span>
                </label>
                <input
                  id="customer-name-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp or Jane Doe"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  data-testid="customer-name-input"
                />
              </div>
            </div>

            {/* Step 2 — Product Picker */}
            <div className="card">
              <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Boxes size={18} color="var(--color-primary)" /> Add Products
              </h2>

              {loadingProds ? (
                <p className="muted">Loading catalog from Firestore…</p>
              ) : (
                <>
                  {/* Product picker row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="select-product-dropdown">Product</label>
                      <select id="select-product-dropdown" className="form-input" value={pickedProduct} onChange={e => setPickedProduct(e.target.value)} data-testid="product-select-dropdown">
                        <option value="">— Choose product —</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.availableStock === 0}>
                            {p.name} ({p.sku}) — ${p.price} [{p.availableStock === 0 ? 'No Stock' : `${p.availableStock} avail`}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="quantity-input">Qty</label>
                      <input id="quantity-input" type="number" min={1} step={1} className="form-input" value={pickedQty} onChange={e => setPickedQty(parseInt(e.target.value) || 0)} data-testid="quantity-input" />
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={addRow} disabled={!pickedProduct} data-testid="add-item-btn">
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {/* Selected order rows */}
                  {rows.length === 0 ? (
                    <div style={{ padding: '1.5rem', border: '2px dashed var(--color-border)', borderRadius: 8, textAlign: 'center' }} data-testid="empty-order-placeholder">
                      <ShoppingBag size={32} color="var(--color-faint)" style={{ marginBottom: 8 }} />
                      <p className="muted" style={{ fontSize: '0.875rem' }}>No items added yet</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }} data-testid="selected-items-list">
                      {enrichedRows.map(row => (
                        <div
                          key={row.productId}
                          data-testid={`selected-item-row-${row.productId}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 0.8fr 0.8fr auto',
                            gap: '0.75rem',
                            alignItems: 'center',
                            padding: '0.75rem 0.875rem',
                            background: row.isOverStock || row.isInvalidQty ? 'var(--color-red-bg)' : 'var(--color-surface-2)',
                            border: `1px solid ${row.isOverStock || row.isInvalidQty ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
                            borderRadius: 8
                          }}
                        >
                          <div>
                            <div className="fw-700" style={{ fontSize: '0.9rem' }}>{row.prod?.name}</div>
                            <div className="mono faint" style={{ fontSize: '0.75rem' }}>SKU: {row.prod?.sku} | Stock: {row.prod?.availableStock}</div>
                            {(row.isOverStock || row.isInvalidQty) && (
                              <div style={{ color: 'var(--color-red)', fontSize: '0.78rem', marginTop: 3 }} data-testid={`row-error-${row.productId}`}>
                                ⚠ {row.isInvalidQty ? 'Quantity must be positive.' : `Exceeds available stock (${row.prod?.availableStock}).`}
                              </div>
                            )}
                          </div>
                          <input
                            type="number" min={1} step={1}
                            className="form-input"
                            style={{ padding: '0.4rem 0.6rem' }}
                            value={row.quantity}
                            onChange={e => updateQty(row.productId, parseInt(e.target.value) || 0)}
                            data-testid={`item-qty-input-${row.productId}`}
                          />
                          <div className="fw-700 text-right">${row.lineTotal.toFixed(2)}</div>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(row.productId)} data-testid={`remove-item-btn-${row.productId}`}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Order Summary & Submit */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '4.5rem' }}>
              <h2 className="section-title">Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="muted">Customer</span>
                  <span className="fw-700">{customerName.trim() || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="muted">Products</span>
                  <span>{rows.length} SKU(s)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="muted">Total Units</span>
                  <span>{totalUnits}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)' }} data-testid="order-grand-total">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={submitting || rows.length === 0 || !customerName.trim() || hasInvalidRow}
                data-testid="submit-order-btn"
              >
                <PackageCheck size={18} />
                {submitting ? 'Processing…' : 'Submit & Reserve Stock'}
              </button>

              <p className="faint" style={{ fontSize: '0.78rem', textAlign: 'center', marginTop: '0.875rem', lineHeight: 1.5 }}>
                If any item is out of stock, the entire order is cancelled and no stock is changed.
              </p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};
