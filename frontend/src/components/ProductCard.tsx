import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";

interface Product {
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
  const { addToCart } = useCart();

  // Normalize string price for layout safety
  const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the click event from bubbling up to the outer <Link> tag
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error(`"${product.name}" is currently out of stock.`);
      return;
    }

    addToCart({
      productId: product.productId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,

      stockQuantity: product.stockQuantity,
    });

    toast.success(`Added ${product.name} to your cart.`);
  };

  return (
    <Link
      to={`/products/${product.productId}`}
      className="group flex flex-col bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      {/* Product Image Frame */}
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

      {/* Details Area */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
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

        {/* Pricing & Cart Trigger Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-[#2d4029]">
              ₱{numericPrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              per {product.unit}
            </span>
          </div>

          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="icon"
            className="w-10 h-10 rounded-xl bg-[#4c6a46] hover:bg-[#3d5538] text-white transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
