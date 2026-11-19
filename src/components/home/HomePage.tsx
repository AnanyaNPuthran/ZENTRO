import { useState, useMemo } from 'react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import HeroBanner from './HeroBanner';
import PromoBanners from './PromoBanners';
import ProductGrid from './ProductGrid';
import CartDrawer from '../cart/CartDrawer';
import WishlistDrawer from '../wishlist/WishlistDrawer';
import { PRODUCTS } from '../../data/products';
import type { Category } from '../../types';
import '../../styles/home.css';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let results = PRODUCTS;
    if (activeCategory !== 'All') {
      results = results.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    return results;
  }, [searchQuery, activeCategory]);

  const isSearching = searchQuery.trim().length > 0;
  const showHero = !isSearching && activeCategory === 'All';

  function handleCategoryChange(cat: Category) {
    setActiveCategory(cat);
    setSearchQuery('');
    // Scroll to products
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function handleViewAll() {
    setActiveCategory('All');
    setSearchQuery('');
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="homepage">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onCartOpen={() => setCartOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />

      <main>
        {showHero && (
          <HeroBanner
            onCategoryChange={handleCategoryChange}
            onSearchChange={setSearchQuery}
          />
        )}
        {showHero && (
          <PromoBanners onCategoryChange={handleCategoryChange} />
        )}

        {/* Products Section */}
        <div id="products-section" className="section">
          <div className="section-header" style={{ paddingTop: showHero ? '56px' : '32px' }}>
            <div>
              <h2 className="section-title">
                {isSearching
                  ? `Results for "${searchQuery}"`
                  : activeCategory === 'All'
                    ? <><span className="section-title-accent">Featured</span> Products</>
                    : <><span className="section-title-accent">{activeCategory}</span> Collection</>
                }
              </h2>
              <div className="section-subtitle">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
            </div>
            {!isSearching && activeCategory !== 'All' && (
              <button
                className="section-link"
                onClick={handleViewAll}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View all
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <ProductGrid products={filteredProducts} searchQuery={searchQuery} />
      </main>

      <Footer />

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      {wishlistOpen && <WishlistDrawer onClose={() => setWishlistOpen(false)} />}
    </div>
  );
}
