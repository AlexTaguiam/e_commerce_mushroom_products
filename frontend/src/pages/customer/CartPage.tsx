import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Custom Hooks and UI elements imports
import { useCart } from "@/context/cartContext"; // Adjust based on exact alias paths
import CartItemRow from "@/components/cart/CartItemRow";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } =
    useCart();

  // Safely evaluate standard subtotal float parameters
  const calculatedSubtotal =
    typeof cartTotal === "number" ? cartTotal : parseFloat(cartTotal) || 0;

  // Explicitly declared structural items for future extensions (Shipping / Tax computation structures)
  const shippingFee = 0;
  const estimatedTax = 0;
  const finalOrderTotal = calculatedSubtotal + shippingFee + estimatedTax;

  const handleItemRemoval = (productId: number, itemName: string) => {
    removeFromCart(productId);
    toast.success(`Removed "${itemName}" from your cart.`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Your shopping cart has been cleared.");
  };

  // 0. EMPTY VIEWPORT BOUNDARY EXCEPTION
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="w-full min-h-[70vh] bg-[#faf8f4] flex flex-col items-center justify-center px-4 py-12 text-center font-sans antialiased">
        <div className="w-20 h-20 rounded-full bg-[#4c6a46]/10 text-[#4c6a46] flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-9 h-9" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-[#2d4029] tracking-tight mb-2">
          Your cart is empty
        </h1>
        <p className="text-sm text-gray-400 max-w-sm font-medium leading-relaxed mb-8">
          Looks like you haven't added any premium automated mushroom products
          to your catalog bucket yet.
        </p>
        <Button className="bg-[#4c6a46] hover:bg-[#3d5538] text-white font-semibold rounded-xl px-6 h-11 shadow-md transition-all tracking-wide">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf8f4] font-sans antialiased py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Section Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
          <div className="space-y-1">
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#2d4029] tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-400">
              Review your harvest items selection before completing secure
              layout transfer.
            </p>
          </div>

          <Button
            variant="ghost"
            className="text-[#4c6a46] hover:text-[#3d5538] hover:bg-[#4c6a46]/5 rounded-xl text-sm font-semibold self-start sm:self-center gap-2"
          >
            <Link to="/catalog">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
          </Button>
        </div>

        {/* TWO COLUMN RESPONSIVE GRID MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: ACTIVE ITEMS LIST COMPOSER (8 Cols wide) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-3.5">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={handleItemRemoval}
                />
              ))}
            </div>

            {/* DESTRUCTIVE ACTION ROW MODULE */}
            <div className="flex justify-end pt-2">
              <AlertDialog>
                <AlertDialogTrigger className="inline-flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs font-semibold rounded-xl h-9 px-3 gap-1.5 transition-colors focus-visible:outline-none">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Shopping Cart</span>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white rounded-3xl border border-gray-200 max-w-[90vw] sm:max-w-md">
                  <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="font-serif font-bold text-[#2d4029] text-xl">
                      Are you absolute sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-gray-500 font-medium">
                      This action will clear all current items from your basket.
                      You will have to manually browse and restock your chosen
                      inventory parameters.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2 pt-2">
                    <AlertDialogCancel className="rounded-xl border-gray-200 font-semibold h-10 hover:bg-gray-100">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl h-10 shadow-sm"
                    >
                      Clear Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* RIGHT COLUMN: FIXED TRANSACTION SIDEBAR (4 Cols wide) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200/60 p-6 sm:p-8 rounded-3xl shadow-xl shadow-[#2d4029]/4 space-y-6 position-sticky top-6">
              <h2 className="font-serif font-bold text-xl text-[#2d4029] border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              {/* Dynamic Subtotal Pricing Line Items */}
              <div className="space-y-3 text-sm font-medium text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-[#2d4029] font-bold">
                    ₱
                    {calculatedSubtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Structural placeholder implementations for scalability */}
                <div className="flex justify-between items-center border-t border-gray-50 pt-2.5 text-xs">
                  <span>Estimated Shipping</span>
                  <span className="text-gray-400 font-normal italic">
                    Calculated at checkout
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-2.5 text-xs">
                  <span>Tax Allocation</span>
                  <span className="text-gray-400 font-normal italic">
                    ₱0.00
                  </span>
                </div>

                {/* Final Total Pricing Line Element */}
                <div className="flex justify-between items-center border-t border-gray-100 pt-4 text-base text-[#2d4029] font-bold">
                  <span>Order Total</span>
                  <span className="font-serif text-lg tracking-tight">
                    ₱
                    {finalOrderTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Core Secure Checkouts System Link Controls */}
              <div className="space-y-4 pt-2">
                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full h-11 bg-[#4c6a46] hover:bg-[#3d5538] text-white font-semibold rounded-xl tracking-wide shadow-md transition-all"
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-[#4c6a46]" />
                  <span>Secure 256-Bit SSL Checkout Channel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
