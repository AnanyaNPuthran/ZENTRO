import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { addToast } from '../ui/Toast';
import '../../styles/home.css';

const BADGE_CLASSES: Record<string, string> = {
  NEW: 'badge badge-new',
  SALE: 'badge badge-sale',
  HOT: 'badge badge-hot',
  TRENDING: 'badge badge-trending',
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="product-card-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} width="12" height="12" viewBox="0 0 24 24"
            fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <span className="stars-count">({count.toLocaleString()})</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  animationDelay?: number;
}

export default function ProductCard({ product, animationDelay = 0 }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  function handleAddToCart() {
    addToCart(product);
    addToast(`${product.name} added to cart`, 'success');
  }

  function handleToggleWishlist() {
    if (inWishlist) {
      removeFromWishlist(product.id);
      addToast('Removed from wishlist', 'info');
    } else {
      addToWishlist(product);
      addToast(`${product.name} added to wishlist`, 'success');
    }
  }

  function formatPrice(p: number) {
    return `₹${p.toLocaleString('en-IN')}`;
  }

  return (
    <article
      className="product-card"
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={product.name}
    >
      <div className="product-card-img-wrap">
        <img
          className="product-card-img"
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={e => {
            (e.currentTarget as HTMLImageElement).src = `https://placehold.co/400x400/0d0d24/4f8ef7?text=${encodeURIComponent(product.name.split(' ')[0])}`;
          }}
        />
        {product.badge && (
          <span className={`product-card-badge ${BADGE_CLASSES[product.badge] || 'badge'}`}>
            {product.badge}
          </span>
        )}
        <button
          className={`product-card-wishlist ${inWishlist ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <StarRating rating={product.rating} count={product.reviewCount} />

        <div className="product-card-footer">
          <div className="product-card-prices">
            <span className="product-card-price">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="product-card-original-price">{formatPrice(product.originalPrice)}</span>
            )}
            {discount > 5 && (
              <span className="price-discount">{discount}% off</span>
            )}
          </div>
          <button
            className={`product-card-add ${inCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            aria-label={inCart ? 'Add more to cart' : 'Add to cart'}
            id={`add-cart-${product.id}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {inCart
                ? <><polyline points="20 6 9 17 4 12"/></>
                : <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>
              }
            </svg>
            {inCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
