import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, LayoutDashboard, PackagePlus, ShoppingBag, LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Brand Logo */}
        <NavLink to="/dashboard" className="brand" data-testid="brand-logo">
          <div className="brand-mark"><Boxes size={20} /></div>
          <span>StockFlow</span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="nav-dashboard">
            <LayoutDashboard size={16} /><span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="nav-products">
            <Boxes size={16} /><span>Products</span>
          </NavLink>
          <NavLink to="/create-order" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="nav-create-order">
            <PackagePlus size={16} /><span>Create Order</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} data-testid="nav-orders">
            <ShoppingBag size={16} /><span>Orders</span>
          </NavLink>
        </nav>

        {/* User Info + Logout */}
        <div className="user-section">
          <User size={14} />
          <span data-testid="user-email">{user.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} data-testid="logout-btn">
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </header>
  );
};
