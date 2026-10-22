import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from './AuthLayout';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'ROLE_EMPLOYEE',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const validate = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return false;
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await signup({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (error) {
      console.error('Signup failed:', error);
      const serverMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null);

      if (error.response?.status === 400) {
        setErrorMessage(serverMessage || 'Registration failed. Username or email may already be registered.');
      } else if (!error.response) {
        setErrorMessage('Cannot reach backend server. Please verify Spring Boot is running on port 9090.');
      } else {
        setErrorMessage(serverMessage || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of organizations already using WorkFlow Suite to manage their workforce."
      mode="signup"
    >
      {/* Error alert */}
      {errorMessage && (
        <div className="auth-alert auth-alert--error">
          <div className="auth-alert-icon">!</div>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Success alert */}
      {successMessage && (
        <div className="auth-alert auth-alert--success">
          <div className="auth-alert-icon">✓</div>
          <div>{successMessage}</div>
        </div>
      )}

      {/* Signup form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="auth-field">
          <div className="auth-field-label">
            <label htmlFor="signup-name">
              Full Name<span className="required-dot">*</span>
            </label>
          </div>
          <div className="auth-input-wrapper">
            <span className="auth-input-icon">✏️</span>
            <input
              id="signup-name"
              name="name"
              type="text"
              className="auth-input"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Username + Email side by side */}
        <div className="auth-field-row">
          <div className="auth-field">
            <div className="auth-field-label">
              <label htmlFor="signup-username">
                Username<span className="required-dot">*</span>
              </label>
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input
                id="signup-username"
                name="username"
                type="text"
                className="auth-input"
                placeholder="e.g. janedoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-field-label">
              <label htmlFor="signup-email">
                Email<span className="required-dot">*</span>
              </label>
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">📧</span>
              <input
                id="signup-email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Role Selector — visual radio cards */}
        <div className="auth-field">
          <div className="auth-field-label">
            <label>
              Select Your Role<span className="required-dot">*</span>
            </label>
          </div>
          <div className="auth-role-selector">
            <div className="auth-role-option">
              <input
                type="radio"
                id="role-employee"
                name="role"
                value="ROLE_EMPLOYEE"
                checked={formData.role === 'ROLE_EMPLOYEE'}
                onChange={handleChange}
              />
              <label htmlFor="role-employee">
                <span className="auth-role-emoji">👤</span>
                <span className="auth-role-name">Employee</span>
                <span className="auth-role-desc">Self-Service & Leave</span>
              </label>
            </div>
            <div className="auth-role-option">
              <input
                type="radio"
                id="role-hr"
                name="role"
                value="ROLE_HR"
                checked={formData.role === 'ROLE_HR'}
                onChange={handleChange}
              />
              <label htmlFor="role-hr">
                <span className="auth-role-emoji">👔</span>
                <span className="auth-role-name">HR Manager</span>
                <span className="auth-role-desc">Records & Leaves</span>
              </label>
            </div>
            <div className="auth-role-option">
              <input
                type="radio"
                id="role-admin"
                name="role"
                value="ROLE_ADMIN"
                checked={formData.role === 'ROLE_ADMIN'}
                onChange={handleChange}
              />
              <label htmlFor="role-admin">
                <span className="auth-role-emoji">🛡️</span>
                <span className="auth-role-name">Admin</span>
                <span className="auth-role-desc">Full Control</span>
              </label>
            </div>
          </div>
        </div>

        {/* Password + Confirm Password side by side */}
        <div className="auth-field-row">
          <div className="auth-field">
            <div className="auth-field-label">
              <label htmlFor="signup-password">
                Password<span className="required-dot">*</span>
              </label>
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-field-label">
              <label htmlFor="signup-confirm-password">
                Confirm<span className="required-dot">*</span>
              </label>
            </div>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        {/* Show passwords toggle */}
        <div className="auth-checkbox-row" style={{ justifyContent: 'flex-start' }}>
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <span>Show passwords</span>
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
              Creating account...
            </>
          ) : (
            <>Create Account →</>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="auth-footer-link">
        Already have an account?{' '}
        <Link to="/login">Sign in here</Link>
      </div>
    </AuthLayout>
  );
};

export default Signup;
