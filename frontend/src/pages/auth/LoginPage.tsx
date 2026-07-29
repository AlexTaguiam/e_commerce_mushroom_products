import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  Coins,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    console.log("Login Request Data:", Object.fromEntries(formData));
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#f2efe8] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl min-h-180 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT PANE: RESPONSIVE INTERACTIVE LOGIN FORM */}
        <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-[#faf8f4]">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4c6a46] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-serif text-xl font-bold">M</span>
            </div>
            <span className="font-serif font-bold text-xl text-[#2d4029] tracking-wide">
              Mushroom Harvest
            </span>
          </div>

          {/* Core Form Area */}
          <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#2d4029]">
                Sign in to
                <br />
                Mushroom Harvest
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-[#4c6a46] hover:underline underline-offset-4 font-semibold "
                >
                  Register now
                </a>
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email Field Block */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="example@mushroomharvest.com"
                    className="w-full h-12 pl-12 pr-4 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#4c6a46] focus:ring-2 focus:ring-[#4c6a46]/20 transition-all shadow-sm placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Password Field Block */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-bold tracking-wider uppercase text-gray-600 block"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
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

              {/* Option Flags */}
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-600">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-[#4c6a46] border-gray-300 focus:ring-[#4c6a46] accent-[#4c6a46]"
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-[#4c6a46] hover:underline font-semibold"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submissions Control */}
              <Button
                disabled={isLoading}
                className="w-full h-12 rounded-full text-base font-semibold tracking-wide shadow-md shadow-[#4c6a46]/10 transition-transform active:scale-[0.99]"
              >
                {isLoading ? "Verifying..." : "Sign in"}
              </Button>
            </form>

            {/* Separation Break */}
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full border-t border-gray-200" />
              <span className="absolute bg-[#ffff] px-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
                OR
              </span>
            </div>

            {/* Social Authentications Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex text-[#4c6a46] items-center justify-center gap-3 h-12 px-4 border border-gray-200 bg-white rounded-full text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
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
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex  text-[#4c6a46] items-center justify-center gap-3 h-12 px-4 border border-gray-200 bg-white rounded-full text-sm font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
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

        {/* RIGHT PANE: BRAND ILLUSTRATION & LOYALTY CARD DISPLAY */}
        <div className="hidden md:flex w-[50%] lg:w-[55%] bg-[#243e27] p-12 lg:p-20 flex-col justify-between relative text-white overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-125 h-125 bg-linear-to-b from-[#2d4d30] to-transparent rounded-full blur-3xl opacity-40 transform translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-12 right-12 text-[#2d4d30]/30 pointer-events-none">
            <Sparkles className="w-24 h-24 stroke-1" />
          </div>

          {/* Global Support Navigation Link */}
          <div className="flex justify-end relative z-10">
            <a
              href="#"
              className="flex items-center gap-2 text-sm font-semibold opacity-90 hover:opacity-100 transition-opacity bg-white/10 px-4 py-2 rounded-full backdrop-blur-md"
            >
              <HelpCircle className="w-4 h-4" />
              Support
            </a>
          </div>

          {/* Dynamic Marketing Feature Card Component */}
          <div className="max-w-md my-auto space-y-12 relative z-10">
            {/* Main Floating Presentation Box */}
            <div className="bg-white rounded-3xl p-8 text-[#333333] shadow-2xl relative">
              <div className="space-y-3 w-[65%]">
                <h3 className="text-2xl font-serif font-bold text-[#2d4029] leading-tight">
                  Unlock exclusive farm-fresh offers
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Use your custom farm token identity across our network to
                  balance orders, collect harvests, and monitor digital
                  production queues effortlessly.
                </p>
              </div>

              <button
                type="button"
                className="mt-6 bg-[#e3d7c3] hover:bg-[#d5c7b1] text-[#2d4029] font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
              >
                Learn more
              </button>

              {/* Overlapping CSS Structural Membership Card */}
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

              {/* Micro Badge Element */}
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

            {/* Bottom Brand Narrative Copy */}
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

            {/* Simple Slide Pagers Layout */}
            <div className="flex items-center gap-2 pt-2">
              <span className="w-5 h-1.5 bg-white rounded-full transition-all" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/70 cursor-pointer" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/70 cursor-pointer" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full hover:bg-white/70 cursor-pointer" />
            </div>
          </div>

          {/* Empty placeholder spacer matching template layouts */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
