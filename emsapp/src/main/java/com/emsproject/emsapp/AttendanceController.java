package com.emsproject.emsapp;

import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.emsproject.emsapp.dto.ApiResponse;
import com.emsproject.emsapp.dto.AttendanceManualEntryDto;
import com.emsproject.emsapp.dto.AttendanceRecordDto;
import com.emsproject.emsapp.dto.CheckInRequestDto;
import com.emsproject.emsapp.dto.CheckOutRequestDto;
import com.emsproject.emsapp.dto.DailyAttendanceSummaryDto;
import com.emsproject.emsapp.dto.MonthlyAttendanceReportDto;
import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody(required = false) CheckInRequestDto request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        try {
            AttendanceRecordDto record = attendanceService.checkIn(request, username);
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Check-in failed: " + e.getMessage()));
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(@RequestBody(required = false) CheckOutRequestDto request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        try {
            AttendanceRecordDto record = attendanceService.checkOut(request, username);
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Check-out failed: " + e.getMessage()));
        }
    }

    @GetMapping("/today")
    public ResponseEntity<AttendanceRecordDto> getTodayAttendance(
            @RequestParam(required = false) Long employeeId
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        AttendanceRecordDto record = attendanceService.getTodayAttendance(username, employeeId);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyAttendanceSummaryDto> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getDailyAttendance(targetDate));
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<AttendanceRecordDto>> getMyHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceHistory(null, startDate, endDate, username));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AttendanceRecordDto>> getEmployeeHistory(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceHistory(employeeId, startDate, endDate, username));
    }

    @GetMapping("/monthly-report")
    public ResponseEntity<MonthlyAttendanceReportDto> getMonthlyReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        int targetYear = (year != null && year > 2000) ? year : LocalDate.now().getYear();
        int targetMonth = (month != null && month >= 1 && month <= 12) ? month : LocalDate.now().getMonthValue();
        return ResponseEntity.ok(attendanceService.getMonthlyReport(targetYear, targetMonth));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> saveManualAttendance(@Valid @RequestBody AttendanceManualEntryDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "ADMIN";
        try {
            AttendanceRecordDto record = attendanceService.saveManualAttendance(dto, username);
            return ResponseEntity.ok(record);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to record attendance: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "ADMIN";
        try {
            attendanceService.deleteAttendance(id, username);
            return ResponseEntity.ok(new ApiResponse(true, "Attendance record removed successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/seed-demo")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ApiResponse> seedDemoAttendance() {
        attendanceService.seedDemoAttendance();
        return ResponseEntity.ok(new ApiResponse(true, "Demo attendance records generated successfully."));
    }
}
