import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AttendanceService from '../service/AttendanceService';
import EmployeeService from '../service/EmployeeService';
import { useAuth } from '../context/AuthContext';

const getStatusBadge = (status, isLate) => {
  const norm = (status || 'NOT_CHECKED_IN').toUpperCase();
  if (norm === 'PRESENT') {
    return (
      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-medium">
        ✓ Present
      </span>
    );
  }
  if (norm === 'LATE' || isLate) {
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fw-medium">
        ⚠️ Late Arrival
      </span>
    );
  }
  if (norm === 'HALF_DAY') {
    return (
      <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1 fw-medium">
        ⏳ Half Day
      </span>
    );
  }
  if (norm === 'ON_LEAVE') {
    return (
      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-medium">
        🏖️ On Leave
      </span>
    );
  }
  if (norm === 'ABSENT') {
    return (
      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fw-medium">
        ✕ Absent
      </span>
    );
  }
  return (
    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fw-medium">
      ⚪ Not Checked In
    </span>
  );
};

const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatDuration = (hoursDecimal) => {
  if (!hoursDecimal || hoursDecimal <= 0) return '0h 0m';
  const totalMins = Math.round(hoursDecimal * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hrs}h ${mins}m`;
};

const AttendanceManagement = () => {
  const { user, canManageEmployees, isEmployee } = useAuth();

  // Active Tab: 'my' | 'daily' | 'monthly'
  const [activeTab, setActiveTab] = useState('my');

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Today's personal punch status
  const [todayRecord, setTodayRecord] = useState(null);
  const [punchNotes, setPunchNotes] = useState('');
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchMessage, setPunchMessage] = useState(null);

  // My History Tab
  const [myHistory, setMyHistory] = useState([]);
  const [myHistoryLoading, setMyHistoryLoading] = useState(false);

  // Daily Roster Tab
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailySearch, setDailySearch] = useState('');
  const [dailyDeptFilter, setDailyDeptFilter] = useState('ALL');
  const [dailyStatusFilter, setDailyStatusFilter] = useState('ALL');

  // Monthly Report Tab
  const todayDateObj = new Date();
  const [selectedYear, setSelectedYear] = useState(todayDateObj.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(todayDateObj.getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlySearch, setMonthlySearch] = useState('');

  // Drilldown Modal (Employee Monthly Log)
  const [drilldownEmployee, setDrilldownEmployee] = useState(null);

  // Manual Adjustment Modal (Admin/HR)
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [adjustFormData, setAdjustFormData] = useState({
    id: null,
    employeeId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    checkInTime: '',
    checkOutTime: '',
    status: 'PRESENT',
    notes: '',
  });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Global Seeding State
  const [seeding, setSeeding] = useState(false);

  // Ticking live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's personal attendance
  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await AttendanceService.getTodayAttendance();
      setTodayRecord(res.data || null);
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    }
  }, []);

  // Fetch my history
  const fetchMyHistory = useCallback(async () => {
    setMyHistoryLoading(true);
    try {
      const res = await AttendanceService.getMyHistory();
      setMyHistory(res.data || []);
    } catch (err) {
      console.error('Error fetching personal attendance history:', err);
    } finally {
      setMyHistoryLoading(false);
    }
  }, []);

  // Fetch daily roster
  const fetchDailyAttendance = useCallback(async (date) => {
    setDailyLoading(true);
    try {
      const res = await AttendanceService.getDailyAttendance(date);
      setDailySummary(res.data);
    } catch (err) {
      console.error('Error fetching daily attendance:', err);
    } finally {
      setDailyLoading(false);
    }
  }, []);

  // Fetch monthly report
  const fetchMonthlyReport = useCallback(async (year, month) => {
    setMonthlyLoading(true);
    try {
      const res = await AttendanceService.getMonthlyReport(year, month);
      setMonthlyReport(res.data);
    } catch (err) {
      console.error('Error fetching monthly attendance report:', err);
    } finally {
      setMonthlyLoading(false);
    }
  }, []);

  // Fetch all employees for manual adjustment dropdown
  const fetchEmployeesList = useCallback(async () => {
    if (!canManageEmployees) return;
    try {
      const res = await EmployeeService.getEmployees();
      const list = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      setEmployeesList(list);
    } catch (err) {
      console.error('Error fetching employees list:', err);
    }
  }, [canManageEmployees]);

  // Initial Load
  useEffect(() => {
    fetchTodayAttendance();
    fetchMyHistory();
    if (canManageEmployees) {
      fetchDailyAttendance(selectedDate);
      fetchEmployeesList();
    }
  }, [fetchTodayAttendance, fetchMyHistory, fetchDailyAttendance, fetchEmployeesList, selectedDate, canManageEmployees]);

  // When changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'my') {
      fetchTodayAttendance();
      fetchMyHistory();
    } else if (tab === 'daily') {
      fetchDailyAttendance(selectedDate);
    } else if (tab === 'monthly') {
      fetchMonthlyReport(selectedYear, selectedMonth);
    }
  };

  // Check In Handler
  const handleCheckIn = async () => {
    setPunchLoading(true);
    setPunchMessage(null);
    try {
      const res = await AttendanceService.checkIn(punchNotes);
      setTodayRecord(res.data);
      setPunchNotes('');
      setPunchMessage({ type: 'success', text: 'Checked in successfully! Have a productive day.' });
      fetchMyHistory();
    } catch (err) {
      console.error('Check-in error:', err);
      setPunchMessage({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Check-in failed.',
      });
    } finally {
      setPunchLoading(false);
    }
  };

  // Check Out Handler
  const handleCheckOut = async () => {
    if (!window.confirm('Are you sure you want to check out for today?')) return;
    setPunchLoading(true);
    setPunchMessage(null);
    try {
      const res = await AttendanceService.checkOut(punchNotes);
      setTodayRecord(res.data);
      setPunchNotes('');
      setPunchMessage({
        type: 'success',
        text: `Checked out successfully! Total working hours: ${res.data.workingHours} hrs.`,
      });
      fetchMyHistory();
    } catch (err) {
      console.error('Check-out error:', err);
      setPunchMessage({
        type: 'danger',
        text: err.response?.data?.message || err.message || 'Check-out failed.',
      });
    } finally {
      setPunchLoading(false);
    }
  };

  // Seed Demo Attendance
  const handleSeedDemoAttendance = async () => {
    setSeeding(true);
    try {
      await AttendanceService.seedDemoAttendance();
      alert('Demo attendance records generated successfully!');
      fetchTodayAttendance();
      fetchMyHistory();
      if (activeTab === 'daily') fetchDailyAttendance(selectedDate);
      if (activeTab === 'monthly') fetchMonthlyReport(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Seeding error:', err);
      alert('Failed to generate demo attendance data.');
    } finally {
      setSeeding(false);
    }
  };

  // Manual Adjust Modal Open
  const handleOpenAdjustModal = (record = null) => {
    if (record) {
      // Pre-fill existing record
      const checkInIso = record.checkInTime ? record.checkInTime.slice(0, 16) : '';
      const checkOutIso = record.checkOutTime ? record.checkOutTime.slice(0, 16) : '';
      setAdjustFormData({
        id: record.id,
        employeeId: record.employeeId,
        attendanceDate: record.attendanceDate,
        checkInTime: checkInIso,
        checkOutTime: checkOutIso,
        status: record.status || 'PRESENT',
        notes: record.notes || '',
      });
    } else {
      // New record
      setAdjustFormData({
        id: null,
        employeeId: employeesList[0]?.id || '',
        attendanceDate: selectedDate || new Date().toISOString().split('T')[0],
        checkInTime: `${selectedDate || new Date().toISOString().split('T')[0]}T09:00`,
        checkOutTime: `${selectedDate || new Date().toISOString().split('T')[0]}T17:30`,
        status: 'PRESENT',
        notes: 'Manual punch adjustment',
      });
    }
    setShowAdjustModal(true);
  };

  // Submit Manual Adjustment
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustFormData.employeeId) {
      alert('Please select an employee.');
      return;
    }
    setAdjustSubmitting(true);
    try {
      await AttendanceService.saveManualAttendance({
        id: adjustFormData.id || null,
        employeeId: Number(adjustFormData.employeeId),
        attendanceDate: adjustFormData.attendanceDate,
        checkInTime: adjustFormData.checkInTime ? adjustFormData.checkInTime : null,
        checkOutTime: adjustFormData.checkOutTime ? adjustFormData.checkOutTime : null,
        status: adjustFormData.status,
        notes: adjustFormData.notes,
      });
      setShowAdjustModal(false);
      fetchDailyAttendance(selectedDate);
      if (activeTab === 'monthly') fetchMonthlyReport(selectedYear, selectedMonth);
    } catch (err) {
      console.error('Error saving manual attendance:', err);
      alert(err.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Export Monthly Report as CSV
  const handleExportCSV = () => {
    if (!monthlyReport || !monthlyReport.employeeSummaries?.length) {
      alert('No monthly attendance data to export.');
      return;
    }

    const headers = [
      'Employee ID',
      'Name',
      'Department',
      'Present Days',
      'Late Arrivals',
      'Half Days',
      'Leaves',
      'Absent Days',
      'Total Working Hours',
      'Avg Hours/Day',
      'Attendance Rate (%)',
    ];

    const rows = monthlyReport.employeeSummaries.map((emp) => [
      emp.employeeId,
      `"${emp.employeeName || ''}"`,
      `"${emp.department || ''}"`,
      emp.totalPresent,
      emp.totalLate,
      emp.totalHalfDay,
      emp.totalOnLeave,
      emp.totalAbsent,
      emp.totalWorkingHours,
      emp.averageWorkingHours,
      `${emp.attendancePercentage}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Attendance_Report_${monthlyReport.monthName}_${monthlyReport.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Departments list for filter
  const departments = useMemo(() => {
    if (!dailySummary?.records) return [];
    const depts = new Set(
      dailySummary.records.map((r) => r.department || 'General').filter(Boolean)
    );
    return Array.from(depts);
  }, [dailySummary]);

  // Filtered daily roster
  const filteredDailyRecords = useMemo(() => {
    if (!dailySummary?.records) return [];
    return dailySummary.records.filter((r) => {
      const matchSearch =
        !dailySearch ||
        r.employeeName?.toLowerCase().includes(dailySearch.toLowerCase()) ||
        r.employeeEmail?.toLowerCase().includes(dailySearch.toLowerCase());
      const matchDept =
        dailyDeptFilter === 'ALL' || (r.department || 'General') === dailyDeptFilter;
      const matchStatus =
        dailyStatusFilter === 'ALL' ||
        (r.status || 'NOT_CHECKED_IN').toUpperCase() === dailyStatusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [dailySummary, dailySearch, dailyDeptFilter, dailyStatusFilter]);

  // Filtered monthly employee summaries
  const filteredMonthlySummaries = useMemo(() => {
    if (!monthlyReport?.employeeSummaries) return [];
    return monthlyReport.employeeSummaries.filter((emp) => {
      return (
        !monthlySearch ||
        emp.employeeName?.toLowerCase().includes(monthlySearch.toLowerCase()) ||
        emp.department?.toLowerCase().includes(monthlySearch.toLowerCase())
      );
    });
  }, [monthlyReport, monthlySearch]);

  // Punch Card Dynamic State
  const isCheckedIn = !!todayRecord?.checkInTime;
  const isCheckedOut = !!todayRecord?.checkOutTime;

  // Live elapsed time calculation if checked in
  const elapsedWorkTime = useMemo(() => {
    if (!isCheckedIn || isCheckedOut || !todayRecord?.checkInTime) return null;
    const checkInDate = new Date(todayRecord.checkInTime);
    const diffMs = currentTime - checkInDate;
    if (diffMs <= 0) return '0h 0m';
    const totalSecs = Math.floor(diffMs / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h}h ${m}m ${s}s`;
  }, [isCheckedIn, isCheckedOut, todayRecord, currentTime]);

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">⏱️ Attendance Management</h2>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
              Daily & Reports
            </span>
          </div>
          <p className="text-muted mb-0 small mt-1">
            Real-time punch records, shift tracking, late arrival analytics, and monthly reports
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Live Clock Card */}
          <div className="bg-dark text-white px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2">
            <span className="fs-5">🕒</span>
            <div>
              <div className="fw-bold font-monospace" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: true })}
              </div>
              <div className="text-white-50" style={{ fontSize: '0.7rem' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          {canManageEmployees && (
            <>
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                onClick={handleSeedDemoAttendance}
                disabled={seeding}
                title="Populate realistic demo attendance records"
              >
                <span>{seeding ? '⏳ Seeding...' : '🎲 Seed Demo Data'}</span>
              </button>
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                onClick={() => handleOpenAdjustModal(null)}
              >
                <span>+ Record / Adjust Punch</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills gap-2 mb-4 p-1 bg-white rounded-3 shadow-sm border">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => handleTabChange('my')}
          >
            👤 My Attendance & Punch
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => handleTabChange('daily')}
          >
            📅 Daily Attendance Status
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold px-3 py-2 ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => handleTabChange('monthly')}
          >
            📊 Monthly Reports & Analytics
          </button>
        </li>
      </ul>

      {/* TAB 1: MY ATTENDANCE & PUNCH */}
      {activeTab === 'my' && (
        <div className="row g-4">
          {/* Punch Hero Card */}
          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Punch Terminal</h5>
                <span className="badge bg-light text-dark border">Shift: 09:00 AM - 05:00 PM</span>
              </div>
              <div className="card-body p-4 text-center">
                {/* Punch Message Alert */}
                {punchMessage && (
                  <div className={`alert alert-${punchMessage.type} alert-dismissible fade show text-start py-2 mb-3`} role="alert">
                    <small>{punchMessage.text}</small>
                    <button type="button" className="btn-close btn-sm" onClick={() => setPunchMessage(null)}></button>
                  </div>
                )}

                {/* Status Ring / Icon */}
                <div className="mb-3">
                  {!isCheckedIn ? (
                    <div
                      className="rounded-circle bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
                    >
                      ⚪
                    </div>
                  ) : !isCheckedOut ? (
                    <div
                      className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
                    >
                      🟢
                    </div>
                  ) : (
                    <div
                      className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                <h4 className="fw-bold mb-1">
                  {!isCheckedIn
                    ? 'Ready to Check In'
                    : !isCheckedOut
                    ? 'Currently on Duty'
                    : 'Shift Completed Today'}
                </h4>

                <p className="text-muted small mb-3">
                  {!isCheckedIn
                    ? 'Standard check-in begins at 09:00 AM. 15-minute grace period applies.'
                    : !isCheckedOut
                    ? `Checked in at ${formatTime(todayRecord?.checkInTime)}. Working time ticking.`
                    : `You worked ${formatDuration(todayRecord?.workingHours)} today. Great job!`}
                </p>

                {/* Live Working Timer if currently checked in */}
                {isCheckedIn && !isCheckedOut && elapsedWorkTime && (
                  <div className="bg-light p-3 rounded-3 mb-3 border">
                    <small className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                      Live Working Duration
                    </small>
                    <span className="fs-3 fw-bold font-monospace text-primary">{elapsedWorkTime}</span>
                  </div>
                )}

                {/* Late Badge indicator */}
                {todayRecord?.isLate && (
                  <div className="alert alert-warning py-2 px-3 mb-3 text-start small d-flex align-items-center gap-2">
                    <span>⚠️</span>
                    <div>
                      <strong>Late Arrival Logged:</strong> Checked in {todayRecord.lateMinutes} minutes past shift start.
                    </div>
                  </div>
                )}

                {/* Punch Details Breakdown */}
                {todayRecord && (
                  <div className="row g-2 mb-3 text-start">
                    <div className="col-6">
                      <div className="p-2 border rounded bg-light">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Check In</small>
                        <span className="fw-semibold">{formatTime(todayRecord.checkInTime)}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 border rounded bg-light">
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Check Out</small>
                        <span className="fw-semibold">{formatTime(todayRecord.checkOutTime)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional Note input */}
                {!isCheckedOut && (
                  <div className="mb-3 text-start">
                    <label className="form-label small text-muted fw-semibold">
                      {isCheckedIn ? 'Check-out Notes (Optional)' : 'Check-in Notes (Optional)'}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={isCheckedIn ? 'e.g. Leaving for client meeting' : 'e.g. Working from Office floor 3'}
                      value={punchNotes}
                      onChange={(e) => setPunchNotes(e.target.value)}
                    />
                  </div>
                )}

                {/* Punch Action Buttons */}
                {!isCheckedIn ? (
                  <button
                    className="btn btn-success btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3"
                    onClick={handleCheckIn}
                    disabled={punchLoading}
                  >
                    <span>{punchLoading ? '⏳ Checking In...' : '▶️ Check In Now'}</span>
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    className="btn btn-danger btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-3"
                    onClick={handleCheckOut}
                    disabled={punchLoading}
                  >
                    <span>{punchLoading ? '⏳ Checking Out...' : '⏹️ Check Out Now'}</span>
                  </button>
                ) : (
                  <div className="p-3 bg-success-subtle text-success border border-success-subtle rounded-3 text-center">
                    <div className="fw-bold">✓ Daily Punch Completed</div>
                    <small>Checked out at {formatTime(todayRecord.checkOutTime)}. See you tomorrow!</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Attendance History Table */}
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-0">My Recent Attendance</h5>
                  <small className="text-muted">Your latest check-in/out records</small>
                </div>
                <span className="badge bg-secondary">{myHistory.length} Records</span>
              </div>
              <div className="card-body p-0">
                {myHistoryLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted small">Loading your attendance history...</p>
                  </div>
                ) : myHistory.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No attendance history found yet.</p>
                    <small className="text-muted">Check in using the terminal on the left to start tracking!</small>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-3">Date</th>
                          <th>Status</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Working Hours</th>
                          <th className="pe-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myHistory.map((rec) => (
                          <tr key={rec.id}>
                            <td className="ps-3 fw-semibold text-nowrap">{formatDate(rec.attendanceDate)}</td>
                            <td>{getStatusBadge(rec.status, rec.isLate)}</td>
                            <td>
                              <span className="text-nowrap">{formatTime(rec.checkInTime)}</span>
                              {rec.isLate && (
                                <span className="badge bg-warning text-dark ms-1 small" style={{ fontSize: '0.65rem' }}>
                                  +{rec.lateMinutes}m
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="text-nowrap">{formatTime(rec.checkOutTime)}</span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <span className="fw-bold">{formatDuration(rec.workingHours)}</span>
                                {rec.workingHours >= 8.5 && (
                                  <span className="badge bg-info-subtle text-info small" style={{ fontSize: '0.65rem' }}>
                                    OT
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="pe-3 text-muted small text-truncate" style={{ maxWidth: '140px' }} title={rec.notes}>
                              {rec.notes || '-'}
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
        </div>
      )}

      {/* TAB 2: DAILY ATTENDANCE STATUS */}
      {activeTab === 'daily' && (
        <div>
          {/* Date Picker Bar & Summary Metrics */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row g-3 align-items-center justify-content-between">
                <div className="col-12 col-md-5 d-flex align-items-center gap-2">
                  <label className="fw-bold text-nowrap mb-0 small">Select Date:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      fetchDailyAttendance(e.target.value);
                    }}
                  />
                  <button
                    className="btn btn-outline-secondary btn-sm text-nowrap"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setSelectedDate(today);
                      fetchDailyAttendance(today);
                    }}
                  >
                    Today
                  </button>
                </div>

                <div className="col-12 col-md-7 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ maxWidth: '200px' }}
                    placeholder="Search employee..."
                    value={dailySearch}
                    onChange={(e) => setDailySearch(e.target.value)}
                  />
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: '140px' }}
                    value={dailyDeptFilter}
                    onChange={(e) => setDailyDeptFilter(e.target.value)}
                  >
                    <option value="ALL">All Depts</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: '140px' }}
                    value={dailyStatusFilter}
                    onChange={(e) => setDailyStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late Arrival</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="NOT_CHECKED_IN">Not Checked In</option>
                    <option value="ABSENT">Absent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Daily KPI Cards */}
          {dailySummary && (
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-4 col-xl-2">
                <div className="card border-0 shadow-sm p-3 text-center bg-white h-100">
                  <span className="text-muted small fw-semibold">Total Staff</span>
                  <h3 className="fw-bold mb-0 text-dark">{dailySummary.totalEmployees}</h3>
                  <small className="text-muted">Registered</small>
                </div>
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <div className="card border-0 shadow-sm p-3 text-center bg-success bg-opacity-10 border border-success-subtle h-100">
                  <span className="text-success small fw-semibold">Present</span>
                  <h3 className="fw-bold mb-0 text-success">{dailySummary.presentCount}</h3>
                  <small className="text-success">
                    {dailySummary.totalEmployees > 0
                      ? `${Math.round((dailySummary.presentCount / dailySummary.totalEmployees) * 100)}%`
                      : '0%'}
                  </small>
                </div>
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <div className="card border-0 shadow-sm p-3 text-center bg-warning bg-opacity-10 border border-warning-subtle h-100">
                  <span className="text-warning-emphasis small fw-semibold">Late Arrivals</span>
                  <h3 className="fw-bold mb-0 text-warning-emphasis">{dailySummary.lateCount}</h3>
                  <small className="text-muted">Past 09:15 AM</small>
                </div>
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <div className="card border-0 shadow-sm p-3 text-center bg-info bg-opacity-10 border border-info-subtle h-100">
                  <span className="text-info-emphasis small fw-semibold">Half Days</span>
                  <h3 className="fw-bold mb-0 text-info-emphasis">{dailySummary.halfDayCount}</h3>
                  <small className="text-muted">&lt; 4.5 hours</small>
                </div>
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <div className="card border-0 shadow-sm p-3 text-center bg-primary bg-opacity-10 border border-primary-subtle h-100">
                  <span className="text-primary small fw-semibold">On Leave</span>
                  <h3 className="fw-bold mb-0 text-primary">{dailySummary.onLeaveCount}</h3>
                  <small className="text-muted">Approved Leaves</small>
                </div>
              </div>
              <div className="col-6 col-md-4 col-xl-2">
                <div className="card border-0 shadow-sm p-3 text-center bg-danger bg-opacity-10 border border-danger-subtle h-100">
                  <span className="text-danger small fw-semibold">Absent / Not In</span>
                  <h3 className="fw-bold mb-0 text-danger">{dailySummary.absentCount}</h3>
                  <small className="text-muted">Pending punch</small>
                </div>
              </div>
            </div>
          )}

          {/* Daily Table Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Daily Roster ({formatDate(selectedDate)})</h5>
                <small className="text-muted">Showing {filteredDailyRecords.length} records</small>
              </div>
              <span className="badge bg-light text-dark border">
                Avg Working Hours Today: <strong>{dailySummary?.averageWorkingHours || 0} hrs</strong>
              </span>
            </div>
            <div className="card-body p-0">
              {dailyLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted small">Loading daily attendance records...</p>
                </div>
              ) : filteredDailyRecords.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No records found matching filters.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Employee</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Working Hours</th>
                        <th>Punctuality</th>
                        {canManageEmployees && <th className="text-end pe-3">Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDailyRecords.map((rec) => (
                        <tr key={rec.employeeId || rec.id}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-inline-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                              >
                                {(rec.employeeName || 'E').charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <div className="fw-semibold">{rec.employeeName}</div>
                                <small className="text-muted">{rec.employeeEmail}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{rec.department || 'General'}</span>
                          </td>
                          <td>{getStatusBadge(rec.status, rec.isLate)}</td>
                          <td className="text-nowrap">{formatTime(rec.checkInTime)}</td>
                          <td className="text-nowrap">{formatTime(rec.checkOutTime)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">{formatDuration(rec.workingHours)}</span>
                              {rec.workingHours > 0 && (
                                <div className="progress flex-grow-1" style={{ height: '6px', width: '50px' }}>
                                  <div
                                    className={`progress-bar ${rec.workingHours >= 8 ? 'bg-success' : rec.workingHours >= 4.5 ? 'bg-info' : 'bg-warning'}`}
                                    style={{ width: `${Math.min(100, (rec.workingHours / 8.0) * 100)}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            {rec.isLate ? (
                              <span className="text-warning-emphasis small fw-medium">
                                ⚠️ +{rec.lateMinutes}m Late
                              </span>
                            ) : rec.checkInTime ? (
                              <span className="text-success small fw-medium">✓ On Time</span>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          {canManageEmployees && (
                            <td className="text-end pe-3">
                              <button
                                className="btn btn-outline-secondary btn-sm py-1 px-2"
                                onClick={() => handleOpenAdjustModal(rec)}
                                title="Adjust this record"
                              >
                                ✏️ Adjust
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY REPORTS & ANALYTICS */}
      {activeTab === 'monthly' && (
        <div>
          {/* Controls Bar */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row g-3 align-items-center justify-content-between">
                <div className="col-12 col-md-6 d-flex align-items-center gap-2 flex-wrap">
                  <label className="fw-bold text-nowrap mb-0 small">Month & Year:</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: '140px' }}
                    value={selectedMonth}
                    onChange={(e) => {
                      const m = parseInt(e.target.value, 10);
                      setSelectedMonth(m);
                      fetchMonthlyReport(selectedYear, m);
                    }}
                  >
                    {[
                      { v: 1, n: 'January' },
                      { v: 2, n: 'February' },
                      { v: 3, n: 'March' },
                      { v: 4, n: 'April' },
                      { v: 5, n: 'May' },
                      { v: 6, n: 'June' },
                      { v: 7, n: 'July' },
                      { v: 8, n: 'August' },
                      { v: 9, n: 'September' },
                      { v: 10, n: 'October' },
                      { v: 11, n: 'November' },
                      { v: 12, n: 'December' },
                    ].map((m) => (
                      <option key={m.v} value={m.v}>
                        {m.n}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select form-select-sm"
                    style={{ maxWidth: '100px' }}
                    value={selectedYear}
                    onChange={(e) => {
                      const y = parseInt(e.target.value, 10);
                      setSelectedYear(y);
                      fetchMonthlyReport(y, selectedMonth);
                    }}
                  >
                    {[2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => fetchMonthlyReport(selectedYear, selectedMonth)}
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="col-12 col-md-6 d-flex align-items-center justify-content-md-end gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ maxWidth: '220px' }}
                    placeholder="Search employee / dept..."
                    value={monthlySearch}
                    onChange={(e) => setMonthlySearch(e.target.value)}
                  />
                  <button
                    className="btn btn-success btn-sm d-flex align-items-center gap-1 text-nowrap"
                    onClick={handleExportCSV}
                    title="Download Excel / CSV Attendance Report"
                  >
                    <span>📥 Export CSV</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly KPI Overview */}
          {monthlyReport && (
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 text-center bg-white h-100">
                  <span className="text-muted small fw-semibold">Attendance Rate</span>
                  <h3 className="fw-bold mb-0 text-success">{monthlyReport.overallAttendanceRate}%</h3>
                  <small className="text-muted">Org Overall</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 text-center bg-white h-100">
                  <span className="text-muted small fw-semibold">Total Working Days</span>
                  <h3 className="fw-bold mb-0 text-primary">{monthlyReport.totalWorkingDays}</h3>
                  <small className="text-muted">{monthlyReport.monthName} {monthlyReport.year}</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 text-center bg-white h-100">
                  <span className="text-muted small fw-semibold">Late Incidents</span>
                  <h3 className="fw-bold mb-0 text-warning-emphasis">{monthlyReport.totalLateIncidents}</h3>
                  <small className="text-muted">Total across staff</small>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 text-center bg-white h-100">
                  <span className="text-muted small fw-semibold">Total Hours Logged</span>
                  <h3 className="fw-bold mb-0 text-dark">{monthlyReport.totalHoursLogged} hrs</h3>
                  <small className="text-muted">Productive time</small>
                </div>
              </div>
            </div>
          )}

          {/* Employee Monthly Summary Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">
                  Monthly Staff Attendance Summary ({monthlyReport?.monthName} {monthlyReport?.year})
                </h5>
                <small className="text-muted">
                  Detailed attendance rate, hours, punctuality, and leaves breakdown
                </small>
              </div>
              <span className="badge bg-secondary">{filteredMonthlySummaries.length} Employees</span>
            </div>
            <div className="card-body p-0">
              {monthlyLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted small">Generating monthly attendance report...</p>
                </div>
              ) : filteredMonthlySummaries.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No monthly records found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">Employee</th>
                        <th>Department</th>
                        <th className="text-center">Present</th>
                        <th className="text-center">Late</th>
                        <th className="text-center">Half Day</th>
                        <th className="text-center">Leaves</th>
                        <th className="text-center">Absent</th>
                        <th>Total Hours</th>
                        <th>Avg / Day</th>
                        <th>Attendance Rate</th>
                        <th className="text-end pe-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonthlySummaries.map((emp) => (
                        <tr key={emp.employeeId}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-inline-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                              >
                                {(emp.employeeName || 'E').charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <div className="fw-semibold">{emp.employeeName}</div>
                                <small className="text-muted">{emp.employeeEmail}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{emp.department || 'General'}</span>
                          </td>
                          <td className="text-center fw-bold text-success">{emp.totalPresent}</td>
                          <td className="text-center">
                            {emp.totalLate > 0 ? (
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                {emp.totalLate}
                              </span>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="text-center">{emp.totalHalfDay || 0}</td>
                          <td className="text-center text-primary">{emp.totalOnLeave || 0}</td>
                          <td className="text-center text-danger">{emp.totalAbsent || 0}</td>
                          <td className="fw-bold">{emp.totalWorkingHours} hrs</td>
                          <td className="text-muted">{emp.averageWorkingHours}h</td>
                          <td style={{ minWidth: '130px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold small">{emp.attendancePercentage}%</span>
                              <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                <div
                                  className={`progress-bar ${emp.attendancePercentage >= 90 ? 'bg-success' : emp.attendancePercentage >= 75 ? 'bg-warning' : 'bg-danger'}`}
                                  style={{ width: `${Math.min(100, emp.attendancePercentage)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-end pe-3">
                            <button
                              className="btn btn-outline-primary btn-sm py-1 px-2"
                              onClick={() => setDrilldownEmployee(emp)}
                              title="View calendar breakdown for this employee"
                            >
                              📋 View Log
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
      )}

      {/* MODAL 1: Day-by-Day Employee Attendance Log (Drilldown) */}
      {drilldownEmployee && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <div>
                  <h5 className="modal-title fw-bold">
                    Attendance Log: {drilldownEmployee.employeeName}
                  </h5>
                  <small className="text-muted">
                    {monthlyReport?.monthName} {monthlyReport?.year} • {drilldownEmployee.department}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDrilldownEmployee(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="p-3 bg-light border-bottom d-flex gap-3 justify-content-around text-center">
                  <div>
                    <small className="text-muted d-block">Present Days</small>
                    <span className="fw-bold text-success fs-5">{drilldownEmployee.totalPresent}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Late Arrivals</small>
                    <span className="fw-bold text-warning-emphasis fs-5">{drilldownEmployee.totalLate}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Total Hours</small>
                    <span className="fw-bold text-dark fs-5">{drilldownEmployee.totalWorkingHours} hrs</span>
                  </div>
                  <div>
                    <small className="text-muted d-block">Attendance %</small>
                    <span className="fw-bold text-primary fs-5">{drilldownEmployee.attendancePercentage}%</span>
                  </div>
                </div>

                {!drilldownEmployee.dailyRecords?.length ? (
                  <div className="text-center py-4 text-muted">
                    No punch records recorded for this employee in this month.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-3">Date</th>
                          <th>Status</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Working Hours</th>
                          <th>Late Info</th>
                          <th className="pe-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drilldownEmployee.dailyRecords.map((r) => (
                          <tr key={r.id}>
                            <td className="ps-3 fw-semibold">{formatDate(r.attendanceDate)}</td>
                            <td>{getStatusBadge(r.status, r.isLate)}</td>
                            <td>{formatTime(r.checkInTime)}</td>
                            <td>{formatTime(r.checkOutTime)}</td>
                            <td className="fw-bold">{formatDuration(r.workingHours)}</td>
                            <td>
                              {r.isLate ? (
                                <span className="badge bg-warning text-dark small">+{r.lateMinutes}m</span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="pe-3 text-muted small">{r.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDrilldownEmployee(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Record / Adjust Punch Modal (Admin/HR) */}
      {showAdjustModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <form onSubmit={handleSaveAdjustment}>
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">
                    {adjustFormData.id ? 'Adjust Attendance Record' : 'Record Manual Attendance'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAdjustModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  {/* Employee select */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Employee <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustFormData.employeeId}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, employeeId: e.target.value })}
                      disabled={!!adjustFormData.id}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employeesList.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department || 'General'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attendance Date */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      Attendance Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={adjustFormData.attendanceDate}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, attendanceDate: e.target.value })}
                      required
                    />
                  </div>

                  {/* Check In Time */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Check-In Timestamp</label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm"
                      value={adjustFormData.checkInTime}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, checkInTime: e.target.value })}
                    />
                  </div>

                  {/* Check Out Time */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Check-Out Timestamp</label>
                    <input
                      type="datetime-local"
                      className="form-control form-control-sm"
                      value={adjustFormData.checkOutTime}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, checkOutTime: e.target.value })}
                    />
                  </div>

                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Attendance Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={adjustFormData.status}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, status: e.target.value })}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="LATE">Late Arrival</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="ABSENT">Absent</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Notes / Reason for Adjustment</label>
                    <textarea
                      rows={2}
                      className="form-control form-control-sm"
                      placeholder="e.g. Card scanner failure at front gate"
                      value={adjustFormData.notes}
                      onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAdjustModal(false)}
                    disabled={adjustSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-semibold"
                    disabled={adjustSubmitting}
                  >
                    {adjustSubmitting ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
