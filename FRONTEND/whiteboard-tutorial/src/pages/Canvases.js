import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshTokenMethod } from '../utils/refreshtoken';

function Canvases() {
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canvasName, setCanvasName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchCanvases = async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');  
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
        const response = await fetch('http://localhost:3030/api/canvas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',

                'Refresh-Token': refreshToken
            },
        });
        
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
            throw new Error('Failed to fetch canvases');
        }
        const data = await response.json();

        setCanvases(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
  }, [navigate]);

  const handleCreateCanvas = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    var token = localStorage.getItem('token');
    var refreshToken = localStorage.getItem('refreshToken');  
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      var response = await fetch('http://localhost:3030/api/canvas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Refresh-Token': refreshToken
        },
        body: JSON.stringify({ name: canvasName || 'Untitled Canvas' }),
      });

      var data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        if(response.status === 302){
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
        }
      }

      token = await localStorage.getItem('token');
      refreshToken = await localStorage.getItem('refreshToken');

      console.log('token after refresh:', token);
      console.log('refreshToken after refresh:', refreshToken);

      response = await fetch('http://localhost:3030/api/canvas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Refresh-Token': refreshToken
        },
        body: JSON.stringify({ name: canvasName || 'Untitled Canvas' }),
      });

      data = await response.json();

      setCanvases([...canvases, data]);
      setShowCreateModal(false);
      setCanvasName('');
    } catch (error) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.loading}>Loading canvases...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Canvases</h1>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate('/profile')} style={styles.profileBtn}>
            Profile
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button onClick={() => setShowCreateModal(true)} style={styles.createBtn}>
        + Create New Canvas
      </button>

      {canvases.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No canvases yet. Create your first canvas!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {canvases.map((canvas) => (
            <div 
              key={canvas._id} 
              style={styles.card}
              onClick={() => navigate(`/canvas/${canvas._id}`)}
            >
              <h3 style={styles.canvasName}>{canvas.name}</h3>
              <div style={styles.cardDetails}>
                <p style={styles.detail}>
                  <strong>Created:</strong> {new Date(canvas.createdAt).toLocaleDateString()}
                </p>
                <p style={styles.detail}>
                  <strong>Last Modified:</strong> {new Date(canvas.modifiedAt).toLocaleDateString()}
                </p>
                <p style={styles.detail}>
                  <strong>Elements:</strong> {canvas.elements?.length || 0}
                </p>
                <p style={styles.detail}>
                  <strong>Shared with:</strong> {canvas.sharedWith?.length || 0} users
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Create New Canvas</h2>
            <form onSubmit={handleCreateCanvas}>
              <input
                type="text"
                placeholder="Canvas name (optional)"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                style={styles.input}
              />
              <div style={styles.modalButtons}>
                <button type="submit" disabled={creating} style={styles.submitBtn}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCanvasName('');
                    setError('');
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    color: '#333',
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  profileBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  createBtn: {
    padding: '15px 30px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
    fontSize: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  canvasName: {
    fontSize: '20px',
    color: '#333',
    marginTop: 0,
    marginBottom: '15px',
    borderBottom: '2px solid #28a745',
    paddingBottom: '10px',
  },
  cardDetails: {
    fontSize: '14px',
    color: '#555',
  },
  detail: {
    margin: '8px 0',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    minWidth: '400px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  submitBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Canvases;
