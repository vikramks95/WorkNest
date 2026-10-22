import api from './api';

const LEAVES_API_PATH = '/leaves';

class LeaveService {
  applyLeave(leaveData) {
    return api.post(LEAVES_API_PATH, leaveData);
  }

  getAllLeaves(status) {
    return api.get(LEAVES_API_PATH, { params: { status: status || undefined } });
  }

  getMyLeaves() {
    return api.get(`${LEAVES_API_PATH}/my`);
  }

  getMyBalances() {
    return api.get(`${LEAVES_API_PATH}/balances`);
  }

  getEmployeeBalances(employeeId) {
    return api.get(`${LEAVES_API_PATH}/balances/${employeeId}`);
  }

  updateLeaveStatus(id, status, reviewComment) {
    return api.put(`${LEAVES_API_PATH}/${id}/status`, { status, reviewComment });
  }

  cancelLeave(id) {
    return api.delete(`${LEAVES_API_PATH}/${id}`);
  }

  getLeaveSummary() {
    return api.get(`${LEAVES_API_PATH}/summary`);
  }
}

export default new LeaveService();
