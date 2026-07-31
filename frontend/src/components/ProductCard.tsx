import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Product {
  productId: number;
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  stockQuantity: number;
  imageUrl: string;
  status: string;
  createdAt: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity === 0;

  // Format currency directly to Philippine Peso (₱) matching application specifications
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(product.price));

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Crucial: Stop navigation click propagation up to the parent wrapping element Link
    e.preventDefault();
    e.stopPropagation();

    // TODO: Wire up to global cart state context hooks later
    console.log(
      `Placeholder Action: Product ${product.productId} ("${product.name}") added to cart request.`,
    );
  };

  return (
    <Link
      to={`/products/${product.productId}`}
      className="group relative flex flex-col bg-white border border-gray-200/60 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#2d4029]/5 hover:border-gray-300/80"
    >
      {/* CARD TOP ASPECT: IMAGE PORTION CONTAINER */}
      <div className="relative aspect-square w-full bg-[#f2eee4] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? "contrast-75 brightness-75 grayscale-30" : ""
          }`}
        />

        {/* Absolute Conditional Stock Badge Overlay */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 backdrop-blur-[2px]">
            <div className="bg-white/95 px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-600 tracking-wide uppercase">
                Out of Stock
              </span>
            </div>
          </div>
        ) : (
          /* Subtle Category Tag Overlay */
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-bold tracking-wider text-[#4c6a46] bg-white/90 backdrop-blur-sm border border-gray-100 px-2.5 py-1 rounded-full uppercase">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* CARD BOTTOM ASPECT: DATA CONTENT LAYER */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1 mb-4">
          <h3 className="font-serif font-bold text-lg text-[#2d4029] leading-snug transition-colors group-hover:text-[#4c6a46] mb-1.5 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price Metrics & Dynamic Checkout Controls Row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="font-sans font-bold text-base text-[#2d4029]">
              {formattedPrice}
            </span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              per {product.unit}
            </span>
          </div>

          <Button
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`h-9 px-4 rounded-full font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 focus:outline-none ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-[#4c6a46] hover:bg-[#3d5538] text-white shadow-sm shadow-[#4c6a46]/10 hover:scale-[1.02]"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
