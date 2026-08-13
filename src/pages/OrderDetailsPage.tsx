import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrderById, cancelOrderAtomic } from '../services/inventoryService';
import { Order } from '../types';
import { useToast } from '../components/Toast';
import {
  ArrowLeft, CheckCircle2, ShoppingBag,
  Clock, User, Copy, PackagePlus, XCircle, AlertTriangle
} from 'lucide-react';

export const OrderDetailsPage: React.FC = () => {
  const { orderId }   = useParams<{ orderId: string }>();
  const navigate      = useNavigate();
  const location      = useLocation();
  const { showToast } = useToast();

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const isJustCreated = Boolean(location.state?.orderCreatedSuccess);

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      setLoading(true);
      try {
        setOrder(await getOrderById(orderId));
      } catch (err) {
        showToast('Failed to load order', String(err), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    showToast('Copied', `Order number ${order.orderNumber} copied to clipboard.`, 'info');
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);
    setCancelSuccess(false);

    try {
      const updated = await cancelOrderAtomic(order.id);
      setOrder(updated);
      setCancelSuccess(true);
      showToast('Order Cancelled', `Order ${order.orderNumber} cancelled and inventory restored.`, 'success');
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to cancel order.';
      setCancelError(errMsg);
      showToast('Cancellation Rejected', errMsg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading / Not Found States ────────────────────────────────────────────────

  if (loading) return <div className="page"><p className="muted">Loading order details from Firestore…</p></div>;

  if (!order) return (
    <div className="page">
      <div className="card empty-state">
        <ShoppingBag size={44} color="var(--color-faint)" />
        <h3>Order not found</h3>
        <p>The order "{orderId}" does not exist in Firestore.</p>
        <button className="btn btn-primary" onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    </div>
  );

  const isCancelled = order.status === 'CANCELLED' || order.status === 'Cancelled';

  // ── Main Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page">

      {/* Top Controls */}
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')} data-testid="back-to-orders-btn">
          <ArrowLeft size={15} /> Back to Orders
        </button>
        <div className="page-header-actions">
          {!isCancelled && (
            <button
              className="btn btn-danger btn-sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
              data-testid="cancel-order-btn"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <XCircle size={14} /> {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={copyOrderNumber}>
            <Copy size={14} /> Copy Order #
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create-order')}>
            <PackagePlus size={14} /> New Order
          </button>
        </div>
      </div>

      {/* Success Banner (shown immediately after order creation) */}
      {isJustCreated && !cancelSuccess && (
        <div className="alert alert-success" data-testid="order-success-banner">
          <CheckCircle2 size={20} />
          <div>
            <strong>Order Created — Inventory Reserved Successfully</strong>
            <div style={{ fontSize: '0.85rem', marginTop: 2 }}>Stock has been atomically decremented in Firestore.</div>
          </div>
        </div>
      )}

      {/* Cancellation Success Banner */}
      {cancelSuccess && (
        <div className="alert alert-success" data-testid="cancel-success-banner" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
          <CheckCircle2 size={20} />
          <div>
            <strong>Order Cancelled — Inventory Restored Atomically</strong>
            <div style={{ fontSize: '0.85rem', marginTop: 2 }}>All reserved product quantities have been credited back to physical available stock.</div>
          </div>
        </div>
      )}

      {/* Cancellation Error Banner */}
      {cancelError && (
        <div className="alert alert-danger" data-testid="cancel-error-alert" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Cancellation Failed</strong>: {cancelError}
          </div>
        </div>
      )}

      {/* Order Manifest Card */}
      <div className="card" data-testid="order-details-card">

        {/* Order Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className={`badge ${isCancelled ? 'badge-red' : 'badge-green'}`} data-testid="detail-order-status">{order.status}</span>
              <span className="mono faint" style={{ fontSize: '0.78rem' }} data-testid="detail-order-id">ID: {order.id}</span>
            </div>
            <h1 className="mono" style={{ fontSize: '2rem', fontWeight: 800 }} data-testid="detail-order-number">
              {order.orderNumber}
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Grand Total</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }} data-testid="detail-order-total">
              ${order.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Order Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(15,23,42,0.5)', borderRadius: 8, border: '1px solid var(--color-border)', marginBottom: '1.75rem' }}>
          <div>
            <div className="muted" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: 4 }}>
              <User size={13} /> Customer
            </div>
            <div className="fw-700" data-testid="detail-customer-name">{order.customerName}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: 4 }}>
              <Clock size={13} /> Created
            </div>
            <div data-testid="detail-creation-time">{new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: 4 }}>
              <ShoppingBag size={13} /> Line Items
            </div>
            <div data-testid="detail-total-items">{order.totalItems} units across {order.items.length} SKUs</div>
          </div>
        </div>

        {/* Order Items Table */}
        <h2 className="section-title">Reserved Items Manifest</h2>
        <div className="table-wrap">
          <table className="table" data-testid="order-items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Qty Reserved</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} data-testid={`order-item-row-${idx}`}>
                  <td className="fw-700" data-testid={`item-name-${idx}`}>{item.productName}</td>
                  <td className="mono muted" data-testid={`item-sku-${idx}`}>{item.sku}</td>
                  <td data-testid={`item-price-${idx}`}>${item.price.toFixed(2)}</td>
                  <td className="fw-700" data-testid={`item-quantity-${idx}`}>{item.quantity}</td>
                  <td className="fw-700" data-testid={`item-linetotal-${idx}`}>${item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'rgba(15,23,42,0.7)' }}>
                <td colSpan={3} style={{ fontWeight: 700, textAlign: 'right' }}>Total Reserved:</td>
                <td className="fw-800" data-testid="footer-total-units">{order.totalItems} units</td>
                <td className="fw-800 mono" style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }} data-testid="footer-total-price">
                  ${order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </div>
  );
};
