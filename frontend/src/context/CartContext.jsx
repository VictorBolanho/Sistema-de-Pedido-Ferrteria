import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addProduct(product) {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.product.id === product.id);
      if (existing) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId, quantity) {
    const parsed = Number(quantity);
    if (!Number.isInteger(parsed)) {
      return;
    }

    setItems((currentItems) => {
      if (parsed <= 0) {
        return currentItems.filter((item) => item.product.id !== productId);
      }

      return currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity: parsed } : item
      );
    });
  }

  function removeProduct(productId) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(
    () =>
      items.reduce(
        (accumulator, item) => accumulator + Number(item.product.price) * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addProduct,
      changeQuantity,
      removeProduct,
      clearCart,
      total,
    }),
    [items, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
