import { useState } from "react";
import { PRODUCT_STATUS, type ProductStatus } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductStatusSelectProps {
  productId: number;
  currentStatus: ProductStatus;
  onStatusChange: (
    productId: number,
    newStatus: ProductStatus,
  ) => Promise<void>;
}

export function ProductStatusSelect({
  productId,
  currentStatus,
  onStatusChange,
}: ProductStatusSelectProps) {
  const [loading, setLoading] = useState(false);

  // Accept string | null from the Select component
  const handleValueChange = async (value: string | null) => {
    // Guard against null or empty values
    if (!value) return;

    const newStatus = value as ProductStatus;
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      await onStatusChange(productId, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status: ProductStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100";
      case "out_of_stock":
        return "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100";
      case "inactive":
        return "bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  return (
    <Select
      disabled={loading}
      value={currentStatus}
      onValueChange={handleValueChange}
    >
      <SelectTrigger
        className={`h-7 text-[11px] font-bold uppercase tracking-wider rounded-lg border px-2.5 transition-all w-32.5 ${getStatusStyles(
          currentStatus,
        )}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white border-[#e5dfd3] text-[#2d4029] rounded-xl shadow-lg">
        {PRODUCT_STATUS.map((status) => (
          <SelectItem
            key={status}
            value={status}
            className="text-xs font-semibold uppercase tracking-wide cursor-pointer focus:bg-[#f4efe6] focus:text-[#2d4029]"
          >
            {status.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
