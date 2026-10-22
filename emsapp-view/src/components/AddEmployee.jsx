import React, { useState } from 'react';
import EmployeeService from '../service/EmployeeService';
import { useNavigate } from 'react-router-dom';
import { AVATAR_PRESETS } from '../utils/avatarPresets';

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

const AddEmployee = () => {
  const navigate = useNavigate();

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
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const saveEmployee = (e) => {
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

    EmployeeService.saveEmployee(payload)
      .then(() => {
        navigate('/employees');
      })
      .catch((error) => {
        console.error('Error saving employee:', error);
        setErrorMessage(
          error.response?.data?.message ||
          error.response?.data ||
          'Failed to save employee. Please check backend connection.'
        );
        setSubmitting(false);
      });
  };

  const reset = (e) => {
    e.preventDefault();
    setEmployee({
      name: '',
      phone: '',
      email: '',
      department: 'Engineering',
      role: '',
      status: 'ACTIVE',
      salary: '',
      profileImage: '',
    });
    setErrorMessage('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h4 className="mb-0 fw-bold">Add New Employee</h4>
              <small className="text-muted">Enter employee details, organizational unit, status, and profile photo</small>
            </div>
            <div className="card-body p-4">
              {errorMessage && (
                <div className="alert alert-danger py-2" role="alert">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={saveEmployee}>
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
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  {/* Phone */}
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
                      placeholder="e.g. +1 555-123-4567"
                    />
                  </div>

                  {/* Email */}
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
                      placeholder="e.g. john.doe@example.com"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  {/* Department */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="department" className="form-label fw-semibold">
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      id="department"
                      className="form-select"
                      name="department"
                      value={employee.department}
                      onChange={handleChange}
                      required
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Role / Job Title */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="role" className="form-label fw-semibold">
                      Job Title / Position
                    </label>
                    <input
                      id="role"
                      className="form-control"
                      type="text"
                      name="role"
                      value={employee.role}
                      onChange={handleChange}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  {/* Status */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="status" className="form-label fw-semibold">
                      Employment Status
                    </label>
                    <select
                      id="status"
                      className="form-select"
                      name="status"
                      value={employee.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">Active (On Duty)</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  {/* Salary */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="salary" className="form-label fw-semibold">
                      Annual Salary ($)
                    </label>
                    <input
                      id="salary"
                      className="form-control"
                      type="number"
                      name="salary"
                      value={employee.salary}
                      onChange={handleChange}
                      placeholder="e.g. 85000"
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Employee'}
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="btn btn-outline-secondary"
                    disabled={submitting}
                  >
                    Clear
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
