import { createContext, useContext, useEffect, useReducer } from 'react';
import { cartReducer, initialCart } from './cartReducer.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'shop-cart-v1';

function loadInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.items) ? { items: saved.items } : initialCart;
  } catch {
    return initialCart;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage can be blocked (private mode); the cart still works in memory
    }
  }, [cart]);

  return <CartContext.Provider value={{ cart, dispatch }}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
