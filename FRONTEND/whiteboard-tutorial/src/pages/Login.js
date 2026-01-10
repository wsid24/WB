import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3030/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store the JWT token in localStorage
      localStorage.setItem('token', data.token);
      
      // Navigate to canvases page
      navigate('/canvases');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa',
      transition: 'background-color 0.3s ease',
      padding: '30px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
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
      </div>
      <div style={{ 
        maxWidth: '450px', 
        margin: '0 auto', 
        padding: '40px',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        border: `1px solid ${isDarkMode ? '#4a4a4a' : '#e5e7eb'}`
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '800',
          marginBottom: '30px',
          color: isDarkMode ? '#e5e5e5' : '#1a1a1a',
          textAlign: 'center'
        }}>Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '600',
              color: isDarkMode ? '#e5e5e5' : '#1a1a1a'
            }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px',
                boxSizing: 'border-box',
                borderRadius: '8px',
                border: `2px solid ${isDarkMode ? '#4a4a4a' : '#e5e7eb'}`,
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                color: isDarkMode ? '#e5e5e5' : '#1a1a1a',
                fontSize: '14px',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '600',
              color: isDarkMode ? '#e5e5e5' : '#1a1a1a'
            }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px',
                boxSizing: 'border-box',
                borderRadius: '8px',
                border: `2px solid ${isDarkMode ? '#4a4a4a' : '#e5e7eb'}`,
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                color: isDarkMode ? '#e5e5e5' : '#1a1a1a',
                fontSize: '14px',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>
          {error && <p style={{ 
            color: '#ef4444',
            backgroundColor: isDarkMode ? '#3d1a1a' : '#fee2e2',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>{error}</p>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px',
              backgroundColor: isDarkMode ? '#6366f1' : '#4f46e5',
              color: 'white', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ 
          marginTop: '20px',
          textAlign: 'center',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: '14px'
        }}>
          Don't have an account? <a href="/register" style={{
            color: isDarkMode ? '#818cf8' : '#4f46e5',
            textDecoration: 'none',
            fontWeight: '600'
          }}>Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
