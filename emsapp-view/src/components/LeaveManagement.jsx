import React, { useEffect, useState, useCallback, useMemo } from 'react';
import LeaveService from '../service/LeaveService';
import { useAuth } from '../context/AuthContext';

const LEAVE_TYPES = [
  { value: 'VACATION', label: 'Vacation', icon: '🏖️', defaultDays: 15 },
  { value: 'SICK_LEAVE', label: 'Sick Leave', icon: '🤒', defaultDays: 10 },
  { value: 'CASUAL_LEAVE', label: 'Casual Leave', icon: '☕', defaultDays: 7 },
  { value: 'PERSONAL', label: 'Personal Leave', icon: '🏠', defaultDays: 5 },
  { value: 'MATERNITY_PATERNITY', label: 'Maternity / Paternity', icon: '👶', defaultDays: 90 },
  { value: 'UNPAID', label: 'Unpaid Leave', icon: '📋', defaultDays: 30 },
];

const getStatusBadge = (status) => {
  const norm = (status || 'PENDING').toUpperCase();
  if (norm === 'APPROVED') {
    return (
      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-medium">
        ✓ Approved
      </span>
    );
  }
  if (norm === 'REJECTED') {
    return (
      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fw-medium">
        ✕ Rejected
      </span>
    );
  }
  return (
    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fw-medium">
      ⏳ Pending Review
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const calculateDays = (start, end) => {
  if (!start || !end) return 1;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e - s;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
};

const LeaveManagement = () => {
  const { user, canManageLeaves, isEmployee } = useAuth();

  // Data states
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBalanceCards, setShowBalanceCards] = useState(true);

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Review / Approve / Reject Modal (for HR/Admin)
  const [reviewingLeave, setReviewingLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVED'); // APPROVED or REJECTED
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Employee Balances Inspection Modal (for HR/Admin)
  const [inspectingEmployee, setInspectingEmployee] = useState(null);
  const [inspectedBalances, setInspectedBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);

  // Load leaves, summary, and balances
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const promises = [
        canManageLeaves ? LeaveService.getAllLeaves() : LeaveService.getMyLeaves(),
        LeaveService.getMyBalances(),
      ];

      if (canManageLeaves) {
        promises.push(LeaveService.getLeaveSummary());
      }

      const [leavesRes, balancesRes, summaryRes] = await Promise.all(promises);
      setLeaves(leavesRes.data || []);
      setBalances(balancesRes.data || []);
      if (summaryRes) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch leave data:', err);
      setErrorMessage(
        err.response?.data?.message || 'Could not fetch leave records. Please verify backend connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [canManageLeaves]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Selected leave type balance in Apply modal
  const selectedTypeBalance = useMemo(() => {
    return balances.find((b) => b.leaveType === leaveForm.leaveType) || null;
  }, [balances, leaveForm.leaveType]);

  const requestedDays = useMemo(() => {
    if (!leaveForm.startDate || !leaveForm.endDate) return 1;
    return calculateDays(leaveForm.startDate, leaveForm.endDate);
  }, [leaveForm.startDate, leaveForm.endDate]);

  const isBalanceExceeded = useMemo(() => {
    if (!selectedTypeBalance) return false;
    return requestedDays > selectedTypeBalance.availableDays;
  }, [selectedTypeBalance, requestedDays]);

  // Submit Apply Leave
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate) {
      alert('Please specify both start and end dates.');
      return;
    }
    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      alert('End date cannot precede start date.');
      return;
    }

    if (isBalanceExceeded) {
      alert(
        `Requested duration of ${requestedDays} days exceeds your available ${selectedTypeBalance.label} balance (${selectedTypeBalance.availableDays} days remaining).`
      );
      return;
    }

    setSubmitting(true);
    try {
      await LeaveService.applyLeave(leaveForm);
      setShowApplyModal(false);
      setLeaveForm({
        leaveType: 'VACATION',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setSuccessToast('Leave request submitted successfully for approval.');
      fetchData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to apply for leave:', err);
      alert(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Approve / Reject
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!reviewingLeave) return;

    setActionLoading(true);
    try {
      await LeaveService.updateLeaveStatus(
        reviewingLeave.id,
        reviewAction,
        reviewComment
      );
      setReviewingLeave(null);
      setReviewComment('');
      setSuccessToast(`Leave request #${reviewingLeave.id} marked as ${reviewAction}.`);
      fetchData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Error updating leave status:', err);
      alert(err.response?.data?.message || 'Failed to update leave status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel / Withdraw pending leave
  const handleCancelLeave = async (leaveId) => {
    const confirmed = window.confirm(
      `Are you sure you want to withdraw/cancel leave request #${leaveId}? This will immediately restore your leave balance.`
    );
    if (!confirmed) return;

    try {
      await LeaveService.cancelLeave(leaveId);
      setSuccessToast(`Leave request #${leaveId} has been withdrawn.`);
      fetchData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to cancel leave:', err);
      alert(err.response?.data?.message || 'Failed to withdraw leave request.');
    }
  };

  // Inspect an employee's balances (for HR/Admin)
  const openInspectBalances = async (employeeId, employeeName) => {
    setInspectingEmployee({ id: employeeId, name: employeeName });
    setLoadingBalances(true);
    try {
      const res = await LeaveService.getEmployeeBalances(employeeId);
      setInspectedBalances(res.data || []);
    } catch (err) {
      console.error('Error fetching employee balances:', err);
      setInspectedBalances([]);
    } finally {
      setLoadingBalances(false);
    }
  };

  const openReviewModal = (leave, action) => {
    setReviewingLeave(leave);
    setReviewAction(action);
    setReviewComment(
      action === 'APPROVED'
        ? 'Approved by HR manager'
        : 'Unable to approve due to schedule/project constraints'
    );
  };

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // Tab / Status filter
      if (activeTab !== 'ALL' && leave.status?.toUpperCase() !== activeTab) {
        return false;
      }
      // Leave Type filter
      if (selectedTypeFilter !== 'ALL' && leave.leaveType?.toUpperCase() !== selectedTypeFilter) {
        return false;
      }
      // Search query (name, email, department, reason)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = leave.employeeName?.toLowerCase().includes(q);
        const matchesEmail = leave.employeeEmail?.toLowerCase().includes(q);
        const matchesDept = leave.department?.toLowerCase().includes(q);
        const matchesReason = leave.reason?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesDept || matchesReason;
      }
      return true;
    });
  }, [leaves, activeTab, selectedTypeFilter, searchQuery]);

  // Pending count for quick badge
  const pendingCount = useMemo(() => {
    return leaves.filter((l) => l.status === 'PENDING').length;
  }, [leaves]);

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">
              {canManageLeaves ? 'Leave Management & Approvals' : 'Leave Portal & Balances'}
            </h2>
            {canManageLeaves && pendingCount > 0 && (
              <span className="badge bg-warning text-dark px-2 py-1">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-muted mb-0 small mt-1">
            {canManageLeaves
              ? 'Review employee absence submissions, manage approvals, and monitor workforce leave balances'
              : 'Submit time-off requests, track real-time leave balances, and view approval status'}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center gap-1"
            onClick={() => setShowApplyModal(true)}
          >
            <span>+</span>
            <span>Request Time Off</span>
          </button>
          <button
            className="btn btn-outline-secondary btn-sm px-3"
            onClick={fetchData}
            title="Refresh leave data"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm" role="alert">
          <span>✓</span>
          <div>{successToast}</div>
          <button
            type="button"
            className="btn-close ms-auto"
            onClick={() => setSuccessToast('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <div>{errorMessage}</div>
          <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchData}>
            Retry
          </button>
        </div>
      )}

      {/* HR Pending Requests Alert Banner */}
      {canManageLeaves && pendingCount > 0 && activeTab !== 'PENDING' && (
        <div className="alert alert-warning border-warning border-opacity-50 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 py-2 px-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fs-5">⏳</span>
            <div>
              <strong>Action Required:</strong> You have <strong>{pendingCount}</strong> pending leave{' '}
              {pendingCount === 1 ? 'request' : 'requests'} waiting for your review.
            </div>
          </div>
          <button
            className="btn btn-warning btn-sm fw-semibold shadow-sm"
            onClick={() => setActiveTab('PENDING')}
          >
            View Pending Queue →
          </button>
        </div>
      )}

      {/* Leave Balances Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0">
              {canManageLeaves ? 'Your Personal Leave Balances' : 'Your Leave Balances'}
            </h5>
            <span className="badge bg-light text-muted border">Annual Allocation</span>
          </div>
          <button
            className="btn btn-link btn-sm text-decoration-none text-muted p-0"
            onClick={() => setShowBalanceCards((prev) => !prev)}
          >
            {showBalanceCards ? '▲ Hide Balances' : '▼ Show Balances'}
          </button>
        </div>

        {showBalanceCards && (
          <div className="row g-3">
            {balances.map((b) => {
              const usedPct = b.totalAllocated > 0 ? Math.round((b.usedDays / b.totalAllocated) * 100) : 0;
              const pendingPct = b.totalAllocated > 0 ? Math.round((b.pendingDays / b.totalAllocated) * 100) : 0;
              const availPct = Math.max(0, 100 - usedPct - pendingPct);

              return (
                <div key={b.leaveType} className="col-12 col-sm-6 col-md-4 col-lg-2">
                  <div className="card border-0 shadow-sm h-100 bg-white p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="fs-4">{b.icon || '📅'}</span>
                      <span className="badge bg-light text-dark border small">
                        {b.availableDays} left
                      </span>
                    </div>

                    <div className="fw-bold text-dark small text-truncate" title={b.label}>
                      {b.label}
                    </div>

                    <div className="d-flex align-items-baseline gap-1 mt-1 mb-2">
                      <span className="fs-4 fw-bold text-primary">{b.availableDays}</span>
                      <span className="text-muted small">/ {b.totalAllocated} days</span>
                    </div>

                    {/* Multi-segment Progress Bar */}
                    <div
                      className="progress"
                      style={{ height: '6px' }}
                      title={`Used: ${b.usedDays}d, Pending: ${b.pendingDays}d, Available: ${b.availableDays}d`}
                    >
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${usedPct}%` }}
                        title={`Used: ${b.usedDays} days`}
                      ></div>
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: `${pendingPct}%` }}
                        title={`Pending: ${b.pendingDays} days`}
                      ></div>
                      <div
                        className="progress-bar bg-success-subtle"
                        style={{ width: `${availPct}%` }}
                        title={`Available: ${b.availableDays} days`}
                      ></div>
                    </div>

                    <div className="d-flex justify-content-between text-muted mt-2" style={{ fontSize: '0.7rem' }}>
                      <span>Used: {b.usedDays}d</span>
                      <span>Pending: {b.pendingDays}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Leave History & Review Panel */}
      <div className="card border-0 shadow-sm">
        {/* Card Header Toolbar */}
        <div className="card-header bg-white py-3 border-bottom">
          <div className="row g-2 align-items-center">
            {/* Status Tabs */}
            <div className="col-12 col-md-6">
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('ALL')}
                >
                  All Requests ({leaves.length})
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'PENDING' ? 'btn-warning text-dark fw-semibold' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('PENDING')}
                >
                  ⏳ Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'APPROVED' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('APPROVED')}
                >
                  ✓ Approved ({leaves.filter((l) => l.status === 'APPROVED').length})
                </button>
                <button
                  type="button"
                  className={`btn ${activeTab === 'REJECTED' ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('REJECTED')}
                >
                  ✕ Rejected ({leaves.filter((l) => l.status === 'REJECTED').length})
                </button>
              </div>
            </div>

            {/* Filter by Leave Type */}
            <div className="col-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
              >
                <option value="ALL">All Leave Categories</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="col-6 col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light text-muted border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Filter by name, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Body Table */}
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading leave records...</span>
              </div>
              <p className="mt-2 text-muted">Retrieving leave submissions & balances...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div className="fs-1 mb-2">🏖️</div>
              <h6 className="fw-bold mb-1">No Leave Requests Found</h6>
              <p className="small text-muted mb-3">
                {activeTab !== 'ALL' || selectedTypeFilter !== 'ALL' || searchQuery
                  ? 'No records match the selected filter criteria.'
                  : 'You have not submitted any leave requests yet.'}
              </p>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setShowApplyModal(true)}>
                + Submit a Leave Request
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-3">Employee</th>
                    <th scope="col">Leave Type</th>
                    <th scope="col">Dates & Duration</th>
                    <th scope="col">Reason / Notes</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end pe-3">
                      {canManageLeaves ? 'Actions / Review' : 'HR Feedback / Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const days = leave.daysCount || calculateDays(leave.startDate, leave.endDate);
                    const isSelf =
                      (user?.employeeId && Number(user.employeeId) === Number(leave.employeeId)) ||
                      (user?.email && leave.employeeEmail && user.email.toLowerCase() === leave.employeeEmail.toLowerCase());

                    return (
                      <tr key={leave.id}>
                        {/* Employee Details */}
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center border"
                              style={{ width: '34px', height: '34px', flexShrink: 0, fontSize: '0.85rem' }}
                            >
                              {leave.employeeName ? leave.employeeName.charAt(0).toUpperCase() : 'E'}
                            </div>
                            <div>
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '180px' }}>
                                {leave.employeeName}
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                                {leave.department || 'General'} • {leave.employeeEmail || ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Leave Type */}
                        <td>
                          {(() => {
                            const meta = LEAVE_TYPES.find((t) => t.value === leave.leaveType);
                            return (
                              <span className="badge bg-light text-dark border px-2 py-1">
                                {meta?.icon || '📅'} {meta?.label || leave.leaveType?.replace('_', ' ')}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Dates & Duration */}
                        <td>
                          <div className="small fw-semibold text-dark">
                            {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            <span className="badge bg-secondary-subtle text-secondary me-1">
                              {days} {days === 1 ? 'day' : 'days'}
                            </span>
                            <span>Applied: {formatDate(leave.createdAt)}</span>
                          </div>
                        </td>

                        {/* Reason */}
                        <td className="small text-secondary" style={{ maxWidth: '240px' }}>
                          <div className="text-truncate" title={leave.reason}>
                            {leave.reason || <span className="text-muted fst-italic">No reason given</span>}
                          </div>
                        </td>

                        {/* Status */}
                        <td>{getStatusBadge(leave.status)}</td>

                        {/* Actions */}
                        <td className="text-end pe-3">
                          {/* HR / Admin Actions */}
                          {canManageLeaves ? (
                            <div className="d-flex justify-content-end align-items-center gap-1">
                              {leave.status === 'PENDING' ? (
                                <>
                                  <button
                                    className="btn btn-sm btn-success px-2 py-1"
                                    onClick={() => openReviewModal(leave, 'APPROVED')}
                                    title="Approve this leave"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger px-2 py-1"
                                    onClick={() => openReviewModal(leave, 'REJECTED')}
                                    title="Reject this leave"
                                  >
                                    ✕ Reject
                                  </button>
                                </>
                              ) : (
                                <div className="text-end small">
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    Reviewed by: <strong>{leave.reviewedBy || 'HR'}</strong>
                                  </div>
                                  {leave.reviewComment && (
                                    <div className="text-secondary fst-italic" style={{ fontSize: '0.72rem' }}>
                                      "{leave.reviewComment}"
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Inspect Employee Balance Button */}
                              {leave.employeeId && (
                                <button
                                  className="btn btn-sm btn-outline-secondary ms-1 py-1 px-2"
                                  onClick={() => openInspectBalances(leave.employeeId, leave.employeeName)}
                                  title="Inspect employee leave balances"
                                >
                                  📊
                                </button>
                              )}
                            </div>
                          ) : (
                            /* Employee view actions */
                            <div className="d-flex justify-content-end align-items-center gap-2">
                              {leave.status === 'PENDING' && isSelf && (
                                <button
                                  className="btn btn-sm btn-outline-danger py-1 px-2"
                                  onClick={() => handleCancelLeave(leave.id)}
                                  title="Withdraw this pending request"
                                >
                                  🗑️ Cancel
                                </button>
                              )}
                              {leave.reviewComment ? (
                                <div className="text-end small">
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    HR Note:
                                  </div>
                                  <div className="text-dark fst-italic" style={{ fontSize: '0.75rem' }}>
                                    "{leave.reviewComment}"
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted small">-</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => setShowApplyModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-primary text-white p-4 position-relative">
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setShowApplyModal(false)}
                  aria-label="Close"
                ></button>
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">🏖️</span>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Apply for Leave</h5>
                    <small className="text-white-50">Submit a time-off or absence request</small>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body p-4">
                  {/* Leave Type Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Leave Category</label>
                    <select
                      className="form-select"
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                      required
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Real-time Balance Badge */}
                  {selectedTypeBalance && (
                    <div
                      className={`p-2 px-3 rounded-3 mb-3 d-flex justify-content-between align-items-center border ${
                        isBalanceExceeded ? 'bg-danger-subtle border-danger text-danger' : 'bg-light border-light-subtle'
                      }`}
                    >
                      <span className="small">
                        <strong>Available Balance:</strong> {selectedTypeBalance.availableDays} /{' '}
                        {selectedTypeBalance.totalAllocated} days remaining
                      </span>
                      <span
                        className={`badge ${
                          isBalanceExceeded ? 'bg-danger text-white' : 'bg-primary-subtle text-primary'
                        }`}
                      >
                        {selectedTypeBalance.usedDays} used • {selectedTypeBalance.pendingDays} pending
                      </span>
                    </div>
                  )}

                  {/* Date Pickers */}
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={leaveForm.endDate}
                        min={leaveForm.startDate || undefined}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Live Indicator */}
                  {leaveForm.startDate && leaveForm.endDate && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center small text-muted">
                        <span>
                          Duration:{' '}
                          <strong className="text-dark">
                            {requestedDays} {requestedDays === 1 ? 'day' : 'days'}
                          </strong>
                        </span>
                        {isBalanceExceeded && (
                          <span className="text-danger fw-semibold">
                            ⚠️ Exceeds remaining balance by {requestedDays - (selectedTypeBalance?.availableDays || 0)}{' '}
                            days
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reason Text Area */}
                  <div className="mb-2">
                    <label className="form-label fw-semibold small">Reason / Justification</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Please provide context or details for this request..."
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-light border-0 py-3 px-4">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={submitting || isBalanceExceeded}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-3"
                    onClick={() => setShowApplyModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (for HR / Admin) */}
      {reviewingLeave && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => setReviewingLeave(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className={`p-4 position-relative text-white ${
                  reviewAction === 'APPROVED' ? 'bg-success' : 'bg-danger'
                }`}
              >
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setReviewingLeave(null)}
                  aria-label="Close"
                ></button>
                <h5 className="modal-title fw-bold mb-1">
                  {reviewAction === 'APPROVED' ? '✓ Approve Leave Request' : '✕ Reject Leave Request'}
                </h5>
                <small className="text-white-50">
                  Request #{reviewingLeave.id} submitted by {reviewingLeave.employeeName}
                </small>
              </div>

              <form onSubmit={handleStatusUpdate}>
                <div className="modal-body p-4">
                  <div className="p-3 mb-3 rounded-3 bg-light border">
                    <div className="row g-2 small">
                      <div className="col-6">
                        <span className="text-muted d-block">Employee:</span>
                        <strong className="text-dark">{reviewingLeave.employeeName}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Category:</span>
                        <strong className="text-dark">{reviewingLeave.leaveType?.replace('_', ' ')}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Dates:</span>
                        <span>
                          {formatDate(reviewingLeave.startDate)} – {formatDate(reviewingLeave.endDate)}
                        </span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">Duration:</span>
                        <strong className="text-primary">
                          {reviewingLeave.daysCount || calculateDays(reviewingLeave.startDate, reviewingLeave.endDate)}{' '}
                          days
                        </strong>
                      </div>
                      {reviewingLeave.reason && (
                        <div className="col-12 mt-2 pt-2 border-top">
                          <span className="text-muted d-block">Reason given:</span>
                          <span className="text-dark fst-italic">"{reviewingLeave.reason}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {reviewAction === 'APPROVED' && (
                    <div className="alert alert-info py-2 small mb-3">
                      ℹ️ Approving this request will automatically update the employee's status to{' '}
                      <strong>ON_LEAVE</strong> on the executive dashboard and employee directory.
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label fw-semibold small">
                      Reviewer Feedback / Comments
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add an explanation or message for the employee..."
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer bg-light border-0 py-3 px-4">
                  <button
                    type="submit"
                    className={`btn px-4 ${reviewAction === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? 'Processing...'
                      : reviewAction === 'APPROVED'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-3"
                    onClick={() => setReviewingLeave(null)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Employee Balances Modal (for HR/Admin) */}
      {inspectingEmployee && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(3px)' }}
          onClick={() => setInspectingEmployee(null)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="bg-dark text-white p-4 position-relative">
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setInspectingEmployee(null)}
                  aria-label="Close"
                ></button>
                <h5 className="modal-title fw-bold mb-1">📊 Employee Leave Balances</h5>
                <small className="text-white-50">
                  {inspectingEmployee.name} (EMP #{inspectingEmployee.id})
                </small>
              </div>

              <div className="modal-body p-4">
                {loadingBalances ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                    <div className="small text-muted mt-2">Loading balance breakdown...</div>
                  </div>
                ) : (
                  <div className="row g-2">
                    {inspectedBalances.map((b) => (
                      <div key={b.leaveType} className="col-6">
                        <div className="p-2 border rounded-3 bg-light">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small fw-semibold">
                              {b.icon} {b.label}
                            </span>
                            <span className="badge bg-primary-subtle text-primary">
                              {b.availableDays} avail
                            </span>
                          </div>
                          <div className="small text-muted d-flex justify-content-between">
                            <span>Allocated: {b.totalAllocated}d</span>
                            <span>Used: {b.usedDays}d</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light border-0 py-2 px-4">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3"
                  onClick={() => setInspectingEmployee(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
