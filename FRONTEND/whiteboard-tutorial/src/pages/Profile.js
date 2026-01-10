import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshTokenMethod } from '../utils/refreshtoken';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3030/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Refresh-Token': refreshToken
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          else if(response.status === 302){
            if (!refreshToken) {
                // No refresh token; force login
                navigate('/login');
                return;
            }
            var statuscode = await refreshTokenMethod();
            if(statuscode === 401){
                navigate('/login');
                return;
            }

            window.location.reload();
            return;
          }
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
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Profile</h2>
        <button 
          onClick={() => navigate('/canvases')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          My Canvases
        </button>
      </div>
      <h3>Hello, {user?.name}!</h3>
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account Created:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
      </div>
      <button 
        onClick={handleLogout}
        style={{ 
          marginTop: '20px',
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          cursor: 'pointer',
          borderRadius: '5px'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
