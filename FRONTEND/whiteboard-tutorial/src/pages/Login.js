import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';
import Brand, { BrandMark } from '../components/Brand';
import { FaMoon, FaSun, FaArrowRight } from 'react-icons/fa';

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
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      navigate('/canvases');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const bg = isDarkMode ? 'bg-black' : 'bg-white';
  const text = isDarkMode ? 'text-white' : 'text-black';
  const muted = isDarkMode ? 'text-white/60' : 'text-black/60';
  const subtle = isDarkMode ? 'text-white/40' : 'text-black/40';
  const border = isDarkMode ? 'border-white/10' : 'border-black/10';
  const inputCls = `w-full px-4 py-3.5 rounded-xl outline-none transition-all duration-200 border text-[15px]
    ${isDarkMode
      ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-white/30 focus:border-white/40 focus:bg-black'
      : 'bg-white border-black/10 text-black placeholder-black/30 focus:border-black/40 focus:bg-white'
    }`;
  const primaryBtn = isDarkMode
    ? 'bg-white text-black hover:bg-white/90'
    : 'bg-black text-white hover:bg-black/90';
  const ghostBtn = isDarkMode
    ? 'border border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
    : 'border border-black/10 text-black/70 hover:bg-black/5 hover:text-black';

  return (
    <div className={`min-h-screen w-full flex ${bg}`}>
      {/* Brand panel — hidden on mobile */}
      <div className={`hidden lg:flex flex-col justify-between w-1/2 p-12 border-r ${border} relative overflow-hidden`}>
        <Brand size={32} subtitle="Infinite Whiteboard" />

        {/* Decorative slate-board mock */}
        <div className="relative flex-1 flex items-center justify-center my-12">
          <div className={`relative w-full max-w-md aspect-[4/3] rounded-2xl border ${border} ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-black/[0.02]'} overflow-hidden shadow-2xl`}>
            <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
              <path d="M40 220 Q 80 120, 140 180 T 280 140" stroke={isDarkMode ? '#ffffff' : '#000000'} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9" />
              <rect x="220" y="60" width="120" height="80" rx="6" stroke={isDarkMode ? '#ffffff' : '#000000'} strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="100" cy="80" r="28" stroke={isDarkMode ? '#ffffff' : '#000000'} strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M160 240 L 240 240" stroke={isDarkMode ? '#ffffff' : '#000000'} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
              <text x="60" y="270" fill={isDarkMode ? '#ffffff' : '#000000'} opacity="0.5" fontFamily="Caveat, cursive" fontSize="22">think · sketch · ship</text>
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <p className={`text-3xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.02em' }}>
            An infinite canvas for the way you think.
          </p>
          <p className={`text-sm ${muted}`}>
            Sketch algorithms, paste problem statements, share a snapshot — all in one premium board.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        {/* Top right controls */}
        <div className="flex items-center justify-between px-6 lg:px-10 py-5">
          <div className="lg:hidden"><Brand size={26} /></div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigate('/register')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ghostBtn}`}
            >
              Sign up
            </button>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${ghostBtn}`}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-10 pb-20">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-10">
              <h1 className={`text-4xl font-bold tracking-tight mb-3 ${text}`} style={{ letterSpacing: '-0.03em' }}>
                Welcome back
              </h1>
              <p className={`text-[15px] ${muted}`}>
                Sign in to your Slate workspace.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className={`block text-xs font-semibold uppercase tracking-[0.15em] ${subtle}`}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className={`block text-xs font-semibold uppercase tracking-[0.15em] ${subtle}`}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={inputCls}
                />
              </div>

              {error && (
                <div className={`p-3.5 rounded-xl flex items-center gap-3 text-sm border
                  ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-[15px] tracking-tight
                  transition-all duration-150 flex items-center justify-center gap-2
                  ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'}
                  ${primaryBtn}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>

            <div className={`mt-10 pt-6 border-t ${border} text-center`}>
              <p className={`text-sm ${muted}`}>
                New to Slate?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className={`font-semibold ${text} underline-offset-4 hover:underline`}
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 lg:px-10 py-5 text-xs ${subtle} flex items-center justify-between`}>
          <div className="flex items-center gap-2 lg:hidden">
            <BrandMark size={16} />
            <span>Slate</span>
          </div>
          <span className="ml-auto">© Slate — Infinite Whiteboard</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
