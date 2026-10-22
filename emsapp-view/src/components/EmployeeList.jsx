import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmployeeService from '../service/EmployeeService';
import EmployeeViewModal from './EmployeeViewModal';
import { useAuth } from '../context/AuthContext';

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

const formatCurrency = (val) => {
  if (val == null || val === '') return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

const EmployeeList = () => {
  const navigate = useNavigate();
  const { user, canManageEmployees, isEmployee } = useAuth();

  // Data states
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Sorting states
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Metadata dropdown options
  const [departmentList, setDepartmentList] = useState([]);
  const [roleList, setRoleList] = useState([]);

  // Selected employee for View Modal
  const [viewingEmployee, setViewingEmployee] = useState(null);

  // Fetch filter metadata (departments & job titles)
  const fetchMetadata = async () => {
    try {
      const [deptRes, rolesRes] = await Promise.all([
        EmployeeService.getDepartments(),
        EmployeeService.getJobTitles(),
      ]);
      setDepartmentList(deptRes.data || []);
      setRoleList(rolesRes.data || []);
    } catch (e) {
      console.warn('Could not fetch filter metadata:', e);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch paginated employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await EmployeeService.searchEmployees({
        search: search.trim() || undefined,
        department: department !== 'ALL' ? department : undefined,
        role: role !== 'ALL' ? role : undefined,
        status: status !== 'ALL' ? status : undefined,
        page,
        size,
        sortBy,
        sortDir,
      });

      const data = response.data;
      if (data && data.content) {
        setEmployees(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        setEmployees(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setErrorMessage(
        error.response?.data?.message ||
        'Could not connect to backend server. Please verify Spring Boot is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, department, role, status, page, size, sortBy, sortDir]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle Sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      // toggle direction
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(0);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <span className="text-muted ms-1 opacity-50">↕</span>;
    }
    return <span className="text-primary ms-1 fw-bold">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const deleteEmployee = async (e, id) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete employee #${id}?`);
    if (!confirmed) return;

    try {
      await EmployeeService.deleteEmployeeById(id);
      fetchEmployees();
      fetchMetadata();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDepartment('ALL');
    setRole('ALL');
    setStatus('ALL');
    setPage(0);
  };

  const hasActiveFilters = search || department !== 'ALL' || role !== 'ALL' || status !== 'ALL';

  // Calculate pagination range text
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className="container py-4">
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show d-flex justify-content-between align-items-center mb-4" role="alert">
          <div>{errorMessage}</div>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={fetchEmployees}>
            Retry
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="card shadow-sm border-0">
        {/* Card Header & Actions */}
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h4 className="mb-0 fw-bold">Employee Directory</h4>
              <small className="text-muted">Search, filter, inspect, and manage organizational staff records</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link to="/dashboard" className="btn btn-outline-secondary btn-sm px-3">
                📊 Dashboard
              </Link>
              {canManageEmployees && (
                <button
                  className="btn btn-primary btn-sm px-3 shadow-sm"
                  onClick={() => navigate('/addEmployee')}
                >
                  + Add Employee
                </button>
              )}
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="row g-2 mt-3 pt-3 border-top">
            {/* Unified Search Input */}
            <div className="col-12 col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Name, Employee ID (#1), Email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(0);
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Department Filter */}
            <div className="col-6 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(0);
                }}
              >
                <option value="ALL">All Departments</option>
                {departmentList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title / Role Filter */}
            <div className="col-6 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(0);
                }}
              >
                <option value="ALL">All Job Titles</option>
                {roleList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Page Size / Reset */}
            <div className="col-6 col-md-2 d-flex justify-content-end align-items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm px-2 text-nowrap"
                  onClick={resetFilters}
                  title="Reset all filters"
                >
                  ↺ Reset
                </button>
              )}
              <select
                className="form-select form-select-sm"
                style={{ width: '80px' }}
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                title="Rows per page"
              >
                <option value={5}>5/pg</option>
                <option value={10}>10/pg</option>
                <option value={25}>25/pg</option>
                <option value={50}>50/pg</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Retrieving employee records...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 text-muted mb-2">👤</div>
              <p className="text-muted fs-5 mb-2">
                {hasActiveFilters ? 'No employees match your search/filter criteria.' : 'No employees found in the system.'}
              </p>
              {hasActiveFilters ? (
                <button className="btn btn-outline-secondary btn-sm" onClick={resetFilters}>
                  Clear Filters
                </button>
              ) : (
                <button className="btn btn-primary px-4" onClick={() => navigate('/addEmployee')}>
                  Add Your First Employee
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light user-select-none">
                  <tr>
                    <th
                      scope="col"
                      className="ps-4 cursor-pointer"
                      onClick={() => handleSort('id')}
                      style={{ cursor: 'pointer' }}
                    >
                      # ID {getSortIcon('id')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('name')}
                      style={{ cursor: 'pointer' }}
                    >
                      Employee {getSortIcon('name')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('department')}
                      style={{ cursor: 'pointer' }}
                    >
                      Department {getSortIcon('department')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('role')}
                      style={{ cursor: 'pointer' }}
                    >
                      Job Title {getSortIcon('role')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('status')}
                      style={{ cursor: 'pointer' }}
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort('salary')}
                      style={{ cursor: 'pointer' }}
                    >
                      Salary {getSortIcon('salary')}
                    </th>
                    <th scope="col" className="text-end pe-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="cursor-pointer"
                      onClick={() => setViewingEmployee(employee)}
                      title="Click row to view profile"
                    >
                      {/* Employee ID */}
                      <td className="ps-4 text-muted fw-semibold">
                        <span className="badge bg-light text-secondary border">
                          #{employee.id}
                        </span>
                      </td>

                      {/* Employee Photo & Info */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {employee.profileImage ? (
                            <img
                              src={employee.profileImage}
                              alt={employee.name}
                              className="rounded-circle object-fit-cover border shadow-sm"
                              style={{ width: '40px', height: '40px' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center"
                              style={{ width: '40px', height: '40px', flexShrink: 0 }}
                            >
                              {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold text-dark">{employee.name}</div>
                            <small className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                              {employee.email}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="badge bg-light text-dark border">
                          {employee.department || 'General'}
                        </span>
                      </td>

                      {/* Job Title / Role */}
                      <td className="text-secondary small">{employee.role || 'Staff'}</td>

                      {/* Status */}
                      <td>{getStatusBadge(employee.status)}</td>

                      {/* Salary */}
                      <td className="small text-muted">{formatCurrency(employee.salary)}</td>

                      {/* Actions */}
                      <td className="text-end pe-4" onClick={(e) => e.stopPropagation()}>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => setViewingEmployee(employee)}
                            title="View Employee Profile"
                          >
                            👁️ View
                          </button>
                          {canManageEmployees && (
                            <>
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate(`/editEmployee/${employee.id}`)}
                                title="Edit Employee"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={(e) => deleteEmployee(e, employee.id)}
                                title="Delete Employee"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                          {!canManageEmployees && isEmployee && (
                            (user?.employeeId && Number(user.employeeId) === Number(employee.id)) ||
                            (user?.email && employee.email && user.email.toLowerCase() === employee.email.toLowerCase())
                          ) && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/editEmployee/${employee.id}`)}
                              title="Edit My Details"
                            >
                              ✏️ Edit My Info
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalElements > 0 && (
          <div className="card-footer bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-3 border-top">
            <span className="text-muted small">
              Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
              <strong>{totalElements}</strong> employees
            </span>

            <ul className="pagination pagination-sm mb-0">
              {/* Previous Page */}
              <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                >
                  ‹ Prev
                </button>
              </li>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i).map((p) => {
                // Show pages around current
                if (
                  p === 0 ||
                  p === totalPages - 1 ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p + 1}
                      </button>
                    </li>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return (
                    <li key={p} className="page-item disabled">
                      <span className="page-link">…</span>
                    </li>
                  );
                }
                return null;
              })}

              {/* Next Page */}
              <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next ›
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* View Employee Modal */}
      {viewingEmployee && (
        <EmployeeViewModal
          employee={viewingEmployee}
          canEdit={
            canManageEmployees ||
            (isEmployee && (
              (user?.employeeId && Number(user.employeeId) === Number(viewingEmployee.id)) ||
              (user?.email && viewingEmployee.email && user.email.toLowerCase() === viewingEmployee.email.toLowerCase())
            ))
          }
          onClose={() => setViewingEmployee(null)}
          onEdit={(id) => navigate(`/editEmployee/${id}`)}
        />
      )}
    </div>
  );
};

export default EmployeeList;
