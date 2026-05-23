import { useCart } from '../context/CartContext';

/**
 * Renders "Add to Cart" when qty === 0.
 * Renders a [− qty +] control when the product is already in the cart.
 *
 * Props:
 *   product      – the full product object
 *   addClassName – className applied to the "Add to Cart" <button>
 *   ctrlClassName – extra className applied to the qty-control <div>
 *   style        – inline style for both states
 */
export default function CartQtyBtn({ product, addClassName = '', ctrlClassName = '', style = {} }) {
  const { items, addToCart, updateQty, removeFromCart } = useCart();
  const cartItem = items.find(i => i._id === product._id);
  const qty = cartItem?.qty || 0;

  if (!product.inStock) {
    return (
      <a
        href={`https://wa.me/918767797815?text=${encodeURIComponent(`Hi! I'd like to order "${product.name}" as a made-to-order piece. Could you let me know the details?`)}`}
        target="_blank"
        rel="noreferrer"
        className={`${addClassName} cart-qty-mto`}
        style={style}
        onClick={e => e.stopPropagation()}
      >
        Made to Order
      </a>
    );
  }

  if (qty === 0) {
    return (
      <button
        className={addClassName}
        style={style}
        onClick={e => { e.stopPropagation(); addToCart(product); }}
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div
      className={`cart-qty-ctrl ${ctrlClassName}`}
      style={style}
      onClick={e => e.stopPropagation()}
    >
      <button
        className="cart-qty-btn cart-qty-btn--minus"
        onClick={() => qty <= 1 ? removeFromCart(product._id) : updateQty(product._id, qty - 1)}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="cart-qty-num">{qty}</span>
      <button
        className="cart-qty-btn cart-qty-btn--plus"
        onClick={() => updateQty(product._id, qty + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
