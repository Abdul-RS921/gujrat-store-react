// Pure cart logic (no React) so it can be tested on its own.
// State shape: { items: [{ id, name, price, emoji, stock, qty }] }

export const initialCart = { items: [] };

export function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const p = action.product;
      const existing = state.items.find((i) => i.id === p.id);
      if (existing) {
        // never allow more than the stock available
        const qty = Math.min(existing.qty + 1, p.stock);
        return { items: state.items.map((i) => (i.id === p.id ? { ...i, qty } : i)) };
      }
      if (p.stock < 1) return state;
      return {
        items: [...state.items, { id: p.id, name: p.name, price: p.price, emoji: p.emoji, stock: p.stock, qty: 1 }],
      };
    }
    case 'setQty': {
      const qty = Math.floor(Number(action.qty));
      if (!Number.isFinite(qty) || qty < 1) {
        return { items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.min(qty, i.stock) } : i)),
      };
    }
    case 'remove':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'clear':
      return initialCart;
    case 'load':
      return { items: Array.isArray(action.items) ? action.items : [] };
    default:
      return state;
  }
}

export const cartCount = (state) => state.items.reduce((sum, i) => sum + i.qty, 0);
export const cartSubtotal = (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

export const FREE_DELIVERY_OVER = 5000;
export const DELIVERY_FEE = 250;
export const deliveryFor = (subtotal) => (subtotal === 0 || subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE);
export const cartTotal = (state) => cartSubtotal(state) + deliveryFor(cartSubtotal(state));

export const formatPKR = (n) => 'Rs. ' + Number(n).toLocaleString('en-PK');
