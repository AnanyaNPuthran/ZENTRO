import type { Category } from '../../types';
import '../../styles/home.css';

interface PromoBannersProps {
  onCategoryChange: (cat: Category) => void;
}

export default function PromoBanners({ onCategoryChange }: PromoBannersProps) {
  function scrollToProducts() {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleCategory(cat: Category) {
    onCategoryChange(cat);
    setTimeout(scrollToProducts, 100);
  }

  return (
    <div className="section">
      <div className="promo-grid">
        {/* Main banner – Electronics */}
        <div className="promo-card promo-card-main">
          <div className="promo-card-glow" />
          <div className="promo-card-content">
            <div className="promo-card-label">Limited Time Offer</div>
            <h2 className="promo-card-title">
              Electronics Sale<br />
              <span style={{ background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Up to 40% Off
              </span>
            </h2>
            <p className="promo-card-sub">
              Score the best deals on headphones, smartwatches, cameras, and more premium tech.
            </p>
            <button
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.875rem' }}
              onClick={() => handleCategory('Electronics')}
            >
              Shop Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Secondary banner – Beauty */}
        <div className="promo-card promo-card-secondary">
          <div className="promo-card-glow" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)' }} />
          <div className="promo-card-content">
            <div className="promo-card-label" style={{ color: '#ec4899' }}>New Collection</div>
            <h2 className="promo-card-title" style={{ fontSize: '1.4rem' }}>
              Beauty &<br />
              <span style={{ color: '#a78bfa' }}>Skincare</span>
            </h2>
            <p className="promo-card-sub" style={{ fontSize: '0.82rem' }}>
              Luxury formulas. Radiant results.
            </p>
            <button
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}
              onClick={() => handleCategory('Beauty')}
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* Category quick-links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '14px' }}>
        {[
          { icon: '👗', label: 'Fashion', cat: 'Fashion' as Category, color: '#4f8ef7' },
          { icon: '👟', label: 'Footwear', cat: 'Footwear' as Category, color: '#8b5cf6' },
          { icon: '🏠', label: 'Home', cat: 'Home' as Category, color: '#ec4899' },
          { icon: '✨', label: 'Beauty', cat: 'Beauty' as Category, color: '#10b981' },
        ].map(f => (
          <button
            key={f.label}
            onClick={() => handleCategory(f.cat)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '18px', borderRadius: 'var(--radius-lg)',
              background: `rgba(${f.color === '#4f8ef7' ? '79,142,247' : f.color === '#8b5cf6' ? '139,92,246' : f.color === '#ec4899' ? '236,72,153' : '16,185,129'}, 0.06)`,
              border: `1px solid ${f.color}22`,
              transition: 'all 0.25s ease',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${f.color}55`;
              (e.currentTarget as HTMLElement).style.background = `rgba(${f.color === '#4f8ef7' ? '79,142,247' : f.color === '#8b5cf6' ? '139,92,246' : f.color === '#ec4899' ? '236,72,153' : '16,185,129'}, 0.12)`;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = `${f.color}22`;
              (e.currentTarget as HTMLElement).style.background = `rgba(${f.color === '#4f8ef7' ? '79,142,247' : f.color === '#8b5cf6' ? '139,92,246' : f.color === '#ec4899' ? '236,72,153' : '16,185,129'}, 0.06)`;
              (e.currentTarget as HTMLElement).style.transform = 'none';
            }}
          >
            <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {f.label}
              </div>
              <div style={{ fontSize: '0.73rem', color: f.color, fontWeight: 600 }}>Shop →</div>
            </div>
          </button>
        ))}
      </div>

      {/* Feature badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '14px' }}>
        {[
          { icon: '🚀', title: 'Free Delivery', sub: 'On orders over ₹999' },
          { icon: '🔒', title: 'Secure Payment', sub: '256-bit SSL encrypted' },
          { icon: '↩️', title: 'Easy Returns', sub: '30-day hassle-free' },
          { icon: '💬', title: '24/7 Support', sub: 'Chat with our experts' },
        ].map(f => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '1px' }}>{f.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
