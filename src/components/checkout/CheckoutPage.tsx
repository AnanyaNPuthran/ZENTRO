import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import type { PlacedOrder } from '../../context/OrderContext';
import '../../styles/checkout.css';

interface AddressForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

type PaymentMethod = 'cod' | 'online';
type OnlinePaymentMethod = 'UPI' | 'Google Pay' | 'PhonePe' | 'Card';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Chandigarh', 'Puducherry'
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function generateOrderId() {
  return (
    'ZTR' +
    Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { navigateTo } = useNavigation();
  const { addOrder } = useOrders();
  const { user } = useAuth();

  const [form, setForm] = useState<AddressForm>({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [onlineMethod, setOnlineMethod] =
    useState<OnlinePaymentMethod>('UPI');

  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const shipping = totalPrice >= 999 ? 0 : 99;
  const gst = Math.round(totalPrice * 0.18);
  const grandTotal = totalPrice + shipping + gst;

  function handleChange(field: keyof AddressForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Enter your full name';
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!form.address.trim() || form.address.trim().length < 10) {
      newErrors.address = 'Enter your complete address';
    }

    if (!form.city.trim()) {
      newErrors.city = 'Enter your city';
    }

    if (!form.state) {
      newErrors.state = 'Select your state';
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder(skipPaymentCheck = false) {
    if (!validate()) return;

    if (payment === 'online' && !skipPaymentCheck && !paymentCompleted) {
      setOrderError('Please complete payment first.');
      return;
    }

    if (!user?.email) {
      setOrderError('Please sign in before placing your order.');
      return;
    }

    setPlacing(true);
    setOrderError('');

    const orderId = generateOrderId();

    const order: PlacedOrder & {
      paymentMethod: string;
      paymentStatus: string;
      customerEmail: string;
      customerName: string;
    } = {
      orderId,
      customerEmail: user.email,
      customerName: user.name || form.name,
      items,
      address: form,
      payment,
      paymentMethod:
        payment === 'online' ? onlineMethod : 'Cash on Delivery',
      paymentStatus:
        payment === 'online' ? 'Paid (Demo)' : 'Pending',
      totalPrice,
      shipping,
      gst,
      grandTotal,
      placedAt: new Date().toISOString(),
      status: 'Confirmed'
    };

    try {
      const response = await fetch(
        'http://localhost:3001/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save order.');
      }

      addOrder(order);

      sessionStorage.setItem(
        'zentro_last_order',
        JSON.stringify(order)
      );

      clearCart();
      navigateTo('order-success', orderId);

    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : 'Order placement failed.'
      );
    } finally {
      setPlacing(false);
    }
  }

  function handleDemoPayment() {
    if (!validate()) return;

    setPaying(true);

    window.setTimeout(() => {
      setPaymentCompleted(true);
      setPaying(false);
      setShowPaymentSuccess(true);

      window.setTimeout(() => {
        setShowPaymentSuccess(false);
        handlePlaceOrder(true);
      }, 2000);

    }, 1200);
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-topbar">
          <button
            className="checkout-back-btn"
            onClick={() => navigateTo('home')}
          >
            ← Back
          </button>
          <span className="checkout-topbar-logo">ZENTRO</span>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '100px 20px'
        }}>
          <h2>Your cart is empty</h2>
          <button
            className="btn-primary"
            onClick={() => navigateTo('home')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      {showPaymentSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#0f2744',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#10b981' }}>
              Payment Successful!
            </h2>
            <p style={{ color: 'white' }}>
              Placing your order...
            </p>
          </div>
        </div>
      )}

      <div className="checkout-topbar">
        <button
          className="checkout-back-btn"
          onClick={() => navigateTo('home')}
        >
          ← Back to Shopping
        </button>

        <span className="checkout-topbar-logo">ZENTRO</span>

        <div className="checkout-topbar-steps">
          <span className="step-active">Cart</span>
          <span>›</span>
          <span className="step-active">Checkout</span>
          <span>›</span>
          <span>Confirmation</span>
        </div>
      </div>

      <div className="checkout-container">

        {orderError && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '14px',
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            borderRadius: '10px'
          }}>
            {orderError}
          </div>
        )}

        <div>

          {/* ORDER ITEMS */}
          <div className="checkout-card">
            <div className="checkout-card-title">
              🛍️ Order Items
              <span style={{ marginLeft: 'auto' }}>
                {totalItems} items
              </span>
            </div>

            <div className="checkout-items">
              {items.map(item => (
                <div
                  key={item.product.id}
                  className="checkout-item"
                >
                  <img
                    className="checkout-item-img"
                    src={item.product.image}
                    alt={item.product.name}
                  />

                  <div className="checkout-item-info">
                    <div className="checkout-item-cat">
                      {item.product.category}
                    </div>

                    <div className="checkout-item-name">
                      {item.product.name}
                    </div>

                    <div className="checkout-item-qty">
                      Qty: {item.quantity}
                    </div>
                  </div>

                  <div className="checkout-item-subtotal">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHIPPING ADDRESS */}
          <div className="checkout-card">
            <div className="checkout-card-title">
              📍 Shipping Address
            </div>

            <div className="checkout-form">

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className={`form-input${errors.name ? ' error' : ''}`}
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <span className="form-error">{errors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    className={`form-input${errors.phone ? ' error' : ''}`}
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={e =>
                      handleChange(
                        'phone',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                  />
                  {errors.phone && (
                    <span className="form-error">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  className={`form-input${errors.address ? ' error' : ''}`}
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
                {errors.address && (
                  <span className="form-error">{errors.address}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    className={`form-input${errors.city ? ' error' : ''}`}
                    value={form.city}
                    onChange={e => handleChange('city', e.target.value)}
                  />
                  {errors.city && (
                    <span className="form-error">{errors.city}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input
                    className={`form-input${errors.pincode ? ' error' : ''}`}
                    maxLength={6}
                    value={form.pincode}
                    onChange={e =>
                      handleChange(
                        'pincode',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                  />
                  {errors.pincode && (
                    <span className="form-error">{errors.pincode}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <select
                  className={`form-input${errors.state ? ' error' : ''}`}
                  value={form.state}
                  onChange={e => handleChange('state', e.target.value)}
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <span className="form-error">{errors.state}</span>
                )}
              </div>

            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="checkout-card">
            <div className="checkout-card-title">
              💳 Payment Method
            </div>

            <div className="payment-options">

              <button
                type="button"
                className={`payment-option${payment === 'cod' ? ' selected' : ''}`}
                onClick={() => {
                  setPayment('cod');
                  setPaymentCompleted(false);
                }}
              >
                <div className="payment-radio">
                  <div className="payment-radio-dot" />
                </div>
                <div className="payment-icon">💵</div>
                <div className="payment-info">
                  <div className="payment-name">
                    Cash on Delivery
                  </div>
                  <div className="payment-desc">
                    Pay when your order arrives.
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`payment-option${payment === 'online' ? ' selected' : ''}`}
                onClick={() => {
                  setPayment('online');
                  setPaymentCompleted(false);
                }}
              >
                <div className="payment-radio">
                  <div className="payment-radio-dot" />
                </div>
                <div className="payment-icon">💳</div>
                <div className="payment-info">
                  <div className="payment-name">
                    Online Payment
                  </div>
                  <div className="payment-desc">
                    UPI, Google Pay, PhonePe and Cards.
                  </div>
                </div>
              </button>

            </div>

            {payment === 'online' && (
              <div style={{
                marginTop: '20px',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #334155',
                background: '#0f172a'
              }}>
                <h3 style={{ color: 'white' }}>
                  Choose Payment Option
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px'
                }}>
                  {([
                    ['UPI', '📱'],
                    ['Google Pay', '🟢'],
                    ['PhonePe', '🟣'],
                    ['Card', '💳']
                  ] as [OnlinePaymentMethod, string][]).map(
                    ([method, icon]) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setOnlineMethod(method)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: onlineMethod === method
                            ? '2px solid #3b82f6'
                            : '1px solid #475569',
                          background: '#111827',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {icon} {method}
                      </button>
                    )
                  )}
                </div>

                <p style={{ color: 'white' }}>
                  Amount: {formatPrice(grandTotal)}
                </p>

                <button
                  type="button"
                  onClick={handleDemoPayment}
                  disabled={paying || placing}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  {paying
                    ? 'Processing...'
                    : `Pay ${formatPrice(grandTotal)} Now`}
                </button>

                <p style={{
                  color: '#94a3b8',
                  fontSize: '12px'
                }}>
                  This is a simulated payment for the college project.
                  No real transaction will take place.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* ORDER SUMMARY */}
        <div className="order-summary-panel">
          <div className="checkout-card">
            <div className="checkout-card-title">
              📋 Order Summary
            </div>

            <div className="summary-row">
              <span>Subtotal ({totalItems} items)</span>
              <span className="summary-value">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-value">
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>

            <div className="summary-row">
              <span>GST (18%)</span>
              <span className="summary-value">
                {formatPrice(gst)}
              </span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span>Total Payable</span>
              <span className="summary-total-value">
                {formatPrice(grandTotal)}
              </span>
            </div>

            {payment === 'cod' && (
              <button
                className="btn-primary place-order-btn"
                onClick={() => handlePlaceOrder()}
                disabled={placing}
              >
                {placing ? 'Placing Order...' : 'Place Order →'}
              </button>
            )}

            {payment === 'online' && (
              <p style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '13px'
              }}>
                Complete payment to place your order.
              </p>
            )}

            <div className="secure-badge">
              🔒 Secure checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}