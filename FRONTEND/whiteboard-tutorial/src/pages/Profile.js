import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';
import Brand from '../components/Brand';
import { FaMoon, FaSun, FaArrowLeft, FaSignOutAlt, FaEnvelope, FaUser, FaCalendarAlt } from 'react-icons/fa';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
        setUser(data);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('token') || err.message.includes('Invalid')) {
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

  const bg = isDarkMode ? 'bg-black' : 'bg-white';
  const text = isDarkMode ? 'text-white' : 'text-black';
  const muted = isDarkMode ? 'text-white/60' : 'text-black/60';
  const subtle = isDarkMode ? 'text-white/40' : 'text-black/40';
  const border = isDarkMode ? 'border-white/10' : 'border-black/10';
  const cardBg = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white';
  const primaryBtn = isDarkMode
    ? 'bg-white text-black hover:bg-white/90'
    : 'bg-black text-white hover:bg-black/90';
  const ghostBtn = isDarkMode
    ? 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
    : 'border border-black/10 text-black/70 hover:bg-black/5 hover:text-black';
  const iconBtn = isDarkMode
    ? 'text-white/60 hover:bg-white/5 hover:text-white'
    : 'text-black/60 hover:bg-black/5 hover:text-black';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="flex flex-col items-center gap-4">
          <svg className={`animate-spin h-8 w-8 ${text}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className={`text-sm ${muted}`}>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 ${bg}`}>
        <div className={`p-8 rounded-2xl max-w-md w-full text-center border ${border} ${cardBg}`}>
          <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4
            ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className={`text-xl font-semibold tracking-tight mb-2 ${text}`}>Something went wrong</h3>
          <p className={`text-sm mb-6 ${muted}`}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${primaryBtn}`}
          >
            Return to sign in
          </button>
        </div>
      </div>
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Top nav */}
      <nav className={`sticky top-0 z-30 backdrop-blur-xl border-b ${border} ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}`}>
        <div className="max-w-4xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Brand size={26} subtitle="Account" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/canvases')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${ghostBtn}`}
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">Boards</span>
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${iconBtn}`}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
        {/* Hero */}
        <div className="mb-10">
          <div className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${subtle}`}>Account</div>
          <h1 className={`text-5xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.03em' }}>
            Your profile
          </h1>
          <p className={`mt-3 ${muted}`}>Manage how you appear on Slate.</p>
        </div>

        {/* Identity card */}
        <div className={`rounded-2xl border ${border} ${cardBg} p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6`}>
          <div
            className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold border ${border}
              ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
          >
            {initial}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className={`text-3xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.02em' }}>{user?.name}</h2>
            <p className={`mt-1 ${muted}`}>{user?.email}</p>
            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${border}
              ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-black/5 text-black/70'}`}>
              <FaCalendarAlt className="text-[10px]" />
              Joined {joined}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={`rounded-2xl border ${border} ${cardBg} overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${border} flex items-center justify-between`}>
            <h3 className={`text-sm font-semibold uppercase tracking-[0.15em] ${subtle}`}>Account details</h3>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-white/10' : 'divide-black/10'}`}>
            <div className="px-6 py-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-black/5 text-black/70'}`}>
                  <FaUser className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs uppercase tracking-[0.15em] font-semibold mb-0.5 ${subtle}`}>Name</div>
                  <div className={`font-medium truncate ${text}`}>{user?.name}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-black/5 text-black/70'}`}>
                  <FaEnvelope className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs uppercase tracking-[0.15em] font-semibold mb-0.5 ${subtle}`}>Email</div>
                  <div className={`font-medium truncate ${text}`}>{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isDarkMode ? 'bg-white/5 text-white/70' : 'bg-black/5 text-black/70'}`}>
                  <FaCalendarAlt className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs uppercase tracking-[0.15em] font-semibold mb-0.5 ${subtle}`}>Member since</div>
                  <div className={`font-medium truncate ${text}`}>{joined}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all
              ${isDarkMode
                ? 'border border-red-500/30 text-red-300 hover:bg-red-500/10'
                : 'border border-red-200 text-red-600 hover:bg-red-50'}`}
          >
            <FaSignOutAlt className="text-xs" />
            Sign out of Slate
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile;
