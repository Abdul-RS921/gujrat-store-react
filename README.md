# Gujrat Store: React Shopping Store

A fully working demo shopping website built with React and Vite: browse products, search, filter, sort, manage a cart and place an order.

This is a demo project: there is no backend, and no real order or payment is made.

## Features

- Product catalogue with categories (Electronics, Fashion, Home, Books), search and sorting (price, rating)
- Stock-aware cart: quantities can never exceed the stock; out-of-stock items cannot be added
- Cart drawer with quantity controls, remove, subtotal, delivery fee and total (free delivery over Rs. 5,000)
- Cart is remembered between visits (`localStorage`)
- Checkout form with validation (name, Pakistani mobile number, email, address, city) and an order confirmation page
- Responsive layout for phones and desktops

## How it is built

| Part | File |
|------|------|
| Cart logic (a pure reducer, easy to test) | `src/cartReducer.js` |
| Cart state shared by all components (Context + `useReducer`) | `src/CartContext.jsx` |
| Screens and components | `src/App.jsx` |
| Sample products | `src/data/products.js` |
| Styling | `src/App.css` |
| Unit tests for the cart | `src/cartReducer.test.js` |

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # development server
npm test           # runs the cart unit tests (6 tests)
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

## Ideas to extend

- Connect to a real backend (Node + MySQL) for products and orders
- User accounts and order history
- Real payment gateway (JazzCash / Easypaisa / card)
