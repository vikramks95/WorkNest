import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import './LandingPage.css';

/* ── data ────────────────────────────────────────────────────── */
const features = [
  {
    icon: '📊',
    bg: '#eef2ff',
    title: 'Real-Time Dashboard',
    desc: 'Get instant visibility into workforce metrics, headcount, department distribution, and key KPIs — all in one glance.',
  },
  {
    icon: '🕐',
    bg: '#ecfdf5',
    title: 'Attendance Tracking',
    desc: 'Automated check-in/check-out, late arrival detection, working hours calculation, and monthly attendance reports.',
  },
  {
    icon: '🏖️',
    bg: '#fff7ed',
    title: 'Leave Management',
    desc: 'Seamless leave requests with multi-level approval workflows, balance tracking, and calendar integration.',
  },
  {
    icon: '👥',
    bg: '#fdf2f8',
    title: 'Employee Directory',
    desc: 'Complete employee profiles with search, filters, department grouping, and role-based visibility controls.',
  },
  {
    icon: '🔐',
    bg: '#f0f9ff',
    title: 'Role-Based Access',
    desc: 'Fine-grained permissions for Admin, HR, and Employee roles. Every user sees exactly what they need.',
  },
  {
    icon: '📈',
    bg: '#faf5ff',
    title: 'Reports & Analytics',
    desc: 'Generate detailed monthly reports, export to CSV, track trends, and make data-driven decisions about your team.',
  },
];

