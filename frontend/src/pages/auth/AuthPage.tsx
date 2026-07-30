import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  HelpCircle,
  Coins,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Truck,
  Percent,
  Zap,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Form variant animation config
// ---------------------------------------------------------------------------
const formVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  animate: (_direction: number) => ({
    opacity: 1,
    x: 0,
    // direction unused here but keeping the signature consistent
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      className="h-5 w-5 text-[#1877F2] fill-current shrink-0"
      viewBox="0 0 24 24"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="flex text-[#4c6a46] items-center justify-center gap-2.5 h-12 px-4 border border-gray-200 bg-white rounded-full text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className="flex text-[#4c6a46] items-center justify-center gap-2.5 h-12 px-4 border border-gray-200 bg-white rounded-full text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
      >
        <FacebookIcon />
        Facebook
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative flex items-center justify-center py-2">
      <div className="w-full border-t border-gray-200" />
      <span className="absolute bg-white px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
        OR
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------
interface LoginFormProps {
  onSwitch: () => void;
}

function LoginForm({ onSwitch }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    console.log("Login Request Data:", Object.fromEntries(formData));
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-3xl lg:text-4xl font-serif font-bold tracking-tight text-[#2d4029]">
          Sign in to
          <br />
          Mushroom Harvest
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#4c6a46] hover:underline underline-offset-4 font-semibold"
          >
            Register now
          </button>
        </p>
      </div>

      {/* Fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="example@mushroomharvest.com"
              className="w-full h-12 pl-12 pr-4 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember / Forgot */}
        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-600">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-[#4c6a46] border-gray-300 accent-[#4c6a46]"
            />
            Remember me
          </label>
          <a href="#" className="text-[#4c6a46] hover:underline font-semibold">
            Forgot Password?
          </a>
        </div>

        <Button
          disabled={isLoading}
          className="w-full h-12 rounded-full text-base font-semibold tracking-wide shadow-md shadow-[#4c6a46]/10 transition-transform active:scale-[0.99]"
        >
          {isLoading ? "Verifying..." : "Sign in"}
        </Button>
      </form>

      <Divider />
      <SocialButtons />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Register Form
// ---------------------------------------------------------------------------
interface RegisterFormProps {
  onSwitch: () => void;
}

interface RegisterPayload {
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  password?: string;
}

function RegisterForm({ onSwitch }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload: RegisterPayload = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: (formData.get("name") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
    };
    console.log("Registration Payload Generated:", payload);
    setTimeout(() => setIsLoading(false), 1200);
  };

  const inputClass =
    "w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-[#2d4029]">
          Create Account
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-[#4c6a46] hover:underline underline-offset-4 font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-name"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              placeholder="Juan Dela Cruz"
              className={inputClass}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-email"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              placeholder="example@mushroomharvest.com"
              className={inputClass}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-phone"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Phone Number{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              placeholder="0912 345 6789"
              className={inputClass}
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-address"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Delivery Address{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="reg-address"
              name="address"
              type="text"
              placeholder="Street, Barangay, City/Municipality"
              className={inputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-password"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="reg-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="reg-confirm-password"
            className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="reg-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 pt-1">
          <div className="relative flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="peer sr-only"
            />
            <div
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                agreedToTerms
                  ? "bg-[#4c6a46] border-[#4c6a46] text-white"
                  : "border-gray-300 bg-white hover:border-[#4c6a46]"
              }`}
            >
              {agreedToTerms && <Check className="w-3.5 h-3.5 stroke-3" />}
            </div>
          </div>
          <label
            htmlFor="terms"
            className="text-xs font-medium text-gray-600 leading-tight cursor-pointer select-none"
          >
            I agree to the{" "}
            <a
              href="#"
              className="text-[#4c6a46] font-bold hover:underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#4c6a46] font-bold hover:underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <Button
          disabled={isLoading}
          className="w-full h-12 rounded-full text-base font-semibold tracking-wide shadow-md shadow-[#4c6a46]/10 transition-all active:scale-[0.99] mt-1"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <Divider />
      <SocialButtons />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left Brand Panel — Login variant
// ---------------------------------------------------------------------------
function LoginBrandPanel() {
  return (
    <div className="flex w-full h-full bg-[#243e27] p-12 lg:p-20 flex-col justify-between relative text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-linear-to-b from-[#2d4d30] to-transparent rounded-full blur-3xl opacity-40 transform translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-12 right-12 text-[#2d4d30]/30 pointer-events-none">
        <Sparkles className="w-24 h-24 stroke-1" />
      </div>

      {/* Support link */}
      <div className="flex justify-end relative z-10">
        <a
          href="#"
          className="flex items-center gap-2 text-sm font-semibold opacity-90 hover:opacity-100 transition-opacity bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
        >
          <HelpCircle className="w-4 h-4" />
          Support
        </a>
      </div>

      {/* Feature card */}
      <div className="max-w-md my-auto space-y-12 relative z-10">
        <div className="bg-white rounded-3xl p-8 text-[#333333] shadow-2xl relative">
          <div className="space-y-3 w-[65%]">
            <h3 className="text-2xl font-serif font-bold text-[#2d4029] leading-tight">
              Unlock exclusive farm-fresh offers
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Use your custom farm token identity across our network to balance
              orders, collect harvests, and monitor digital production queues
              effortlessly.
            </p>
          </div>
          <button
            type="button"
            className="mt-6 bg-[#e3d7c3] hover:bg-[#d5c7b1] text-[#2d4029] font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
          >
            Learn more
          </button>

          {/* Membership card */}
          <div className="absolute -right-6 top-6 w-52 h-32 bg-[#e8e5da] border border-white/60 rounded-xl p-4 shadow-xl transform rotate-6 flex flex-col justify-between text-[#2d4029]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                Harvest Pass
              </span>
              <CreditCard className="w-5 h-5 opacity-80" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono tracking-wider font-bold">
                XXXX XXXX 4120
              </div>
              <div className="flex justify-between text-[8px] font-semibold uppercase opacity-60">
                <span>Gold Member</span>
                <span>Exp 12/28</span>
              </div>
            </div>
          </div>

          {/* Credits badge */}
          <div className="absolute right-4 -bottom-5 bg-white border border-gray-100 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 transform -rotate-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <Coins className="w-4 h-4 fill-amber-500/20" />
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                Farm Credits
              </div>
              <div className="text-sm font-mono font-black text-[#2d4029] leading-none mt-0.5">
                120.50
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h4 className="text-xl font-serif font-bold tracking-wide text-white">
            Discover new mushroom varieties & grow kits
          </h4>
          <p className="text-sm text-gray-300 font-medium leading-relaxed max-w-sm">
            Explore our laboratory additions, including specialized culinary
            strains and digital automation tools customized to orchestrate
            seamless farm-to-table delivery parameters.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <span className="w-5 h-1.5 bg-white rounded-full" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/70 cursor-pointer" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/70 cursor-pointer" />
          <span className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/70 cursor-pointer" />
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left Brand Panel — Register variant
// ---------------------------------------------------------------------------
function RegisterBrandPanel() {
  return (
    <div className="flex w-full h-full bg-[#243e27] p-12 lg:p-16 flex-col justify-between relative text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-md h-112 bg-linear-to-br from-[#2d4d30] to-transparent rounded-full blur-3xl opacity-40 transform -translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-linear-to-tl from-[#1b301e] to-transparent rounded-full blur-3xl opacity-30 transform translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/3 right-12 text-[#2d4d30]/30 pointer-events-none">
        <Sparkles className="w-20 h-20 stroke-1" />
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-[#4c6a46] rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-serif text-xl font-bold">M</span>
        </div>
        <span className="font-serif font-bold text-xl text-white tracking-wide">
          Mushroom Harvest
        </span>
      </div>

      {/* Marketing content */}
      <div className="my-auto space-y-10 relative z-10 max-w-lg">
        <div className="space-y-4">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-wide leading-tight text-white">
            Start Your Journey with <br /> Mushroom Harvest
          </h1>
          <p className="text-sm text-gray-300 font-medium leading-relaxed">
            Create an account to purchase premium mushroom products, save
            delivery addresses, track orders, and receive exclusive rewards.
          </p>
        </div>

        {/* Benefits card */}
        <div className="bg-white rounded-2xl p-6 text-[#333333] shadow-xl border border-white/10 max-w-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#4c6a46]" />
            <h3 className="text-lg font-serif font-bold text-[#2d4029]">
              Member Benefits
            </h3>
          </div>
          <ul className="space-y-3 text-xs font-medium text-gray-600">
            {[
              {
                icon: <ShieldCheck className="w-4 h-4" />,
                label: "Secure Account Protection",
              },
              {
                icon: <Truck className="w-4 h-4" />,
                label: "Real-time Order Tracking",
              },
              {
                icon: <Percent className="w-4 h-4" />,
                label: "Exclusive Subscriber Discounts",
              },
              {
                icon: <Coins className="w-4 h-4" />,
                label: "Earn Reward Points on Orders",
              },
              {
                icon: <Zap className="w-4 h-4" />,
                label: "Faster One-Click Checkout",
              },
            ].map(({ icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#f0eee4] flex items-center justify-center text-[#4c6a46]">
                  {icon}
                </div>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-sm text-gray-400 font-medium max-w-sm relative z-10">
        Join thousands of culinary chefs and home cooks choosing premium,
        farm-to-table delivery parameters.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AuthPage
// ---------------------------------------------------------------------------
export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive initial state from the current path
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  // Direction: +1 = going to register, -1 = going to login
  const [direction, setDirection] = useState(1);

  const switchToRegister = () => {
    setDirection(1);
    setIsLogin(false);
    navigate("/register", { replace: true });
  };

  const switchToLogin = () => {
    setDirection(-1);
    setIsLogin(true);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f2efe8] flex items-center justify-center p-4 lg:p-8 font-sans antialiased select-none">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* ── Brand Panel (left) — crossfades between Login / Register variants ── */}
        <div
          className="hidden md:flex md:self-stretch relative"
          style={{ width: "55%" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.div
                key="brand-login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="absolute inset-0"
              >
                <LoginBrandPanel />
              </motion.div>
            ) : (
              <motion.div
                key="brand-register"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="absolute inset-0"
              >
                <RegisterBrandPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Form Panel (right) — layout-animates height, content crossfades ── */}
        <div className="w-full md:w-[45%] bg-[#faf8f4] flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
          {/* Brand header (mobile only) */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <div className="w-10 h-10 bg-[#4c6a46] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-serif text-xl font-bold">M</span>
            </div>
            <span className="font-serif font-bold text-xl text-[#2d4029] tracking-wide">
              Mushroom Harvest
            </span>
          </div>

          {/*
            motion.div with `layout` prop — this is the core trick.
            When the inner content changes height (login → register), Framer Motion
            smoothly interpolates the container height instead of snapping.
            overflow-hidden clips any content that protrudes during the transition.
          */}
          <motion.div
            layout
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {isLogin ? (
                <motion.div
                  key="login-form"
                  custom={direction}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <LoginForm onSwitch={switchToRegister} />
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  custom={direction}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <RegisterForm onSwitch={switchToLogin} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
