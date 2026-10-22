import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import './AuthLayout.css';

// Testimonials that rotate on the left panel
const testimonials = [
  {
    text: '"WorkFlow Suite transformed our HR operations. We cut onboarding time by 60% and employee satisfaction is at an all-time high."',
    name: 'Sarah K.',
    role: 'HR Director, Acme Corp.',
    bgColor: '#6366f1',
    initials: 'SK',
    stars: 5,
  },
  {
    text: '"The attendance tracking and leave management modules alone saved us hundreds of hours per quarter. Absolutely essential."',
    name: 'James M.',
    role: 'COO, NexGen Solutions',
    bgColor: '#0891b2',
    initials: 'JM',
    stars: 5,
  },
  {
    text: '"Elegant, intuitive, and rock-solid. Our managers adopted it within a week — no training needed. Best HR tool we\'ve used."',
    name: 'Priya R.',
    role: 'VP of People, TechVista',
    bgColor: '#7c3aed',
    initials: 'PR',
    stars: 5,
  },
];

const AuthLayout = ({ children, title, subtitle, mode = 'login', onQuickLogin }) => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[testimonialIdx];

  return (
    <div className="auth-layout">
      {/* Public navbar overlaying the auth layout */}
      <PublicNavbar />

      {/* ===================== LEFT HERO PANEL ===================== */}
      <div className="auth-hero">
        {/* Floating glow orbs */}
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">WS</div>
          <span className="auth-brand-name">
            WorkFlow Suite
            <span className="auth-brand-badge">Enterprise</span>
          </span>
        </div>

        {/* Main hero content */}
        <div className="auth-hero-content">
          <div>
            <h1 className="auth-hero-tagline">
              Empower Your People. Elevate Your Business.
            </h1>
            <p className="auth-hero-subtitle">
              The all-in-one workforce management platform trusted by leading organizations
              to streamline HR, attendance, payroll, and employee engagement.
            </p>
          </div>

          {/* Stats */}
          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-value">
                12<span className="stat-accent">K+</span>
              </div>
              <div className="auth-stat-label">Active Users</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-value">
                99.9<span className="stat-accent">%</span>
              </div>
              <div className="auth-stat-label">Uptime SLA</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-value">
                4.9<span className="stat-accent">★</span>
              </div>
              <div className="auth-stat-label">User Rating</div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="auth-features">
            <div className="auth-feature-pill">
              <span className="pill-icon">📊</span> Dashboard & Analytics
            </div>
            <div className="auth-feature-pill">
              <span className="pill-icon">🕐</span> Attendance Tracking
            </div>
            <div className="auth-feature-pill">
              <span className="pill-icon">🏖️</span> Leave Management
            </div>
            <div className="auth-feature-pill">
              <span className="pill-icon">👥</span> Employee Directory
            </div>
            <div className="auth-feature-pill">
              <span className="pill-icon">🔐</span> Role-Based Access
            </div>
          </div>

          {/* Testimonial */}
          <div className="auth-testimonial" key={testimonialIdx}>
            <p className="auth-testimonial-text">{current.text}</p>
            <div className="auth-testimonial-author">
              <div
                className="auth-testimonial-avatar"
                style={{ background: current.bgColor }}
              >
                {current.initials}
              </div>
              <div className="auth-testimonial-meta">
                <span className="auth-testimonial-name">{current.name}</span>
                <span className="auth-testimonial-role">{current.role}</span>
              </div>
              <div className="auth-testimonial-stars">
                {'★'.repeat(current.stars)}
              </div>
            </div>
          </div>

          {/* Demo accounts */}
          {mode === 'login' && <DemoAccountCards onQuickLogin={onQuickLogin} />}
        </div>

        {/* Footer */}
        <div className="auth-hero-footer">
          <div className="auth-trust">
            <div className="auth-trust-avatars">
              <div className="auth-trust-avatar" style={{ background: '#6366f1' }}>AK</div>
              <div className="auth-trust-avatar" style={{ background: '#0891b2' }}>MJ</div>
              <div className="auth-trust-avatar" style={{ background: '#7c3aed' }}>LS</div>
              <div className="auth-trust-avatar" style={{ background: '#059669' }}>RD</div>
              <div className="auth-trust-avatar" style={{ background: '#dc2626' }}>+5K</div>
            </div>
            <div className="auth-trust-text">
              <strong>5,000+</strong> companies trust us
            </div>
          </div>
          <div className="auth-security-badges">
            <div className="auth-badge">
              <span className="badge-icon">🔒</span> SSL Secured
            </div>
            <div className="auth-badge">
              <span className="badge-icon">✅</span> SOC 2 Compliant
            </div>
            <div className="auth-badge">
              <span className="badge-icon">🛡️</span> GDPR Ready
            </div>
          </div>
        </div>
      </div>

      {/* ===================== RIGHT FORM PANEL ===================== */}
      <div className="auth-form-panel">
        {/* Mobile header (visible only on small screens) */}
        <div className="auth-mobile-header">
          <div className="auth-mobile-brand">
            <div className="auth-brand-icon" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>WS</div>
            WorkFlow Suite
          </div>
          <div className="auth-mobile-tagline">
            Enterprise Workforce Management
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-desc">{subtitle}</p>
          </div>

          {children}

          <div className="auth-legal">
            By continuing, you agree to our <a href="#" style={{ color: '#6366f1' }}>Terms of Service</a> and <a href="#" style={{ color: '#6366f1' }}>Privacy Policy</a>.
            <br />© {new Date().getFullYear()} WorkFlow Suite. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

/* Demo account clickable cards – rendered on left panel only for login */
export const DemoAccountCards = ({ onQuickLogin, isMobile = false }) => {
  const demos = [
    {
      role: 'Admin',
      emoji: '🛡️',
      username: 'admin',
      password: 'admin123',
      avatarClass: 'auth-demo-avatar--admin',
      desc: 'Full Control',
    },
    {
      role: 'HR Manager',
      emoji: '👔',
      username: 'hr',
      password: 'hr123',
      avatarClass: 'auth-demo-avatar--hr',
      desc: 'Records & Leaves',
    },
    {
      role: 'Employee',
      emoji: '👤',
      username: 'employee',
      password: 'emp123',
      avatarClass: 'auth-demo-avatar--emp',
      desc: 'Self Service',
    },
  ];

  if (isMobile) {
    return (
      <div className="auth-mobile-demo">
        <div className="auth-divider">
          <span>Quick Demo Login</span>
        </div>
        {demos.map((d) => (
          <button
            key={d.role}
            type="button"
            className="auth-mobile-demo-btn"
            onClick={() => onQuickLogin?.(d.username, d.password)}
          >
            <span>{d.emoji}</span>
            <span><strong>{d.role}</strong> — {d.username} / {d.password}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="auth-demo-section">
      <div className="auth-demo-title">
        <span>⚡</span> Quick Demo Access
      </div>
      <div className="auth-demo-cards">
        {demos.map((d) => (
          <div
            key={d.role}
            className="auth-demo-card"
            onClick={() => onQuickLogin?.(d.username, d.password)}
          >
            <div className={`auth-demo-avatar ${d.avatarClass}`}>
              {d.emoji}
            </div>
            <div className="auth-demo-info">
              <span className="auth-demo-role">{d.role}</span>
              <span className="auth-demo-creds">
                {d.username} / {d.password}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthLayout;
