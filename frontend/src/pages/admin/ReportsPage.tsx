import { useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadSalesXlsx,
  getBestSellingProducts,
  getCustomerPurchaseSummary,
  getSalesSummary,
  getSalesTrends,
  type BestSellingProduct,
  type CustomerPurchase,
  type ReportRange,
  type SalesSummary,
  type SalesTrend,
} from "@/services/report.service";

type RangePreset = "week" | "month" | "lastMonth" | "quarter" | "custom";

const pad = (value: number) => String(value).padStart(2, "0");
const dateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function getPresetRange(preset: Exclude<RangePreset, "custom">): ReportRange {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  let from = start;
  let to = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);

  if (preset === "week") {
    from = new Date(start);
    from.setDate(start.getDate() - 6);
  } else if (preset === "month") {
    from = new Date(start.getFullYear(), start.getMonth(), 1);
  } else if (preset === "lastMonth") {
    from = new Date(start.getFullYear(), start.getMonth() - 1, 1);
    to = new Date(start.getFullYear(), start.getMonth(), 1);
  } else if (preset === "quarter") {
    from = new Date(
      start.getFullYear(),
      Math.floor(start.getMonth() / 3) * 3,
      1,
    );
  }

  return { from: dateValue(from), to: dateValue(to) };
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value);

const unwrap = <T,>(response: { data: { data: T } }) => response.data.data;

