import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

// Testimonials that rotate on the left panel
const testimonials = [
  {
    text: '"WorkNest transformed our HR operations. We cut onboarding time by 60% and employee satisfaction is at an all-time high."',
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
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      {/* Public navbar overlaying the auth layout */}
      <PublicNavbar />

      {/*  LEFT HERO PANEL  */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f172a] to-[#312e81] p-12 pt-28 text-white overflow-hidden">
        {/* Floating glow orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
            WN
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            WorkNest
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Enterprise
            </span>
          </span>
        </div>

        {/* Main hero content */}
        <div className="relative z-10 my-auto py-8">
          <div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Empower Your People. Elevate Your Business.
            </h1>
            <p className="text-slate-300 text-sm xl:text-base mt-3 leading-relaxed max-w-lg">
              The all-in-one workforce management platform trusted by leading organizations
              to streamline HR, attendance, payroll, and employee engagement.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div>
              <div className="text-2xl font-extrabold text-white">
                12<span className="text-indigo-400">K+</span>
              </div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">
                99.9<span className="text-indigo-400">%</span>
              </div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">Uptime SLA</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">
                4.9<span className="text-amber-400">★</span>
              </div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">User Rating</div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
              <span></span> Dashboard & Analytics
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
              <span></span> Attendance Tracking
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
              <span></span> Leave Management
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
              <span></span> Employee Directory
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
              <span></span> Role-Based Access
            </span>
          </div>

          {/* Testimonial */}
          <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm" key={testimonialIdx}>
            <p className="text-sm italic text-slate-200 leading-relaxed">{current.text}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
                  style={{ background: current.bgColor }}
                >
                  {current.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white leading-tight">{current.name}</div>
                  <div className="text-xs text-slate-400 leading-tight">{current.role}</div>
                </div>
              </div>
              <div className="text-amber-400 text-sm tracking-wider">
                {'★'.repeat(current.stars)}
              </div>
            </div>
          </div>

          {/* Demo accounts */}
          {mode === 'login' && <DemoAccountCards onQuickLogin={onQuickLogin} />}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold">AK</div>
              <div className="w-7 h-7 rounded-full bg-cyan-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold">MJ</div>
              <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold">LS</div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold">RD</div>
              <div className="w-7 h-7 rounded-full bg-rose-600 border-2 border-[#0a0e27] flex items-center justify-center text-[9px] font-bold">+5K</div>
            </div>
            <div className="text-xs text-slate-300">
              <strong className="text-white font-semibold">5,000+</strong> companies trust us
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>SSL Secured</span>
            <span>•</span>
            <span> SOC 2</span>
            <span>•</span>
            <span> GDPR</span>
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 pt-28 lg:pt-24 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 mt-2">{subtitle}</p>
          </div>

          {children}

          <div className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Privacy Policy</a>.
            <br />© {new Date().getFullYear()} WorkNest. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

/* Demo account clickable cards */
export const DemoAccountCards = ({ onQuickLogin, isMobile = false }) => {
  const demos = [
    {
      role: 'Admin',
      username: 'admin',
      password: 'admin123',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      desc: 'Full Control',
    },
    {
      role: 'HR Manager',
      username: 'hr',
      password: 'hr123',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      desc: 'Records & Leaves',
    },
    {
      role: 'Employee',
      username: 'employee',
      password: 'emp123',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      desc: 'Self Service',
    },
  ];

  if (isMobile) {
    return (
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
          Quick Demo Login
        </div>
        <div className="flex flex-col gap-2">
          {demos.map((d) => (
            <button
              key={d.role}
              type="button"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs text-slate-700 transition-colors cursor-pointer"
              onClick={() => onQuickLogin?.(d.username, d.password)}
            >
              <span className="flex items-center gap-2">
                <span>{d.emoji}</span>
                <strong>{d.role}</strong>
              </span>
              <span className="text-slate-500 font-mono text-[11px]">{d.username} / {d.password}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
        Quick Demo Access
      </div>
      <div className="grid grid-cols-3 gap-3">
        {demos.map((d) => (
          <button
            key={d.role}
            type="button"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/50 cursor-pointer transition-all hover:-translate-y-0.5 text-left group"
            onClick={() => onQuickLogin?.(d.username, d.password)}
          >
            <div className="text-xl mb-1">{d.emoji}</div>
            <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
              {d.role}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {d.username} / {d.password}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuthLayout;
