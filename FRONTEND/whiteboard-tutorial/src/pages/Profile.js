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
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black text-neutral-300' : 'bg-slate-50 text-slate-600'}`}>
        <div className="flex flex-col items-center space-y-4">
          <svg className={`animate-spin h-10 w-10 ${isDarkMode ? 'text-white' : 'text-indigo-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
        <div className={`p-8 rounded-2xl max-w-md w-full text-center border shadow-xl ${isDarkMode ? 'bg-[#111111] border-red-900/50' : 'bg-white border-red-100'}`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-red-900/20 text-red-500' : 'bg-red-100 text-red-500'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Oops! Something went wrong</h3>
          <p className={`mb-6 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>

      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-30 backdrop-blur-md border-b transition-all ${isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: isDarkMode ? '#ffffff' : '#0f172a' }}>
                Account Settings
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
                onClick={() => navigate('/canvases')}
                className={`px-4 py-2 rounded-lg font-bold tracking-wide transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md active:scale-95
                  ${isDarkMode
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                `}
              >
                My Canvases
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Profile Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile Header Card */}
        <div className={`relative rounded-3xl p-8 md:p-12 border shadow-xl overflow-hidden mb-8 transition-all
          ${isDarkMode ? 'bg-[#111111] border-neutral-800' : 'bg-white border-slate-200'}
        `}>
          {/* Abstract Background Decoration */}
          {isDarkMode ? (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-neutral-800 mix-blend-screen filter blur-[128px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-neutral-700 mix-blend-screen filter blur-[128px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 bg-indigo-300"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2 bg-emerald-300"></div>
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Avatar Placeholder */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-inner border-4
              ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-indigo-50 border-white text-indigo-600'}
            `}>
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className={`text-3xl md:text-4xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {user?.name}
                </h2>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-neutral-400' : 'text-indigo-600'}`}>
                  {user?.email}
                </p>
              </div>

              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border
                ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-slate-50 border-slate-200 text-slate-700'}
              `}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className={`rounded-3xl p-8 border shadow-sm mb-8 transition-all
          ${isDarkMode ? 'bg-[#111111] border-neutral-800' : 'bg-white border-slate-200'}
        `}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <svg className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Account details
          </h3>

          <div className="space-y-6">
            <div className={`p-4 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-slate-500'}`}>Display Name</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-center justify-between border ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-neutral-500' : 'text-slate-500'}`}>Email Address</p>
                <p className={`font-medium py-1.5 px-3 rounded-lg text-sm border ${isDarkMode ? 'bg-black border-neutral-800 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95
              ${isDarkMode
                ? 'bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 border border-red-900/50'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span>Log out of your account</span>
          </button>
        </div>

      </main>
    </div>
  );
}

export default Profile;