export default function ReportsPage() {
  const [preset, setPreset] = useState<RangePreset>("month");
  const [range, setRange] = useState<ReportRange>(() =>
    getPresetRange("month"),
  );
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [products, setProducts] = useState<BestSellingProduct[]>([]);
  const [customers, setCustomers] = useState<CustomerPurchase[]>([]);
  const [trends, setTrends] = useState<SalesTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { from: rangeFrom, to: rangeTo } = range;

  useEffect(() => {
    let cancelled = false;

    const requestReports = async () => {
      setLoading(true);
      setError("");
      const requestRange = { from: rangeFrom, to: rangeTo };
      try {
        const [
          summaryResponse,
          productsResponse,
          customersResponse,
          trendsResponse,
        ] = await Promise.all([
          getSalesSummary(requestRange),
          getBestSellingProducts(requestRange),
          getCustomerPurchaseSummary(requestRange),
          getSalesTrends(requestRange),
        ]);
        if (cancelled) return;
        setSummary(unwrap(summaryResponse));
        setProducts(unwrap(productsResponse));
        setCustomers(unwrap(customersResponse));
        setTrends(unwrap(trendsResponse));
      } catch (requestError) {
        if (cancelled) return;
        const axiosError = requestError as AxiosError<{ message?: string }>;
        let message = "Reports could not be loaded.";
        if (axios.isAxiosError(requestError)) {
          const responseData = axiosError.response?.data;
          if (
            typeof responseData === "object" &&
            responseData !== null &&
            "message" in responseData
          ) {
            message = String(responseData.message);
          } else if (axiosError.response?.status) {
            message = `Reports request failed (${axiosError.response.status}).`;
          } else if (axiosError.message) {
            message = axiosError.message;
          }
        } else if (requestError instanceof Error) {
          message = requestError.message;
        }
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void requestReports();
    return () => {
      cancelled = true;
    };
  }, [rangeFrom, rangeTo, refreshKey]);

  const loadReports = () => {
    setRefreshKey((current) => current + 1);
  };

  const maxRevenue = Math.max(...trends.map((point) => point.revenue), 1);
  const topProducts = products.slice(0, 6);
  const maxProductQuantity = Math.max(
    ...topProducts.map((product) => product.quantitySold),
    1,
  );
  const rangeLabel = useMemo(() => `${range.from} to ${range.to}`, [range]);
  const metrics: Array<{
    label: string;
    value: string | number;
    detail: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Revenue",
      value: summary ? currency(summary.totalRevenue) : "--",
      detail: "Paid sales in range",
      icon: BarChart3,
    },
    {
      label: "Orders",
      value: summary?.orderCount ?? "--",
      detail: "Completed purchases",
      icon: ShoppingBag,
    },
    {
      label: "Items sold",
      value: summary?.itemsSold ?? "--",
      detail: "Units across orders",
      icon: Package,
    },
    {
      label: "Average order",
      value: summary ? currency(summary.averageOrderValue) : "--",
      detail: "Revenue per order",
      icon: Users,
    },
  ];

  const handlePresetChange = (value: RangePreset) => {
    setPreset(value);
    if (value !== "custom") setRange(getPresetRange(value));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await downloadSalesXlsx(range);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sales-report-${range.from}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4c6a46]">
            Business intelligence
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#2d4029]">
            Sales reports
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            A focused view of revenue, customers, and product movement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadReports()}
            disabled={loading}
            className="gap-2 rounded-xl border-[#d8d0c3] bg-white text-xs"
          >
            <RefreshCw
              className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"}
            />{" "}
            Refresh
          </Button>
          <Button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting}
            className="gap-2 rounded-xl bg-[#4c6a46] text-xs hover:bg-[#3d5538]"
          >
            <Download className="h-3.5 w-3.5" />{" "}
            {exporting ? "Preparing..." : "Export XLSX"}
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#e5dfd3] bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            ["week", "month", "lastMonth", "quarter", "custom"] as RangePreset[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handlePresetChange(item)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${preset === item ? "bg-[#4c6a46] text-white" : "bg-[#f7f3ec] text-stone-600 hover:bg-[#e9e4da]"}`}
            >
              {item === "week"
                ? "This week"
                : item === "month"
                  ? "This month"
                  : item === "lastMonth"
                    ? "Last month"
                    : item === "quarter"
                      ? "This quarter"
                      : "Custom"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-stone-500">
            From
            <input
              type="date"
              value={range.from}
              onChange={(event) => {
                setPreset("custom");
                setRange((current) => ({
                  ...current,
                  from: event.target.value,
                }));
              }}
              className="mt-1 block h-9 rounded-lg border border-[#d8d0c3] px-2 text-xs text-[#2d4029]"
            />
          </label>
          <label className="text-xs font-semibold text-stone-500">
            To
            <input
              type="date"
              value={range.to}
              onChange={(event) => {
                setPreset("custom");
                setRange((current) => ({ ...current, to: event.target.value }));
              }}
              className="mt-1 block h-9 rounded-lg border border-[#d8d0c3] px-2 text-xs text-[#2d4029]"
            />
          </label>
          <span className="flex items-center gap-1 pb-2 text-[11px] text-stone-400">
            <CalendarDays className="h-3.5 w-3.5" /> {rangeLabel}
          </span>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: MetricIcon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#e5dfd3] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-500">{label}</p>
                <p className="mt-2 font-serif text-2xl font-bold text-[#2d4029]">
                  {value}
                </p>
                <p className="mt-1 text-[11px] text-stone-400">{detail}</p>
              </div>
              <div className="rounded-xl bg-[#e2ebe0] p-2.5 text-[#4c6a46]">
                <MetricIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-2xl border border-[#e5dfd3] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2d4029]">
                Revenue trend
              </h2>
              <p className="text-xs text-stone-400">
                Daily performance across the selected range
              </p>
            </div>
            <FileText className="h-5 w-5 text-[#4c6a46]" />
          </div>
          <div className="h-56">
            {trends.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-stone-400">
                {loading ? "Loading trend..." : "No sales in this range."}
              </div>
            ) : (
              <div className="flex h-full items-end gap-1.5 border-b border-l border-[#e5dfd3] px-2 pb-1">
                {trends.map((point) => (
                  <div
                    key={point.date}
                    className="group relative flex h-full flex-1 items-end"
                  >
                    <div
                      className="w-full rounded-t-md bg-[#7f9d78] transition-all group-hover:bg-[#4c6a46]"
                      style={{
                        height: `${Math.max((point.revenue / maxRevenue) * 100, 3)}%`,
                      }}
                      title={`${point.date}: ${currency(point.revenue)}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {trends.length > 0 && (
            <div className="mt-2 flex justify-between text-[10px] text-stone-400">
              <span>{trends[0].date}</span>
              <span>{trends[trends.length - 1].date}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#e5dfd3] bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-serif text-lg font-bold text-[#2d4029]">
              Best-selling products
            </h2>
            <p className="text-xs text-stone-400">Ranked by units sold</p>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="py-12 text-center text-sm text-stone-400">
                No product sales in this range.
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.productId}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate font-semibold text-[#2d4029]">
                      <span className="mr-2 text-stone-400">0{index + 1}</span>
                      {product.name}
                    </span>
                    <span className="shrink-0 font-bold text-[#4c6a46]">
                      {product.quantitySold} units
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f1eee8]">
                    <div
                      className="h-full rounded-full bg-[#7f9d78]"
                      style={{
                        width: `${(product.quantitySold / maxProductQuantity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-[#e5dfd3] bg-white shadow-sm">
          <div className="border-b border-[#eee9e1] p-5">
            <h2 className="font-serif text-lg font-bold text-[#2d4029]">
              Product performance
            </h2>
            <p className="text-xs text-stone-400">
              Revenue contribution by product
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8f4] text-[10px] uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Units</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee9e1]">
                {products.slice(0, 8).map((product) => (
                  <tr key={product.productId}>
                    <td className="px-5 py-3 font-semibold text-[#2d4029]">
                      {product.name}
                    </td>
                    <td className="px-5 py-3 text-stone-500">
                      {product.category || "Uncategorized"}
                    </td>
                    <td className="px-5 py-3 text-right text-stone-600">
                      {product.quantitySold}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#4c6a46]">
                      {currency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="p-8 text-center text-sm text-stone-400">
                No product data available.
              </p>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#e5dfd3] bg-white shadow-sm">
          <div className="border-b border-[#eee9e1] p-5">
            <h2 className="font-serif text-lg font-bold text-[#2d4029]">
              Top customers
            </h2>
            <p className="text-xs text-stone-400">
              Highest spend in selected range
            </p>
          </div>
          <div className="divide-y divide-[#eee9e1]">
            {customers.slice(0, 6).map((customer) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#2d4029]">
                    {customer.name}
                  </p>
                  <p className="truncate text-[11px] text-stone-400">
                    {customer.email || "No email"} · {customer.orderCount}{" "}
                    orders
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-[#4c6a46]">
                  {currency(customer.totalSpent)}
                </span>
              </div>
            ))}
            {customers.length === 0 && (
              <p className="p-8 text-center text-sm text-stone-400">
                No customer data available.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
