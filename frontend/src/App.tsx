import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AppRouter } from "./routes/AppRouter";

// --- Core UI Shared Layout Elements ---
const Navbar = () => (
  <nav className="bg-slate-900 p-4 border-b border-slate-800 text-teal-400">
    Store Navbar
  </nav>
);
const Footer = () => (
  <footer className="bg-slate-900 p-4 border-t border-slate-800 text-slate-500 text-center text-xs">
    Store Footer
  </footer>
);
const Toaster = () => (
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
      <Toaster />

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
