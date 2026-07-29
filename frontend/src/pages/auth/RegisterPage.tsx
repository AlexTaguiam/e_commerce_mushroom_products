import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Truck,
  Percent,
  Coins,
  Zap,
  Check,
} from "lucide-react";

interface RegisterPayload {
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  password?: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const handleGoogleAuth = () => console.log("Registering via Google...");
  const handleFacebookAuth = () => console.log("Registering via Facebook...");

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    // Transform empty optional string inputs into explicit null values
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

  return (
    <div className="min-h-screen w-full bg-[#f7f5f0] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans antialiased select-none">
      {/* ROOT LAYOUT CONTAINER */}
      <div className="w-full max-w-350 min-h-[85vh] lg:min-h-220 bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* LEFT PANEL: MARKETING / BRANDING SECTION (55%) */}
        <div className="hidden md:flex w-[55%] bg-[#243e27] p-8 lg:p-16 flex-col justify-between relative text-white overflow-hidden">
          {/* Subtle Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-112.5 h-112.5 bg-linear-to-br from-[#2d4d30] to-transparent rounded-full blur-3xl opacity-40 transform -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-87.5 h-87.5 bg-linear-to-tl from-[#1b301e] to-transparent rounded-full blur-3xl opacity-30 transform translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/3 right-12 text-[#2d4d30]/30 pointer-events-none">
            <Sparkles className="w-20 h-20 stroke-1" />
          </div>

          {/* Brand Header */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-[#4c6a46] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-serif text-xl font-bold">M</span>
            </div>
            <span className="font-serif font-bold text-xl text-white tracking-wide">
              Mushroom Harvest
            </span>
          </div>

          {/* Dynamic Marketing Feature Section */}
          <div className="my-auto space-y-10 relative z-10 max-w-lg">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-wide leading-tight text-white">
                Start Your Journey with <br />
                Mushroom Harvest
              </h1>
              <p className="text-sm text-gray-300 font-medium leading-relaxed">
                Create an account to purchase premium mushroom products, save
                delivery addresses, track orders, and receive exclusive rewards.
              </p>
            </div>

            {/* Floating Premium "Member Benefits" Card */}
            <div className="bg-white rounded-2xl p-6 text-[#333333] shadow-xl relative border border-white/10 max-w-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#4c6a46]" />
                <h3 className="text-lg font-serif font-bold text-[#2d4029]">
                  Member Benefits
                </h3>
              </div>

              <ul className="space-y-3 text-xs font-medium text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#f0eee4] flex items-center justify-center text-[#4c6a46]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Secure Account Protection</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#f0eee4] flex items-center justify-center text-[#4c6a46]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span>Real-time Order Tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#f0eee4] flex items-center justify-center text-[#4c6a46]">
                    <Percent className="w-4 h-4" />
                  </div>
                  <span>Exclusive Subscriber Discounts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#f0eee4] flex items-center justify-center text-[#4c6a46]">
                    <Coins className="w-4 h-4" />
                  </div>
                  <span>Earn Reward Points on Orders</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#f0eee4] flex items-center justify-center text-[#4c6a46]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>Faster One-Click Checkout</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Brand Narrative Narrative */}
          <div className="text-sm text-gray-400 font-medium max-w-sm relative z-10">
            Join thousands of culinary chefs and home cooks choosing premium,
            farm-to-table delivery parameters.
          </div>
        </div>

        {/* RIGHT PANEL: REGISTRATION CONTAINER SECTION (45%) */}
        <div className="w-full md:w-[45%] bg-[#faf8f4] flex flex-col justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
          {/* REGISTRATION FORM CARD CONTAINER */}
          <div className="w-full max-w-130 mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6 my-4">
            {/* Header Block */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-3xl font-serif font-bold tracking-tight text-[#2d4029]">
                Create Account
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#4c6a46] hover:underline underline-offset-4 font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Registration Input Form Fields */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 1. Full Name Field (Required) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Juan Dela Cruz"
                    className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* 2. Email Field (Required) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="example@mushroomharvest.com"
                    className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* 3. Phone Number Field (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Phone Number{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0912 345 6789"
                    className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* 4. Address Field (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="address"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Delivery Address{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Street, Barangay, City/Municipality"
                    className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* 5. Password Field (Required) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
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

              {/* 6. Confirm Password Field (Required) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
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

              {/* Terms and Conditions Checkbox (shadcn Custom Style Emulation) */}
              <div className="flex items-start gap-3 pt-2">
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
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shadow-sm
                      ${
                        agreedToTerms
                          ? "bg-[#4c6a46] border-[#4c6a46] text-white"
                          : "border-gray-300 bg-white hover:border-[#4c6a46]"
                      }`}
                  >
                    {agreedToTerms && (
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    )}
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

              {/* Form Actions Submissions Button */}
              <Button
                disabled={isLoading}
                className="w-full h-12 rounded-full text-base font-semibold tracking-wide shadow-md shadow-[#4c6a46]/10 transition-all active:scale-[0.99] mt-2"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Layout Center Section Divider Block */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-gray-200" />
              <span className="absolute bg-white px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                OR
              </span>
            </div>

            {/* Social Logins Header Context */}
            <div className="text-center space-y-3">
              <span className="text-xs font-bold tracking-wider text-gray-400 uppercase block">
                Continue with
              </span>

              {/* Responsive Grid Setup: Desktop 2 Cols, Mobile Stacks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="flex text-[#4c6a46] items-center justify-center gap-3 h-12 px-4 border border-gray-200 bg-white rounded-full text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm w-full"
                >
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
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleFacebookAuth}
                  className="flex text-[#4c6a46] items-center justify-center gap-3 h-12 px-4 border border-gray-200 bg-white rounded-full text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm w-full"
                >
                  <svg
                    className="h-5 w-5 text-[#1877F2] fill-current shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
