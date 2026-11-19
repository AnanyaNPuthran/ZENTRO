import { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import '../../styles/checkout.css';
import '../../styles/orders.css';

function formatPrice(p: number) {
  return `₹${p.toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

const DELIVERY_STAGES = [
  'Processing',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

const STATUS_CONFIG: Record<string, {
  color: string;
  bg: string;
  icon: string;
}> = {
  Processing: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: '⏳'
  },
  Confirmed: {
    color: '#4f8ef7',
    bg: 'rgba(79,142,247,0.12)',
    icon: '✅'
  },
  Packed: {
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    icon: '📦'
  },
  Shipped: {
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    icon: '🚚'
  },
  'Out for Delivery': {
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    icon: '🛵'
  },
  Delivered: {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    icon: '🎉'
  }
};

export default function MyOrdersPage() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  const userEmail = user?.email?.trim().toLowerCase();
  const userOrders = orders.filter(order => 
    !order.customerEmail || !userEmail || order.customerEmail.trim().toLowerCase() === userEmail
  );

  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);

  return (
    <div className="checkout-page">

      {/* TOP BAR */}
      <div className="checkout-topbar">
        <button
          className="checkout-back-btn"
          onClick={() => navigateTo('home')}
        >
          ← Back to Shopping
        </button>

        <span className="checkout-topbar-logo">ZENTRO</span>
      </div>

      <div style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>

        {/* PAGE HEADING */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            marginBottom: '6px'
          }}>
            My{' '}
            <span style={{
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Orders
            </span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            {userOrders.length === 0
              ? 'You have no orders yet.'
              : `${userOrders.length} order${userOrders.length !== 1 ? 's' : ''} placed`}
          </p>
        </div>

        {/* EMPTY ORDERS */}
        {userOrders.length === 0 ? (
          <div className="checkout-card" style={{
            textAlign: 'center',
            padding: '60px 24px'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '16px'
            }}>
              📋
            </div>

            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              No orders yet
            </h2>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginBottom: '24px'
            }}>
              Start shopping and your orders will appear here.
            </p>

            <button
              className="btn-primary"
              style={{
                borderRadius: '12px',
                padding: '13px 32px'
              }}
              onClick={() => navigateTo('home')}
            >
              Start Shopping
            </button>
          </div>
        ) : (

          /* ORDER LIST */
          <div className="orders-list">

            {userOrders.map(order => {
              const st =
                STATUS_CONFIG[order.status] ||
                STATUS_CONFIG['Confirmed'];

              const isTracking =
                trackingOrder === order.orderId;

              const currentStage =
                DELIVERY_STAGES.indexOf(order.status);

              return (
                <div
                  key={order.orderId}
                  className="checkout-card order-card"
                  style={{ marginBottom: '22px' }}
                >

                  {/* ORDER HEADER */}
                  <div className="order-card-header">

                    <div>
                      <div className="order-id">
                        Order #{order.orderId}
                      </div>

                      <div className="order-date">
                        {formatDate(order.placedAt)}
                      </div>
                    </div>

                    <div
                      className="order-status-badge"
                      style={{
                        color: st.color,
                        background: st.bg
                      }}
                    >
                      {st.icon} {order.status}
                    </div>

                  </div>

                  {/* PRODUCTS */}
                  <div className="order-items-preview">

                    {order.items.slice(0, 3).map(item => (
                      <div
                        key={item.product.id}
                        className="order-item-chip"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="order-item-thumb"
                        />

                        <span className="order-item-chip-name">
                          {item.product.name}
                        </span>

                        <span className="order-item-chip-qty">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}

                    {order.items.length > 3 && (
                      <div className="order-item-more">
                        +{order.items.length - 3} more
                      </div>
                    )}

                  </div>

                  {/* ORDER DETAILS */}
                  <div className="order-card-footer">

                    <div className="order-address">
                      📍 {order.address.city}, {order.address.state}
                    </div>

                    <div className="order-payment">
                      {order.payment === 'cod'
                        ? '💵 COD'
                        : `💳 ${order.paymentMethod || 'Online'}`}
                    </div>

                    <div className="order-total">
                      {formatPrice(order.grandTotal)}
                    </div>

                  </div>

                  {/* PAYMENT STATUS */}
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    borderRadius: '9px',
                    background: 'rgba(79,142,247,0.08)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}>
                    Payment Status:{' '}
                    <strong style={{
                      color: order.paymentStatus === 'Paid (Demo)'
                        ? '#10b981'
                        : '#f59e0b'
                    }}>
                      {order.paymentStatus ||
                        (order.payment === 'cod' ? 'Pending' : 'Paid (Demo)')}
                    </strong>
                  </div>

                  {/* TRACK ORDER BUTTON */}
                  <button
                    type="button"
                    onClick={() =>
                      setTrackingOrder(
                        isTracking ? null : order.orderId
                      )
                    }
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '13px',
                      borderRadius: '9px',
                      border: 'none',
                      background: 'var(--gradient-brand)',
                      color: 'white',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isTracking
                      ? 'Hide Tracking ↑'
                      : '🚚 Track Order'}
                  </button>

                  {/* DELIVERY TRACKING */}
                  {isTracking && (
                    <div style={{
                      marginTop: '22px',
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(79,142,247,0.06)',
                      border: '1px solid rgba(79,142,247,0.18)'
                    }}>

                      <h3 style={{
                        marginTop: 0,
                        marginBottom: '22px',
                        fontSize: '1.1rem'
                      }}>
                        📦 Delivery Tracking
                      </h3>

                      {DELIVERY_STAGES.map((stage, index) => {
                        const completed =
                          currentStage >= index;

                        const isCurrent =
                          currentStage === index;

                        return (
                          <div
                            key={stage}
                            style={{
                              display: 'flex',
                              gap: '14px',
                              minHeight: index === DELIVERY_STAGES.length - 1
                                ? '45px'
                                : '65px'
                            }}
                          >

                            {/* TIMELINE ICON */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center'
                            }}>

                              <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: completed
                                  ? '#10b981'
                                  : '#334155',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: 700
                              }}>
                                {completed ? '✓' : index + 1}
                              </div>

                              {index !== DELIVERY_STAGES.length - 1 && (
                                <div style={{
                                  width: '2px',
                                  flex: 1,
                                  minHeight: '25px',
                                  background: completed
                                    ? '#10b981'
                                    : '#334155'
                                }} />
                              )}

                            </div>

                            {/* TIMELINE TEXT */}
                            <div style={{ paddingBottom: '15px' }}>

                              <div style={{
                                color: completed
                                  ? '#10b981'
                                  : 'var(--text-secondary)',
                                fontWeight: isCurrent ? 800 : 600,
                                fontSize: '14px'
                              }}>
                                {stage}
                                {isCurrent && ' — Current Status'}
                              </div>

                              <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                marginTop: '4px'
                              }}>
                                {completed
                                  ? stage === 'Delivered'
                                    ? 'Your order has been delivered.'
                                    : 'Completed'
                                  : 'Waiting for update'}
                              </div>

                            </div>

                          </div>
                        );
                      })}

                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                        fontSize: '13px'
                      }}>
                        {order.status === 'Delivered'
                          ? '🎉 Your order has been delivered successfully!'
                          : `Your current delivery status is: ${order.status}`}
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}