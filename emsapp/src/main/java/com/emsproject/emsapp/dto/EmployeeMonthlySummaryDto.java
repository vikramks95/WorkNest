package com.emsproject.emsapp.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeMonthlySummaryDto {
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private long totalPresent;
    private long totalLate;
    private long totalHalfDay;
    private long totalAbsent;
    private long totalOnLeave;
    private double totalWorkingHours;
    private double averageWorkingHours;
    private double attendancePercentage; // e.g. 95.5%
    private List<AttendanceRecordDto> dailyRecords;
}
