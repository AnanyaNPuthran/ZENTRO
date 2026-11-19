import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import '../../styles/auth.css';

export default function MyAccountPage() {
  const { user, logout } = useAuth();
  const { navigateTo } = useNavigation();

  if (!user) {
    return <div>Please sign in to view your account.</div>;
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((word: string) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080d19',
      color: 'white',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>

      <div style={{
        maxWidth: '750px',
        margin: 'auto'
      }}>

        <button
          onClick={() => navigateTo('home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            fontSize: '15px',
            marginBottom: '25px'
          }}
        >
          ← Back to Shopping
        </button>

        <h1 style={{ fontSize: '30px' }}>
          My Account
        </h1>

        <p style={{ color: '#94a3b8' }}>
          Manage your ZENTRO account information.
        </p>

        <div style={{
          background: '#111c30',
          border: '1px solid #263752',
          borderRadius: '18px',
          padding: '30px',
          marginTop: '30px'
        }}>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px'
          }}>

            <div style={{
              width: '75px',
              height: '75px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '27px',
              fontWeight: 800
            }}>
              {initials}
            </div>

            <div>
              <h2 style={{ margin: 0 }}>
                {user.name || 'Customer'}
              </h2>

              <p style={{ color: '#94a3b8' }}>
                ZENTRO Customer
              </p>
            </div>

          </div>

          <hr style={{
            border: 'none',
            borderTop: '1px solid #263752'
          }} />

          <h3 style={{ marginTop: '25px' }}>
            Personal Information
          </h3>

          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#94a3b8' }}>Full Name</p>
            <p>{user.name || 'Not available'}</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#94a3b8' }}>Email Address</p>
            <p>{user.email || 'Not available'}</p>
          </div>

          <button
            onClick={() => navigateTo('my-orders')}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '30px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            View My Orders
          </button>

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '14px',
              marginTop: '12px',
              background: 'transparent',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Sign Out
          </button>

        </div>
      </div>
    </div>
  );
}