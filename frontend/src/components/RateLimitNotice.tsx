import React from "react";
import { useRateLimit } from "../context/RateLimitContext";

export const RateLimitNotice: React.FC = () => {
  const { isRateLimited, retryAfter } = useRateLimit();

  if (!isRateLimited) return null;

  // Format seconds into MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/20 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-rose-950/40 backdrop-blur-xl">
        {/* Glowing Background Accent */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          {/* Animated Warning Icon */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 shadow-inner">
            <span className="absolute inset-0 rounded-2xl bg-rose-500/20 animate-ping opacity-25" />
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Too Many Requests
          </h2>

          {/* Subtext */}
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            You've made too many requests in a short period. Please wait a
            moment while your access cools down.
          </p>

          {/* Countdown Display Box */}
          <div className="mt-6 w-full rounded-xl bg-slate-950/60 border border-slate-800/80 p-4 shadow-inner">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Cooldown Remaining
            </span>
            <div className="mt-1 text-3xl font-mono font-bold tracking-widest text-rose-400">
              {formatTime(retryAfter)}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Requests temporarily paused</span>
          </div>
        </div>
      </div>
    </div>
  );
};
