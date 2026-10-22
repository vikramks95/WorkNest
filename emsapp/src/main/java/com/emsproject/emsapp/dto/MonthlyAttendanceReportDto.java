package com.emsproject.emsapp.dto;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyAttendanceReportDto {
    private int year;
    private int month;
    private String monthName;
    private int totalDaysInMonth;
    private int totalWorkingDays;
    private long totalEmployees;
    private double overallAttendanceRate;
    private long totalLateIncidents;
    private double totalHoursLogged;
    private List<EmployeeMonthlySummaryDto> employeeSummaries;
    private Map<String, Long> departmentAttendanceRate;
}
