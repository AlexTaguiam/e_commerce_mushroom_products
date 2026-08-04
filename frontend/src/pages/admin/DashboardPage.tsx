import { DashboardKpiGrid } from "@/components/admin/dashboard/DashboardKpiGrid";
import { DashboardSalesChart } from "@/components/admin/dashboard/DashboardSalesChart";
import { DashboardRecentOrders } from "@/components/admin/dashboard/DashboardRecentOrders";
import { DashboardStatusDonut } from "@/components/admin/dashboard/DashboardStatusDonut";
import { DashboardAlertsBanner } from "@/components/admin/dashboard/DashboardAlertsBanner";

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
          Store Overview
        </h1>
        <p className="text-xs text-stone-500 font-medium mt-1">
          Monitor revenue metrics, active orders, and batch operations.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <DashboardKpiGrid />

      {/* Main Grid Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analytics Chart & Orders Table */}
        <div className="lg:col-span-8 space-y-6">
          <DashboardSalesChart />
          <DashboardRecentOrders />
        </div>

        {/* Right Column: Breakdown Donut & Action Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <DashboardStatusDonut />
          <DashboardAlertsBanner />
        </div>
      </div>
    </div>
  );
}
