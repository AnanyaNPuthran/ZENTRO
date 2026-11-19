import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useOrders } from '../../context/OrderContext';
import { useNavigation } from '../../context/NavigationContext';
import type { Category } from '../../types';
import { CATEGORIES } from '../../data/products';
import '../../styles/navbar.css';

const CATEGORY_ICONS: Record<string, string> = {
  All: '✦',
  Fashion: '👗',
  Electronics: '💻',
  Beauty: '✨',
  Home: '🏠',
  Footwear: '👟',
};

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: Category;
  onCategoryChange: (c: Category) => void;
  onCartOpen: () => void;
  onWishlistOpen: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  onCartOpen,
  onWishlistOpen,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const { totalItems: cartCount } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { totalOrders } = useOrders();
  const { navigateTo } = useNavigation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">

          {/* Brand */}
          <div className="navbar-brand">
            <div
              className="navbar-brand-icon"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
              }}
            >
              Z
            </div>
            <span className="navbar-brand-name">ZENTRO</span>
          </div>

          {/* Search */}
          <div className="navbar-search">
            <svg
              className="navbar-search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              id="search-input"
              type="text"
              className="navbar-search-input"
              placeholder="Search products, brands and more..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              aria-label="Search products"
            />

            {searchQuery && (
              <button
                className="navbar-search-clear"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">

            {/* Wishlist */}
            <button
              id="wishlist-btn"
              className="navbar-action-btn"
              onClick={onWishlistOpen}
              aria-label={`Open wishlist (${wishlistCount} items)`}
              title="Wishlist"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>

              {wishlistCount > 0 && (
                <span className="navbar-badge">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              id="cart-btn"
              className="navbar-action-btn"
              onClick={onCartOpen}
              aria-label={`Open cart (${cartCount} items)`}
              title="Shopping Cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>

              {cartCount > 0 && (
                <span className="navbar-badge">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <div className="navbar-divider" />

            {/* User Menu */}
            <div className="navbar-user" ref={dropdownRef}>
              <button
                id="user-menu-btn"
                className="navbar-user-btn"
                onClick={() => setDropdownOpen(o => !o)}
                aria-expanded={dropdownOpen}
                aria-label="User menu"
              >
                <div className="navbar-avatar">{initials}</div>

                <span className="navbar-user-name">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown" role="menu">

                  <div className="navbar-dropdown-header">
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {user?.name || 'User'}
                    </div>
                    <div className="navbar-dropdown-email">
                      {user?.email}
                    </div>
                  </div>

                  {/* My Account */}
                  <button
                    className="navbar-dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigateTo('my-account');
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Account
                  </button>

                  {/* My Orders */}
                  <button
                    className="navbar-dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigateTo('my-orders');
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="2" ry="2" />
                    </svg>

                    My Orders

                    {totalOrders > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          padding: '1px 7px',
                          background: 'var(--gradient-blue-purple)',
                          borderRadius: '99px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: 'white',
                        }}
                      >
                        {totalOrders}
                      </span>
                    )}
                  </button>

                  {/* Sign Out */}
                  <button
                    id="logout-btn"
                    className="navbar-dropdown-item danger"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>

                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Category Bar */}
      <div className="category-bar">
        <div className="category-bar-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`category-${cat.toLowerCase()}`}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat as Category)}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}