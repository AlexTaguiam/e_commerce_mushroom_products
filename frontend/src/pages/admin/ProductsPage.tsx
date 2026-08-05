import { useState, useEffect } from "react";
import {
  type Product,
  type ProductStatus,
  PRODUCT_CATEGORY,
  PRODUCT_STATUS,
} from "@/types/product";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductFormModal } from "@/components/admin/products/ProductFormModal";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/api/client"; // Adjust import path to match your file structure
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Trigger state to manually re-run the effect
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Fetch products effect
  useEffect(() => {
    let isSubscribed = true;

    const loadProducts = async () => {
      try {
        const params: Record<string, string> = {};
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (selectedStatus !== "all") params.status = selectedStatus;

        const res = await adminApi.get("/products", { params });

        if (isSubscribed) {
          // Unwraps responseHandler payload structure (res.data.data)
          setProducts(res.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isSubscribed = false;
    };
  }, [selectedCategory, selectedStatus, refreshKey]);

  // Handler for manual refresh button click
  const handleManualRefresh = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  // Status Change Handler (PATCH /products/:id/status)
  const handleStatusChange = async (
    productId: number,
    newStatus: ProductStatus,
  ) => {
    try {
      const res = await adminApi.patch(`/products/${productId}/status`, {
        status: newStatus,
      });

      if (res.status === 200) {
        setProducts((prev) =>
          prev.map((p) =>
            p.productId === productId ? { ...p, status: newStatus } : p,
          ),
        );
        toast.success("Update Successfull");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    }
  };

  // Form Submit Handler (POST/PATCH with FormData for multipart uploads)
  const handleFormSubmit = async (
    formData: FormData,
    isEdit: boolean,
    productId?: number,
  ) => {
    try {
      const endpoint = isEdit ? `/products/${productId}` : "/products";
      const config = {
        headers: {
          "Content-Type": undefined, // Allows browser to generate boundary
        },
        timeout: 30000,
      };

      if (isEdit) {
        await adminApi.patch(endpoint, formData, config);
        toast.success("Update Successfull");
      } else {
        await adminApi.post(endpoint, formData, config);
        toast.success("New Product Added Sucessfuly");
      }

      setLoading(true);
      setRefreshKey((prev) => prev + 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // THIS LOG WILL SHOW THE EXACT BACKEND VALIDATION FIELD THAT FAILED
      toast.error("Error Uploading/Updating Products");
      console.error("Backend 400 Validation Error:", err.response?.data);
      throw err;
    }
  };

  const handleOpenCreateModal = () => {
    setProductToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setModalOpen(true);
  };

  // Client-side search filtering
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2d4029]">
            Product Catalog
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Manage public store items, pricing, media, and availability status.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#4c6a46] hover:bg-[#3d5538] text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Button>
      </div>

      {/* Control Bar: Search & Category/Status Filters */}
      <div className="bg-white border border-[#e5dfd3] rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-9 bg-[#faf8f4]/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#4c6a46]" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setLoading(true);
              setSelectedCategory(e.target.value);
            }}
            className="h-9 px-3 rounded-xl border border-[#e5dfd3] bg-[#faf8f4]/50 text-xs font-semibold text-[#2d4029] focus:outline-none focus:border-[#4c6a46]"
          >
            <option value="all">All Categories</option>
            {PRODUCT_CATEGORY.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setLoading(true);
              setSelectedStatus(e.target.value);
            }}
            className="h-9 px-3 rounded-xl border border-[#e5dfd3] bg-[#faf8f4]/50 text-xs font-semibold text-[#2d4029] focus:outline-none focus:border-[#4c6a46]"
          >
            <option value="all">All Statuses</option>
            {PRODUCT_STATUS.map((st) => (
              <option key={st} value={st}>
                {st.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleManualRefresh}
            className="h-9 w-9 text-stone-500 hover:text-[#2d4029] hover:bg-[#f4efe6] rounded-xl shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Product List Table */}
      <ProductTable
        products={filteredProducts}
        onEdit={handleOpenEditModal}
        onStatusChange={handleStatusChange}
      />

      {/* Modal Dialog for Add/Edit */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        productToEdit={productToEdit}
      />
    </div>
  );
}
