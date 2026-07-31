import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import axios from "axios";
// Adjust this import path to point directly to your shared Axios config file
import { api } from "@/api/client";
import ProductCard, { type Product } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Setting up a clean, abortable request controller to avoid memory leaks on page toggles
    const controller = new AbortController();

    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Data extraction directly via your customized Axios client instance
        const response = await api.get<ApiResponse>("/products/featured", {
          signal: controller.signal,
        });

        // Axios automatically unboxes status checks (2xx rules) and parses JSON structures into .data
        const resData = response.data;

        if (resData.success) {
          setProducts(resData.data || []);
        } else {
          setError(
            resData.message ||
              "Failed to parse featured data payload elements correctly.",
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // Ignore errors caused by standard component unmounting cancels
        if (axios.isCancel(err)) return;

        console.error(
          "Axios execution error matching featured catalog pipeline:",
          err,
        );

        // Extract backend custom message if available, otherwise fall back to native Axios error strings
        const serverErrorMessage =
          err.response?.data?.message ||
          err.message ||
          "Something went wrong while retrieving our featured products.";
        setError(serverErrorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="w-full bg-[#faf8f4] py-16 border-b border-gray-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER BLOCK ROW */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#4c6a46] uppercase block mb-2">
              CURATED SELECTION
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029] tracking-tight">
              Featured Highlights
            </h2>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#4c6a46] hover:text-[#3d5538] border-b border-[#4c6a46]/20 hover:border-[#3d5538] pb-0.5 transition-all self-start sm:self-auto group"
          >
            <span>View Full Catalog</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* LOADING STATE - SKELETON PLACEHOLDERS */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-sm"
              >
                <Skeleton className="aspect-square w-full rounded-2xl bg-gray-100/80 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-2/3 bg-gray-100/80 rounded animate-pulse" />
                  <Skeleton className="h-3.5 w-full bg-gray-100/80 rounded animate-pulse" />
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Skeleton className="h-5 w-16 bg-gray-100/80 rounded animate-pulse" />
                  <Skeleton className="h-9 w-20 bg-gray-100/80 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE FALLBACK */}
        {!isLoading && error && (
          <div className="w-full bg-white border border-gray-200/60 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#2d4029] mb-1">
              Failed to sync featured selection
            </h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS STATE - PRODUCT GRID */}
        {!isLoading &&
          !error &&
          (products.length === 0 ? (
            <div className="w-full bg-white border border-gray-200/60 rounded-3xl p-10 text-center max-w-xl mx-auto shadow-sm">
              <p className="text-xs text-gray-500 font-medium">
                No highlights available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.productId} product={product} />
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}
