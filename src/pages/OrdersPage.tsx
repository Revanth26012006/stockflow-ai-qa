import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../services/inventoryService';
import { Order } from '../types';
import { useToast } from '../components/Toast';
import { ShoppingBag, PackagePlus, ArrowRight } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setOrders(await getOrders());
      } catch (err) {
        showToast('Failed to load orders', String(err), 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" data-testid="orders-title">Fulfilled Orders</h1>
          <p className="page-subtitle">Complete record of all customer inventory reservations</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-order')} data-testid="create-order-from-orders-btn">
          <PackagePlus size={16} /> New Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p className="muted" style={{ padding: '2rem' }}>Loading orders from Firestore…</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} color="var(--color-faint)" />
            <h3>No orders yet</h3>
            <p>Create your first order to test atomic inventory reservation.</p>
            <button className="btn btn-primary" onClick={() => navigate('/create-order')}>Create Order</button>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="table" data-testid="orders-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>SKUs</th>
                  <th>Total Units</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} data-testid={`order-row-${order.id}`}>
                    <td className="mono fw-700" style={{ color: 'var(--color-primary)' }} data-testid={`order-number-${order.id}`}>
                      {order.orderNumber}
                    </td>
                    <td className="fw-700" data-testid={`order-customer-${order.id}`}>{order.customerName}</td>
                    <td>{order.items.length}</td>
                    <td data-testid={`order-items-count-${order.id}`}>{order.totalItems}</td>
                    <td className="fw-700" data-testid={`order-total-${order.id}`}>${order.totalAmount.toFixed(2)}</td>
                    <td><span className="badge badge-green" data-testid={`order-status-${order.id}`}>{order.status}</span></td>
                    <td className="muted" style={{ fontSize: '0.82rem' }} data-testid={`order-time-${order.id}`}>
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm" data-testid={`view-order-details-link-${order.id}`}>
                        Details <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
