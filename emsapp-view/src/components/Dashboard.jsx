import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmployeeService from '../service/EmployeeService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
];

const getStatusBadge = (status) => {
  const norm = (status || 'ACTIVE').toUpperCase();
  if (norm === 'ACTIVE') {
    return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>;
  }
  if (norm === 'ON_LEAVE' || norm === 'LEAVE') {
    return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">On Leave</span>;
  }
  return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Inactive</span>;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await EmployeeService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setErrorMessage(
        error.response?.data?.message ||
        'Could not fetch dashboard statistics. Please ensure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await EmployeeService.seedDemoData();
      await fetchStats();
    } catch (error) {
      console.error('Failed to seed demo data:', error);
      alert('Could not seed demo data. Please check backend connection.');
    } finally {
      setSeeding(false);
    }
  };

  // Prepare chart data
  const deptDist = stats?.departmentDistribution || {};
  const deptLabels = Object.keys(deptDist);
  const deptCounts = Object.values(deptDist);

  const doughnutData = {
    labels: deptLabels.length ? deptLabels : ['No Departments'],
    datasets: [
      {
        data: deptCounts.length ? deptCounts : [1],
        backgroundColor: deptLabels.length
          ? deptLabels.map((_, i) => PALETTE[i % PALETTE.length])
          : ['#e2e8f0'],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const count = context.parsed;
            const total = stats?.totalEmployees || 1;
            const pct = Math.round((count / total) * 100);
            return ` ${context.label}: ${count} staff (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  const barData = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Employees',
        data: deptCounts,
        backgroundColor: deptLabels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.parsed.y} employees`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { family: "'Inter', sans-serif" },
        },
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif" },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Loading workforce insights...</p>
      </div>
    );
  }

  const activePct = stats?.totalEmployees
    ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Company Dashboard</h2>
          <p className="text-muted mb-0 small">
            High-level overview of personnel, departments, and active statuses
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {stats?.totalEmployees === 0 && (
            <button
              className="btn btn-outline-success btn-sm px-3"
              onClick={handleSeedData}
              disabled={seeding}
              title="Populate 8 realistic demo employees with departments"
            >
              {seeding ? 'Seeding...' : ' Load Demo Employees'}
            </button>
          )}
          <button className="btn btn-outline-secondary btn-sm px-3" onClick={fetchStats}>
            ↻ Refresh
          </button>
          <button className="btn btn-primary btn-sm px-3 shadow-sm" onClick={() => navigate('/addEmployee')}>
            + Add Employee
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <div>{errorMessage}</div>
          <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchStats}>
            Retry
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Total Employees */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Total Staff</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary"
                style={{ width: '42px', height: '42px' }}
              >
                
              </div>
            </div>
            <h3 className="fw-bold mb-1">{stats?.totalEmployees || 0}</h3>
            <span className="text-muted small">
              <Link to="/employees" className="text-decoration-none text-primary fw-semibold">
                View all records →
              </Link>
            </span>
          </div>
        </div>

        {/* Active Employees */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Active Employees</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10 text-success"
                style={{ width: '42px', height: '42px' }}
              >
                
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-success">{stats?.activeEmployees || 0}</h3>
            <span className="text-muted small">
              <strong>{activePct}%</strong> of total workforce on duty
            </span>
          </div>
        </div>

        {/* Total Departments */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Departments</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-purple bg-opacity-10 text-white"
                style={{ width: '42px', height: '42px', backgroundColor: '#8b5cf6' }}
              >
                
              </div>
            </div>
            <h3 className="fw-bold mb-1">{stats?.totalDepartments || 0}</h3>
            <span className="text-muted small">Active functional teams</span>
          </div>
        </div>

        {/* Employees On Leave */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">On Leave</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-warning bg-opacity-10 text-warning"
                style={{ width: '42px', height: '42px' }}
              >
                
              </div>
            </div>
            <h3 className="fw-bold mb-1 text-warning-emphasis">{stats?.onLeaveEmployees || 0}</h3>
            <span className="text-muted small">
              {stats?.onLeaveEmployees ? 'Scheduled away / vacation' : 'Zero active leaves'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Doughnut Chart */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Department Distribution</h5>
              <small className="text-muted">Proportion of staff per functional division</small>
            </div>
            <div className="card-body d-flex flex-column justify-content-center align-items-center py-4">
              {stats?.totalEmployees === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-3">No employee data to display</p>
                  <button className="btn btn-outline-primary btn-sm" onClick={handleSeedData}>
                    Load Sample Data
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '280px' }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Headcount by Department</h5>
              <small className="text-muted">Staff volume across organizational teams</small>
            </div>
            <div className="card-body py-4">
              {stats?.totalEmployees === 0 ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-3">No departments created yet</p>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/addEmployee')}>
                    Add First Employee
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', height: '280px' }}>
                  <Bar data={barData} options={barOptions} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section: Recent Additions & Employees On Leave */}
      <div className="row g-4">
        {/* Recent Additions */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold">Recent Employee Additions</h5>
                <small className="text-muted">Latest team members onboarded</small>
              </div>
              <Link to="/employees" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              {(!stats?.recentEmployees || stats.recentEmployees.length === 0) ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-0">No employees added yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Employee</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th className="text-end pe-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentEmployees.map((emp) => (
                        <tr key={emp.id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-2">
                              {emp.profileImage ? (
                                <img
                                  src={emp.profileImage}
                                  alt={emp.name}
                                  className="rounded-circle object-fit-cover border shadow-sm"
                                  style={{ width: '34px', height: '34px', flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center small"
                                  style={{ width: '34px', height: '34px', flexShrink: 0 }}
                                >
                                  {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold small">{emp.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {emp.department || 'General'}
                            </span>
                          </td>
                          <td className="small text-muted">{emp.role || 'Staff'}</td>
                          <td>{getStatusBadge(emp.status)}</td>
                          <td className="text-end pe-3">
                            <button
                              className="btn btn-sm btn-outline-secondary py-0 px-2"
                              style={{ fontSize: '0.8rem' }}
                              onClick={() => navigate(`/editEmployee/${emp.id}`)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employees On Leave */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold">Employees on Leave</h5>
                <small className="text-muted">Staff currently away or on approved absence</small>
              </div>
              <span className="badge bg-warning text-dark">{stats?.leaveEmployees?.length || 0}</span>
            </div>
            <div className="card-body p-0">
              {(!stats?.leaveEmployees || stats.leaveEmployees.length === 0) ? (
                <div className="text-center py-5 text-muted">
                  <div className="fs-1 mb-2"></div>
                  <h6 className="fw-bold mb-1">Full Attendance</h6>
                  <p className="small text-muted mb-0">No employees are currently marked on leave.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.leaveEmployees.map((emp) => (
                    <div key={emp.id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                      <div className="d-flex align-items-center gap-3">
                        {emp.profileImage ? (
                          <img
                            src={emp.profileImage}
                            alt={emp.name}
                            className="rounded-circle object-fit-cover border shadow-sm"
                            style={{ width: '40px', height: '40px', flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-warning bg-opacity-25 text-warning-emphasis fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px', flexShrink: 0 }}
                          >
                            {emp.name ? emp.name.charAt(0).toUpperCase() : 'L'}
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold">{emp.name}</div>
                          <div className="text-muted small">
                            {emp.department || 'General'} • {emp.role || 'Staff'}
                          </div>
                          {emp.phone && (
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                               {emp.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">
                        On Leave
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
