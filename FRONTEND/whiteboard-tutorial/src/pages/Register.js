import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';
import Brand, { BrandMark } from '../components/Brand';
import { FaMoon, FaSun, FaArrowRight } from 'react-icons/fa';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(themeContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      navigate('/login');
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

  const features = [
    { num: '01', t: 'Infinite canvas', d: 'Pan, zoom, and never run out of space.' },
    { num: '02', t: 'Paste anything', d: 'Drop images straight from your clipboard.' },
    { num: '03', t: 'Share as image', d: 'Get a public JPG link in one click.' },
    { num: '04', t: 'Real-time', d: 'Collaborate live with anyone you invite.' },
  ];

  return (
    <div className={`min-h-screen w-full flex ${bg}`}>
      {/* Brand panel */}
      <div className={`hidden lg:flex flex-col justify-between w-1/2 p-12 border-r ${border} relative overflow-hidden`}>
        <Brand size={32} subtitle="Infinite Whiteboard" />

        <div className="space-y-8 my-12">
          <h2 className={`text-3xl font-bold tracking-tight ${text}`} style={{ letterSpacing: '-0.02em' }}>
            A premium board built for thinkers and competitive programmers.
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {features.map((f) => (
              <div key={f.num}>
                <div className={`text-xs font-bold tracking-[0.2em] mb-1.5 ${subtle}`}>{f.num}</div>
                <div className={`font-semibold mb-0.5 ${text}`}>{f.t}</div>
                <div className={`text-sm ${muted}`}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`text-xs ${subtle}`}>© Slate · Built for makers.</div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 lg:px-10 py-5">
          <div className="lg:hidden"><Brand size={26} /></div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigate('/login')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ghostBtn}`}
            >
              Sign in
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

        <div className="flex-1 flex flex-col justify-center px-6 lg:px-10 pb-20">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-10">
              <h1 className={`text-4xl font-bold tracking-tight mb-3 ${text}`} style={{ letterSpacing: '-0.03em' }}>
                Create your account
              </h1>
              <p className={`text-[15px] ${muted}`}>
                Start drawing your thoughts in seconds.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className={`block text-xs font-semibold uppercase tracking-[0.15em] ${subtle}`}>
                  Name
                </label>
                <input
                  id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name" required className={inputCls}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className={`block text-xs font-semibold uppercase tracking-[0.15em] ${subtle}`}>
                  Email
                </label>
                <input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com" required className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className={`block text-xs font-semibold uppercase tracking-[0.15em] ${subtle}`}>
                  Password
                </label>
                <input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 chars" required className={inputCls}
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
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>

            <div className={`mt-10 pt-6 border-t ${border} text-center`}>
              <p className={`text-sm ${muted}`}>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className={`font-semibold ${text} underline-offset-4 hover:underline`}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

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

export default Register;
