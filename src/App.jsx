import { useMemo, useState } from 'react';
import { CartProvider, useCart } from './CartContext.jsx';
import { CATEGORIES, PRODUCTS } from './data/products.js';
import {
  cartCount, cartSubtotal, cartTotal, deliveryFor, formatPKR,
} from './cartReducer.js';
import './App.css';

function Header({ onOpenCart, search, setSearch }) {
  const { cart } = useCart();
  return (
    <header className="header">
      <div className="brand">🛍️ Gujrat Store</div>
      <input
        className="search"
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search products"
      />
      <button className="cart-btn" onClick={onOpenCart} aria-label="Open cart">
        🛒 Cart <span className="badge">{cartCount(cart)}</span>
      </button>
    </header>
  );
}

function ProductCard({ product }) {
  const { cart, dispatch } = useCart();
  const inCart = cart.items.find((i) => i.id === product.id)?.qty ?? 0;
  const soldOut = product.stock < 1;
  const maxed = inCart >= product.stock;
  return (
    <article className="card">
      <div className="card-img" aria-hidden="true">{product.emoji}</div>
      <h3>{product.name}</h3>
      <p className="muted">{product.description}</p>
      <div className="row">
        <strong>{formatPKR(product.price)}</strong>
        <span title="Rating">⭐ {product.rating}</span>
      </div>
      <div className="row">
        <span className={product.stock < 6 ? 'low' : 'muted'}>
          {soldOut ? 'Out of stock' : `${product.stock} in stock`}
        </span>
        <button
          className="primary"
          disabled={soldOut || maxed}
          onClick={() => dispatch({ type: 'add', product })}
        >
          {soldOut ? 'Sold out' : maxed ? 'Max added' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

function Shop({ search }) {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (q === '' || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, category, sort]);

  return (
    <main className="container">
      <div className="toolbar">
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c} className={c === category ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <label className="sort">
          Sort by{' '}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>
      {visible.length === 0 ? (
        <p className="empty">No products match your search.</p>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, dispatch } = useCart();
  const subtotal = cartSubtotal(cart);
  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}
      <aside className={open ? 'drawer open' : 'drawer'} aria-hidden={!open}>
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="link" onClick={onClose}>Close ✕</button>
        </div>
        {cart.items.length === 0 ? (
          <p className="empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="lines">
              {cart.items.map((i) => (
                <li key={i.id}>
                  <span className="emoji">{i.emoji}</span>
                  <div className="grow">
                    <strong>{i.name}</strong>
                    <div className="muted">{formatPKR(i.price)} each</div>
                    <div className="qty">
                      <button onClick={() => dispatch({ type: 'setQty', id: i.id, qty: i.qty - 1 })} aria-label="Decrease">−</button>
                      <span>{i.qty}</span>
                      <button
                        onClick={() => dispatch({ type: 'setQty', id: i.id, qty: i.qty + 1 })}
                        disabled={i.qty >= i.stock}
                        aria-label="Increase"
                      >+</button>
                      <button className="link danger" onClick={() => dispatch({ type: 'remove', id: i.id })}>Remove</button>
                    </div>
                  </div>
                  <strong>{formatPKR(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
            <div className="totals">
              <div className="row"><span>Subtotal</span><span>{formatPKR(subtotal)}</span></div>
              <div className="row">
                <span>Delivery</span>
                <span>{deliveryFor(subtotal) === 0 ? 'Free' : formatPKR(deliveryFor(subtotal))}</span>
              </div>
              <div className="row total"><span>Total</span><span>{formatPKR(cartTotal(cart))}</span></div>
              <button className="primary wide" onClick={onCheckout}>Checkout</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function validate(f) {
  const errors = {};
  if (f.name.trim().length < 3) errors.name = 'Please enter your full name.';
  if (!/^03\d{2}-?\d{7}$/.test(f.phone.trim())) errors.phone = 'Use a Pakistani mobile number like 0300-1234567.';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = 'Enter a valid email address.';
  if (f.address.trim().length < 10) errors.address = 'Please enter your full delivery address.';
  if (f.city.trim().length < 2) errors.city = 'Enter your city.';
  return errors;
}

function Checkout({ onBack, onDone }) {
  const { cart, dispatch } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', payment: 'cod' });
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0 || cart.items.length === 0) return;
    setOrder({
      id: 'ORD-' + Date.now().toString().slice(-6),
      items: cart.items,
      total: cartTotal(cart),
      form,
    });
    dispatch({ type: 'clear' });
  };

  if (order) {
    return (
      <main className="container narrow">
        <div className="panel center">
          <div className="big">✅</div>
          <h2>Thank you, {order.form.name.split(' ')[0]}!</h2>
          <p>Your order <strong>{order.id}</strong> has been placed.</p>
          <ul className="lines">
            {order.items.map((i) => (
              <li key={i.id}>
                <span className="emoji">{i.emoji}</span>
                <div className="grow">{i.name} × {i.qty}</div>
                <strong>{formatPKR(i.price * i.qty)}</strong>
              </li>
            ))}
          </ul>
          <p className="muted">
            Total {formatPKR(order.total)} ({order.form.payment === 'cod' ? 'Cash on delivery' : 'Paid online'}).
            We will deliver to {order.form.address}, {order.form.city}.
          </p>
          <p className="muted">This is a demo store: no real order or payment is made.</p>
          <button className="primary" onClick={onDone}>Continue shopping</button>
        </div>
      </main>
    );
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <label className="field">
      {label}
      <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} />
      {errors[key] && <span className="err">{errors[key]}</span>}
    </label>
  );

  return (
    <main className="container narrow">
      <button className="link" onClick={onBack}>← Back to shop</button>
      <div className="checkout">
        <form className="panel" onSubmit={submit} noValidate>
          <h2>Delivery details</h2>
          {field('name', 'Full name')}
          {field('phone', 'Mobile number', 'tel', '0300-1234567')}
          {field('email', 'Email', 'email')}
          {field('address', 'Address')}
          {field('city', 'City')}
          <label className="field">
            Payment
            <select value={form.payment} onChange={set('payment')}>
              <option value="cod">Cash on delivery</option>
              <option value="card">Card (demo)</option>
            </select>
          </label>
          <button className="primary wide" type="submit" disabled={cart.items.length === 0}>
            Place order · {formatPKR(cartTotal(cart))}
          </button>
        </form>
        <div className="panel">
          <h2>Order summary</h2>
          {cart.items.length === 0 ? (
            <p className="empty">Your cart is empty.</p>
          ) : (
            <ul className="lines">
              {cart.items.map((i) => (
                <li key={i.id}>
                  <span className="emoji">{i.emoji}</span>
                  <div className="grow">{i.name} × {i.qty}</div>
                  <strong>{formatPKR(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
          )}
          <div className="row"><span>Delivery</span><span>{deliveryFor(cartSubtotal(cart)) === 0 ? 'Free' : formatPKR(deliveryFor(cartSubtotal(cart)))}</span></div>
          <div className="row total"><span>Total</span><span>{formatPKR(cartTotal(cart))}</span></div>
        </div>
      </div>
    </main>
  );
}

function Store() {
  const [view, setView] = useState('shop');
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  return (
    <>
      <Header onOpenCart={() => setCartOpen(true)} search={search} setSearch={setSearch} />
      {view === 'shop' ? (
        <Shop search={search} />
      ) : (
        <Checkout onBack={() => setView('shop')} onDone={() => setView('shop')} />
      )}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setView('checkout');
        }}
      />
      <footer className="footer">Demo store built with React. Free delivery on orders over Rs. 5,000.</footer>
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Store />
    </CartProvider>
  );
}
