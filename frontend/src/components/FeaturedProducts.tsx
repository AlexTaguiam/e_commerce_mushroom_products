import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import axios from "axios";
import { getFeaturedProducts } from "@/services/product.service";
import { type Product } from "../types/product";
import { Skeleton } from "@/components/ui/skeleton";
import CoverflowCarousel, {
  type CoverflowCarouselItem,
} from "@/components/ui/coverflow-carousel";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const resData = await getFeaturedProducts({
          signal: controller.signal,
        });

        if (resData.success) {
          setProducts(resData.data || []);
        } else {
          setError(
            resData.message ||
              "Failed to load featured products.",
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (axios.isCancel(err)) return;
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
    return () => controller.abort();
  }, []);

  // Map products to the carousel item shape — image and alt only, no detail text
  const carouselItems: CoverflowCarouselItem[] = products.map((p) => ({
    id: String(p.productId),
    image: p.imageUrl,
    alt: p.name,
  }));

  return (
    <section className="w-full bg-[#faf8f4] py-16 border-b border-gray-200/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
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
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#4c6a46] hover:text-[#3d5538] border-b border-[#4c6a46]/20 hover:border-[#3d5538] pb-0.5 transition-all self-start sm:self-auto group"
          >
            <span>View Full Catalog</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* LOADING STATE — single card skeleton matching the carousel footprint */}
        {isLoading && (
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="h-[340px] w-[420px] rounded-2xl bg-gray-200/70 animate-pulse" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-16 rounded-full bg-gray-200/70 animate-pulse" />
              <div className="flex gap-1.5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gray-200/70 animate-pulse"
                  />
                ))}
              </div>
              <Skeleton className="h-9 w-16 rounded-full bg-gray-200/70 animate-pulse" />
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoading && error && (
          <div className="w-full bg-white border border-gray-200/60 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#2d4029] mb-1">
              Failed to load featured selection
            </h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && products.length === 0 && (
          <div className="w-full bg-white border border-gray-200/60 rounded-3xl p-10 text-center max-w-xl mx-auto shadow-sm">
            <p className="text-xs text-gray-500 font-medium">
              No highlights available at the moment.
            </p>
          </div>
        )}

        {/* CAROUSEL — overflow-hidden clips side-cards on narrow screens without
            breaking the 3D perspective since `perspective` is scoped to the
            carousel's own root div, not this wrapper. */}
        {!isLoading && !error && carouselItems.length > 0 && (
          <div className="overflow-hidden">
            <CoverflowCarousel
              items={carouselItems}
              loop
              autoplay
              autoplayDelay={3500}
            />
          </div>
        )}

      </div>
    </section>
  );
}
