import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout, { DemoAccountCards } from './AuthLayout';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleQuickLogin = async (username, password) => {
    setFormData({ username, password });
    setLoading(true);
    setErrorMessage('');
    try {
      await login(username, password);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Quick login failed:', error);
      setErrorMessage('Could not sign in with demo account. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login(formData.username.trim(), formData.password);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      const serverMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);

      if (error.response?.status === 401) {
        setErrorMessage(serverMessage || 'Invalid username/email or password.');
      } else if (!error.response) {
        setErrorMessage('Cannot reach backend server. Please verify Spring Boot is running on port 9090.');
      } else {
        setErrorMessage(serverMessage || 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to access your workspace and manage your team."
      mode="login"
      onQuickLogin={handleQuickLogin}
    >
      {/* Error alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
          <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            !
          </div>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Username */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="login-username" className="text-xs font-semibold text-slate-700">
              Username or Email
            </label>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 pointer-events-none text-sm"></span>
            <input
              id="login-username"
              name="username"
              type="text"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
              placeholder="Enter your username or email"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
              Password
            </label>
            <a href="#" tabIndex={-1} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium no-underline">
              Forgot password?
            </a>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 pointer-events-none text-sm"></span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 text-sm"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Remember me / Show password */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span>Remember me</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show password</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer border-0 mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            <span>Sign In →</span>
          )}
        </button>
      </form>

      {/* Mobile-only demo logins */}
      <DemoAccountCards onQuickLogin={handleQuickLogin} isMobile={true} />

      {/* Footer link */}
      <div className="text-center text-xs text-slate-500 mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold no-underline">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
