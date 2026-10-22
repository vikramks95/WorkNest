import api from './api';

const ATTENDANCE_API_PATH = '/attendance';

class AttendanceService {
  checkIn(notes = '', employeeId = null) {
    const payload = {};
    if (notes) payload.notes = notes;
    if (employeeId) payload.employeeId = employeeId;
    return api.post(`${ATTENDANCE_API_PATH}/check-in`, payload);
  }

  checkOut(notes = '', employeeId = null) {
    const payload = {};
    if (notes) payload.notes = notes;
    if (employeeId) payload.employeeId = employeeId;
    return api.post(`${ATTENDANCE_API_PATH}/check-out`, payload);
  }

  getTodayAttendance(employeeId = null) {
    const params = employeeId ? { employeeId } : {};
    return api.get(`${ATTENDANCE_API_PATH}/today`, { params });
  }

  getDailyAttendance(date) {
    const params = date ? { date } : {};
    return api.get(`${ATTENDANCE_API_PATH}/daily`, { params });
  }

  getMyHistory(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get(`${ATTENDANCE_API_PATH}/my-history`, { params });
  }

  getEmployeeHistory(employeeId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get(`${ATTENDANCE_API_PATH}/employee/${employeeId}`, { params });
  }

  getMonthlyReport(year, month) {
    return api.get(`${ATTENDANCE_API_PATH}/monthly-report`, {
      params: { year, month },
    });
  }

  saveManualAttendance(data) {
    return api.post(`${ATTENDANCE_API_PATH}/manual`, data);
  }

  deleteAttendance(id) {
    return api.delete(`${ATTENDANCE_API_PATH}/${id}`);
  }

  seedDemoAttendance() {
    return api.post(`${ATTENDANCE_API_PATH}/seed-demo`);
  }
}

export default new AttendanceService();
