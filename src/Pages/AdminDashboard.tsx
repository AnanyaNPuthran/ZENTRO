import { useEffect, useState } from 'react';
import { PRODUCTS } from '../data/products';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

type DeliveryStatus =
  | 'Processing'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered';

interface AdminOrder {
  orderId: string;
  items: {
    name?: string;
    title?: string;
    quantity?: number;
  }[];

  address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  payment: string;
  paymentMethod?: string;
  paymentStatus?: string;

  grandTotal: number;
  placedAt: string;
  status: DeliveryStatus;
}

const DELIVERY_STATUSES: DeliveryStatus[] = [
  'Processing',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

const API_URL = 'http://localhost:3001/api/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState('');

  // LOAD DASHBOARD DATA
  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('zentro_admin_token');

      if (!token) {
        throw new Error('Admin login required. Please log in again.');
      }

      // 1. SYNC PRODUCTS
      const syncResponse = await fetch(
        `${API_URL}/sync-products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            products: PRODUCTS
          })
        }
      );

      if (!syncResponse.ok) {
        const data = await syncResponse.json();
        throw new Error(data.error || 'Product sync failed.');
      }

      // 2. LOAD STATISTICS
      const statsResponse = await fetch(
        `${API_URL}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!statsResponse.ok) {
        throw new Error('Unable to load dashboard statistics.');
      }

      const statsData = await statsResponse.json();

      setStats(statsData);

      // 3. LOAD CUSTOMER ORDERS
      const ordersResponse = await fetch(
        `${API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!ordersResponse.ok) {
        throw new Error('Unable to load customer orders.');
      }

      const ordersData = await ordersResponse.json();

      let orderList: AdminOrder[] = [];

      if (Array.isArray(ordersData)) {
        orderList = ordersData;
      } else if (Array.isArray(ordersData.orders)) {
        orderList = ordersData.orders;
      } else if (Array.isArray(ordersData.data)) {
        orderList = ordersData.data;
      }

      setOrders(orderList);

      setSuccess('Dashboard and orders refreshed successfully!');

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  // LOAD WHEN ADMIN DASHBOARD OPENS
  useEffect(() => {
    loadDashboard();
  }, []);

  // UPDATE DELIVERY STATUS
  const updateDeliveryStatus = async (
    orderId: string,
    status: DeliveryStatus
  ) => {
    try {
      const token = localStorage.getItem('zentro_admin_token');

      if (!token) {
        throw new Error('Admin login required.');
      }

      setUpdatingOrder(orderId);
      setError('');
      setSuccess('');

      const response = await fetch(
        `${API_URL}/orders/${encodeURIComponent(orderId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to update delivery status.'
        );
      }

      // UPDATE ORDER ON SCREEN
      setOrders(previousOrders =>
        previousOrders.map(order =>
          order.orderId === orderId
            ? { ...order, status }
            : order
        )
      );

      setSuccess(
        `Order ${orderId} updated to ${status} successfully!`
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Status update failed.'
      );
    } finally {
      setUpdatingOrder('');
    }
  };

  // DASHBOARD CARDS
  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers
    },
    {
      title: 'Total Revenue',
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080d19',
      color: 'white',
      padding: '30px',
      fontFamily: 'Arial, sans-serif'
    }}>

      {/* ADMIN BRAND */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px'
      }}>

        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 800
        }}>
          Z
        </div>

        <h1 style={{
          color: '#60a5fa',
          margin: 0,
          letterSpacing: '3px'
        }}>
          ZENTRO ADMIN
        </h1>

      </div>

      <p>Welcome to your Admin Dashboard</p>

      {/* LOADING */}
      {loading && (
        <p style={{ color: '#60a5fa' }}>
          Loading dashboard data...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <div style={{
          background: '#451a1a',
          color: '#fca5a5',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          {error}
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div style={{
          background: '#14532d',
          color: '#86efac',
          padding: '12px',
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          {success}
        </div>
      )}

      {/* DASHBOARD CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '35px'
      }}>

        {cards.map(item => (
          <div
            key={item.title}
            style={{
              background: '#111c30',
              padding: '25px',
              borderRadius: '12px',
              border: '1px solid #263752'
            }}
          >
            <h3>{item.title}</h3>

            <h2 style={{ color: '#60a5fa' }}>
              {loading ? '...' : item.value}
            </h2>
          </div>
        ))}

      </div>

      {/* CUSTOMER ORDER MANAGEMENT */}
      <section style={{ marginTop: '50px' }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>

          <h2 style={{ color: '#60a5fa' }}>
            Customer Order Management
          </h2>

          {/* REFRESH BUTTON */}
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '11px 20px',
              borderRadius: '7px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontWeight: 600
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Orders'}
          </button>

        </div>

        {/* NO ORDERS */}
        {!loading && orders.length === 0 && (
          <div style={{
            background: '#111c30',
            padding: '25px',
            borderRadius: '10px',
            marginTop: '20px',
            border: '1px solid #263752'
          }}>
            No customer orders found.
          </div>
        )}

        {/* ORDER LIST */}
        {Array.isArray(orders) && orders.map(order => (

          <div
            key={order.orderId}
            style={{
              background: '#111c30',
              border: '1px solid #263752',
              borderRadius: '12px',
              padding: '22px',
              marginTop: '20px'
            }}
          >

            {/* ORDER ID */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>

              <h3 style={{ color: '#60a5fa' }}>
                Order ID: {order.orderId}
              </h3>

              <span style={{
                background: '#1e3a5f',
                color: '#93c5fd',
                padding: '8px 14px',
                borderRadius: '20px'
              }}>
                {order.status || 'Processing'}
              </span>

            </div>

            {/* CUSTOMER DETAILS */}
            <h3>Customer Details</h3>

            <p>Name: {order.address?.name || 'N/A'}</p>
            <p>Phone: {order.address?.phone || 'N/A'}</p>

            <p>
              Address: {order.address?.address || 'N/A'},
              {' '}{order.address?.city || ''},
              {' '}{order.address?.state || ''} -
              {' '}{order.address?.pincode || ''}
            </p>

            {/* ORDERED PRODUCTS */}
            <h3>Ordered Products</h3>

            {order.items?.map((item, index) => (
              <p key={index}>
                {item.name || item.title || 'Product'}
                {' '} × {item.quantity || 1}
              </p>
            ))}

            {/* PAYMENT DETAILS */}
            <h3>Payment Details</h3>

            <p>
              Payment Method: {order.paymentMethod || order.payment || 'N/A'}
            </p>

            <p>
              Payment Status: {order.paymentStatus || 'Pending'}
            </p>

            <h3 style={{ color: '#4ade80' }}>
              Total Amount: ₹
              {Number(order.grandTotal || 0).toLocaleString('en-IN')}
            </h3>

            <p>
              Order Date: {
                order.placedAt
                  ? new Date(order.placedAt).toLocaleString('en-IN')
                  : 'N/A'
              }
            </p>

            {/* DELIVERY STATUS */}
            <div style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop: '1px solid #263752'
            }}>

              <h3 style={{ color: '#60a5fa' }}>
                Update Delivery Status
              </h3>

              <select
                value={order.status || 'Processing'}
                disabled={updatingOrder === order.orderId}
                onChange={event =>
                  updateDeliveryStatus(
                    order.orderId,
                    event.target.value as DeliveryStatus
                  )
                }
                style={{
                  width: '100%',
                  maxWidth: '350px',
                  padding: '12px',
                  borderRadius: '7px',
                  background: '#080d19',
                  color: 'white',
                  border: '1px solid #3b82f6',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >

                {DELIVERY_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}

              </select>

              {updatingOrder === order.orderId && (
                <p style={{ color: '#60a5fa' }}>
                  Updating delivery status...
                </p>
              )}

            </div>

          </div>

        ))}

      </section>

    </div>
  );
}