const testimonials = [
  {
    text: '"WorkFlow Suite transformed how we manage 500+ employees across 3 offices. Onboarding time dropped by 60%."',
    name: 'Sarah K.',
    role: 'HR Director, Acme Corp.',
    bg: '#6366f1',
    initials: 'SK',
  },
  {
    text: '"The attendance and leave modules alone saved us hundreds of hours per quarter. The ROI was immediate."',
    name: 'James M.',
    role: 'COO, NexGen Solutions',
    bg: '#0891b2',
    initials: 'JM',
  },
  {
    text: '"Elegant, intuitive, and rock-solid. Our managers adopted it within a week — zero training needed."',
    name: 'Priya R.',
    role: 'VP of People, TechVista Inc.',
    bg: '#7c3aed',
    initials: 'PR',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'For small teams getting started',
    features: ['Up to 25 employees', 'Basic attendance', 'Leave management', 'Employee directory', 'Email support'],
    featured: false,
    btnClass: 'lp-btn--dark',
    btnText: 'Start Free',
  },
  {
    name: 'Professional',
    price: '$12',
    period: '/user/mo',
    desc: 'For growing organizations',
    features: ['Unlimited employees', 'Advanced attendance & reports', 'Custom approval workflows', 'Analytics dashboard', 'API access', 'Priority support'],
    featured: true,
    btnClass: 'lp-btn--primary',
    btnText: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale deployments',
    features: ['Everything in Professional', 'SSO & SAML integration', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
    featured: false,
    btnClass: 'lp-btn--dark',
    btnText: 'Contact Sales',
  },
];

const logos = ['Acme Corp', 'NexGen', 'TechVista', 'CloudSys', 'DataFlow', 'InnovateCo'];

/* ── component ───────────────────────────────────────────────── */
const LandingPage = () => {
  return (
    <div className="landing-page">
      <PublicNavbar />

      {/* ════════ HERO ════════ */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb--1" />
        <div className="lp-orb lp-orb--2" />
        <div className="lp-orb lp-orb--3" />

        <div className="lp-hero-badge">
          <span className="lp-hero-badge-dot" />
          Now with AI-Powered Insights — Version 3.0
        </div>

        <h1 className="lp-hero-heading">
          The Modern Way to<br />Manage Your Workforce
        </h1>

        <p className="lp-hero-sub">
          Streamline HR operations, automate attendance tracking, manage leave requests,
          and empower your people — all from a single, beautiful platform.
        </p>

        <div className="lp-hero-ctas">
          <Link to="/signup" className="lp-btn lp-btn--primary">
            Get Started Free →
          </Link>
          <Link to="/login" className="lp-btn lp-btn--outline">
            ▶ Watch Demo
          </Link>
        </div>

        <div className="lp-hero-proof">
          <div className="lp-hero-proof-avatars">
            <div className="lp-hero-proof-avatar" style={{ background: '#6366f1' }}>AK</div>
            <div className="lp-hero-proof-avatar" style={{ background: '#0891b2' }}>MJ</div>
            <div className="lp-hero-proof-avatar" style={{ background: '#7c3aed' }}>LS</div>
            <div className="lp-hero-proof-avatar" style={{ background: '#059669' }}>RD</div>
            <div className="lp-hero-proof-avatar" style={{ background: '#dc2626' }}>+5K</div>
          </div>
          <div className="lp-hero-proof-text">
            <strong>5,000+</strong> companies trust us &nbsp;
            <span className="lp-hero-proof-stars">★★★★★</span>
          </div>
        </div>
      </section>

      {/* ════════ LOGOS TICKER ════════ */}
      <section className="lp-logos">
        <div className="lp-logos-label">Trusted by industry-leading organizations</div>
        <div className="lp-logos-track">
          {logos.map((name) => (
            <span key={name} className="lp-logo-item">{name}</span>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="lp-features" id="features">
        <div className="lp-section-header">
          <div className="lp-section-badge">✨ Features</div>
          <h2 className="lp-section-title">Everything You Need to Manage Your Team</h2>
          <p className="lp-section-desc">
            A comprehensive suite of tools designed for modern HR teams.
            Built with simplicity, powered by intelligence.
          </p>
        </div>

        <div className="lp-features-grid">
          {features.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-section-header">
          <div className="lp-section-badge">🚀 How It Works</div>
          <h2 className="lp-section-title">Up and Running in Minutes</h2>
          <p className="lp-section-desc">
            No complex setup. No lengthy onboarding. Just sign up and start managing.
          </p>
        </div>

        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-number">1</div>
            <h3 className="lp-step-title">Create Your Account</h3>
            <p className="lp-step-desc">
              Sign up in seconds. Choose your role — Admin, HR, or Employee. No credit card required.
            </p>
          </div>
          <div className="lp-step">
            <div className="lp-step-number">2</div>
            <h3 className="lp-step-title">Set Up Your Organization</h3>
            <p className="lp-step-desc">
              Add employees, configure departments, set up attendance rules and leave policies.
            </p>
          </div>
          <div className="lp-step">
            <div className="lp-step-number">3</div>
            <h3 className="lp-step-title">Start Managing Smarter</h3>
            <p className="lp-step-desc">
              Track attendance, approve leaves, view analytics — everything from your personalized dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ════════ STATS BAR ════════ */}
      <section className="lp-stats-bar">
        <div className="lp-stats-grid">
          <div className="lp-stat-item">
            <div className="lp-stat-value">12K+</div>
            <div className="lp-stat-label">Active Users</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-value">99.9%</div>
            <div className="lp-stat-label">Uptime SLA</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-value">150+</div>
            <div className="lp-stat-label">Countries</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-value">4.9★</div>
            <div className="lp-stat-label">User Rating</div>
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS ════════ */}
      <section className="lp-testimonials" id="testimonials">
        <div className="lp-section-header">
          <div className="lp-section-badge">💬 Testimonials</div>
          <h2 className="lp-section-title">Loved by Teams Worldwide</h2>
          <p className="lp-section-desc">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
        </div>

        <div className="lp-testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="lp-testimonial-card">
              <div className="lp-testimonial-stars">★★★★★</div>
              <p className="lp-testimonial-text">{t.text}</p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar" style={{ background: t.bg }}>
                  {t.initials}
                </div>
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ PRICING ════════ */}
      <section className="lp-pricing" id="pricing">
        <div className="lp-section-header">
          <div className="lp-section-badge">💰 Pricing</div>
          <h2 className="lp-section-title">Simple, Transparent Pricing</h2>
          <p className="lp-section-desc">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="lp-pricing-grid">
          {pricingPlans.map((p) => (
            <div key={p.name} className={`lp-pricing-card ${p.featured ? 'lp-pricing-card--featured' : ''}`}>
              {p.featured && <div className="lp-pricing-popular">Most Popular</div>}
              <div className="lp-pricing-name">{p.name}</div>
              <div className="lp-pricing-price">
                {p.price}
                {p.period && <span>{p.period}</span>}
              </div>
              <div className="lp-pricing-desc">{p.desc}</div>
              <ul className="lp-pricing-features">
                {p.features.map((feat) => (
                  <li key={feat}>
                    <span className="lp-pricing-check">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`lp-btn ${p.btnClass}`} style={{ width: '100%', justifyContent: 'center' }}>
                {p.btnText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="lp-cta">
        <h2 className="lp-cta-heading">
          Ready to Transform Your<br />Workforce Management?
        </h2>
        <p className="lp-cta-sub">
          Join thousands of organizations that trust WorkFlow Suite.
          Start free today — no credit card required.
        </p>
        <div className="lp-cta-btns">
          <Link to="/signup" className="lp-btn lp-btn--white">
            Get Started Free →
          </Link>
          <Link to="/login" className="lp-btn lp-btn--outline">
            Sign In to Your Account
          </Link>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <div className="lp-footer-brand">
              <div className="lp-footer-brand-icon">WS</div>
              <span className="lp-footer-brand-name">WorkFlow Suite</span>
            </div>
            <p className="lp-footer-tagline">
              The all-in-one workforce management platform for modern organizations.
              Streamline HR, attendance, and employee engagement.
            </p>
          </div>

          <div>
            <h4 className="lp-footer-col-title">Product</h4>
            <ul className="lp-footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="lp-footer-col-title">Company</h4>
            <ul className="lp-footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="lp-footer-col-title">Legal</h4>
            <ul className="lp-footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <div className="lp-footer-copyright">
            © {new Date().getFullYear()} WorkFlow Suite. All rights reserved.
          </div>
          <div className="lp-footer-badges">
            <div className="lp-footer-badge">🔒 SSL Secured</div>
            <div className="lp-footer-badge">✅ SOC 2</div>
            <div className="lp-footer-badge">🛡️ GDPR</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
