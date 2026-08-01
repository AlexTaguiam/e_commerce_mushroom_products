import { useLayoutEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AppRouter } from "./routes/AppRouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import { killAllScrollTriggers } from "./utils/scrollTriggerCleanup";
const Toast = () => (
  <div className="fixed bottom-4 right-4 z-50 pointer-events-none" />
); // Toast notification mounting root
const RateLimitNotice = ({ retryAfter }: { retryAfter: number }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md text-white p-6">
    <div className="bg-slate-950 border border-red-900 p-6 rounded-xl max-w-sm text-center">
      <h3 className="text-red-500 font-bold text-lg">Too Many Requests</h3>
      <p className="text-sm text-slate-400 mt-2">
        Please wait {retryAfter} seconds before trying again.
      </p>
    </div>
  </div>
);

// --- Mock Error Context (Swap with your real application error tracking hook) ---
const useErrorContext = () => ({
  error: null as { code: string; retryAfter: number } | null,
});

function AppShell() {
  const location = useLocation();
  const { error } = useErrorContext();

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
      <Toast />
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "12px",
          },
        }}
      />

      {/* Network rate limit overlay modal guard */}
      {error?.code === "RATE_LIMIT" && (
        <RateLimitNotice retryAfter={error.retryAfter} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
