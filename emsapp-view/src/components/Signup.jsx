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
      subtitle="Join thousands of organizations already using WorkNest to manage their workforce."
      mode="signup"
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

      {/* Success alert */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium">
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <div>{successMessage}</div>
        </div>
      )}

      {/* Signup form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 pointer-events-none text-sm">✏️</span>
            <input
              id="signup-name"
              name="name"
              type="text"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Username + Email side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none text-sm">👤</span>
              <input
                id="signup-username"
                name="username"
                type="text"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                placeholder="e.g. janedoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none text-sm">📧</span>
              <input
                id="signup-email"
                name="email"
                type="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                placeholder="jane@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Role Selector — visual radio cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Your Role <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'role-employee', value: 'ROLE_EMPLOYEE', emoji: '👤', name: 'Employee', desc: 'Self Service' },
              { id: 'role-hr', value: 'ROLE_HR', emoji: '👔', name: 'HR Manager', desc: 'Leaves & Team' },
              { id: 'role-admin', value: 'ROLE_ADMIN', emoji: '🛡️', name: 'Admin', desc: 'Full Access' },
            ].map((roleOption) => {
              const isSelected = formData.role === roleOption.value;
              return (
                <label
                  key={roleOption.id}
                  htmlFor={roleOption.id}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <input
                    type="radio"
                    id={roleOption.id}
                    name="role"
                    value={roleOption.value}
                    checked={isSelected}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-lg mb-0.5">{roleOption.emoji}</span>
                  <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {roleOption.name}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {roleOption.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Password + Confirm Password side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none text-sm">🔒</span>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
                placeholder="≥ 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0 text-sm"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 pointer-events-none text-sm">🔒</span>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm text-slate-900 transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
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
        <div className="flex items-center text-xs font-medium text-slate-600 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show passwords</span>
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
              Creating account...
            </span>
          ) : (
            <span>Create Account →</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold no-underline">
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Signup;
