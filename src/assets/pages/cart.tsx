/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../auth";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../../api";

export type CartItem = {
  id: string; // the cart line's own id: used for PATCH and DELETE
  productId: string; // the product's id: used only when adding
  qty: number;
  lineTotal: number;
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    image: string;
    price: number;
    oldPrice?: number | null;
    currency: string;
    stock: number;
    inStock: boolean;
  };
};

export type Cart = {
  items: CartItem[];
  totalQty: number;
  subtotal: number;
  currency: string;
};

type CartContextValue = {
  cart: Cart | null;
  isBusy: boolean;
  addToCart: (productId: string, qty: number) => Promise<void>;
  changeQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
};
// addToCart: (productId: string, qty: number) => Promise<void>;
//   changeQty: (itemId: string, qty: number) => Promise<void>;
//   removeItem: (itemId: string) => Promise<void>;
//   clearCart: () => void;   whats this for?? i dont recognize promise syntax like this
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  // when the user is logged in, load their cart from the server
  useEffect(() => {
    if (auth.status !== "authenticated") {
      return;
    }

    getCart()
      .then((data) => setCart(data))
      .catch(() => setCart(null));
  }, [auth.status]);

  async function addToCart(productId: string, qty: number) {
    setIsBusy(true);

    try {
      const data = await addCartItem(productId, qty);
      setCart(data);
    } finally {
      setIsBusy(false);
    }
  }

  async function changeQty(itemId: string, qty: number) {
    setIsBusy(true);

    try {
      const data = await updateCartItem(itemId, qty);
      setCart(data);
    } finally {
      setIsBusy(false);
    }
  }

  async function removeItem(itemId: string) {
    setIsBusy(true);

    try {
      const data = await removeCartItem(itemId);
      setCart(data);
    } finally {
      setIsBusy(false);
    }
  }

  // called on logout so the next person in this browser doesn't see this cart
  function clearCart() {
    setCart(null);
  }

  return (
    <CartContext.Provider
      value={{ cart, isBusy, addToCart, changeQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
