package com.emsproject.emsapp;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.emsproject.emsapp.dto.AttendanceManualEntryDto;
import com.emsproject.emsapp.dto.AttendanceRecordDto;
import com.emsproject.emsapp.dto.CheckInRequestDto;
import com.emsproject.emsapp.dto.CheckOutRequestDto;
import com.emsproject.emsapp.dto.DailyAttendanceSummaryDto;
import com.emsproject.emsapp.dto.EmployeeMonthlySummaryDto;
import com.emsproject.emsapp.dto.MonthlyAttendanceReportDto;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private static final LocalTime SHIFT_START = LocalTime.of(9, 0); // 09:00 AM
    private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 15); // 15 mins grace period

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Override
    public AttendanceRecordDto checkIn(CheckInRequestDto request, String currentUsername) {
        EmployeeEntity employee = resolveEmployee(currentUsername, request != null ? request.getEmployeeId() : null);
        LocalDate today = LocalDate.now();

        Optional<AttendanceEntity> existingOpt = attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today);
        if (existingOpt.isPresent()) {
            AttendanceEntity existing = existingOpt.get();
            if (existing.getCheckInTime() != null) {
                throw new IllegalArgumentException(
                    "Employee " + employee.getName() + " already checked in today at " + existing.getCheckInTime().toLocalTime().toString().substring(0, 5)
                );
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalTime checkInTime = now.toLocalTime();

        boolean isLate = checkInTime.isAfter(LATE_THRESHOLD);
        int lateMinutes = 0;
        if (isLate) {
            long minutes = Duration.between(SHIFT_START, checkInTime).toMinutes();
            lateMinutes = (int) Math.max(0, minutes);
        }

        String status = isLate ? "LATE" : "PRESENT";

        AttendanceEntity attendance = existingOpt.orElse(
            AttendanceEntity.builder()
                .employeeId(employee.getId())
                .attendanceDate(today)
                .build()
        );

        attendance.setEmployeeName(employee.getName());
        attendance.setEmployeeEmail(employee.getEmail());
        attendance.setDepartment(employee.getDepartment());
        attendance.setCheckInTime(now);
        attendance.setStatus(status);
        attendance.setIsLate(isLate);
        attendance.setLateMinutes(lateMinutes);
        attendance.setRecordedBy(currentUsername != null ? currentUsername : "SELF");

        if (request != null && request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            attendance.setNotes(request.getNotes().trim());
        }

        AttendanceEntity saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Override
    public AttendanceRecordDto checkOut(CheckOutRequestDto request, String currentUsername) {
        EmployeeEntity employee = resolveEmployee(currentUsername, request != null ? request.getEmployeeId() : null);
        LocalDate today = LocalDate.now();

        AttendanceEntity attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today)
            .orElseThrow(() -> new IllegalArgumentException("No check-in record found for today. Please check in first."));

        if (attendance.getCheckInTime() == null) {
            throw new IllegalArgumentException("No check-in timestamp found for today. Please check in first.");
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOutTime(now);

        // Calculate working hours
        Duration duration = Duration.between(attendance.getCheckInTime(), now);
        long totalMinutes = Math.max(0, duration.toMinutes());
        double hours = Math.round((totalMinutes / 60.0) * 100.0) / 100.0;
        attendance.setWorkingHours(hours);

        // If worked less than 4.5 hours, classify as HALF_DAY
        if (hours < 4.5 && !"LATE".equalsIgnoreCase(attendance.getStatus())) {
            attendance.setStatus("HALF_DAY");
        }

        if (request != null && request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String existingNotes = attendance.getNotes();
            attendance.setNotes(
                (existingNotes != null && !existingNotes.isEmpty() ? existingNotes + " | " : "") + request.getNotes().trim()
            );
        }

        AttendanceEntity saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceRecordDto getTodayAttendance(String currentUsername, Long employeeId) {
        EmployeeEntity employee = resolveEmployee(currentUsername, employeeId);
        LocalDate today = LocalDate.now();

        return attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today)
            .map(this::mapToDto)
            .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyAttendanceSummaryDto getDailyAttendance(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<EmployeeEntity> allEmployees = employeeRepository.findAll();
        List<AttendanceEntity> recordedList = attendanceRepository.findByAttendanceDateOrderByEmployeeNameAsc(targetDate);

        Map<Long, AttendanceEntity> recordedMap = recordedList.stream()
            .collect(Collectors.toMap(AttendanceEntity::getEmployeeId, a -> a, (a1, a2) -> a1));

        List<AttendanceRecordDto> allDayRecords = new ArrayList<>();

        long presentCount = 0;
        long lateCount = 0;
        long halfDayCount = 0;
        long absentCount = 0;
        long onLeaveCount = 0;
        double totalHoursSum = 0.0;
        long checkedOutCount = 0;

        for (EmployeeEntity emp : allEmployees) {
            AttendanceEntity existing = recordedMap.get(emp.getId());
            if (existing != null) {
                AttendanceRecordDto dto = mapToDto(existing);
                allDayRecords.add(dto);

                String s = (dto.getStatus() != null ? dto.getStatus() : "PRESENT").toUpperCase();
                if ("LATE".equals(s)) {
                    lateCount++;
                    presentCount++;
                } else if ("HALF_DAY".equals(s)) {
                    halfDayCount++;
                    presentCount++;
                } else if ("ON_LEAVE".equals(s)) {
                    onLeaveCount++;
                } else if ("ABSENT".equals(s)) {
                    absentCount++;
                } else {
                    presentCount++;
                }

                if (dto.getWorkingHours() != null && dto.getWorkingHours() > 0) {
                    totalHoursSum += dto.getWorkingHours();
                    checkedOutCount++;
                }
            } else {
                // Check if employee is on approved leave
                boolean onLeave = isEmployeeOnLeave(emp.getId(), targetDate);
                String status = onLeave ? "ON_LEAVE" : (targetDate.isBefore(LocalDate.now()) ? "ABSENT" : "NOT_CHECKED_IN");

                if (onLeave) {
                    onLeaveCount++;
                } else if ("ABSENT".equals(status)) {
                    absentCount++;
                }

                allDayRecords.add(
                    AttendanceRecordDto.builder()
                        .employeeId(emp.getId())
                        .employeeName(emp.getName())
                        .employeeEmail(emp.getEmail())
                        .department(emp.getDepartment())
                        .attendanceDate(targetDate)
                        .status(status)
                        .isLate(false)
                        .lateMinutes(0)
                        .workingHours(0.0)
                        .build()
                );
            }
        }

        double avgHours = checkedOutCount > 0 ? Math.round((totalHoursSum / checkedOutCount) * 100.0) / 100.0 : 0.0;

        return DailyAttendanceSummaryDto.builder()
            .date(targetDate)
            .totalEmployees(allEmployees.size())
            .presentCount(presentCount)
            .lateCount(lateCount)
            .halfDayCount(halfDayCount)
            .absentCount(absentCount)
            .onLeaveCount(onLeaveCount)
            .averageWorkingHours(avgHours)
            .records(allDayRecords)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getEmployeeAttendanceHistory(
        Long employeeId, LocalDate startDate, LocalDate endDate, String currentUsername
    ) {
        EmployeeEntity targetEmployee = resolveEmployee(currentUsername, employeeId);
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        List<AttendanceEntity> entities = attendanceRepository
            .findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(targetEmployee.getId(), start, end);

        return entities.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlyAttendanceReportDto getMonthlyReport(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        LocalDate effectiveEnd = end.isAfter(LocalDate.now()) ? LocalDate.now() : end;

        int totalDaysInMonth = start.lengthOfMonth();
        int workingDays = countWorkingDays(start, effectiveEnd);

        List<EmployeeEntity> allEmployees = employeeRepository.findAll();
        List<AttendanceEntity> monthlyRecords = attendanceRepository
            .findByAttendanceDateBetweenOrderByAttendanceDateDesc(start, end);

        Map<Long, List<AttendanceEntity>> recordsByEmployee = monthlyRecords.stream()
            .collect(Collectors.groupingBy(AttendanceEntity::getEmployeeId));

        List<EmployeeMonthlySummaryDto> employeeSummaries = new ArrayList<>();
        Map<String, Long> deptAttendanceMap = new HashMap<>();

        long totalLateIncidents = 0;
        double totalHoursLogged = 0.0;
        double sumAttendancePercent = 0.0;

        for (EmployeeEntity emp : allEmployees) {
            List<AttendanceEntity> empRecords = recordsByEmployee.getOrDefault(emp.getId(), Collections.emptyList());

            long totalPresent = 0;
            long totalLate = 0;
            long totalHalfDay = 0;
            long totalOnLeave = 0;
            double empTotalHours = 0.0;

            for (AttendanceEntity r : empRecords) {
                String s = (r.getStatus() != null ? r.getStatus() : "PRESENT").toUpperCase();
                if ("LATE".equals(s) || Boolean.TRUE.equals(r.getIsLate())) {
                    totalLate++;
                    totalPresent++;
                    totalLateIncidents++;
                } else if ("HALF_DAY".equals(s)) {
                    totalHalfDay++;
                    totalPresent++;
                } else if ("ON_LEAVE".equals(s)) {
                    totalOnLeave++;
                } else if ("PRESENT".equals(s)) {
                    totalPresent++;
                }

                if (r.getWorkingHours() != null && r.getWorkingHours() > 0) {
                    empTotalHours += r.getWorkingHours();
                    totalHoursLogged += r.getWorkingHours();
                }
            }

            long totalAbsent = Math.max(0, workingDays - (totalPresent + totalOnLeave));
            double avgHours = totalPresent > 0 ? Math.round((empTotalHours / totalPresent) * 100.0) / 100.0 : 0.0;
            double attendancePct = workingDays > 0 ? Math.min(100.0, Math.round(((double) totalPresent / workingDays) * 1000.0) / 10.0) : 0.0;
            sumAttendancePercent += attendancePct;

            List<AttendanceRecordDto> dailyDtos = empRecords.stream().map(this::mapToDto).collect(Collectors.toList());

            EmployeeMonthlySummaryDto summary = EmployeeMonthlySummaryDto.builder()
                .employeeId(emp.getId())
                .employeeName(emp.getName())
                .employeeEmail(emp.getEmail())
                .department(emp.getDepartment())
                .totalPresent(totalPresent)
                .totalLate(totalLate)
                .totalHalfDay(totalHalfDay)
                .totalAbsent(totalAbsent)
                .totalOnLeave(totalOnLeave)
                .totalWorkingHours(Math.round(empTotalHours * 100.0) / 100.0)
                .averageWorkingHours(avgHours)
                .attendancePercentage(attendancePct)
                .dailyRecords(dailyDtos)
                .build();

            employeeSummaries.add(summary);

            String dept = emp.getDepartment() != null ? emp.getDepartment() : "General";
            deptAttendanceMap.put(dept, deptAttendanceMap.getOrDefault(dept, 0L) + totalPresent);
        }

        double overallAttendanceRate = allEmployees.isEmpty() ? 0.0 : Math.round((sumAttendancePercent / allEmployees.size()) * 10.0) / 10.0;

        Month m = Month.of(month);
        String monthName = m.getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        return MonthlyAttendanceReportDto.builder()
            .year(year)
            .month(month)
            .monthName(monthName)
            .totalDaysInMonth(totalDaysInMonth)
            .totalWorkingDays(workingDays)
            .totalEmployees(allEmployees.size())
            .overallAttendanceRate(overallAttendanceRate)
            .totalLateIncidents(totalLateIncidents)
            .totalHoursLogged(Math.round(totalHoursLogged * 100.0) / 100.0)
            .employeeSummaries(employeeSummaries)
            .departmentAttendanceRate(deptAttendanceMap)
            .build();
    }

    @Override
    public AttendanceRecordDto saveManualAttendance(AttendanceManualEntryDto dto, String reviewerUsername) {
        EmployeeEntity emp = employeeRepository.findById(dto.getEmployeeId())
            .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + dto.getEmployeeId()));

        AttendanceEntity entity;
        if (dto.getId() != null) {
            entity = attendanceRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found with ID: " + dto.getId()));
        } else {
            entity = attendanceRepository.findByEmployeeIdAndAttendanceDate(emp.getId(), dto.getAttendanceDate())
                .orElse(AttendanceEntity.builder()
                    .employeeId(emp.getId())
                    .attendanceDate(dto.getAttendanceDate())
                    .build());
        }

        entity.setEmployeeName(emp.getName());
        entity.setEmployeeEmail(emp.getEmail());
        entity.setDepartment(emp.getDepartment());
        entity.setCheckInTime(dto.getCheckInTime());
        entity.setCheckOutTime(dto.getCheckOutTime());
        entity.setRecordedBy(reviewerUsername != null ? reviewerUsername : "ADMIN");
        entity.setNotes(dto.getNotes());

        // Working hours calculation
        if (dto.getCheckInTime() != null && dto.getCheckOutTime() != null) {
            Duration duration = Duration.between(dto.getCheckInTime(), dto.getCheckOutTime());
            long totalMinutes = Math.max(0, duration.toMinutes());
            double hours = Math.round((totalMinutes / 60.0) * 100.0) / 100.0;
            entity.setWorkingHours(hours);
        }

        // Late calculation
        if (dto.getCheckInTime() != null) {
            LocalTime checkInTime = dto.getCheckInTime().toLocalTime();
            if (checkInTime.isAfter(LATE_THRESHOLD)) {
                entity.setIsLate(true);
                long minutes = Duration.between(SHIFT_START, checkInTime).toMinutes();
                entity.setLateMinutes((int) Math.max(0, minutes));
            } else {
                entity.setIsLate(false);
                entity.setLateMinutes(0);
            }
        }

        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            entity.setStatus(dto.getStatus().trim().toUpperCase());
        } else if (Boolean.TRUE.equals(entity.getIsLate())) {
            entity.setStatus("LATE");
        } else {
            entity.setStatus("PRESENT");
        }

        AttendanceEntity saved = attendanceRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public void deleteAttendance(Long id, String reviewerUsername) {
        if (!attendanceRepository.existsById(id)) {
            throw new IllegalArgumentException("Attendance record not found with ID: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    // Helper: Resolve employee from authenticated username or requested ID
    private EmployeeEntity resolveEmployee(String username, Long requestedEmployeeId) {
        if (requestedEmployeeId != null && requestedEmployeeId > 0) {
            Optional<EmployeeEntity> byId = employeeRepository.findById(requestedEmployeeId);
            if (byId.isPresent()) {
                return byId.get();
            }
        }

        if (username != null && !username.trim().isEmpty() && !username.equals("anonymousUser")) {
            Optional<UserEntity> userOpt = userRepository.findByUsername(username);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                if (user.getEmployeeId() != null) {
                    Optional<EmployeeEntity> byEmpId = employeeRepository.findById(user.getEmployeeId());
                    if (byEmpId.isPresent()) {
                        return byEmpId.get();
                    }
                }
                // Try match by email
                Optional<EmployeeEntity> byEmail = employeeRepository.findByEmail(user.getEmail());
                if (byEmail.isPresent()) {
                    return byEmail.get();
                }
                // Try match by name
                Optional<EmployeeEntity> byName = employeeRepository.findByName(user.getName());
                if (byName.isPresent()) {
                    return byName.get();
                }
            }
        }

        // If requestedEmployeeId was provided but not matched
        if (requestedEmployeeId != null) {
            return employeeRepository.findById(requestedEmployeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with ID: " + requestedEmployeeId));
        }

        throw new IllegalArgumentException("Could not identify linked employee record for user: " + username + ". Please ensure your employee profile exists.");
    }

    private boolean isEmployeeOnLeave(Long employeeId, LocalDate date) {
        try {
            List<LeaveRequestEntity> leaves = leaveRequestRepository.findByEmployeeId(employeeId);
            for (LeaveRequestEntity leave : leaves) {
                if ("APPROVED".equalsIgnoreCase(leave.getStatus())) {
                    if (leave.getStartDate() != null && leave.getEndDate() != null) {
                        if (!date.isBefore(leave.getStartDate()) && !date.isAfter(leave.getEndDate())) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private int countWorkingDays(LocalDate start, LocalDate end) {
        int count = 0;
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            DayOfWeek day = curr.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                count++;
            }
            curr = curr.plusDays(1);
        }
        return Math.max(1, count);
    }

    private AttendanceRecordDto mapToDto(AttendanceEntity entity) {
        if (entity == null) return null;
        return AttendanceRecordDto.builder()
            .id(entity.getId())
            .employeeId(entity.getEmployeeId())
            .employeeName(entity.getEmployeeName())
            .employeeEmail(entity.getEmployeeEmail())
            .department(entity.getDepartment())
            .attendanceDate(entity.getAttendanceDate())
            .checkInTime(entity.getCheckInTime())
            .checkOutTime(entity.getCheckOutTime())
            .workingHours(entity.getWorkingHours())
            .status(entity.getStatus())
            .isLate(entity.getIsLate())
            .lateMinutes(entity.getLateMinutes())
            .notes(entity.getNotes())
            .recordedBy(entity.getRecordedBy())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    @Override
    public void seedDemoAttendance() {
        List<EmployeeEntity> employees = employeeRepository.findAll();
        if (employees.isEmpty()) {
            return;
        }

        LocalDate today = LocalDate.now();

        // Seed previous 14 calendar days
        for (int dayOffset = 14; dayOffset >= 0; dayOffset--) {
            LocalDate date = today.minusDays(dayOffset);
            DayOfWeek dow = date.getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                continue;
            }

            for (int i = 0; i < employees.size(); i++) {
                EmployeeEntity emp = employees.get(i);
                if (attendanceRepository.findByEmployeeIdAndAttendanceDate(emp.getId(), date).isPresent()) {
                    continue;
                }

                if (dayOffset == 0) {
                    // Today
                    if (i % 4 == 0) {
                        LocalDateTime checkIn = LocalDateTime.of(date, LocalTime.of(8, 48 + (i % 10)));
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .checkInTime(checkIn)
                            .status("PRESENT")
                            .isLate(false)
                            .lateMinutes(0)
                            .workingHours(0.0)
                            .recordedBy("SYSTEM")
                            .notes("Checked in on time")
                            .build());
                    } else if (i % 4 == 1) {
                        LocalDateTime checkIn = LocalDateTime.of(date, LocalTime.of(9, 25 + (i % 15)));
                        int lateMins = (int) Duration.between(SHIFT_START, checkIn.toLocalTime()).toMinutes();
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .checkInTime(checkIn)
                            .status("LATE")
                            .isLate(true)
                            .lateMinutes(lateMins)
                            .workingHours(0.0)
                            .recordedBy("SYSTEM")
                            .notes("Delayed by traffic")
                            .build());
                    } else if (i % 4 == 2) {
                        LocalDateTime checkIn = LocalDateTime.of(date, LocalTime.of(8, 55));
                        LocalDateTime checkOut = LocalDateTime.of(date, LocalTime.of(17, 30));
                        double hrs = Math.round((Duration.between(checkIn, checkOut).toMinutes() / 60.0) * 100.0) / 100.0;
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .checkInTime(checkIn)
                            .checkOutTime(checkOut)
                            .status("PRESENT")
                            .isLate(false)
                            .lateMinutes(0)
                            .workingHours(hrs)
                            .recordedBy("SYSTEM")
                            .notes("Completed day shift")
                            .build());
                    }
                } else {
                    int mod = (i + dayOffset) % 10;
                    if (mod == 8) {
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .status("ON_LEAVE")
                            .isLate(false)
                            .lateMinutes(0)
                            .workingHours(0.0)
                            .recordedBy("SYSTEM")
                            .notes("Approved Personal Leave")
                            .build());
                    } else if (mod == 7) {
                        LocalDateTime checkIn = LocalDateTime.of(date, LocalTime.of(9, 0));
                        LocalDateTime checkOut = LocalDateTime.of(date, LocalTime.of(13, 15));
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .checkInTime(checkIn)
                            .checkOutTime(checkOut)
                            .status("HALF_DAY")
                            .isLate(false)
                            .lateMinutes(0)
                            .workingHours(4.25)
                            .recordedBy("SYSTEM")
                            .notes("Half-day shift")
                            .build());
                    } else if (mod == 5) {
                        LocalDateTime checkIn = LocalDateTime.of(date, LocalTime.of(9, 28 + (i % 10)));
                        LocalDateTime checkOut = LocalDateTime.of(date, LocalTime.of(17, 45));
                        int lateMins = (int) Duration.between(SHIFT_START, checkIn.toLocalTime()).toMinutes();
                        double hrs = Math.round((Duration.between(checkIn, checkOut).toMinutes() / 60.0) * 100.0) / 100.0;
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .checkInTime(checkIn)
                            .checkOutTime(checkOut)
                            .status("LATE")
                            .isLate(true)
                            .lateMinutes(lateMins)
                            .workingHours(hrs)
                            .recordedBy("SYSTEM")
                            .notes("Late arrival")
                            .build());
                    } else if (mod != 9) {
                        LocalDateTime checkIn = LocalDateTime.of(date, LocalTime.of(8, 45 + (i % 12)));
                        LocalDateTime checkOut = LocalDateTime.of(date, LocalTime.of(17, 15 + (i % 30)));
                        double hrs = Math.round((Duration.between(checkIn, checkOut).toMinutes() / 60.0) * 100.0) / 100.0;
                        attendanceRepository.save(AttendanceEntity.builder()
                            .employeeId(emp.getId())
                            .employeeName(emp.getName())
                            .employeeEmail(emp.getEmail())
                            .department(emp.getDepartment())
                            .attendanceDate(date)
                            .checkInTime(checkIn)
                            .checkOutTime(checkOut)
                            .status("PRESENT")
                            .isLate(false)
                            .lateMinutes(0)
                            .workingHours(hrs)
                            .recordedBy("SYSTEM")
                            .notes("Regular business shift")
                            .build());
                    }
                }
            }
        }
    }
}

