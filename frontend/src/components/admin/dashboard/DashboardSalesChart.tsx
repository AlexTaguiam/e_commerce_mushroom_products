import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function DashboardSalesChart() {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "1Y">("30D");

  // SVG Area chart path mock points
  const points = [
    { label: "Jan", val: 60 },
    { label: "Feb", val: 45 },
    { label: "Mar", val: 35 },
    { label: "Apr", val: 60 },
    { label: "May", val: 52 },
    { label: "Jun", val: 85 },
    { label: "Jul", val: 70 },
    { label: "Aug", val: 95 },
  ];

  return (
    <div className="bg-white border border-[#e5dfd3] rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-[#2d4029]">
              Revenue Overview
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e2ebe0] text-[#4c6a46] border border-[#c3d6c0]">
              Live
            </span>
          </div>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Gross store transactions & subscription renewals
          </p>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center bg-[#faf8f4] border border-[#e5dfd3] rounded-xl p-1 self-start sm:self-auto">
          {(["7D", "30D", "1Y"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeframe === t
                  ? "bg-[#4c6a46] text-white shadow-sm"
                  : "text-stone-500 hover:text-[#2d4029]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Responsive Area Chart Visualization */}
      <div className="relative w-full h-56 pt-4">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 500 150"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4c6a46" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4c6a46" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1="30"
            x2="500"
            y2="30"
            stroke="#f0ebe1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="75"
            x2="500"
            y2="75"
            stroke="#f0ebe1"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="120"
            x2="500"
            y2="120"
            stroke="#f0ebe1"
            strokeDasharray="4 4"
          />

          {/* Area Fill */}
          <path
            d="M 0,130 Q 60,110 120,90 T 240,40 T 360,70 T 500,20 L 500,150 L 0,150 Z"
            fill="url(#chartGradient)"
          />

          {/* Smooth Trend Line */}
          <path
            d="M 0,130 Q 60,110 120,90 T 240,40 T 360,70 T 500,20"
            fill="none"
            stroke="#4c6a46"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Key Metric Marker Point */}
          <circle
            cx="360"
            cy="70"
            r="5"
            fill="#2d4029"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>

        {/* Floating Tooltip Mock */}
        <div className="absolute top-[32%] left-[68%] -translate-x-1/2 -translate-y-full bg-[#2d4029] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md border border-[#4c6a46] flex items-center gap-1">
          <span>₱8,920.00</span>
          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-stone-400 pt-2 border-t border-[#f0ebe1]">
        {points.map((p, idx) => (
          <span key={idx}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}
