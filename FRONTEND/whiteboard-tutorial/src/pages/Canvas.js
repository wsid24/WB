import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Canvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCanvas = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3030/api/canvas/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error(data.error || 'Failed to load canvas');
        }

        setCanvas(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCanvas();
  }, [id, navigate]);

  if (loading) {
    return <div style={styles.loading}>Loading canvas...</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate('/canvases')} style={styles.backBtn}>
          ← Back to Canvases
        </button>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/canvases')} style={styles.backBtn}>
          ← Back to Canvases
        </button>
        <h1 style={styles.title}>{canvas?.name || 'Canvas Editor'}</h1>
      </div>
      <div style={styles.content}>
        <div style={styles.infoBar}>
          <p style={styles.info}><strong>Canvas ID:</strong> {canvas?._id}</p>
          <p style={styles.info}><strong>Created:</strong> {new Date(canvas?.createdAt).toLocaleString()}</p>
          <p style={styles.info}><strong>Last Modified:</strong> {new Date(canvas?.modifiedAt).toLocaleString()}</p>
          <p style={styles.info}><strong>Elements:</strong> {canvas?.elements?.length || 0}</p>
          <p style={styles.info}><strong>Shared with:</strong> {canvas?.sharedWith?.length || 0} users</p>
        </div>
        <div style={styles.placeholder}>
          <p>Canvas editor will be implemented here</p>
          <p style={styles.note}>This is where your whiteboard drawing functionality will go</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#333',
  },
  content: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    padding: '20px',
    borderRadius: '5px',
    marginTop: '20px',
  },
  infoBar: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  info: {
    margin: 0,
    fontSize: '14px',
    color: '#555',
  },
  placeholder: {
    textAlign: 'center',
    padding: '100px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #ddd',
  },
  note: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#999',
  },
};

export default Canvas;
