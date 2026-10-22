import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getRoleBadge = (role) => {
  const norm = (role || 'ROLE_EMPLOYEE').toUpperCase();
  if (norm.includes('ADMIN')) {
    return <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">🛡️ Admin</span>;
  }
  if (norm.includes('HR')) {
    return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle small">👔 HR</span>;
  }
  return <span className="badge bg-success-subtle text-success border border-success-subtle small">👤 Employee</span>;
};

const Navbar = () => {
  const { isAuthenticated, user, role, canManageEmployees, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to={isAuthenticated ? "/dashboard" : "/login"}>
          <span className="badge bg-primary fs-6">EMS</span>
          <span>Employee Manager</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">
                    📊 Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/employees">
                    👥 Employees
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/leaves">
                    🏖️ Leaves
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">
                    👤 My Profile
                  </NavLink>
                </li>

                {canManageEmployees && (
                  <li className="nav-item">
                    <NavLink className="btn btn-outline-light btn-sm px-3" to="/addEmployee">
                      + Add Employee
                    </NavLink>
                  </li>
                )}

                {/* User & Role Badge */}
                <li className="nav-item d-flex align-items-center ms-lg-2 py-1 py-lg-0">
                  <div className="d-flex align-items-center gap-2 bg-secondary bg-opacity-25 text-white px-3 py-1 rounded-pill small">
                    <span
                      className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                    >
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span>{user?.name || user?.username}</span>
                    <span className="ms-1">{getRoleBadge(role)}</span>
                  </div>
                </li>

                <li className="nav-item ms-lg-1">
                  <button
                    className="btn btn-danger btn-sm px-3"
                    onClick={handleLogout}
                    title="Sign Out"
                  >
                    Logout
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
                  <NavLink className="btn btn-primary btn-sm px-3" to="/signup">
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