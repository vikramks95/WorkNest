import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PublicNavbar.css';

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const scrollToSection = (id) => {
    // Only scroll if we're on the landing page
    if (location.pathname !== '/') {
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  const isLanding = location.pathname === '/';

  return (
    <>
      <nav className={`pub-navbar ${scrolled ? 'pub-navbar--scrolled' : ''}`}>
        {/* Brand */}
        <Link to="/" className="pub-navbar__brand">
          <div className="pub-navbar__logo">WS</div>
          <span className="pub-navbar__wordmark">
            WorkFlow Suite
            <span className="pub-navbar__wordmark-tag">Enterprise</span>
          </span>
        </Link>

        {/* Center links (visible on landing page) */}
        <ul className="pub-navbar__links">
          {isLanding ? (
            <>
              <li>
                <span className="pub-navbar__link" onClick={() => scrollToSection('features')}>
                  Features
                </span>
              </li>
              <li>
                <span className="pub-navbar__link" onClick={() => scrollToSection('how-it-works')}>
                  How It Works
                </span>
              </li>
              <li>
                <span className="pub-navbar__link" onClick={() => scrollToSection('testimonials')}>
                  Testimonials
                </span>
              </li>
              <li>
                <span className="pub-navbar__link" onClick={() => scrollToSection('pricing')}>
                  Pricing
                </span>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className="pub-navbar__link">Home</Link>
              </li>
              <li>
                <Link to="/" className="pub-navbar__link">Features</Link>
              </li>
              <li>
                <Link to="/" className="pub-navbar__link">Pricing</Link>
              </li>
            </>
          )}
        </ul>

        {/* CTA actions */}
        <div className="pub-navbar__actions">
          <Link
            to="/login"
            className={`pub-navbar__btn pub-navbar__btn--ghost ${location.pathname === '/login' ? 'pub-navbar__link--active' : ''}`}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="pub-navbar__btn pub-navbar__btn--primary"
          >
            Get Started Free →
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className={`pub-navbar__burger ${mobileOpen ? 'pub-navbar__burger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="pub-navbar__burger-line" />
          <span className="pub-navbar__burger-line" />
          <span className="pub-navbar__burger-line" />
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      <div className={`pub-navbar__mobile-menu ${mobileOpen ? 'pub-navbar__mobile-menu--open' : ''}`}>
        {isLanding ? (
          <>
            <span className="pub-navbar__link" onClick={() => scrollToSection('features')}>Features</span>
            <span className="pub-navbar__link" onClick={() => scrollToSection('how-it-works')}>How It Works</span>
            <span className="pub-navbar__link" onClick={() => scrollToSection('testimonials')}>Testimonials</span>
            <span className="pub-navbar__link" onClick={() => scrollToSection('pricing')}>Pricing</span>
          </>
        ) : (
          <>
            <Link to="/" className="pub-navbar__link" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/" className="pub-navbar__link" onClick={() => setMobileOpen(false)}>Features</Link>
          </>
        )}
        <Link to="/login" className="pub-navbar__btn pub-navbar__btn--ghost" onClick={() => setMobileOpen(false)}>Sign In</Link>
        <Link to="/signup" className="pub-navbar__btn pub-navbar__btn--primary" onClick={() => setMobileOpen(false)}>Get Started Free →</Link>
      </div>
    </>
  );
};

export default PublicNavbar;
