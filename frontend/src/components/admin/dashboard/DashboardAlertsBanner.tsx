import { AlertTriangle, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardAlertsBanner() {
  const lowStockItems = [
    { name: "Oyster Mushroom Spawn Kit", stock: 3, threshold: 10 },
    { name: "Substrate Blocks (Fruiting Mix)", stock: 2, threshold: 15 },
  ];

  return (
    <div className="space-y-4">
      {/* Low Stock Warning Card */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <h3 className="font-serif font-bold text-sm">
            Low Stock Inventory Warnings
          </h3>
        </div>

        <div className="space-y-2">
          {lowStockItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white/80 border border-amber-200/50 rounded-xl p-2.5 text-xs"
            >
              <span className="font-semibold text-stone-700 truncate">
                {item.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 shrink-0">
                {item.stock} left
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Export Banner */}
      <div className="bg-[#e2ebe0]/60 border border-[#c3d6c0] rounded-3xl p-5 space-y-3 text-center">
        <div className="w-10 h-10 rounded-2xl bg-white border border-[#c3d6c0] flex items-center justify-center text-[#4c6a46] mx-auto shadow-sm">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-[#2d4029]">
            Monthly Report
          </h3>
          <p className="text-xs text-stone-500 font-medium max-w-xs mx-auto mt-0.5">
            Download the consolidated sales and inventory PDF sheet for
            financial auditing.
          </p>
        </div>
        <Button
          type="button"
          className="w-full bg-[#4c6a46] hover:bg-[#3d5538] text-white font-bold text-xs rounded-xl h-10 shadow-sm flex items-center justify-center gap-2"
        >
          <span>Download Audit PDF</span>
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
