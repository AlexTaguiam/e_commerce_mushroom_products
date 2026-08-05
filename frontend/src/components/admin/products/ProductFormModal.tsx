import React, { useState } from "react";
import {
  type Product,
  PRODUCT_CATEGORY,
  type ProductCategory,
} from "@/types/product";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    isEdit: boolean,
    productId?: number,
  ) => Promise<void>;
  productToEdit?: Product | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
}: ProductFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white border-[#e5dfd3] text-[#2d4029] rounded-3xl p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-serif font-bold text-xl text-[#2d4029]">
            {productToEdit
              ? "Edit Product Catalog Entry"
              : "Create New Product"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 font-medium">
            {productToEdit
              ? "Update specifications, pricing, or product media."
              : "Add a new harvest or product listing to the customer shop."}
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <ProductFormContent
            key={
              productToEdit ? `edit-${productToEdit.productId}` : "create-new"
            }
            productToEdit={productToEdit}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Inner form component initialized cleanly with initial useState values
interface ProductFormContentProps {
  productToEdit?: Product | null;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    isEdit: boolean,
    productId?: number,
  ) => Promise<void>;
}

function ProductFormContent({
  productToEdit,
  onClose,
  onSubmit,
}: ProductFormContentProps) {
  const isEdit = Boolean(productToEdit);
  const [loading, setLoading] = useState(false);

  // Initial state derived directly on mount (No useEffect required)
  const [name, setName] = useState(productToEdit?.name || "");
  const [description, setDescription] = useState(
    productToEdit?.description || "",
  );
  const [category, setCategory] = useState<ProductCategory>(
    productToEdit?.category || "fresh",
  );
  const [price, setPrice] = useState(productToEdit?.price?.toString() || "");
  const [unit, setUnit] = useState(productToEdit?.unit || "pack");
  const [stockQuantity, setStockQuantity] = useState(
    productToEdit?.stockQuantity?.toString() || "0",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    productToEdit?.imageUrl || null,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("unit", unit);
    formData.append("stockQuantity", stockQuantity);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await onSubmit(formData, isEdit, productToEdit?.productId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Image Upload Area */}
      <div>
        <label className="text-xs font-bold text-stone-600 block mb-1.5 uppercase tracking-wide">
          Product Image
        </label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-[#c3d6c0] bg-[#faf8f4] flex items-center justify-center overflow-hidden shrink-0">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-stone-600 hover:text-red-600 backdrop-blur-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <ImagePlus className="w-6 h-6 text-[#4c6a46]" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <input
              type="file"
              id="product-image-input"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("product-image-input")?.click()
              }
              className="border-[#e5dfd3] bg-[#faf8f4] hover:bg-[#f4efe6] text-[#2d4029] text-xs font-semibold rounded-xl h-9"
            >
              {imagePreview ? "Replace Image" : "Choose File"}
            </Button>
            <p className="text-[11px] text-stone-400">
              PNG, JPG or WEBP up to 5MB (Uploaded to Cloudinary)
            </p>
          </div>
        </div>
      </div>

      {/* Product Name */}
      <div>
        <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
          Product Title *
        </label>
        <Input
          required
          placeholder="e.g. Fresh Oyster Mushrooms"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10"
        />
      </div>

      {/* Category & Unit Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            className="w-full h-10 px-3 rounded-xl border border-[#e5dfd3] bg-white text-xs font-semibold text-[#2d4029] focus:outline-none focus:border-[#4c6a46]"
          >
            {PRODUCT_CATEGORY.map((cat) => (
              <option key={cat} value={cat}>
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
            Unit (e.g. kg, pack, kit) *
          </label>
          <Input
            required
            placeholder="pack"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10"
          />
        </div>
      </div>

      {/* Price & Initial Stock Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
            Price (₱) *
          </label>
          <Input
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10 font-serif font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
            {isEdit ? "Current Stock" : "Initial Stock Quantity"}
          </label>
          <Input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs h-10"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-stone-600 block mb-1 uppercase tracking-wide">
          Description
        </label>
        <Textarea
          rows={3}
          placeholder="Describe mushroom species, flavor profile, or cultivation specs..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-[#e5dfd3] focus:border-[#4c6a46] rounded-xl text-xs"
        />
      </div>

      <DialogFooter className="pt-2 gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#4c6a46] hover:bg-[#3d5538] text-white font-bold text-xs rounded-xl h-10 px-5"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Product"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
