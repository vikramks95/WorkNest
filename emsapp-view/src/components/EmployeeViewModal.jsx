import React from 'react';

const formatSalary = (salary) => {
  if (salary == null || salary === '') return 'Not specified';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(salary);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getStatusBadge = (status) => {
  const norm = (status || 'ACTIVE').toUpperCase();
  if (norm === 'ACTIVE') {
    return <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fs-6">Active (On Duty)</span>;
  }
  if (norm === 'ON_LEAVE' || norm === 'LEAVE') {
    return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fs-6">On Leave</span>;
  }
  return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fs-6">Inactive</span>;
};

const EmployeeViewModal = ({ employee, onClose, onEdit, canEdit = true }) => {
  if (!employee) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-primary text-white p-4 position-relative">
            <button
              type="button"
              className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
              onClick={onClose}
              aria-label="Close"
            ></button>
            <div className="d-flex align-items-center gap-3">
              {employee.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt={employee.name}
                  className="rounded-circle border border-3 border-white shadow-sm object-fit-cover"
                  style={{ width: '80px', height: '80px' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center shadow-sm fs-2 border border-3 border-white"
                  style={{ width: '80px', height: '80px', flexShrink: 0 }}
                >
                  {employee.name ? employee.name.charAt(0).toUpperCase() : 'E'}
                </div>
              )}
              <div>
                <span className="badge bg-white bg-opacity-25 text-white mb-1">
                  EMP ID: #{employee.id}
                </span>
                <h4 className="fw-bold mb-1">{employee.name}</h4>
                <div className="text-white-50 small">
                  {employee.role || 'Staff Member'} • {employee.department || 'General'}
                </div>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="modal-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <span className="text-muted fw-semibold small text-uppercase">Status</span>
              <div>{getStatusBadge(employee.status)}</div>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <label className="text-muted small fw-semibold d-block">Department</label>
                <span className="fw-medium text-dark">{employee.department || 'General'}</span>
              </div>
              <div className="col-6">
                <label className="text-muted small fw-semibold d-block">Job Title / Role</label>
                <span className="fw-medium text-dark">{employee.role || 'Staff'}</span>
              </div>
              <div className="col-6">
                <label className="text-muted small fw-semibold d-block">Email Address</label>
                <a href={`mailto:${employee.email}`} className="text-primary text-decoration-none fw-medium text-break">
                  {employee.email || '-'}
                </a>
              </div>
              <div className="col-6">
                <label className="text-muted small fw-semibold d-block">Phone Number</label>
                <a href={`tel:${employee.phone}`} className="text-dark text-decoration-none fw-medium">
                  {employee.phone || '-'}
                </a>
              </div>
              <div className="col-6">
                <label className="text-muted small fw-semibold d-block">Annual Salary</label>
                <span className="fw-bold text-success">{formatSalary(employee.salary)}</span>
              </div>
              <div className="col-6">
                <label className="text-muted small fw-semibold d-block">Date Onboarded</label>
                <span className="text-muted small">{formatDate(employee.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light border-0 py-3 px-4">
            {canEdit && (
              <button
                type="button"
                className="btn btn-primary btn-sm px-3"
                onClick={() => {
                  onClose();
                  onEdit(employee.id);
                }}
              >
                ✏️ Edit Details
              </button>
            )}
            <button type="button" className="btn btn-secondary btn-sm px-3" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeViewModal;
