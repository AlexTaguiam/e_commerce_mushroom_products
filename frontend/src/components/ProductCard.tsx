import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";
import { type Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cartItems } = useCart();
  const [qty, setQty] = useState(1);

  const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  const isOutOfStock = product.stockQuantity === 0;

  // How many of this item the user already has in cart
  const inCartQty =
    cartItems.find((i) => i.productId === product.productId)?.quantity ?? 0;

  // Remaining purchasable units
  const remaining = product.stockQuantity - inCartQty;

  // ── Quantity stepper handlers ────────────────────────────────────────────
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty >= remaining) {
      toast.warning(
        remaining <= 0
          ? `You already have all available stock in your cart.`
          : `Only ${remaining} more can be added (${product.stockQuantity} total stock).`,
      );
      return;
    }
    setQty((prev) => prev + 1);
  };

  // ── Add to cart ──────────────────────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error(`"${product.name}" is currently out of stock.`);
      return;
    }

    // Hard block — don't allow adding beyond available stock
    if (remaining <= 0) {
      toast.error(
        `You already have all ${product.stockQuantity} available units of "${product.name}" in your cart.`,
      );
      return;
    }

    if (qty > remaining) {
      toast.error(
        `You can only add ${remaining} more "${product.name}" (${inCartQty} already in cart, ${product.stockQuantity} total stock).`,
      );
      return;
    }

    addToCart(
      {
        productId: product.productId,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
      },
      qty,
    );

    toast.success(
      `${qty > 1 ? `${qty}× ` : ""}${product.name} added to cart.`,
    );
    setQty(1); // reset stepper after adding
  };

  // ── Stock badge config ───────────────────────────────────────────────────
  const stockBadge = () => {
    if (isOutOfStock) return null; // overlay handles this state
    if (product.stockQuantity <= 5) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Only {product.stockQuantity} left
        </span>
      );
    }
    if (product.stockQuantity <= 10) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Low · {product.stockQuantity} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4c6a46] bg-[#4c6a46]/8 border border-[#4c6a46]/20 rounded-full px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4c6a46] inline-block" />
        {product.stockQuantity} in stock
      </span>
    );
  };

  const isAddDisabled = isOutOfStock || remaining <= 0;

  return (
    <Link
      to={`/products/${product.productId}`}
      className="group flex flex-col bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-[#faf8f4] overflow-hidden border-b border-gray-100">
        <img
          src={
            product.imageUrl ||
            "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-[#2d4029] font-sans font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Name & description */}
        <div className="space-y-1 flex-1">
          <span className="text-[11px] font-bold tracking-wider text-[#4c6a46] uppercase">
            {product.category}
          </span>
          <h3 className="font-serif font-bold text-lg text-[#2d4029] leading-tight group-hover:text-[#4c6a46] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Stock badge row */}
        <div className="flex items-center gap-2 flex-wrap">
          {stockBadge()}
          {inCartQty > 0 && !isOutOfStock && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">
              <ShoppingCart className="w-2.5 h-2.5" />
              {inCartQty} in cart
            </span>
          )}
        </div>

        {/* Price + Qty stepper + Add button */}
        <div className="pt-1 border-t border-gray-100 space-y-2.5">
          {/* Price */}
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-[#2d4029]">
              ₱{numericPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              per {product.unit}
            </span>
          </div>

          {/* Qty stepper + Add to Cart */}
          <div className="flex items-center gap-2">
            {/* Stepper */}
            <div
              className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                isAddDisabled
                  ? "border-gray-100 bg-gray-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isAddDisabled || qty <= 1}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span
                className={`w-8 text-center text-sm font-bold tabular-nums select-none ${
                  isAddDisabled ? "text-gray-300" : "text-[#2d4029]"
                }`}
              >
                {qty}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={isAddDisabled || qty >= remaining}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Add to Cart */}
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className="flex-1 h-8 rounded-xl bg-[#4c6a46] hover:bg-[#3d5538] text-white text-xs font-bold transition-all shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {remaining <= 0 ? "Maxed Out" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
