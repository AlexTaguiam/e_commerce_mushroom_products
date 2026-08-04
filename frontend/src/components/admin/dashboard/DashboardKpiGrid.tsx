import React from "react";
import {
  PhilippinePeso,
  ShoppingBag,
  Clock,
  Sprout,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface KpiItem {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  accentBg: string;
  iconColor: string;
  borderColor: string;
}

export function DashboardKpiGrid() {
  const kpis: KpiItem[] = [
    {
      title: "Total Revenue",
      value: "₱59,540.00",
      change: "+12.5%",
      isPositive: true,
      icon: PhilippinePeso,
      accentBg: "bg-[#e2ebe0]",
      iconColor: "text-[#4c6a46]",
      borderColor: "border-[#c3d6c0]",
    },
    {
      title: "Total Orders",
      value: "1,284",
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingBag,
      accentBg: "bg-stone-100",
      iconColor: "text-stone-700",
      borderColor: "border-stone-200",
    },
    {
      title: "Pending Orders",
      value: "14",
      change: "-3.1%",
      isPositive: false,
      icon: Clock,
      accentBg: "bg-amber-50",
      iconColor: "text-amber-700",
      borderColor: "border-amber-200",
    },
    {
      title: "Active Cultivations",
      value: "84 Batches",
      change: "+15.4%",
      isPositive: true,
      icon: Sprout,
      accentBg: "bg-emerald-50",
      iconColor: "text-emerald-800",
      borderColor: "border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-[#e5dfd3] rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                {kpi.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${kpi.accentBg} border ${kpi.borderColor} flex items-center justify-center ${kpi.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <div className="font-serif font-bold text-2xl text-[#2d4029]">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {kpi.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span
                  className={`text-xs font-bold ${
                    kpi.isPositive ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  vs last month
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
