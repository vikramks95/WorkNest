package com.emsproject.emsapp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceManualEntryDto {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    private String status; // PRESENT, LATE, HALF_DAY, ABSENT, ON_LEAVE
    private String notes;
}
