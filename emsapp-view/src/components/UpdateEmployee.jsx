import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeService from '../service/EmployeeService';
import { AVATAR_PRESETS } from '../utils/avatarPresets';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Marketing',
  'Finance',
  'Sales',
  'Design',
  'Operations',
  'Legal',
  'General',
];

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canManageEmployees, isEmployee } = useAuth();

  const [employee, setEmployee] = useState({
    name: '',
    phone: '',
    email: '',
    department: 'Engineering',
    role: '',
    status: 'ACTIVE',
    salary: '',
    profileImage: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSelf = Boolean(
    (user?.employeeId && Number(user.employeeId) === Number(id)) ||
    (user?.email && employee.email && user.email.toLowerCase() === employee.email.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB limit. Please choose a smaller file.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEmployee((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetAvatar = (url) => {
    setEmployee((prev) => ({ ...prev, profileImage: url }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await EmployeeService.getEmployeeById(id);
        if (response.data) {
          setEmployee({
            name: response.data.name || '',
            phone: response.data.phone || '',
            email: response.data.email || '',
            department: response.data.department || 'Engineering',
            role: response.data.role || '',
            status: response.data.status || 'ACTIVE',
            salary: response.data.salary != null ? response.data.salary : '',
            profileImage: response.data.profileImage || '',
          });
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        setErrorMessage('Employee not found or server is unreachable.');
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const updateEmployee = (e) => {
    e.preventDefault();
    if (!employee.name.trim()) {
      setErrorMessage('Employee name is required.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      ...employee,
      salary: employee.salary ? parseFloat(employee.salary) : null,
    };

    EmployeeService.updateEmployee(payload, id)
      .then(() => {
        navigate('/employees');
      })
      .catch((error) => {
        console.error('Error updating employee:', error);
        setErrorMessage(
          error.response?.data?.message ||
          error.response?.data ||
          'Failed to update employee details.'
        );
        setSubmitting(false);
      });
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h4 className="mb-0 fw-bold">Update Employee #{id}</h4>
              <small className="text-muted">Modify employee record, role, status, department, or photo</small>
            </div>
            <div className="card-body p-4">
              {errorMessage && (
                <div className="alert alert-danger py-2" role="alert">
                  {errorMessage}
                </div>
              )}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading employee details...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading employee details...</p>
                </div>
              ) : (
                <>
                  {/* Role-based Banner */}
                  {!canManageEmployees && isEmployee && !isSelf && (
                    <div className="alert alert-warning py-2 mb-3">
                      ⚠️ <strong>Access Restricted:</strong> As an employee, you can only view and update your own personal profile.
                    </div>
                  )}

                  {!canManageEmployees && isEmployee && isSelf && (
                    <div className="alert alert-info py-2 mb-3 d-flex align-items-center gap-2">
                      <span className="fs-5">ℹ️</span>
                      <div className="small">
                        <strong>Self-Service Mode:</strong> You can edit your personal details (Name, Phone, Email, and Profile Photo). Organizational settings (Department, Job Title, Status, and Salary) are locked and managed by HR/Admin.
                      </div>
                    </div>
                  )}

                  <form onSubmit={updateEmployee}>
                  {/* Profile Photo Section */}
                  <div className="p-3 mb-4 rounded-3 border bg-light bg-opacity-50">
                    <label className="form-label fw-semibold mb-2">Profile Photo</label>
                    <div className="d-flex flex-wrap align-items-center gap-4">
                      {/* Preview */}
                      <div className="position-relative">
                        {employee.profileImage ? (
                          <img
                            src={employee.profileImage}
                            alt="Preview"
                            className="rounded-circle border border-2 border-primary object-fit-cover shadow-sm"
                            style={{ width: '84px', height: '84px' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary bg-opacity-25 text-secondary fw-bold d-flex align-items-center justify-content-center border fs-3"
                            style={{ width: '84px', height: '84px' }}
                          >
                            {employee.name ? employee.name.charAt(0).toUpperCase() : '👤'}
                          </div>
                        )}
                        {employee.profileImage && (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                            style={{ width: '22px', height: '22px' }}
                            onClick={() => setEmployee((prev) => ({ ...prev, profileImage: '' }))}
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="flex-grow-1">
                        <div className="mb-2">
                          <label className="form-label small text-muted mb-1">Image URL or Local Upload</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Paste image URL (https://...)"
                              name="profileImage"
                              value={employee.profileImage}
                              onChange={handleChange}
                            />
                            <label className="btn btn-outline-secondary mb-0">
                              Upload File
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Presets */}
                        <div>
                          <span className="small text-muted me-2">Or pick a preset:</span>
                          <div className="d-inline-flex gap-2 align-items-center mt-1">
                            {AVATAR_PRESETS.map((preset) => (
                              <img
                                key={preset.name}
                                src={preset.url}
                                alt={preset.name}
                                title={preset.name}
                                className={`rounded-circle cursor-pointer border ${employee.profileImage === preset.url ? 'border-primary border-2 shadow-sm' : 'border-light'}`}
                                style={{ width: '28px', height: '28px', cursor: 'pointer', objectFit: 'cover' }}
                                onClick={() => selectPresetAvatar(preset.url)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="name"
                      className="form-control"
                      type="text"
                      name="name"
                      value={employee.name}
                      onChange={handleChange}
                      placeholder="Name"
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        className="form-control"
                        type="tel"
                        name="phone"
                        value={employee.phone}
                        onChange={handleChange}
                        placeholder="Phone"
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Email Address
                      </label>
                      <input
                        id="email"
                        className="form-control"
                        type="email"
                        name="email"
                        value={employee.email}
                        onChange={handleChange}
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label htmlFor="department" className="form-label fw-semibold">
                        Department {!canManageEmployees && <span className="badge bg-secondary-subtle text-secondary ms-1">🔒 Locked</span>}
                      </label>
                      <select
                        id="department"
                        className="form-select"
                        name="department"
                        value={employee.department}
                        onChange={handleChange}
                        disabled={!canManageEmployees}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label htmlFor="role" className="form-label fw-semibold">
                        Job Title / Position {!canManageEmployees && <span className="badge bg-secondary-subtle text-secondary ms-1">🔒 Locked</span>}
                      </label>
                      <input
                        id="role"
                        className="form-control"
                        type="text"
                        name="role"
                        value={employee.role}
                        onChange={handleChange}
                        placeholder="e.g. Lead Designer"
                        disabled={!canManageEmployees}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6">
                      <label htmlFor="status" className="form-label fw-semibold">
                        Employment Status {!canManageEmployees && <span className="badge bg-secondary-subtle text-secondary ms-1">🔒 Locked</span>}
                      </label>
                      <select
                        id="status"
                        className="form-select"
                        name="status"
                        value={employee.status}
                        onChange={handleChange}
                        disabled={!canManageEmployees}
                      >
                        <option value="ACTIVE">Active (On Duty)</option>
                        <option value="ON_LEAVE">On Leave</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label htmlFor="salary" className="form-label fw-semibold">
                        Annual Salary ($) {!canManageEmployees && <span className="badge bg-secondary-subtle text-secondary ms-1">🔒 Locked</span>}
                      </label>
                      <input
                        id="salary"
                        className="form-control"
                        type="number"
                        name="salary"
                        value={employee.salary}
                        onChange={handleChange}
                        placeholder="e.g. 95000"
                        disabled={!canManageEmployees}
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={submitting || (!canManageEmployees && !isSelf)}
                    >
                      {submitting ? 'Updating...' : 'Update Employee'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/employees')}
                      className="btn btn-light ms-auto"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateEmployee;
