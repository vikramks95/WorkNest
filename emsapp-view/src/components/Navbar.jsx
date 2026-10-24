import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getRoleBadge = (role) => {
  const norm = (role || 'ROLE_EMPLOYEE').toUpperCase();
  if (norm.includes('ADMIN')) {
    return (
      <span
        className="badge rounded-pill fw-semibold px-2 py-0.5"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#fca5a5',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          fontSize: '0.72rem'
        }}
      >
        Admin
      </span>
    );
  }
  if (norm.includes('HR')) {
    return (
      <span
        className="badge rounded-pill fw-semibold px-2 py-0.5"
        style={{
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          color: '#7dd3fc',
          border: '1px solid rgba(14, 165, 233, 0.4)',
          fontSize: '0.72rem'
        }}
      >
        HR
      </span>
    );
  }
  return (
    <span
      className="badge rounded-pill fw-semibold px-2 py-0.5"
      style={{
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        color: '#86efac',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        fontSize: '0.72rem'
      }}
    >
      Employee
    </span>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, role, canManageEmployees, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-lg app-navbar shadow-sm sticky-top"
      data-bs-theme="dark"
      style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}
    >
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to={isAuthenticated ? "/dashboard" : "/"}>
          <span
            className="d-inline-flex align-items-center justify-content-center text-white fw-bold rounded-2 shadow-sm"
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              fontSize: '0.85rem'
            }}
          >
            WN
          </span>
          <span style={{ letterSpacing: '-0.3px', fontFamily: "'Outfit', 'Inter', sans-serif", color: '#ffffff' }}>
            WorkNest
          </span>
          <span
            className="badge rounded-pill text-uppercase d-none d-sm-inline-block"
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.8px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.4)'
            }}
          >
            Enterprise
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-controls="navbarNav"
          aria-expanded={navOpen}
          aria-label="Toggle navigation"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`navbar-collapse ${navOpen ? 'd-block' : 'd-none'} d-lg-flex`}
          id="navbarNav"
          style={{ visibility: 'visible' }}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 gap-lg-2">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/dashboard"
                  >
                    <span>📊</span>
                    <span>Dashboard</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/employees"
                  >
                    <span>👥</span>
                    <span>Employees</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/attendance"
                  >
                    <span>⏱️</span>
                    <span>Attendance</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/leaves"
                  >
                    <span>📅</span>
                    <span>Leaves</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    to="/profile"
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </NavLink>
                </li>

                {canManageEmployees && (
                  <li className="nav-item">
                    <NavLink
                      className="btn btn-add-emp btn-sm"
                      to="/addEmployee"
                      title="Add New Employee"
                    >
                      <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>+</span>
                      <span>Add Employee</span>
                    </NavLink>
                  </li>
                )}

                {/* User & Role Badge */}
                <li className="nav-item d-flex align-items-center ms-lg-2 py-1 py-lg-0">
                  <div className="user-pill d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold shadow-sm"
                      style={{
                        width: '26px',
                        height: '26px',
                        fontSize: '0.75rem',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                      }}
                    >
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="fw-semibold text-white" style={{ fontSize: '0.85rem' }}>
                      {user?.name || user?.username}
                    </span>
                    <span className="ms-1">{getRoleBadge(role)}</span>
                  </div>
                </li>

                {/* Logout Button */}
                <li className="nav-item ms-lg-1">
                  <button
                    className="btn btn-logout btn-sm"
                    onClick={handleLogout}
                    title="Sign Out"
                    aria-label="Logout"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Sign In
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="btn btn-primary btn-sm px-3"
                    to="/signup"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      border: '1px solid #6366f1',
                      fontWeight: 600
                    }}
                  >
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;