import '../../styles/home.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'var(--gradient-blue-purple)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 800,
                color: '#ffffff'
              }}>Z</div>

              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700,
                letterSpacing: '3px', background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>ZENTRO</span>
            </div>

            <p className="footer-brand-desc">
              The future of shopping is here. Premium products, curated collections, and next-generation shopping experience for the bold and stylish.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {['𝕏', 'in', 'f', '📷'].map((s, i) => (
                <button key={i} style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)', fontSize: '0.85rem',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-glow)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--blue-bright)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-title">Shop</div>
            <div className="footer-links">
              {['Fashion', 'Electronics', 'Beauty', 'Home & Living', 'Footwear', 'New Arrivals', 'Sale'].map(l => (
                <span key={l} className="footer-link" style={{ cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-title">Company</div>
            <div className="footer-links">
              {['About ZENTRO', 'Careers', 'Press', 'Blog', 'Sustainability', 'Investor Relations'].map(l => (
                <span key={l} className="footer-link" style={{ cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-title">Support</div>
            <div className="footer-links">
              {['Help Center', 'Track Order', 'Returns & Refunds', 'Size Guide', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(l => (
                <span key={l} className="footer-link" style={{ cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 ZENTRO. All rights reserved.</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔒</span> 256-bit SSL Secured
            </span>

            <span>Made with ♥ by ZENTRO Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
}