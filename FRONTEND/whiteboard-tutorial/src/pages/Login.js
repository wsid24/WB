import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import themeContext from '../store/theme-context';
import { API_URL } from '../config';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store the JWT token in localStorage
      localStorage.setItem('token', data.token);

      // Navigate to canvases page
      navigate('/canvases');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
      {/* Navbar/Header Area for Theme Toggle */}
      <div className="w-full relative z-20 px-6 py-4 flex justify-end items-center">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full backdrop-blur-md bg-opacity-20 hover:bg-opacity-30 border shadow-lg transition-all duration-300
                    text-xl focus:outline-none focus:ring-2 ${isDarkMode ? 'focus:ring-white' : 'focus:ring-indigo-500'}`}
          style={{
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(226, 232, 240, 1)',
            color: isDarkMode ? '#ffffff' : '#4f46e5'
          }}
          title="Toggle theme"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10 w-full mb-12">
        {/* Decorative Background Elements */}
        {isDarkMode && (
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-neutral-800 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob"></div>
        )}
        {isDarkMode && (
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-neutral-700 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        )}

        {/* Login Card */}
        <div
          className={`w-full max-w-sm p-8 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 relative z-20`}
          style={{
            backgroundColor: isDarkMode ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkMode ? 'rgba(64, 64, 64, 0.6)' : 'rgba(226, 232, 240, 1)'
          }}
        >
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-black bg-clip-text text-transparent ${isDarkMode ? 'bg-white text-white' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}>
              Welcome Back
            </h2>
            <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Sign in to access your digital canvases.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className={`block text-sm font-bold tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className={`w-full px-4 py-3 rounded-lg outline-none transition-all duration-200 border-2
                  ${isDarkMode
                      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:bg-black focus:border-white focus:ring-1 focus:ring-white focus:ring-offset-0'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:border-indigo-500'
                    }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className={`block text-sm font-bold tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  PASSWORD
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full px-4 py-3 rounded-lg outline-none transition-all duration-200 border-2
                  ${isDarkMode
                      ? 'bg-neutral-900 border-neutral-800 text-white placeholder-neutral-500 focus:bg-black focus:border-white focus:ring-1 focus:ring-white focus:ring-offset-0'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:border-indigo-500'
                    }`}
                />
              </div>
            </div>

            {error && (
              <div className={`p-4 rounded-lg flex items-center space-x-3 backdrop-blur-md border animate-in fade-in slide-in-from-top-2
                ${isDarkMode ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-lg font-bold tracking-wide
                transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg active:scale-95
                flex items-center justify-center space-x-2
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                ${isDarkMode
                  ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_4px_14px_0_rgba(255,255,255,0.15)]'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)]'
                }`
              }
            >
              {loading ? (
                <>
                  <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${isDarkMode ? 'text-black' : 'text-white'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50 text-center">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              New to Whiteboard?{' '}
              <button
                onClick={() => navigate('/register')}
                className={`font-bold transition-colors duration-200 ml-1 hover:underline
                  ${isDarkMode ? 'text-white hover:text-neutral-300' : 'text-indigo-600 hover:text-indigo-800'}`}
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
