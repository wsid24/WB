import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';
import CanvasPreview from '../components/CanvasPreview';
import Brand from '../components/Brand';
import {
  FaPlus, FaMoon, FaSun, FaUserCircle, FaSignOutAlt,
  FaShareAlt, FaTrash, FaSearch, FaTimes,
} from 'react-icons/fa';

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
  const [query, setQuery] = useState('');
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();

  const fetchCanvases = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch(`${API_URL}/api/canvas`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; }
        throw new Error(data.error || 'Failed to fetch canvases');
      }
      setCanvases(data);
    } catch (err) {
      setError(err.message);
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: canvasName || 'Untitled Canvas' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create canvas');
      setCanvases([data, ...canvases]);
      setShowCreateModal(false);
      setCanvasName('');
      navigate(`/canvas/${data._id}`);
    } catch (err) {
      setError(err.message);
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareWithEmail: shareEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to share canvas');
      setCanvases((prev) => prev.map((c) => (c._id === sharingCanvasId ? data : c)));
      setShareSuccess('Invite sent successfully.');
      setTimeout(() => {
        setShowShareModal(false);
        setShareEmail('');
        setSharingCanvasId(null);
        setShareSuccess('');
      }, 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setSharing(false);
    }
  };

  const openShareModal = (e, canvasId) => {
    e.stopPropagation();
    setSharingCanvasId(canvasId);
    setShowShareModal(true);
    setError('');
    setShareSuccess('');
  };

  const handleDeleteCanvas = async (e, canvasId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this canvas? This cannot be undone.')) return;
    setDeletingCanvasId(canvasId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/canvas/${canvasId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete canvas');
      setCanvases((prev) => prev.filter((c) => c._id !== canvasId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingCanvasId(null);
    }
  };

  // palette
  const bg = isDarkMode ? 'bg-black' : 'bg-white';
  const text = isDarkMode ? 'text-white' : 'text-black';
  const muted = isDarkMode ? 'text-white/60' : 'text-black/60';
  const subtle = isDarkMode ? 'text-white/40' : 'text-black/40';
  const border = isDarkMode ? 'border-white/10' : 'border-black/10';
  const cardBg = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white';
  const cardHover = isDarkMode ? 'hover:border-white/30' : 'hover:border-black/30';
  const inputCls = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 border text-[15px]
    ${isDarkMode
      ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-white/30 focus:border-white/40'
      : 'bg-white border-black/10 text-black placeholder-black/30 focus:border-black/40'
    }`;
  const primaryBtn = isDarkMode
    ? 'bg-white text-black hover:bg-white/90'
    : 'bg-black text-white hover:bg-black/90';
  const ghostBtn = isDarkMode
    ? 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
    : 'border border-black/10 text-black/70 hover:bg-black/5 hover:text-black';
  const iconBtn = isDarkMode
    ? 'text-white/60 hover:bg-white/5 hover:text-white'
    : 'text-black/60 hover:bg-black/5 hover:text-black';

  const filtered = canvases.filter(c =>
    !query.trim() ||
    (c.name || '').toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="flex flex-col items-center gap-4">
          <svg className={`animate-spin h-8 w-8 ${text}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className={`text-sm ${muted}`}>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Top navigation */}
      <nav className={`sticky top-0 z-30 backdrop-blur-xl border-b ${border} ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Brand size={26} subtitle="Workspace" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              title="Profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${iconBtn}`}
            >
              <FaUserCircle />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${iconBtn}`}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-500/5'}`}
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {/* Hero */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${subtle}`}>
              Your workspace
            </div>
            <h1 className={`text-5xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.03em' }}>
              Boards
            </h1>
            <p className={`mt-3 ${muted}`}>
              {canvases.length === 0
                ? "You haven't created anything yet — let's fix that."
                : `${canvases.length} board${canvases.length === 1 ? '' : 's'} · pick up where you left off.`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-72">
              <FaSearch className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs ${subtle}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search boards…"
                className={`${inputCls} pl-10`}
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm tracking-tight transition-all active:scale-[0.98] whitespace-nowrap ${primaryBtn}`}
            >
              <FaPlus className="text-xs" />
              New board
            </button>
          </div>
        </div>

        {error && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm border
            ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {error}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center px-6 py-24 rounded-2xl border ${border} ${cardBg}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <svg className={`w-7 h-7 ${muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v18m6-18v18M3 9h18M3 15h18" /></svg>
            </div>
            <h3 className={`text-xl font-semibold mb-1 ${text}`}>
              {query ? 'Nothing matched your search.' : 'Your first board awaits.'}
            </h3>
            <p className={`text-sm mb-6 ${muted}`}>
              {query ? 'Try a different name.' : 'Create one — it takes about a second.'}
            </p>
            {!query && (
              <button
                onClick={() => setShowCreateModal(true)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${primaryBtn}`}
              >
                <FaPlus className="text-xs" />
                Create your first board
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((canvas) => (
              <div
                key={canvas._id}
                className={`group flex flex-col rounded-2xl border ${border} ${cardBg} ${cardHover} transition-all duration-200 cursor-pointer overflow-hidden`}
                onClick={() => navigate(`/canvas/${canvas._id}`)}
              >
                {/* Preview */}
                <div className={`relative w-full aspect-[5/3] border-b ${border} overflow-hidden ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
                  <CanvasPreview elements={canvas.elements} />

                  {/* Hover action buttons */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openShareModal(e, canvas._id)}
                      title="Share"
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs backdrop-blur-md border ${border}
                        ${isDarkMode ? 'bg-black/60 text-white hover:bg-black/80' : 'bg-white/80 text-black hover:bg-white'}`}
                    >
                      <FaShareAlt />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCanvas(e, canvas._id)}
                      disabled={deletingCanvasId === canvas._id}
                      title="Delete"
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs backdrop-blur-md border
                        ${isDarkMode ? 'bg-black/60 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-white/80 border-red-200 text-red-500 hover:bg-red-50'}`}
                    >
                      {deletingCanvasId === canvas._id ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : <FaTrash />}
                    </button>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className={`font-semibold truncate tracking-tight ${text}`} title={canvas.name}>
                    {canvas.name}
                  </h3>
                  <div className={`mt-1 text-xs ${subtle}`}>
                    {new Date(canvas.modifiedAt || canvas.updatedAt || canvas.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className={`mt-4 pt-4 border-t ${border} flex items-center justify-between text-xs ${muted}`}>
                    <span className="tabular-nums">
                      {canvas.elements?.length || 0} {(canvas.elements?.length || 0) === 1 ? 'element' : 'elements'}
                    </span>
                    {(canvas.sharedWith?.length || 0) > 0 && (
                      <span className={`tabular-nums px-2 py-0.5 rounded-full text-[10px] font-semibold ${isDarkMode ? 'bg-white/10 text-white/80' : 'bg-black/5 text-black/70'}`}>
                        +{canvas.sharedWith.length} shared
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <div className={`w-full max-w-md p-7 rounded-2xl border shadow-2xl ${border} ${cardBg}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.02em' }}>New board</h2>
                <p className={`text-sm mt-1 ${muted}`}>Give it a name. You can change it later.</p>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setCanvasName(''); setError(''); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${iconBtn}`}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateCanvas}>
              <input
                type="text"
                placeholder="e.g., Two Sum brainstorm"
                value={canvasName}
                onChange={(e) => setCanvasName(e.target.value)}
                className={inputCls}
                autoFocus
              />
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCanvasName(''); setError(''); }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${ghostBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2
                    ${creating ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'} ${primaryBtn}`}
                >
                  {creating ? 'Creating…' : 'Create board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60">
          <div className={`w-full max-w-md p-7 rounded-2xl border shadow-2xl ${border} ${cardBg}`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.02em' }}>Invite to collaborate</h2>
                <p className={`text-sm mt-1 ${muted}`}>They'll see and edit this board in real time.</p>
              </div>
              <button
                onClick={() => { setShowShareModal(false); setShareEmail(''); setSharingCanvasId(null); setError(''); setShareSuccess(''); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${iconBtn}`}
              >
                <FaTimes />
              </button>
            </div>

            {shareSuccess && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 text-sm border
                ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {shareSuccess}
              </div>
            )}
            {error && !shareSuccess && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-3 text-sm border
                ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {error}
              </div>
            )}

            <form onSubmit={handleShareCanvas}>
              <label className={`block text-xs font-semibold uppercase tracking-[0.15em] mb-2 ${subtle}`}>
                Their email
              </label>
              <input
                type="email"
                placeholder="friend@domain.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                required
                className={inputCls}
                autoFocus
              />
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowShareModal(false); setShareEmail(''); setSharingCanvasId(null); setError(''); setShareSuccess(''); }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${ghostBtn}`}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={sharing}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                    ${sharing ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'} ${primaryBtn}`}
                >
                  {sharing ? 'Sending…' : 'Send invite'}
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
