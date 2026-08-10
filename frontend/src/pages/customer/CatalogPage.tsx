import { useState, useEffect } from "react";
import { SlidersHorizontal, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/services/product.service";

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

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const resData = await getProducts();

        if (resData.success) {
          // Explicitly isolate active inventory allocations
          const activeItems = resData.data.filter(
            (p: Product) => p.status === "active",
          );
          setProducts(activeItems);
        } else {
          setError(resData.message || "Failed to populate product arrays.");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // Axios catches non-2xx statuses automatically.
        // Extract the server error message if available, fallback to connection failure text.
        const serverErrorMessage = err.response?.data?.message;
        setError(
          serverErrorMessage ||
            "Network interface connection failure. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  // Compute clean unique categories from active product items array
  const uniqueCategories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  // Client-side quick filter pipeline execution
  const filteredProducts = products.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory,
  );

  if (error) {
    return (
      <div className="w-full min-h-[60vh] bg-[#faf8f4] flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 max-w-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf8f4] font-sans antialiased py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#2d4029] tracking-tight">
            Our Harvest Catalog
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-400 max-w-xl">
            Browse our premium selection of organic mushrooms and advanced home
            grow kits cultivated with precise environmental engineering.
          </p>
        </div>

        {/* Filter Management Subgrid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
          {loading ? (
            <div className="flex gap-2 w-full overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-20 bg-gray-200 rounded-xl shrink-0"
                />
              ))}
            </div>
          ) : (
            <CategoryFilter
              categories={uniqueCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-[#2d4029] bg-white border border-gray-200 rounded-xl px-3.5 py-2 self-start sm:self-auto shrink-0 shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4c6a46]" />
            <span>{filteredProducts.length} Items Available</span>
          </div>
        </div>

        {/* Dynamic Display Matrix Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-3xl p-4 space-y-4"
              >
                <Skeleton className="aspect-square w-full bg-gray-200 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3 bg-gray-200" />
                  <Skeleton className="h-5 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-1/3 bg-gray-200" />
                  <Skeleton className="h-9 w-9 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white border border-gray-200/60 rounded-3xl shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#faf8f4] flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2d4029] mb-1">
              No products found
            </h3>
            <p className="text-xs text-gray-400 font-medium max-w-xs">
              There are currently no active products matching the "
              {selectedCategory}" category allocation parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
