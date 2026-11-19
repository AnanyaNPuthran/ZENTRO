import { useEffect, useState } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { OrderProvider } from './context/OrderContext';

import AuthPage from './components/auth/AuthPage';
import HomePage from './components/home/HomePage';
import CheckoutPage from './components/checkout/CheckoutPage';
import OrderSuccessPage from './components/checkout/OrderSuccessPage';
import MyOrdersPage from './components/orders/MyOrdersPage';
import MyAccountPage from './components/account/MyAccountPage';

import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';

import { ToastContainer } from './components/ui/Toast';
import './styles/globals.css';

// ZENTRO LOGO
function ZentroLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span
        style={{
          width: '48px',
          height: '48px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
          color: '#ffffff',
          fontSize: '30px',
          fontWeight: 900,
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
        }}
      >
        Z
      </span>

      <span
        style={{
          fontSize: '30px',
          fontWeight: 900,
          letterSpacing: '2px',
          color: '#60a5fa',
        }}
      >
        ZENTRO
      </span>
    </div>
  );
}

// MAIN ENTRY PAGE
function WelcomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080d19',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
      }}
    >
      <ZentroLogo />

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '45px',
          marginTop: '20px',
        }}
      >
        Welcome to Zentro. Choose how you want to continue.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '25px',
          width: '100%',
          maxWidth: '650px',
        }}
      >
        {/* CUSTOMER */}
        <button
          onClick={() => (window.location.href = '/customer')}
          style={{
            flex: '1',
            minWidth: '240px',
            padding: '35px 20px',
            background: '#111c30',
            border: '1px solid #263752',
            borderRadius: '15px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '40px' }}>🛍️</div>

          <h2 style={{ color: '#60a5fa' }}>Customer</h2>

          <p>Explore products and shop online</p>

          <span style={{ color: '#60a5fa' }}>
            Continue Shopping →
          </span>
        </button>

        {/* ADMIN */}
        <button
          onClick={() => (window.location.href = '/admin')}
          style={{
            flex: '1',
            minWidth: '240px',
            padding: '35px 20px',
            background: '#111c30',
            border: '1px solid #263752',
            borderRadius: '15px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '40px' }}>🔐</div>

          <h2 style={{ color: '#60a5fa' }}>Admin</h2>

          <p>Manage products and dashboard</p>

          <span style={{ color: '#60a5fa' }}>
            Admin Login →
          </span>
        </button>
      </div>

      <p
        style={{
          marginTop: '55px',
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        © 2026 ZENTRO. All Rights Reserved.
      </p>
    </div>
  );
}

// ADMIN DASHBOARD SECURITY CHECK
function AdminDashboardGate() {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('zentro_admin_token');

    if (!token) {
      window.location.replace('/admin');
      return;
    }

    fetch('http://localhost:3001/api/admin/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Admin verification failed');
        }

        setVerified(true);
      })
      .catch(() => {
        localStorage.removeItem('zentro_admin_token');
        window.location.replace('/admin');
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#080d19',
          color: 'white',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <ZentroLogo />
      </div>
    );
  }

  if (!verified) return null;

  return <AdminDashboard />;
}

// APP ROUTER
function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { page } = useNavigation();

  const currentPath = window.location.pathname;

  // MAIN ENTRY PAGE
  if (currentPath === '/') {
    return <WelcomePage />;
  }

  // ADMIN LOGIN
  if (currentPath === '/admin') {
    return <AdminLogin />;
  }

  // ADMIN DASHBOARD
  if (currentPath === '/admin/dashboard') {
    return <AdminDashboardGate />;
  }

  // CUSTOMER SECTION
  if (currentPath === '/customer') {
    if (isLoading) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#080d19',
            color: '#60a5fa',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <ZentroLogo />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AuthPage />;
    }

    switch (page) {
      case 'checkout':
        return <CheckoutPage />;

      case 'order-success':
        return <OrderSuccessPage />;

      case 'my-orders':
        return <MyOrdersPage />;

      case 'my-account':
        return <MyAccountPage />;

      default:
        return <HomePage />;
    }
  }

  return <WelcomePage />;
}

// MAIN APP
export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <OrderProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRouter />
              <ToastContainer />
            </WishlistProvider>
          </CartProvider>
        </OrderProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}