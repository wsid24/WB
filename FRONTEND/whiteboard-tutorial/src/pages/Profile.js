import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }

        setUser(data);
      } catch (error) {
        setError(error.message);
        // If token is invalid or expired, redirect to login
        if (error.message.includes('token') || error.message.includes('Invalid')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: isDarkMode ? '#e5e5e5' : '#1a1a1a' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '30px',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '800',
          margin: 0,
          color: isDarkMode ? '#e5e5e5' : '#1a1a1a'
        }}>Profile</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{
            padding: '10px 16px',
            backgroundColor: isDarkMode ? '#6366f1' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
          }} title="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => navigate('/canvases')}
            style={{ 
              padding: '10px 24px',
              backgroundColor: isDarkMode ? '#10b981' : '#059669',
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
            }}
          >
            My Canvases
          </button>
        </div>
      </div>
      <h3 style={{ 
        color: isDarkMode ? '#e5e5e5' : '#1a1a1a',
        fontSize: '24px',
        marginBottom: '30px'
      }}>Hello, {user?.name}!</h3>
      <div style={{ 
        marginTop: '20px', 
        padding: '24px', 
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderRadius: '12px',
        border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e5e7eb'}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <p style={{ 
          margin: '12px 0', 
          fontSize: '16px',
          color: isDarkMode ? '#e5e5e5' : '#1a1a1a'
        }}>
          <strong style={{ color: isDarkMode ? '#10b981' : '#059669' }}>Name:</strong> {user?.name}
        </p>
        <p style={{ 
          margin: '12px 0', 
          fontSize: '16px',
          color: isDarkMode ? '#e5e5e5' : '#1a1a1a'
        }}>
          <strong style={{ color: isDarkMode ? '#10b981' : '#059669' }}>Email:</strong> {user?.email}
        </p>
        <p style={{ 
          margin: '12px 0', 
          fontSize: '16px',
          color: isDarkMode ? '#e5e5e5' : '#1a1a1a'
        }}>
          <strong style={{ color: isDarkMode ? '#10b981' : '#059669' }}>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}
        </p>
      </div>
      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '30px',
          padding: '12px 28px',
          backgroundColor: isDarkMode ? '#ef4444' : '#dc3545',
          color: 'white', 
          border: 'none', 
          cursor: 'pointer',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
