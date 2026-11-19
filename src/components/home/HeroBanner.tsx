import { useState, useEffect } from 'react';
import { PRODUCTS } from '../../data/products';
import type { Category } from '../../types';
import '../../styles/home.css';

interface HeroBannerProps {
  onCategoryChange: (cat: Category) => void;
  onSearchChange: (q: string) => void;
}

const BANNER_SLIDES = [
  {
    id: 1,
    label: '🔥 Flash Sale – Ends Tonight',
    title: 'Dress the Future.',
    titleHighlight: 'Shop Now.',
    subtitle: 'Up to 60% off on top brands. Premium picks curated for the bold and stylish.',
    cta: 'Explore Sale',
    ctaSecondary: 'Browse All',
    ctaAction: 'Fashion' as Category,
    ctaSecondaryAction: 'All' as Category,
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
    accentColor: '#4f8ef7',
  },
  {
    id: 2,
    label: ' New Arrivals',
    title: 'Next-Gen Tech.',
    titleHighlight: 'Drop Today.',
    subtitle: 'The most advanced gadgets, wearables, and smart home devices – all in one place.',
    cta: 'Shop Electronics',
    ctaSecondary: 'See All Deals',
    ctaAction: 'Electronics' as Category,
    ctaSecondaryAction: 'All' as Category,
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.12) 100%)',
    accentColor: '#8b5cf6',
  },
  {
    id: 3,
    label: '✨ Exclusive Collection',
    title: 'Beauty Redefined.',
    titleHighlight: 'Glow Up.',
    subtitle: 'Science-backed skincare and luxury cosmetics to illuminate your true radiance.',
    cta: 'Shop Beauty',
    ctaSecondary: 'View All',
    ctaAction: 'Beauty' as Category,
    ctaSecondaryAction: 'All' as Category,
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(245,158,11,0.1) 100%)',
    accentColor: '#ec4899',
  },
];

export default function HeroBanner({ onCategoryChange, onSearchChange }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const featuredProducts = PRODUCTS.slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => { next(); }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  function next() {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => { setCurrent(c => (c + 1) % BANNER_SLIDES.length); setIsAnimating(false); }, 200);
  }

  function goTo(i: number) {
    if (i === current || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => { setCurrent(i); setIsAnimating(false); }, 200);
  }

  function handleCta(cat: Category) {
    onCategoryChange(cat);
    onSearchChange('');
    // Smooth scroll to products section
    setTimeout(() => {
      document.querySelector('.section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const slide = BANNER_SLIDES[current];

  return (
    <section className="hero" aria-label="Promotional banner">
      <div className="hero-bg">
        <div className="hero-bg-grid" />
        <div className="hero-bg-glow-1" style={{ background: `radial-gradient(circle, ${slide.accentColor}22 0%, transparent 70%)` }} />
        <div className="hero-bg-glow-2" />
      </div>

      <div className="hero-inner">
        {/* Content */}
        <div className="hero-content" style={{ opacity: isAnimating ? 0 : 1, transition: 'opacity 0.2s ease' }}>
          <div className="hero-badge">
            <div className="hero-badge-dot" style={{ background: slide.accentColor }} />
            {slide.label}
          </div>

          <h1 className="hero-title">
            {slide.title}{' '}
            <span
              className="hero-title-gradient"
              style={{ background: `linear-gradient(135deg, ${slide.accentColor} 0%, #a78bfa 50%, #ec4899 100%)` }}
            >
              {slide.titleHighlight}
            </span>
          </h1>

          <p className="hero-description">{slide.subtitle}</p>

          <div className="hero-cta-group">
            <button
              className="btn-primary"
              style={{ background: `linear-gradient(135deg, ${slide.accentColor}, #8b5cf6)` }}
              onClick={() => handleCta(slide.ctaAction)}
            >
              {slide.cta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button
              className="btn-ghost"
              onClick={() => handleCta(slide.ctaSecondaryAction)}
            >
              {slide.ctaSecondary}
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">50K+</div>
              <div className="hero-stat-label">Products</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">1.2M+</div>
              <div className="hero-stat-label">Happy Shoppers</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">4.9★</div>
              <div className="hero-stat-label">Rating</div>
            </div>
          </div>

          {/* Dot Indicators */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === current ? slide.accentColor : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* Visual Cards */}
        <div className="hero-visual">
          <div className="hero-cards-stack">
            {featuredProducts.map((product) => (
              <div key={product.id} className="hero-card-floating">
                <img
                  className="hero-card-img"
                  src={product.image}
                  alt={product.name}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://placehold.co/300x200/0d0d24/4f8ef7?text=${encodeURIComponent(product.name.split(' ')[0])}`;
                  }}
                />
                <div className="hero-card-body">
                  <div className="hero-card-name">{product.name}</div>
                  <div className="hero-card-price">₹{product.price.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
