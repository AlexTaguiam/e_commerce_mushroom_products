import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

import AuthPage from "../pages/auth/AuthPage";

import CatalogPage from "../pages/customer/CatalogPage";
import CartPage from "../pages/customer/CartPage";
import CheckoutPage from "../pages/customer/CheckoutPage";
import ProductDetailPage from "../pages/customer/ProductDetailPage";
import OrderHistoryPage from "../pages/customer/OrderHistoryPage";

import DashboardPage from "../pages/admin/DashboardPage";
import InventoryPage from "../pages/admin/InventoryPage";
import OrderManagerPage from "../pages/admin/OrderManagerPage";
import AuditLogsPage from "../pages/admin/AuditLogsPage";
import BatchTrackerPage from "../pages/admin/BatchTrackerPage";
import ContactPage from "@/pages/customer/ContactPage";

const AdminLayout = () => (
  <div className="flex min-h-screen bg-slate-950 text-slate-100">
    <aside className="w-64 border-r border-slate-900 bg-slate-900/40 p-6">
      <h2 className="text-lg font-bold text-slate-200 tracking-tight">
        Control Panel
      </h2>
    </aside>
    <main className="flex-1 p-8">
      <Outlet />
    </main>
  </div>
);

const publicRoutes = (
  <>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
  </>
);

const customerRoutes = (
  <>
    <Route path="/" element={<CatalogPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/orders" element={<OrderHistoryPage />} />
    <Route path="/products/:productId" element={<ProductDetailPage />} />
    <Route path="/contact" element={<ContactPage />} />
  </>
);

const adminRoutes = (
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/dashboard" element={<DashboardPage />} />
    <Route path="/admin/inventory" element={<InventoryPage />} />
    <Route path="/admin/orders" element={<OrderManagerPage />} />
    <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
    <Route path="/admin/batches" element={<BatchTrackerPage />} />
  </Route>
);

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {publicRoutes}

      <Route element={<ProtectedRoute allowedRoles={["customer", "admin"]} />}>
        {customerRoutes}
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        {adminRoutes}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
