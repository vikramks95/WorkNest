package com.emsproject.emsapp;

import java.time.LocalDate;
import java.util.List;
import com.emsproject.emsapp.dto.AttendanceManualEntryDto;
import com.emsproject.emsapp.dto.AttendanceRecordDto;
import com.emsproject.emsapp.dto.CheckInRequestDto;
import com.emsproject.emsapp.dto.CheckOutRequestDto;
import com.emsproject.emsapp.dto.DailyAttendanceSummaryDto;
import com.emsproject.emsapp.dto.MonthlyAttendanceReportDto;

public interface AttendanceService {

    AttendanceRecordDto checkIn(CheckInRequestDto request, String currentUsername);

    AttendanceRecordDto checkOut(CheckOutRequestDto request, String currentUsername);

    AttendanceRecordDto getTodayAttendance(String currentUsername, Long employeeId);

    DailyAttendanceSummaryDto getDailyAttendance(LocalDate date);

    List<AttendanceRecordDto> getEmployeeAttendanceHistory(Long employeeId, LocalDate startDate, LocalDate endDate, String currentUsername);

    MonthlyAttendanceReportDto getMonthlyReport(int year, int month);

    AttendanceRecordDto saveManualAttendance(AttendanceManualEntryDto dto, String reviewerUsername);

    void deleteAttendance(Long id, String reviewerUsername);

    void seedDemoAttendance();
}
