/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { type Product } from "@/types/product";
import { adminApi } from "@/api//client";
import {
  SlidersHorizontal,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  products: Product[];
}

export function AdjustModal({
  isOpen,
  onClose,
  onSuccess,
  products,
}: AdjustModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [direction, setDirection] = useState<"decrease" | "increase">(
    "decrease",
  );
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProduct = products.find(
    (p) => p.productId === Number(selectedProductId),
  );
  const inputQty = Math.abs(parseInt(quantity, 10) || 0);
  const changeValue = direction === "decrease" ? -inputQty : inputQty;

  const currentStock = selectedProduct ? selectedProduct.stockQuantity : 0;
  const projectedStock = currentStock + changeValue;
  const isInvalidNegative = selectedProduct ? projectedStock < 0 : false;

  const handleQuickReason = (text: string) => {
    setReason(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || inputQty === 0) {
      setErrorMsg(
        "Please select a product and enter a non-zero adjustment value.",
      );
      return;
    }

    if (isInvalidNegative) {
      setErrorMsg(
        `Cannot decrease stock below 0. Current available: ${currentStock}.`,
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await adminApi.post("/inventory/adjust", {
        productId: Number(selectedProductId),
        adjustment: changeValue,
        reason:
          reason.trim() ||
          (direction === "decrease"
            ? "Spoilage / Miscount deduction"
            : "Audit adjustment"),
      });

      // Reset and close
      setSelectedProductId("");
      setQuantity("");
      setReason("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to adjust inventory:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to adjust stock. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-[#e5dfd3] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#faf8f4] border-b border-[#e5dfd3] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#2d4029]">
              Reconcile / Adjust Stock
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Log spoilage, physical count corrections, or damages.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
              Select Product *
            </label>
            <select
              required
              value={selectedProductId}
              onChange={(e) =>
                setSelectedProductId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="w-full h-10 px-3 rounded-xl border border-[#e5dfd3] bg-[#faf8f4]/50 text-xs font-semibold text-[#2d4029] focus:outline-none focus:border-[#4c6a46]"
            >
              <option value="">-- Choose item to adjust --</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} (Current: {p.stockQuantity} {p.unit}s)
                </option>
              ))}
            </select>
          </div>

          {/* Direction Switcher Toggle */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5 uppercase tracking-wide">
              Adjustment Type *
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#faf8f4] p-1 border border-[#e5dfd3] rounded-xl">
              <button
                type="button"
                onClick={() => setDirection("decrease")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  direction === "decrease"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Deduct (-)</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection("increase")}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  direction === "increase"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Add (+)</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
              Quantity Difference *
            </label>
            <Input
              type="number"
              min="1"
              required
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10 font-bold"
            />
          </div>

          {/* Projection Preview */}
          {selectedProduct && inputQty > 0 && (
            <div
              className={`border rounded-xl p-3 flex items-center justify-between text-xs ${
                isInvalidNegative
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-[#f4efe6]/60 border-[#e5dfd3] text-stone-700"
              }`}
            >
              <span className="font-semibold">Stock Output:</span>
              <div className="flex items-center gap-2 font-bold">
                <span>{currentStock}</span>
                <span>→</span>
                <span
                  className={`px-2 py-0.5 rounded-md ${
                    isInvalidNegative
                      ? "bg-red-200 text-red-800"
                      : direction === "decrease"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {projectedStock} {selectedProduct.unit}s
                </span>
              </div>
            </div>
          )}

          {/* Reason Field */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
              Adjustment Reason *
            </label>
            <Input
              required
              placeholder="e.g. Spoilage/Contamination, Shrinkage, Recount"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {(direction === "decrease"
                ? [
                    "Mold Spoilage",
                    "Drying Loss",
                    "Damaged Packaging",
                    "Expired Item",
                  ]
                : ["Recount Correction", "Found Inventory", "Sample Return"]
              ).map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => handleQuickReason(chip)}
                  className="text-[10px] font-semibold bg-[#faf8f4] hover:bg-[#f4efe6] text-stone-600 border border-[#e5dfd3] px-2 py-1 rounded-lg transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#e5dfd3] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl text-xs h-9 font-semibold border-[#e5dfd3]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !selectedProductId ||
                inputQty === 0 ||
                isInvalidNegative
              }
              className="bg-[#2d4029] hover:bg-[#1f2d1d] text-white rounded-xl text-xs h-9 font-bold px-4 shadow-sm"
            >
              {submitting ? "Applying..." : "Save Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
