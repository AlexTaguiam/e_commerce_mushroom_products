import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItem {
  productId: number;
  name: string;
  price: string;
  unit: string;
  imageUrl: string;
  quantity: number;
  stockQuantity: number;
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number, name: string) => void;
}

export default function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  // Gracefully parse price string to number for mathematical calculation safety
  const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
  const itemSubtotal = numericPrice * item.quantity;
  const isMaxStockReached = item.quantity >= item.stockQuantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-gray-200/60 rounded-2xl shadow-sm transition-all hover:border-gray-300">
      {/* Product Image and Details Group */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-20 h-20 rounded-xl bg-[#faf8f4] border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src={
              item.imageUrl ||
              "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=150"
            }
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="font-serif font-bold text-[#2d4029] truncate text-base sm:text-lg">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            ₱{numericPrice.toLocaleString()} / {item.unit}
          </p>
        </div>
      </div>

      {/* Control Actions Frame */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
        {/* Quantity Stepper Interface */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center bg-[#faf8f4] border border-gray-200 rounded-xl overflow-hidden h-9">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={item.quantity <= 1}
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity - 1)
              }
              className="w-8 h-full rounded-none hover:bg-gray-200/60 text-[#2d4029]"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>

            <span className="w-10 text-center text-sm font-semibold text-[#2d4029] select-none">
              {item.quantity}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isMaxStockReached}
              onClick={() =>
                onUpdateQuantity(item.productId, item.quantity + 1)
              }
              className="w-8 h-full rounded-none hover:bg-gray-200/60 text-[#2d4029]"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Inventory Safety Alert */}
          {isMaxStockReached && (
            <span className="text-[10px] font-bold text-amber-600 animate-pulse">
              Max stock reached
            </span>
          )}
        </div>

        {/* Price Output & Destructive Actions Wrapper */}
        <div className="flex items-center gap-4 min-w-25 justify-end">
          <span className="font-serif font-bold text-base text-[#2d4029]">
            ₱
            {itemSubtotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.productId, item.name)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl w-9 h-9 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
