"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItemAddition = {
  additionId: string;
  name: string;
  price: number;
  emoji: string | null;
  quantity: number;
};

export type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  emoji: string | null;
  imageUrl: string | null;
  quantity: number;
  note?: string;
  additions: CartItemAddition[];
};

type AddToCartInput = {
  productId: string;
  name: string;
  price: number;
  emoji: string | null;
  imageUrl: string | null;
  quantity: number;
  note?: string;
  additions: CartItemAddition[];
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: AddToCartInput) => void;
  incrementItem: (cartItemId: string) => void;
  decrementItem: (cartItemId: string) => void;
  removeItem: (cartItemId: string) => void;
  updateItemNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "andre-burger-cart";

const CartContext = createContext<CartContextValue | null>(null);

function createCartItemId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getItemSubtotal(item: CartItem) {
  const additionsTotal = item.additions.reduce(
    (acc, addition) => acc + addition.price * addition.quantity,
    0,
  );

  return (item.price + additionsTotal) * item.quantity;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as CartItem[];
        setItems(
          parsedCart.map((item) => ({
            ...item,
            cartItemId: item.cartItemId || createCartItemId(),
            additions: item.additions || [],
          })),
        );
      } catch {
        setItems([]);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(item: AddToCartInput) {
    setItems((currentItems) => [
      ...currentItems,
      {
        cartItemId: createCartItemId(),
        ...item,
        note: item.note || "",
      },
    ]);
  }

  function incrementItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  function decrementItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartItemId !== cartItemId),
    );
  }

  function updateItemNote(cartItemId: string, note: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              note,
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + getItemSubtotal(item), 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addItem,
        incrementItem,
        decrementItem,
        removeItem,
        updateItemNote,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}

export function calculateCartItemSubtotal(item: CartItem) {
  return getItemSubtotal(item);
}
