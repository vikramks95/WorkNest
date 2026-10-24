import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

/*  data  */
const features = [
  {

    bg: '#eef2ff',
    title: 'Real-Time Dashboard',
    desc: 'Get instant visibility into workforce metrics, headcount, department distribution, and key KPIs — all in one glance.',
  },
  {

    bg: '#ecfdf5',
    title: 'Attendance Tracking',
    desc: 'Automated check-in/check-out, late arrival detection, working hours calculation, and monthly attendance reports.',
  },
  {

    bg: '#fff7ed',
    title: 'Leave Management',
    desc: 'Seamless leave requests with multi-level approval workflows, balance tracking, and calendar integration.',
  },
  {

    bg: '#fdf2f8',
    title: 'Employee Directory',
    desc: 'Complete employee profiles with search, filters, department grouping, and role-based visibility controls.',
  },
  {
    bg: '#f0f9ff',
    title: 'Role-Based Access',
    desc: 'Fine-grained permissions for Admin, HR, and Employee roles. Every user sees exactly what they need.',
  },
  {
    bg: '#faf5ff',
    title: 'Reports & Analytics',
    desc: 'Generate detailed monthly reports, export to CSV, track trends, and make data-driven decisions about your team.',
  },
];

const testimonials = [
  {
    text: '"WorkNest transformed how we manage 500+ employees across 3 offices. Onboarding time dropped by 60%."',
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
    btnClass: 'bg-slate-900 hover:bg-slate-800 text-white',
    btnText: 'Start Free',
  },
  {
    name: 'Professional',
    price: '$12',
    period: '/user/mo',
    desc: 'For growing organizations',
    features: ['Unlimited employees', 'Advanced attendance & reports', 'Custom approval workflows', 'Analytics dashboard', 'API access', 'Priority support'],
    featured: true,
    btnClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/30',
    btnText: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale deployments',
    features: ['Everything in Professional', 'SSO & SAML integration', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
    featured: false,
    btnClass: 'bg-slate-900 hover:bg-slate-800 text-white',
    btnText: 'Contact Sales',
  },
];

const logos = ['Acme Corp', 'NexGen', 'TechVista', 'CloudSys', 'DataFlow', 'InnovateCo'];

/*  component  */
const LandingPage = () => {
  return (
    <div className="font-sans text-slate-800 overflow-x-hidden bg-white">
      <PublicNavbar />

      {/*  HERO  */}
      <section className="relative min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#0f172a] to-[#1e1b4b] text-white flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Now with AI-Powered Insights — Version 3.0
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
            The Modern Way to<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Manage Your Workforce
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mt-6 leading-relaxed">
            Streamline HR operations, automate attendance tracking, manage leave requests,
            and empower your people — all from a single, beautiful platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-white/10 hover:bg-white/15 border border-white/15 hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline"
            >
              Watch Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-12 pt-6 border-t border-white/10">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold text-white">AK</div>
              <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold text-white">MJ</div>
              <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold text-white">LS</div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold text-white">RD</div>
              <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-[#0a0e27] flex items-center justify-center text-[10px] font-bold text-white">+5K</div>
            </div>
            <div className="text-xs sm:text-sm text-slate-300">
              <strong className="text-white font-semibold">5,000+</strong> companies trust us &nbsp;
              <span className="text-amber-400">★★★★★</span>
            </div>
          </div>
        </div>
      </section>

      {/*  LOGOS TICKER  */}
      <section className="py-8 bg-[#0a0e27] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Trusted by industry-leading organizations
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {logos.map((name) => (
              <span key={name} className="text-slate-400 hover:text-white font-bold text-sm tracking-wider uppercase transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/*  FEATURES  */}
      <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Manage Your Team
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            A comprehensive suite of tools designed for modern HR teams. Built with simplicity, powered by intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110"
                style={{ background: f.bg }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  HOW IT WORKS  */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-200" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider mb-3">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Up and Running in Minutes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            No complex setup. No lengthy onboarding. Just sign up and start managing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              num: '1',
              title: 'Create Your Account',
              desc: 'Sign up in seconds. Choose your role — Admin, HR, or Employee. No credit card required.',
            },
            {
              num: '2',
              title: 'Set Up Your Organization',
              desc: 'Add employees, configure departments, set up attendance rules and leave policies.',
            },
            {
              num: '3',
              title: 'Start Managing Smarter',
              desc: 'Track attendance, approve leaves, view analytics — everything from your personalized dashboard.',
            },
          ].map((step) => (
            <div key={step.num} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-5 shadow-md shadow-indigo-500/25">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  STATS BAR  */}
      <section className="py-16 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">12K+</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">99.9%</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">150+</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Countries</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">4.9★</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/*  TESTIMONIALS  */}
      <section className="py-24 px-6 max-w-7xl mx-auto" id="testimonials">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-3">
             Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by Teams Worldwide
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-amber-400 text-sm mb-4">★★★★★</div>
                <p className="text-sm text-slate-600 leading-relaxed italic mb-6">{t.text}</p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white"
                  style={{ background: t.bg }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{t.name}</div>
                  <div className="text-xs text-slate-500 leading-tight">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*  PRICING  */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-200" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-3">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-2xl bg-white border transition-all flex flex-col justify-between relative ${
                p.featured
                  ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-600/20 lg:-translate-y-2'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}
              <div>
                <div className="text-base font-bold text-slate-900 mb-2">{p.name}</div>
                <div className="text-4xl font-extrabold text-slate-900 mb-2 flex items-baseline gap-1">
                  {p.price}
                  {p.period && <span className="text-sm text-slate-500 font-normal">{p.period}</span>}
                </div>
                <div className="text-xs text-slate-500 mb-6">{p.desc}</div>
                <ul className="space-y-3 mb-8 list-none p-0">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="text-emerald-500 font-bold">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/signup"
                className={`w-full py-3 rounded-xl font-semibold text-center text-sm transition-all no-underline block ${p.btnClass}`}
              >
                {p.btnText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/*  CTA  */}
      <section className="py-24 px-6 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to Transform Your<br />Workforce Management?
          </h2>
          <p className="text-slate-200 text-sm sm:text-base mt-4 max-w-xl mx-auto">
            Join thousands of organizations that trust WorkNest. Start free today — no credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-indigo-700 bg-white hover:bg-slate-100 shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white border border-white/30 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/*  FOOTER  */}
      <footer className="bg-[#0a0e27] text-slate-400 py-16 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-sm">
                WN
              </div>
              <span className="font-bold text-lg text-white">WorkNest</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The all-in-one workforce management platform for modern organizations.
              Streamline HR, attendance, and employee engagement.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Product</h4>
            <ul className="space-y-2 text-xs list-none p-0">
              <li><a href="#features" className="text-slate-400 hover:text-white no-underline">Features</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white no-underline">Pricing</a></li>
              <li><a href="#testimonials" className="text-slate-400 hover:text-white no-underline">Testimonials</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2 text-xs list-none p-0">
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Careers</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Blog</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-xs list-none p-0">
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">Cookie Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white no-underline">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} WorkNest. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span> SSL Secured</span>
            <span> SOC 2</span>
            <span> GDPR</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
