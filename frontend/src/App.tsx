import { useLayoutEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AppRouter } from "./routes/AppRouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import { killAllScrollTriggers } from "./utils/scrollTriggerCleanup";
import { CartProvider } from "./context/CartProvider";
import { RateLimitProvider } from "./context/rateLimitProvider";
import { RateLimitNotice } from "./components/RateLimitNotice";

function AppShell() {
  const location = useLocation();

  // Kill pinned ScrollTriggers synchronously before React unmounts the old page.
  // useLayoutEffect cleanup runs in the layout phase (before paint), not after unmount like useEffect.
  useLayoutEffect(() => {
    return () => {
      killAllScrollTriggers();
    };
  }, [location.pathname]);

  // Dynamic Layout Rule Engine
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute =
    location.pathname.startsWith("/auth") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const hideGlobalLayout = isAdminRoute || isAuthRoute;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30">
      {/* Customer layout maps globally if not structural or administrative page */}
      {!hideGlobalLayout && <Navbar />}

      <div className="flex-1 flex flex-col">
        <AppRouter />
      </div>

      {!hideGlobalLayout && <Footer />}

      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />

      <RateLimitNotice />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RateLimitProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </RateLimitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
