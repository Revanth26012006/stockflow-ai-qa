import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getOrders, seedProducts } from '../services/inventoryService';
import { Product, Order } from '../types';
import { useToast } from '../components/Toast';
import {
  Boxes, ShoppingBag, AlertTriangle, CheckCircle2,
  PackagePlus, RefreshCw, TrendingUp, ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [seeding,  setSeeding]  = useState(false);

  // Load dashboard data on mount
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([getProducts(), getOrders()]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      showToast('Failed to load data', String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedProducts();
      await loadData();
      showToast('Catalog seeded', 'Sample products added to Firestore.', 'success');
    } catch (err) {
      showToast('Seed failed', String(err), 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Computed metrics
  const totalStock   = products.reduce((sum, p) => sum + p.availableStock, 0);
  const lowStock     = products.filter(p => p.availableStock > 0 && p.availableStock <= 10);
  const outOfStock   = products.filter(p => p.availableStock === 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" data-testid="dashboard-title">Order Fulfillment Dashboard</h1>
          <p className="page-subtitle">Overview of inventory levels and recent orders</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding} data-testid="seed-products-btn">
            <RefreshCw size={15} className={seeding ? 'spin' : ''} />
            {seeding ? 'Seeding...' : 'Seed Products'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/create-order')} data-testid="create-order-quick-btn">
            <PackagePlus size={16} />
            New Order
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid-4 mb-2">

        <div className="metric-card" data-testid="metric-total-products">
          <div>
            <div className="metric-label">Total SKUs</div>
            <div className="metric-number">{loading ? '—' : products.length}</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <Boxes size={22} color="var(--color-primary)" />
          </div>
        </div>

        <div className="metric-card" data-testid="metric-stock-units">
          <div>
            <div className="metric-label">Available Units</div>
            <div className="metric-number">{loading ? '—' : totalStock}</div>
          </div>
          <div className="metric-icon" style={{ background: 'var(--color-green-bg)' }}>
            <CheckCircle2 size={22} color="var(--color-green)" />
          </div>
        </div>

        <div className="metric-card" data-testid="metric-low-stock">
          <div>
            <div className="metric-label">Stock Alerts</div>
            <div className="metric-number" style={{ color: (lowStock.length + outOfStock.length) > 0 ? 'var(--color-amber)' : undefined }}>
              {loading ? '—' : lowStock.length + outOfStock.length}
            </div>
          </div>
          <div className="metric-icon" style={{ background: 'var(--color-amber-bg)' }}>
            <AlertTriangle size={22} color="var(--color-amber)" />
          </div>
        </div>

        <div className="metric-card" data-testid="metric-total-orders">
          <div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-number" style={{ color: 'var(--color-primary)' }}>
              {loading ? '—' : orders.length}
            </div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <TrendingUp size={22} color="var(--color-primary)" />
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Orders + Stock Alerts */}
      <div className="grid-2">

        {/* Recent Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Recent Orders</h2>
            <Link to="/orders" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p className="muted">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={40} color="var(--color-faint)" />
              <h3>No orders yet</h3>
              <p>Create your first order to test atomic stock reservation.</p>
              <button className="btn btn-primary" onClick={() => navigate('/create-order')}>Create Order</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table" data-testid="recent-orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map(order => (
                    <tr key={order.id}>
                      <td className="mono fw-700" style={{ color: 'var(--color-primary)' }}>{order.orderNumber}</td>
                      <td className="fw-700">{order.customerName}</td>
                      <td>${order.totalAmount.toFixed(2)}</td>
                      <td><span className="badge badge-green">{order.status}</span></td>
                      <td>
                        <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm" data-testid={`view-order-btn-${order.id}`}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Alerts Sidebar */}
        <div className="card">
          <h2 className="section-title">Stock Alerts</h2>
          {loading ? (
            <p className="muted">Checking stock…</p>
          ) : outOfStock.length + lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <CheckCircle2 size={32} color="var(--color-green)" />
              <p>All products adequately stocked.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {outOfStock.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--color-red-bg)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div className="mono faint" style={{ fontSize: '0.75rem' }}>{p.sku}</div>
                  </div>
                  <span className="badge badge-red">Out of Stock</span>
                </div>
              ))}
              {lowStock.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--color-amber-bg)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                    <div className="mono faint" style={{ fontSize: '0.75rem' }}>{p.sku}</div>
                  </div>
                  <span className="badge badge-amber">{p.availableStock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
