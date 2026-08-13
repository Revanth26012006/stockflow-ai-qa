import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, seedProducts } from '../services/inventoryService';
import { Product } from '../types';
import { useToast } from '../components/Toast';
import { Search, RefreshCw, Plus } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [seeding,  setSeeding]  = useState(false);

  // Load products from Firestore on mount
  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
    } catch (err) {
      showToast('Failed to load products', String(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedProducts();
      await fetchProducts();
      showToast('Catalog seeded', 'Products saved to Firestore database.', 'success');
    } catch (err) {
      showToast('Seed failed', String(err), 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Filter by name or SKU search string
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  // Helper: badge type based on stock level
  const stockBadge = (stock: number) => {
    if (stock === 0)    return <span className="badge badge-red"   data-testid="stock-badge-out">Out of Stock</span>;
    if (stock <= 10)    return <span className="badge badge-amber" data-testid="stock-badge-low">Low — {stock}</span>;
    return                     <span className="badge badge-green" data-testid="stock-badge-in">In Stock</span>;
  };

  return (
    <div className="page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" data-testid="products-title">Product Inventory</h1>
          <p className="page-subtitle">All catalog items with live Firestore stock levels</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding} data-testid="seed-products-page-btn">
            <RefreshCw size={15} className={seeding ? 'spin' : ''} />
            {seeding ? 'Seeding...' : 'Seed Catalog'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/create-order')} data-testid="create-order-from-products-btn">
            <Plus size={16} />
            Create Order
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by product name or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="product-search-input"
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-faint)' }} />
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p className="muted" style={{ padding: '2rem' }}>Loading inventory from Firestore…</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Try seeding the catalog or changing your search.</p>
            <button className="btn btn-secondary" onClick={handleSeed}>Seed Sample Catalog</button>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="table" data-testid="products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} data-testid={`product-row-${product.id}`}>
                    <td>
                      <div className="fw-700" data-testid={`product-name-${product.id}`}>{product.name}</div>
                      {product.description && <div className="faint" style={{ fontSize: '0.78rem', marginTop: 2 }}>{product.description}</div>}
                    </td>
                    <td className="mono muted" data-testid={`product-sku-${product.id}`}>{product.sku}</td>
                    <td><span className="badge badge-purple">{product.category || 'General'}</span></td>
                    <td className="fw-700" data-testid={`product-price-${product.id}`}>${product.price.toFixed(2)}</td>
                    <td className="fw-700" data-testid={`product-stock-${product.id}`}>{product.availableStock}</td>
                    <td>{stockBadge(product.availableStock)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={product.availableStock === 0}
                        onClick={() => navigate('/create-order', { state: { preselectProductId: product.id } })}
                        data-testid={`add-to-order-btn-${product.id}`}
                      >
                        <Plus size={14} /> Add to Order
                      </button>
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
