import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

function loadCart() {
  try {
    const c = localStorage.getItem('mk_cart');
    return c ? JSON.parse(c) : [];
  } catch { return []; }
}

function saveCart(items) {
  try { localStorage.setItem('mk_cart', JSON.stringify(items)); } catch {}
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Persist whenever items change
  useEffect(() => { saveCart(items); }, [items]);

  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) {
        return prev.map(i =>
          i._id === product._id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, {
        _id:           product._id,
        name:          product.name,
        price:         product.price,
        originalPrice: product.originalPrice,
        category:      product.category,
        image:         (product.images?.[product.primaryImageIndex ?? 0] || product.images?.[0] || product.image) || null,
        inStock:       product.inStock,
        qty,
      }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const cartTotal = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
