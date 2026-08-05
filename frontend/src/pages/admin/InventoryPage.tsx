import { useState, useEffect } from "react";
import { type Product } from "@/types/product";
import { type InventoryLog } from "@/types/inventory";
import { adminApi } from "@/api/client";
import { InventoryLogTable } from "@/components/admin/inventory/InventoryLogTable";
import { RestockModal } from "@/components/admin/inventory/RestockModal";
import { AdjustModal } from "@/components/admin/inventory/AdjustModal";
import {
  Package,
  PlusCircle,
  SlidersHorizontal,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  // Data Fetching
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products for dropdowns and KPIs
        const productsRes = await adminApi.get("/products");

        // Fetch logs (pass product_id param if filtered)
        const params: Record<string, string> = {};
        if (selectedProductId !== "all") {
          params.product_id = selectedProductId;
        }

        const logsRes = await adminApi.get("/inventory/logs", { params });

        if (isSubscribed) {
          setProducts(productsRes.data?.data || []);
          setLogs(logsRes.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to load inventory data:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [selectedProductId, refreshKey]);

  const handleManualRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Metric Computations
  const totalStockUnits = products.reduce(
    (sum, p) => sum + (p.stockQuantity || 0),
    0,
  );
  const lowStockCount = products.filter((p) => p.stockQuantity <= 10).length;
  const totalRestocksCount = logs.filter(
    (l) => l.changeType === "RESTOCK",
  ).length;

  const formatDate = (dateValue?: string | Date) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter logs client-side by query and type
  // Filter logs client-side by query, reason, product name, date, and movement type
  const filteredLogs = logs.filter((log) => {
    const formattedDate = formatDate(log.loggedAt || log.loggedAt);
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      (log.product?.name || "").toLowerCase().includes(query) ||
      (log.reason || "").toLowerCase().includes(query) ||
      formattedDate.toLowerCase().includes(query);

    const matchesType =
      selectedType === "all" || log.changeType === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
            Inventory & Stock Reconciliation
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Track harvests, restocks, spoilage, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setRestockModalOpen(true)}
            className="bg-[#4c6a46] hover:bg-[#3d5538] text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Restock Item</span>
          </Button>

          <Button
            onClick={() => setAdjustModalOpen(true)}
            variant="outline"
            className="border-[#e5dfd3] bg-white text-[#2d4029] hover:bg-[#faf8f4] font-bold text-xs rounded-xl h-10 px-4 shadow-sm flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>Adjust / Reconcile</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5dfd3] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4c6a46]/10 text-[#4c6a46] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Total Units On Hand
            </span>
            <span className="font-serif font-bold text-xl text-[#2d4029]">
              {totalStockUnits.toLocaleString()} units
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e5dfd3] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              lowStockCount > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-stone-100 text-stone-400"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Low Stock Alert (≤10)
            </span>
            <span
              className={`font-serif font-bold text-xl ${
                lowStockCount > 0 ? "text-amber-700" : "text-[#2d4029]"
              }`}
            >
              {lowStockCount} Products
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e5dfd3] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Recorded Restocks
            </span>
            <span className="font-serif font-bold text-xl text-[#2d4029]">
              {totalRestocksCount} Batches
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white border border-[#e5dfd3] rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by title or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-9 bg-[#faf8f4]/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#4c6a46]" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#e5dfd3] bg-[#faf8f4]/50 text-xs font-semibold text-[#2d4029] focus:outline-none focus:border-[#4c6a46]"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#e5dfd3] bg-[#faf8f4]/50 text-xs font-semibold text-[#2d4029] focus:outline-none focus:border-[#4c6a46]"
          >
            <option value="all">All Movement Types</option>
            <option value="STOCK_IN">Initial Stock (STOCK_IN)</option>
            <option value="RESTOCK">RESTOCK Only</option>
            <option value="ADJUSTMENT">ADJUSTMENT Only</option>
            <option value="ORDER_DEDUCTION">ORDER DEDUCTION Only</option>
          </select>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleManualRefresh}
            className="h-9 w-9 text-stone-500 hover:text-[#2d4029] hover:bg-[#f4efe6] rounded-xl shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <InventoryLogTable logs={filteredLogs} loading={loading} />

      {/* Modals */}
      <RestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        onSuccess={handleManualRefresh}
        products={products}
      />

      <AdjustModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onSuccess={handleManualRefresh}
        products={products}
      />
    </div>
  );
}
