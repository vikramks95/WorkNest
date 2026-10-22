package com.emsproject.emsapp.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyAttendanceSummaryDto {
    private LocalDate date;
    private long totalEmployees;
    private long presentCount;
    private long lateCount;
    private long halfDayCount;
    private long absentCount;
    private long onLeaveCount;
    private double averageWorkingHours;
    private List<AttendanceRecordDto> records;
}
