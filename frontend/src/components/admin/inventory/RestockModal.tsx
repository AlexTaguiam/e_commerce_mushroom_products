/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { type Product } from "@/types/product";
import { restockProduct } from "@/services/inventory.service";
import { PlusCircle, Package, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  products: Product[];
}

export function RestockModal({
  isOpen,
  onClose,
  onSuccess,
  products,
}: RestockModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProduct = products.find(
    (p) => p.productId === Number(selectedProductId),
  );
  const restockQty = parseInt(quantity, 10) || 0;
  const currentStock = selectedProduct ? selectedProduct.stockQuantity : 0;
  const newStock = currentStock + restockQty;

  const handleQuickReason = (text: string) => {
    setReason(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || restockQty <= 0) {
      setErrorMsg(
        "Please select a product and enter a valid positive quantity.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await restockProduct({
        productId: Number(selectedProductId),
        quantity: restockQty,
        reason: reason.trim() || "Standard stock replenishment",
      });

      // Reset and close
      setSelectedProductId("");
      setQuantity("");
      setReason("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to restock product:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to submit restock. Please try again.",
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
          <div className="w-10 h-10 rounded-xl bg-[#4c6a46]/10 text-[#4c6a46] flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-[#2d4029]">
              Restock Product
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Record batch harvests or supplier deliveries.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
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
              <option value="">-- Choose item to restock --</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.name} (Current Stock: {p.stockQuantity} {p.unit}s)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
              Replenish Quantity *
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                required
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10 font-bold pr-16"
              />
              {selectedProduct && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
                  {selectedProduct.unit}s
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Calculation Card */}
          {selectedProduct && restockQty > 0 && (
            <div className="bg-[#f4efe6]/60 border border-[#e5dfd3] rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <Package className="w-4 h-4 text-[#4c6a46]" />
                <span>Stock Projection:</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-stone-500">{currentStock}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {newStock} {selectedProduct.unit}s
                </span>
              </div>
            </div>
          )}

          {/* Reason Input & Preset Chips */}
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
              Reason / Batch Tag
            </label>
            <Input
              placeholder="e.g. Batch #104 Harvest, Supplier Delivery"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                "Fresh Harvest",
                "Supplier Restock",
                "Batch Processing",
                "Recount Addition",
              ].map((chip) => (
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

          {/* Action Buttons */}
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
              disabled={submitting || !selectedProductId || restockQty <= 0}
              className="bg-[#4c6a46] hover:bg-[#3d5538] text-white rounded-xl text-xs h-9 font-bold px-4 shadow-sm"
            >
              {submitting ? "Updating..." : "Confirm Restock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
