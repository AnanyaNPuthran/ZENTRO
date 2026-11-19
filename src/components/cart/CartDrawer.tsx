import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { addToast } from '../ui/Toast';
import '../../styles/components.css';

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { navigateTo } = useNavigation();

  const shipping = totalPrice >= 999 ? 0 : 99;
  const gst = Math.round(totalPrice * 0.18);

  function formatPrice(p: number) {
    return `₹${p.toLocaleString('en-IN')}`;
  }

  function handleCheckout() {
    if (items.length === 0) {
      addToast('Add items to your cart first!', 'error');
      return;
    }
    onClose();
    navigateTo('checkout');
  }

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" aria-label="Shopping cart" role="dialog">
        <div className="drawer-header">
          <div className="drawer-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Cart
            {totalItems > 0 && <span className="drawer-count">{totalItems}</span>}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <div className="drawer-empty-icon">🛒</div>
            <div className="drawer-empty-title">Your cart is empty</div>
            <div className="drawer-empty-sub">Add some products to get started!</div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {items.map(item => (
                <div key={item.product.id} className="cart-item">
                  <img
                    className="cart-item-img"
                    src={item.product.image}
                    alt={item.product.name}
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src =
                        `https://placehold.co/72x72/0d0d24/4f8ef7?text=${encodeURIComponent(item.product.name[0])}`;
                    }}
                  />
                  <div className="cart-item-info">
                    <div className="cart-item-category">{item.product.category}</div>
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-price">{formatPrice(item.product.price * item.quantity)}</div>
                    <div className="cart-item-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        className="cart-item-remove"
                        onClick={() => {
                          removeFromCart(item.product.id);
                          addToast('Item removed from cart', 'info');
                        }}
                        aria-label="Remove from cart"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-footer">
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal ({totalItems} items)</span>
                  <span className="cart-summary-value">{formatPrice(totalPrice)}</span>
                </div>
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Shipping</span>
                  <span className="cart-summary-value" style={{ color: shipping === 0 ? '#10b981' : undefined }}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="cart-summary-row">
                  <span className="cart-summary-label">GST (18%)</span>
                  <span className="cart-summary-value">{formatPrice(gst)}</span>
                </div>
                <div className="cart-summary-divider" />
                <div className="cart-summary-row cart-summary-total">
                  <span className="cart-summary-label">Total</span>
                  <span className="cart-summary-value">{formatPrice(totalPrice + shipping + gst)}</span>
                </div>
              </div>
              <button
                id="checkout-btn"
                className="btn-primary cart-checkout-btn"
                onClick={handleCheckout}
                style={{ borderRadius: '12px', fontSize: '0.95rem', padding: '13px' }}
              >
                Proceed to Checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              {totalPrice < 999 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                  Add {formatPrice(999 - totalPrice)} more for free shipping!
                </p>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
