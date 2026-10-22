import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeService from '../service/EmployeeService';
import LeaveService from '../service/LeaveService';
import { useAuth } from '../context/AuthContext';
import { AVATAR_PRESETS } from '../utils/avatarPresets';

const formatCurrency = (val) => {
  if (val == null || val === '') return 'Not disclosed';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const MyProfile = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Editable personal details form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profileImage: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [response, balanceRes] = await Promise.allSettled([
        EmployeeService.getMyProfile(),
        LeaveService.getMyBalances(),
      ]);

      if (response.status === 'fulfilled' && response.value?.data) {
        setEmployee(response.value.data);
        setFormData({
          name: response.value.data.name || '',
          phone: response.value.data.phone || '',
          email: response.value.data.email || '',
          profileImage: response.value.data.profileImage || '',
        });
      }

      if (balanceRes.status === 'fulfilled' && balanceRes.value?.data) {
        setBalances(balanceRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err);
      // Fallback: create mock profile display from user account
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        profileImage: '',
      });
      setErrorMessage(
        err.response?.data?.message || 'Could not load linked employee record. You can still view account details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (successMessage) setSuccessMessage('');
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
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Name is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updated = await EmployeeService.updateMyProfile(formData);
      setEmployee(updated.data);
      setSuccessMessage('Your personal profile details were updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to update personal details. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          {/* Header Card */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="bg-primary text-white p-4">
              <div className="d-flex flex-wrap align-items-center gap-4">
                {/* Profile Photo */}
                <div className="position-relative">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage}
                      alt={formData.name}
                      className="rounded-circle border border-3 border-white shadow object-fit-cover"
                      style={{ width: '92px', height: '92px' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center shadow fs-1 border border-3 border-white"
                      style={{ width: '92px', height: '92px' }}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h3 className="fw-bold mb-0">{formData.name || user?.name}</h3>
                    <span className="badge bg-white bg-opacity-25 text-white">
                      {role?.replace('ROLE_', '')}
                    </span>
                  </div>
                  <p className="text-white-50 mb-1 small">
                    {employee?.role || 'Staff Member'} • {employee?.department || 'General'}
                  </p>
                  <small className="text-white-50">
                    EMP ID: #{employee?.id || user?.employeeId || user?.id}
                  </small>
                </div>

                {/* Quick Action */}
                <div>
                  <button
                    className="btn btn-light btn-sm px-3 shadow-sm"
                    onClick={() => navigate('/leaves')}
                  >
                    🏖️ Request Leave
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
              <span>✓</span>
              <div>{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
              <span>!</span>
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Details & Form Card */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Personal & Organizational Details</h5>
              <small className="text-muted">
                You can edit your permitted personal details below. Department, job title, status, and compensation are managed by HR/Admin.
              </small>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <h6 className="fw-bold text-primary mb-3">✏️ Permitted Personal Information</h6>

                {/* Photo Update */}
                <div className="p-3 mb-4 rounded-3 border bg-light bg-opacity-50">
                  <label className="form-label fw-semibold small mb-2">Change Profile Photo</label>
                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-8">
                      <div className="input-group input-group-sm">
                        <input
                          type="url"
                          className="form-control"
                          placeholder="Paste image URL (https://...)"
                          name="profileImage"
                          value={formData.profileImage}
                          onChange={handleChange}
                        />
                        <label className="btn btn-outline-secondary mb-0">
                          Upload File
                          <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d-flex gap-1 align-items-center">
                        <span className="text-muted small me-1">Presets:</span>
                        {AVATAR_PRESETS.slice(0, 5).map((p) => (
                          <img
                            key={p.name}
                            src={p.url}
                            alt={p.name}
                            title={p.name}
                            className={`rounded-circle border ${formData.profileImage === p.url ? 'border-primary border-2' : ''}`}
                            style={{ width: '26px', height: '26px', cursor: 'pointer', objectFit: 'cover' }}
                            onClick={() => setFormData((prev) => ({ ...prev, profileImage: p.url }))}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  {/* Name */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 555-123-4567"
                    />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Read-Only Organizational Section */}
                <h6 className="fw-bold text-secondary mb-3">🏢 Organizational Information (Managed by HR/Admin)</h6>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Department</span>
                    <span className="fw-semibold text-dark">{employee?.department || 'General'}</span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Job Title / Role</span>
                    <span className="fw-semibold text-dark">{employee?.role || 'Staff Member'}</span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Status</span>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      {employee?.status || 'Active'}
                    </span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Compensation</span>
                    <span className="fw-bold text-dark">{formatCurrency(employee?.salary)}</span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">Onboarded Date</span>
                    <span className="text-muted small">{formatDate(employee?.createdAt)}</span>
                  </div>
                  <div className="col-6 col-md-3">
                    <span className="text-muted small d-block">System Username</span>
                    <span className="text-dark small">@{user?.username}</span>
                  </div>
                </div>

                {/* Leave Balances Widget */}
                {balances.length > 0 && (
                  <div className="p-3 mb-4 rounded-3 border bg-light bg-opacity-50">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark">🏖️ Time Off & Leave Balances</h6>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-decoration-none p-0 fw-semibold"
                        onClick={() => navigate('/leaves')}
                      >
                        Request Time Off →
                      </button>
                    </div>
                    <div className="row g-2">
                      {balances.slice(0, 4).map((b) => (
                        <div key={b.leaveType} className="col-6 col-sm-3">
                          <div className="p-2 border rounded-2 bg-white">
                            <span className="small text-muted d-block text-truncate">
                              {b.icon} {b.label}
                            </span>
                            <div className="d-flex align-items-baseline gap-1 mt-1">
                              <span className="fw-bold text-primary">{b.availableDays}</span>
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                / {b.totalAllocated}d left
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? 'Saving Changes...' : 'Save Personal Details'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/employees')}
                  >
                    View All Employees
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

export default MyProfile;
