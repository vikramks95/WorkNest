package com.emsproject.emsapp.dto;

import java.util.List;
import java.util.Map;
import com.emsproject.emsapp.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalEmployees;
    private long activeEmployees;
    private long onLeaveEmployees;
    private long inactiveEmployees;
    private long totalDepartments;
    private Map<String, Long> departmentDistribution;
    private List<Employee> recentEmployees;
    private List<Employee> leaveEmployees;
}
