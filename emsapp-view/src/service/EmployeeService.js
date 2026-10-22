import api from './api';

const EMPLOYEE_API_PATH = "/employees";

class EmployeeService {
    saveEmployee(employee) {
        return api.post(EMPLOYEE_API_PATH, employee);
    }
    getEmployees() {
        return api.get(EMPLOYEE_API_PATH);
    }
    getEmployeeById(id) {
        return api.get(`${EMPLOYEE_API_PATH}/${id}`);
    }
    deleteEmployeeById(id) {
        return api.delete(`${EMPLOYEE_API_PATH}/${id}`);
    }
    updateEmployee(employee, id) {
        return api.put(`${EMPLOYEE_API_PATH}/${id}`, employee);
    }
    getDashboardStats() {
        return api.get(`${EMPLOYEE_API_PATH}/dashboard/stats`);
    }
    seedDemoData() {
        return api.post(`${EMPLOYEE_API_PATH}/seed-demo-data`);
    }
    searchEmployees(params = {}) {
        return api.get(`${EMPLOYEE_API_PATH}/search`, { params });
    }
    getJobTitles() {
        return api.get(`${EMPLOYEE_API_PATH}/meta/job-titles`);
    }
    getDepartments() {
        return api.get(`${EMPLOYEE_API_PATH}/meta/departments`);
    }
    getMyProfile() {
        return api.get(`${EMPLOYEE_API_PATH}/me`);
    }
    updateMyProfile(employee) {
        return api.put(`${EMPLOYEE_API_PATH}/me`, employee);
    }
}

export default new EmployeeService();
