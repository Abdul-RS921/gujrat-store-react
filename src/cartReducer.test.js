// Run with: npm test   (uses Node's built-in test runner)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cartReducer, initialCart, cartCount, cartSubtotal, cartTotal, deliveryFor,
} from './cartReducer.js';

const pen = { id: 1, name: 'Pen', price: 100, emoji: '🖊️', stock: 3 };
const book = { id: 2, name: 'Book', price: 2500, emoji: '📘', stock: 5 };

test('adding the same product increases its quantity', () => {
  let s = cartReducer(initialCart, { type: 'add', product: pen });
  s = cartReducer(s, { type: 'add', product: pen });
  assert.equal(s.items.length, 1);
  assert.equal(s.items[0].qty, 2);
});

test('quantity can never go above stock', () => {
  let s = initialCart;
  for (let i = 0; i < 10; i++) s = cartReducer(s, { type: 'add', product: pen });
  assert.equal(s.items[0].qty, 3);
  s = cartReducer(s, { type: 'setQty', id: 1, qty: 99 });
  assert.equal(s.items[0].qty, 3);
});

test('out-of-stock products cannot be added', () => {
  const s = cartReducer(initialCart, { type: 'add', product: { ...pen, stock: 0 } });
  assert.equal(s.items.length, 0);
});

test('setting quantity below 1 removes the item', () => {
  let s = cartReducer(initialCart, { type: 'add', product: pen });
  s = cartReducer(s, { type: 'setQty', id: 1, qty: 0 });
  assert.equal(s.items.length, 0);
});

test('count, subtotal and delivery fee', () => {
  let s = cartReducer(initialCart, { type: 'add', product: pen });
  s = cartReducer(s, { type: 'add', product: pen });
  assert.equal(cartCount(s), 2);
  assert.equal(cartSubtotal(s), 200);
  assert.equal(deliveryFor(200), 250);
  assert.equal(cartTotal(s), 450);
  s = cartReducer(s, { type: 'add', product: book });
  s = cartReducer(s, { type: 'add', product: book });
  assert.equal(cartSubtotal(s), 5200);
  assert.equal(deliveryFor(5200), 0); // free delivery from Rs. 5000
  assert.equal(cartTotal(s), 5200);
});

test('remove and clear', () => {
  let s = cartReducer(initialCart, { type: 'add', product: pen });
  s = cartReducer(s, { type: 'add', product: book });
  s = cartReducer(s, { type: 'remove', id: 1 });
  assert.deepEqual(s.items.map((i) => i.id), [2]);
  s = cartReducer(s, { type: 'clear' });
  assert.equal(s.items.length, 0);
});
