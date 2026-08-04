import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { CartContext } from "./cartContext";
import type { CartItem } from "../types/cart";
import { useAuth } from "./authContext";

const GUEST_CART_KEY = "cart_guest";

function loadCart(key: string): CartItem[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const cartKey = user?.uid ? `cart_${user.uid}` : GUEST_CART_KEY;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const loadedKeyRef = useRef<string | null>(null);

  // Load cart whenever the active key changes (login/logout/switch account)
  useEffect(() => {
    if (authLoading) return;
    if (loadedKeyRef.current === cartKey) return; // already loaded for this identity

    loadedKeyRef.current = cartKey;
    setCartItems(loadCart(cartKey));
  }, [cartKey, authLoading]);

  // Persist to the correct key whenever cart changes
  useEffect(() => {
    if (authLoading) return;
    if (loadedKeyRef.current !== cartKey) return; // don't save before the initial load for this key completes

    try {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
      toast.error(
        "Couldn't save your cart. Your changes may not persist if you reload.",
      );
    }
  }, [cartItems, cartKey, authLoading]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          existing.stockQuantity,
        );
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: newQty } : i,
        );
      }
      return [
        ...prev,
        { ...item, quantity: Math.min(quantity, item.stockQuantity) },
      ];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
          : i,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + parseFloat(i.price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
