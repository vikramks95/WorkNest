import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 transition-all duration-300 backdrop-blur-md ${
          scrolled
            ? 'bg-[#0a0e27]/95 py-3 shadow-xl border-b border-white/10'
            : 'bg-[#0a0e27]/75 py-4 border-b border-white/5'
        }`}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 no-underline text-white group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:-rotate-3 transition-transform">
            WN
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            WorkNest
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Enterprise
            </span>
          </span>
        </Link>

        {/* Center links (visible on landing page) */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {isLanding ? (
            <>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="bg-transparent border-0 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="bg-transparent border-0 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('testimonials')}
                  className="bg-transparent border-0 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('pricing')}
                  className="bg-transparent border-0 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Pricing
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors no-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors no-underline">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors no-underline">
                  Pricing
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* CTA actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all no-underline ${
              location.pathname === '/login'
                ? 'text-white bg-white/15'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline"
          >
            Get Started Free →
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 gap-1.5 cursor-pointer text-white"
          aria-label="Toggle menu"
        >
          <span className={`w-5 h-0.5 bg-white transition-transform duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-white transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-white transition-transform duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-18 bg-[#0a0e27]/98 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl z-40">
          {isLanding ? (
            <>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="text-left bg-transparent border-0 text-slate-200 text-base font-medium py-2 cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-left bg-transparent border-0 text-slate-200 text-base font-medium py-2 cursor-pointer"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('testimonials')}
                className="text-left bg-transparent border-0 text-slate-200 text-base font-medium py-2 cursor-pointer"
              >
                Testimonials
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pricing')}
                className="text-left bg-transparent border-0 text-slate-200 text-base font-medium py-2 cursor-pointer"
              >
                Pricing
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="text-slate-200 text-base font-medium py-2 no-underline" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link to="/#features" className="text-slate-200 text-base font-medium py-2 no-underline" onClick={() => setMobileOpen(false)}>
                Features
              </Link>
            </>
          )}
          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            <Link
              to="/login"
              className="text-center py-2.5 font-semibold text-slate-200 bg-white/5 rounded-lg no-underline hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-center py-2.5 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg no-underline shadow-md shadow-indigo-500/25"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicNavbar;
