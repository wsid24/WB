import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';

function Canvases() {
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canvasName, setCanvasName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharingCanvasId, setSharingCanvasId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState('');
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();

  const fetchCanvases = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
        const response = await fetch(`${API_URL}/api/canvas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            throw new Error(data.error || 'Failed to fetch canvases');
        }

        setCanvases(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateCanvas = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/canvas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: canvasName || 'Untitled Canvas' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create canvas');
      }

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

  const handleShareCanvas = async (e) => {
    e.preventDefault();
    setSharing(true);
    setError('');
    setShareSuccess('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/canvas/share/${sharingCanvasId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareWithEmail: shareEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share canvas');
      }

      // Update the canvas in the state with the functional form to ensure we have the latest state
      setCanvases(prevCanvases => 
        prevCanvases.map(canvas => 
          canvas._id === sharingCanvasId ? data : canvas
        )
      );
      
      setShareSuccess('Canvas shared successfully!');
      setTimeout(() => {
        setShowShareModal(false);
        setShareEmail('');
        setSharingCanvasId(null);
        setShareSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setSharing(false);
    }
  };

  const openShareModal = (e, canvasId) => {
    e.stopPropagation(); // Prevent card click navigation
    setSharingCanvasId(canvasId);
    setShowShareModal(true);
    setError('');
    setShareSuccess('');
  };

  if (loading) {
    return <div style={styles.loading}>Loading canvases...</div>;
  }

  return (
    <div style={{...styles.container, backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f9fa'}}>
      <div style={styles.header}>
        <h1 style={{...styles.title, color: isDarkMode ? '#e5e5e5' : '#1a1a1a'}}>My Canvases</h1>
        <div style={styles.headerButtons}>
          <button onClick={toggleTheme} style={{...styles.themeBtn, backgroundColor: isDarkMode ? '#6366f1' : '#4f46e5'}} title="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => navigate('/profile')} style={{...styles.profileBtn, backgroundColor: isDarkMode ? '#6366f1' : '#4f46e5'}}>
            Profile
          </button>
          <button onClick={handleLogout} style={{...styles.logoutBtn, backgroundColor: isDarkMode ? '#ef4444' : '#dc3545'}}>
            Logout
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button onClick={() => setShowCreateModal(true)} style={{...styles.createBtn, backgroundColor: isDarkMode ? '#10b981' : '#059669'}}>
        + Create New Canvas
      </button>

      {canvases.length === 0 ? (
        <div style={{...styles.emptyState, color: isDarkMode ? '#9ca3af' : '#666'}}>
          <p>No canvases yet. Create your first canvas!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {canvases.map((canvas) => (
            <div 
              key={canvas._id} 
              style={{...styles.card, backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff', color: isDarkMode ? '#e5e5e5' : '#1a1a1a', borderColor: isDarkMode ? '#4a4a4a' : '#e5e7eb'}}
              onClick={() => navigate(`/canvas/${canvas._id}`)}
            >
              <div style={styles.cardHeader}>
                <h3 style={{...styles.canvasName, color: isDarkMode ? '#e5e5e5' : '#1a1a1a'}}>{canvas.name}</h3>
                <button
                  onClick={(e) => openShareModal(e, canvas._id)}
                  style={{...styles.shareBtn, backgroundColor: isDarkMode ? '#6366f1' : '#4f46e5'}}
                  title="Share canvas"
                >
                  🔗
                </button>
              </div>
              <div style={{...styles.cardDetails, color: isDarkMode ? '#9ca3af' : '#6b7280'}}>
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
          <div style={{...styles.modalContent, backgroundColor: isDarkMode ? '#2d2d2d' : 'white'}}>
            <h2 style={{...styles.modalTitle, color: isDarkMode ? '#e5e5e5' : '#1a1a1a'}}>Create New Canvas</h2>
            <form onSubmit={handleCreateCanvas}>
              <input
                type="text"
                placeholder="Canvas name (optional)"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                style={{...styles.input, backgroundColor: isDarkMode ? '#1a1a1a' : 'white', color: isDarkMode ? '#e5e5e5' : '#1a1a1a', borderColor: isDarkMode ? '#4a4a4a' : '#e5e7eb'}}
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

      {showShareModal && (
        <div style={styles.modal}>
          <div style={{...styles.modalContent, backgroundColor: isDarkMode ? '#2d2d2d' : 'white'}}>
            <h2 style={{...styles.modalTitle, color: isDarkMode ? '#e5e5e5' : '#1a1a1a'}}>Share Canvas</h2>
            {shareSuccess && <p style={styles.success}>{shareSuccess}</p>}
            {error && <p style={styles.errorInModal}>{error}</p>}
            <form onSubmit={handleShareCanvas}>
              <input
                type="email"
                placeholder="Enter email to share with"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
                style={{...styles.input, backgroundColor: isDarkMode ? '#1a1a1a' : 'white', color: isDarkMode ? '#e5e5e5' : '#1a1a1a', borderColor: isDarkMode ? '#4a4a4a' : '#e5e7eb'}}
              />
              <div style={styles.modalButtons}>
                <button type="submit" disabled={sharing} style={{...styles.submitBtn, opacity: sharing ? 0.6 : 1}}>
                  {sharing ? 'Sharing...' : 'Share'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEmail('');
                    setSharingCanvasId(null);
                    setError('');
                    setShareSuccess('');
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px',
    fontFamily: 'Inter, Arial, sans-serif',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    margin: 0,
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  themeBtn: {
    padding: '10px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
  },
  profileBtn: {
    padding: '10px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
  },
  logoutBtn: {
    padding: '10px 24px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
  },
  createBtn: {
    padding: '16px 32px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
    transition: 'all 0.2s ease',
  },
  loading: {
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '18px',
    color: 'var(--text-secondary)',
  },
  error: {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#666',
    fontSize: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  canvasName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 0,
    marginBottom: 0,
    borderBottom: '3px solid #10b981',
    paddingBottom: '12px',
    flex: 1,
  },
  shareBtn: {
    padding: '8px 12px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
    marginLeft: '12px',
  },
  cardDetails: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.8',
  },
  detail: {
    margin: '6px 0',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    minWidth: '450px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '24px',
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
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
  success: {
    color: '#10b981',
    backgroundColor: '#d1fae5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '600',
  },
  errorInModal: {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
};

export default Canvases;
