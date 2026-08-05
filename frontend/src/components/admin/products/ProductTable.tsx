import { type Product, type ProductStatus } from "@/types/product";
import { ProductStatusSelect } from "./ProductStatusSelect";
import { Edit3, PackageX, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onStatusChange: (
    productId: number,
    newStatus: ProductStatus,
  ) => Promise<void>;
}

export function ProductTable({
  products,
  onEdit,
  onStatusChange,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[#e5dfd3] rounded-3xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#faf8f4] border border-[#e5dfd3] flex items-center justify-center text-stone-400 mx-auto">
          <PackageX className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#2d4029]">
          No Products Found
        </h3>
        <p className="text-xs text-stone-400 max-w-sm mx-auto">
          No items match your active category or status filter. Try clearing
          filters or create a new listing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5dfd3] rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e5dfd3] bg-[#faf8f4] text-[11px] font-bold uppercase tracking-wider text-stone-400">
              <th className="py-3.5 px-4">Item Details</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price / Unit</th>
              <th className="py-3.5 px-4">Stock Level</th>
              <th className="py-3.5 px-4">Status Control</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4efe6] text-xs">
            {products.map((product) => (
              <tr
                key={product.productId}
                className="hover:bg-[#faf8f4]/80 transition-colors"
              >
                {/* Item Details */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#e2ebe0] border border-[#c3d6c0] flex items-center justify-center overflow-hidden shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sprout className="w-5 h-5 text-[#4c6a46]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-[#2d4029] truncate">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-stone-400 truncate max-w-xs">
                        {product.description || "No description provided."}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#faf8f4] text-stone-600 border border-[#e5dfd3]">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="py-3.5 px-4 font-serif font-bold text-[#2d4029]">
                  ₱{Number(product.price).toFixed(2)}
                  <span className="text-[11px] font-sans font-normal text-stone-400 ml-1">
                    / {product.unit}
                  </span>
                </td>

                {/* Stock Level */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#2d4029]">
                      {product.stockQuantity}
                    </span>
                    {product.stockQuantity <= 5 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                        Low
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Selector */}
                <td className="py-3.5 px-4">
                  <ProductStatusSelect
                    productId={product.productId}
                    currentStatus={product.status}
                    onStatusChange={onStatusChange}
                  />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-8 px-2.5 rounded-xl text-stone-500 hover:text-[#2d4029] hover:bg-[#f4efe6] gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Edit</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
