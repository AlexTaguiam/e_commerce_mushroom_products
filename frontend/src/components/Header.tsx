import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut, LayoutDashboard, ShoppingCart, Package } from "lucide-react";
import { useAuth } from "../context/authContext";

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 text-emerald-400 font-bold text-lg hover:opacity-90 transition">
          <ShoppingBag className="w-6 h-6 text-emerald-400" />
          <span>B&J Mushroom Products</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-emerald-400 transition">
            Catalog
          </Link>
          <Link to="/cart" className="hover:text-emerald-400 transition flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" />
            Cart
          </Link>
          <Link to="/orders" className="hover:text-emerald-400 transition flex items-center gap-1">
            <Package className="w-4 h-4" />
            My Orders
          </Link>

          {role === "admin" && (
            <Link
              to="/admin/dashboard"
              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md hover:bg-emerald-500/20 transition flex items-center gap-1 text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-900/50 px-3 py-1.5 rounded-md transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-1.5 rounded-md transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-3 py-1.5 rounded-md transition text-xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
