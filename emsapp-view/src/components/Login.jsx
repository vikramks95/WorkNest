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
        <div className="auth-alert auth-alert--error">
          <div className="auth-alert-icon">!</div>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Username */}
        <div className="auth-field">
          <div className="auth-field-label">
            <label htmlFor="login-username">Username or Email</label>
          </div>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon">👤</span>
            <input
              id="login-username"
              name="username"
              type="text"
              className="auth-input"
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
        <div className="auth-field">
          <div className="auth-field-label">
            <label htmlFor="login-password">Password</label>
            <a href="#" tabIndex={-1}>Forgot password?</a>
          </div>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon">🔒</span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Remember me / Show password */}
        <div className="auth-checkbox-row">
          <label className="auth-checkbox">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <span>Show password</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Signing in...
            </>
          ) : (
            <>Sign In →</>
          )}
        </button>
      </form>

      {/* Mobile-only demo logins */}
      <DemoAccountCards onQuickLogin={handleQuickLogin} isMobile={true} />

      {/* Footer link */}
      <div className="auth-footer-link">
        Don't have an account?{' '}
        <Link to="/signup">Create an account</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
