import { useEffect, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import '../../styles/checkout.css';

interface OrderData {
  orderId: string;
  items: Array<{ product: { id: string; name: string; image: string; category: string; price: number }; quantity: number }>;
  address: { name: string; phone: string; address: string; city: string; state: string; pincode: string };
  payment: string;
  totalPrice: number;
  shipping: number;
  gst: number;
  grandTotal: number;
  placedAt: string;
}

function formatPrice(p: number) {
  return `₹${p.toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export default function OrderSuccessPage() {
  const { navigateTo } = useNavigation();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('zentro_last_order');
    if (raw) {
      try {
        setOrder(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  }, []);

  if (!order) {
    // Fallback if sessionStorage is cleared
    return (
      <div className="success-page">
        <div className="success-icon-wrap">🎉</div>
        <h1 className="success-title">Order Placed!</h1>
        <p className="success-sub">Your order has been successfully placed.</p>
        <div style={{ marginTop: '32px' }}>
          <button className="btn-primary" style={{ borderRadius: '12px', padding: '14px 36px', fontSize: '1rem' }}
            onClick={() => navigateTo('home')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.placedAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryStr = estimatedDelivery.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="success-page">
      {/* Animated checkmark */}
      <div className="success-icon-wrap">✅</div>

      <h1 className="success-title">Order Placed Successfully!</h1>
      <p className="success-sub">Thank you, <strong>{order.address.name}</strong>! Your order is confirmed.</p>
      <div className="success-order-id">Order ID: {order.orderId}</div>

      {/* Order Details */}
      <div className="success-details-card">
        <div className="success-details-title">Order Details</div>

        <div className="success-detail-row">
          <span className="success-detail-label">Order Date</span>
          <span className="success-detail-value">{formatDate(order.placedAt)}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Items</span>
          <span className="success-detail-value">{order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Payment Method</span>
          <span className="success-detail-value">
            {order.payment === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
          </span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Shipping To</span>
          <span className="success-detail-value">
            {order.address.address}, {order.address.city}, {order.address.state} – {order.address.pincode}
          </span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Contact</span>
          <span className="success-detail-value">+91 {order.address.phone}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Subtotal</span>
          <span className="success-detail-value">{formatPrice(order.totalPrice)}</span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">Shipping</span>
          <span className="success-detail-value" style={{ color: order.shipping === 0 ? '#10b981' : undefined }}>
            {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
          </span>
        </div>
        <div className="success-detail-row">
          <span className="success-detail-label">GST (18%)</span>
          <span className="success-detail-value">{formatPrice(order.gst)}</span>
        </div>
        <div className="success-detail-row" style={{ borderBottom: 'none', paddingTop: '10px' }}>
          <span className="success-detail-label" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Total Paid</span>
          <span className="success-detail-value total">{formatPrice(order.grandTotal)}</span>
        </div>
      </div>

      {/* Ordered Items */}
      <div className="success-details-card">
        <div className="success-details-title">Items Ordered</div>
        <div className="success-items-list">
          {order.items.map(item => (
            <div key={item.product.id} className="success-item">
              <img
                className="success-item-img"
                src={item.product.image}
                alt={item.product.name}
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src =
                    `https://placehold.co/50x50/0d0d24/4f8ef7?text=${encodeURIComponent(item.product.name[0])}`;
                }}
              />
              <div className="success-item-info">
                <div className="success-item-name">{item.product.name}</div>
                <div className="success-item-qty">{item.quantity} × {formatPrice(item.product.price)}</div>
              </div>
              <div className="success-item-price">{formatPrice(item.product.price * item.quantity)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Delivery */}
      <div style={{
        marginBottom: '28px', padding: '16px 24px',
        background: 'rgba(79, 142, 247, 0.08)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', textAlign: 'center', width: '100%', maxWidth: '560px'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          Estimated Delivery
        </div>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--blue-bright)' }}>
          🚚 By {deliveryStr}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Delivery within 3–7 business days
        </div>
      </div>

      {/* Actions */}
      <div className="success-actions">
        <button className="btn-primary" onClick={() => navigateTo('home')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
