package com.emsproject.emsapp;

import java.util.List;
import com.emsproject.emsapp.dto.DashboardStatsDto;
import com.emsproject.emsapp.dto.PaginatedResponse;

public interface EmployeeService {
    Employee createEmployee(Employee employee);
    List<Employee> readEmployees();
    boolean deleteEmployee(Long id);
    Employee updateEmployee(Long id, Employee employee);
    Employee readEmployee(Long id);
    DashboardStatsDto getDashboardStats();
    void seedDemoEmployees();

    PaginatedResponse<Employee> getAdvancedEmployees(
            String search,
            String department,
            String role,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    List<String> getAllJobTitles();
    List<String> getAllDepartments();
}