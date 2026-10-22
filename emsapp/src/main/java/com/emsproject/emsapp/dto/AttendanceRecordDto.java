package com.emsproject.emsapp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecordDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private LocalDate attendanceDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Double workingHours;
    private String status; // PRESENT, LATE, HALF_DAY, ABSENT, ON_LEAVE
    private Boolean isLate;
    private Integer lateMinutes;
    private String notes;
    private String recordedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
