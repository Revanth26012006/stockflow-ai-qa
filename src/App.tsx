import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';

// Guard that redirects unauthenticated users to /login
const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => (
  <div className="app-wrap">
    <Navbar />
    <Routes>
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/dashboard"    element={<Protected><DashboardPage /></Protected>} />
      <Route path="/products"     element={<Protected><ProductsPage /></Protected>} />
      <Route path="/create-order" element={<Protected><CreateOrderPage /></Protected>} />
      <Route path="/orders"       element={<Protected><OrdersPage /></Protected>} />
      <Route path="/orders/:orderId" element={<Protected><OrderDetailsPage /></Protected>} />
      <Route path="*"             element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </div>
);

const App: React.FC = () => (
  <AuthProvider>
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  </AuthProvider>
);

export default App;
