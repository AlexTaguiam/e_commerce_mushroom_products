import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/cartContext";
import { getProductById } from "@/services/product.service";
import { type Product } from "@/types/product";

// interface Product {
//   productId: number;
//   name: string;
//   description: string;
//   category: string;
//   price: string;
//   unit: string;
//   stockQuantity: number;
//   imageUrl: string;
//   status: string;
//   createdAt: string;
// }

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      try {
        setLoading(true);

        const resData = await getProductById(productId);

        if (resData.success && resData.data) {
          setProduct(resData.data);
        } else {
          setError(resData.message || "Product profile item not found.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // Safely check if the backend returned a specific error message (e.g., 404 Not Found)
        const serverErrorMessage = err.response?.data?.message;
        setError(
          serverErrorMessage ||
            "Failed to establish remote backend connection pipeline.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);
  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[70vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 py-12 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-5 border border-red-100">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#2d4029] mb-2">
          Item Profile Missing
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mb-8 font-medium leading-relaxed">
          {error ||
            "The individual catalog item you are trying to view cannot be discovered or has been sunsetted."}
        </p>
        <Button
          nativeButton={false}
          className="bg-[#4c6a46] hover:bg-[#3d5538] text-white rounded-xl shadow-md font-semibold px-6"
          render={<Link to="/products">Return to Catalog</Link>}
        />
      </div>
    );
  }

  const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const handleQuantityIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleQuantityDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSubmissionToCart = () => {
    if (isOutOfStock) {
      toast.error("Item configuration out of stock.");
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

    toast.success(`Added ${quantity} x "${product.name}" to your cart.`);
  };

  return (
    <div className="w-full min-h-screen bg-[#faf8f4] font-sans antialiased py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation Line */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-[#4c6a46] hover:text-[#3d5538] hover:bg-[#4c6a46]/5 rounded-xl font-semibold gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Button>
        </div>

        {/* TWO COLUMN CONTENT LAYOUT CONFIGURATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT CONTAINER: STYLISH ITEM CANVAS (6 Columns) */}
          <div className="lg:col-span-6 bg-white border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#faf8f4] border border-gray-100">
              <img
                src={
                  product.imageUrl ||
                  "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-white text-[#2d4029] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTAINER: METADATA DESCRIPTIVE INTERFACE (6 Columns) */}
          <div className="lg:col-span-6 space-y-6 lg:py-2">
            {/* Context Badge Group */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-[#4c6a46]/10 text-[#4c6a46] text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-lg">
                  {product.category}
                </span>

                {/* Inline Stock Flag Modules */}
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-lg">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg animate-pulse">
                    Low Stock: Only {product.stockQuantity} left
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#4c6a46] bg-[#4c6a46]/5 border border-[#4c6a46]/10 px-2.5 py-0.5 rounded-lg">
                    In Stock
                  </span>
                )}
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#2d4029] tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Display Pricing Structure */}
            <div className="bg-white border border-gray-200/60 rounded-2xl p-4 sm:p-5 flex items-baseline gap-2 shadow-sm">
              <span className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
                ₱
                {numericPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm font-medium text-gray-400">
                per {product.unit}
              </span>
            </div>

            {/* Description Matrix Wrapper */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#2d4029]">
                Product Description
              </h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed bg-white border border-gray-200/40 rounded-2xl p-5 shadow-inner">
                {product.description}
              </p>
            </div>

            {/* Action Matrix Steppers and Final Submission Button Hooks */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Embedded Counter Input */}
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden h-12 shadow-sm justify-between px-2 sm:justify-start">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={handleQuantityDecrement}
                    className="w-9 h-9 rounded-lg hover:bg-gray-100 text-[#2d4029]"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <span className="w-12 text-center text-sm font-bold text-[#2d4029] select-none">
                    {quantity}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={quantity >= product.stockQuantity || isOutOfStock}
                    onClick={handleQuantityIncrement}
                    className="w-9 h-9 rounded-lg hover:bg-gray-100 text-[#2d4029]"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Main Action Trigger Button */}
                <Button
                  onClick={handleSubmissionToCart}
                  disabled={isOutOfStock}
                  className="flex-1 h-12 bg-[#4c6a46] hover:bg-[#3d5538] text-white font-semibold rounded-xl shadow-md transition-all tracking-wide disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isOutOfStock ? "Out of Stock" : `Add to Basket`}
                </Button>
              </div>

              {/* Safety Assurances Row */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200/60 pt-4 text-[11px] font-semibold text-gray-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#4c6a46]" />
                  <span>Fresh Local Shipping Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4c6a46]" />
                  <span>Quality Assurance Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal File Interface Component Skeleton
function DetailSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#faf8f4] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-9 w-32 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 bg-white border border-gray-100 rounded-3xl p-6">
            <Skeleton className="aspect-square w-full bg-gray-200 rounded-2xl" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-24 bg-gray-200" />
              <Skeleton className="h-10 w-3/4 bg-gray-200" />
            </div>
            <Skeleton className="h-16 w-full bg-gray-200 rounded-2xl" />
            <Skeleton className="h-32 w-full bg-gray-200 rounded-2xl" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32 bg-gray-200 rounded-xl" />
              <Skeleton className="h-12 flex-1 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
