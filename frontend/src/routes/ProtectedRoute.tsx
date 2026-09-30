import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface GuardProps {
  allowedRoles: Array<"admin" | "customer">;
}

export const ProtectedRoute: React.FC<GuardProps> = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-teal-500" />
          <p className="text-xs tracking-wide">Validating permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve the page they tried to visit so AuthPage can redirect back after login
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <Navigate to={role === "admin" ? "/admin/dashboard" : "/"} replace />
    );
  }

  return <Outlet />;
};
