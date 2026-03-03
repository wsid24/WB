import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';
import CanvasPreview from '../components/CanvasPreview';

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
  const [deletingCanvasId, setDeletingCanvasId] = useState(null);
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

  const handleDeleteCanvas = async (e, canvasId) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this canvas?')) {
      return;
    }

    setDeletingCanvasId(canvasId);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete canvas');
      }

      setCanvases(prev => prev.filter(c => c._id !== canvasId));
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingCanvasId(null);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black text-neutral-300' : 'bg-slate-50 text-slate-600'}`}>
        <div className="flex flex-col items-center space-y-4">
          <svg className={`animate-spin h-10 w-10 ${isDarkMode ? 'text-white' : 'text-indigo-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Loading your canvases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>

      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-30 backdrop-blur-md border-b transition-all ${isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            <div className="flex-shrink-0 flex items-center">
              <h1 className={`text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent ${isDarkMode ? 'bg-white text-white' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}>
                Whiteboard
              </h1>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors active:scale-95 ${isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                title="Toggle Theme"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>

              <button
                onClick={() => navigate('/profile')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 ${isDarkMode ? 'bg-white hover:bg-neutral-200 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}`}
              >
                Profile
              </button>

              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 ${isDarkMode ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 border border-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            My Workspace
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center px-5 py-2.5 rounded-xl font-bold tracking-wide
              transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg active:scale-95
              ${isDarkMode
                ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.15)]'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]'
              }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Canvas
          </button>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 border ${isDarkMode ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Canvas Grid */}
        {canvases.length === 0 ? (
          <div className={`flex flex-col items-center justify-center p-16 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-neutral-800 bg-[#0a0a0a]' : 'border-slate-300 bg-white'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-neutral-800/50 text-neutral-400' : 'bg-slate-100 text-slate-500'}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No canvases found</h3>
            <p className={`text-center ${isDarkMode ? 'text-neutral-500' : 'text-slate-500'}`}>
              Get started by creating your first collaborative whiteboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {canvases.map((canvas) => (
              <div
                key={canvas._id}
                className={`group flex flex-col justify-between rounded-2xl p-6 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]
                  ${isDarkMode
                    ? 'bg-[#111111] border-neutral-800 hover:border-neutral-600'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 hover:ring-offset-1'
                  }`}
                onClick={() => navigate(`/canvas/${canvas._id}`)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-lg font-bold truncate pr-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} title={canvas.name}>
                      {canvas.name}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => openShareModal(e, canvas._id)}
                        className={`p-2 rounded-lg transition-colors
                          ${isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}
                        `}
                        title="Share Canvas"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteCanvas(e, canvas._id)}
                        disabled={deletingCanvasId === canvas._id}
                        className={`p-2 rounded-lg transition-colors
                          ${isDarkMode ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400' : 'bg-red-50 text-red-600 hover:bg-red-100'}
                        `}
                        title="Delete Canvas"
                      >
                        {deletingCanvasId === canvas._id ? (
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Visual Divider / Preview Area */}
                  <div className={`w-full h-24 rounded-lg mb-5 overflow-hidden flex items-center justify-center border-t border-l border-r
                    ${isDarkMode ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-100'}
                  `}>
                    <CanvasPreview elements={canvas.elements} />
                  </div>
                </div>

                <div className={`space-y-2 text-xs font-medium ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Modified
                    </span>
                    <span className={isDarkMode ? 'text-neutral-300' : 'text-slate-600'}>
                      {new Date(canvas.modifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Elements
                    </span>
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-700'}`}>
                      {canvas.elements?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      Shared With
                    </span>
                    <span className={isDarkMode ? 'text-neutral-300' : 'text-slate-600'}>
                      {canvas.sharedWith?.length || 0} users
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/70 animate-in fade-in duration-200">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-[#111111] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create New Canvas</h2>
            <form onSubmit={handleCreateCanvas}>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="E.g., System Architecture Diagram"
                  value={canvasName}
                  onChange={(e) => setCanvasName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg outline-none transition-all duration-200 border-2
                    ${isDarkMode
                      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:bg-black focus:border-white focus:ring-1 focus:ring-white focus:ring-offset-0'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:border-indigo-500'
                    }`}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCanvasName('');
                    setError('');
                  }}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-colors active:scale-95
                    ${isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all active:scale-95
                    ${isDarkMode
                      ? 'bg-white text-black hover:bg-neutral-200 shadow-md'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}
                    ${creating ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}
                  `}
                >
                  {creating ? 'Creating...' : 'Create Canvas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/70 animate-in fade-in duration-200">
          <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-[#111111] border-neutral-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Share Canvas</h2>

            {shareSuccess && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 border ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <p className="font-medium text-sm">{shareSuccess}</p>
              </div>
            )}

            {error && !shareSuccess && (
              <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 border ${isDarkMode ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-red-50 text-red-600 border-red-100'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleShareCanvas}>
              <div className="mb-6">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-neutral-300' : 'text-slate-700'}`}>Invite via Email</label>
                <input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-3 rounded-lg outline-none transition-all duration-200 border-2
                    ${isDarkMode
                      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:bg-black focus:border-white focus:ring-1 focus:ring-white focus:ring-offset-0'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:border-indigo-500'
                    }`}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEmail('');
                    setSharingCanvasId(null);
                    setError('');
                    setShareSuccess('');
                  }}
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-colors active:scale-95
                    ${isDarkMode ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                  `}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sharing}
                  className={`px-6 py-2.5 rounded-lg font-bold tracking-wide transition-all active:scale-95
                    ${isDarkMode
                      ? 'bg-white text-black hover:bg-neutral-200 shadow-md'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}
                    ${sharing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}
                  `}
                >
                  {sharing ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Canvases;
