import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { addToast } from '../ui/Toast';
import '../../styles/components.css';

interface WishlistDrawerProps {
  onClose: () => void;
}

export default function WishlistDrawer({ onClose }: WishlistDrawerProps) {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  function formatPrice(p: number) {
    return `₹${p.toLocaleString('en-IN')}`;
  }

  function handleMoveToCart(productId: string) {
    const item = items.find(i => i.product.id === productId);
    if (item) {
      addToCart(item.product);
      removeFromWishlist(productId);
      addToast(`${item.product.name} moved to cart`, 'success');
    }
  }

  return (
    <>
      <div className="overlay" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" aria-label="Wishlist" role="dialog">
        <div className="drawer-header">
          <div className="drawer-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: '#ec4899' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Wishlist
            {items.length > 0 && <span className="drawer-count" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>{items.length}</span>}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <div className="drawer-empty-icon">💝</div>
            <div className="drawer-empty-title">Your wishlist is empty</div>
            <div className="drawer-empty-sub">Save items you love and come back later!</div>
          </div>
        ) : (
          <div className="drawer-body">
            {items.map(item => (
              <div key={item.product.id} className="wishlist-item">
                <img
                  className="wishlist-item-img"
                  src={item.product.image}
                  alt={item.product.name}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://placehold.co/72x72/0d0d24/ec4899?text=${encodeURIComponent(item.product.name[0])}`;
                  }}
                />
                <div className="wishlist-item-info">
                  <div className="wishlist-item-category">{item.product.category}</div>
                  <div className="wishlist-item-name">{item.product.name}</div>
                  <div className="wishlist-item-price">
                    {formatPrice(item.product.price)}
                    {item.product.originalPrice > item.product.price && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>
                        {formatPrice(item.product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="wishlist-item-actions">
                    <button
                      className="wishlist-add-btn"
                      onClick={() => handleMoveToCart(item.product.id)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => {
                        removeFromWishlist(item.product.id);
                        addToast('Removed from wishlist', 'info');
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
