import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// --- Page Component Imports (Placeholders - Swap with your real page views) ---
const Login = () => <div className="p-8 text-white">Login Page</div>;
const Register = () => <div className="p-8 text-white">Register Page</div>;
const Catalog = () => <div className="p-8 text-teal-400">Store Catalog</div>;
const Cart = () => <div className="p-8 text-white">Shopping Cart</div>;
const AdminDashboard = () => (
  <div className="p-8 text-amber-500">Admin Dashboard</div>
);
const AdminInventory = () => (
  <div className="p-8 text-white">Inventory Records</div>
);

// --- Admin Sidebar Layout Shell ---
const AdminLayout = () => (
  <div className="flex min-h-screen bg-slate-950 text-slate-100">
    <aside className="w-64 border-r border-slate-900 bg-slate-900/40 p-6">
      <h2 className="text-lg font-bold text-slate-200 tracking-tight">
        Control Panel
      </h2>
      {/* Sidebar navigation links go here */}
    </aside>
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  </div>
);

// 🔓 1. Public Fragment
const publicRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
);

// 🔒 2. Customer Fragment
const customerRoutes = (
  <>
    <Route path="/" element={<Catalog />} />
    <Route path="/cart" element={<Cart />} />
  </>
);

// 🔒 3. Admin Fragment (Wrapped in its structural Sidebar layout)
const adminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/admin/inventory" element={<AdminInventory />} />
  </Route>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Entry Portals */}
      {publicRoutes}

      {/* Customer Perimeter */}
      <Route element={<ProtectedRoute allowedRoles={["customer", "admin"]} />}>
        {customerRoutes}
      </Route>

      {/* Administrative Perimeter */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        {adminRoutes}
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
