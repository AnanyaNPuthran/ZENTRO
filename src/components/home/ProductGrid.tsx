import type { Product } from '../../types';
import ProductCard from './ProductCard';
import '../../styles/home.css';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
}

export default function ProductGrid({ products, searchQuery }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="section" style={{ paddingBottom: 60 }}>
        <div className="products-grid">
          <div className="products-empty">
            <div className="products-empty-icon">🔍</div>
            <div className="products-empty-title">
              {searchQuery ? `No results for "${searchQuery}"` : 'No products found'}
            </div>
            <div className="products-empty-sub">
              {searchQuery
                ? 'Try different keywords or browse categories.'
                : 'Try selecting a different category.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="products-grid">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            animationDelay={Math.min(index * 50, 400)}
          />
        ))}
      </div>
    </div>
  );
}
