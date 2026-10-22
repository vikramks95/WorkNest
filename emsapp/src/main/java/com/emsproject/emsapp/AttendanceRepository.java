package com.emsproject.emsapp;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceEntity, Long> {

    Optional<AttendanceEntity> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    List<AttendanceEntity> findByAttendanceDateOrderByEmployeeNameAsc(LocalDate attendanceDate);

    List<AttendanceEntity> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);

    List<AttendanceEntity> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
        Long employeeId, LocalDate startDate, LocalDate endDate
    );

    List<AttendanceEntity> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(
        Long employeeId, LocalDate startDate, LocalDate endDate
    );

    List<AttendanceEntity> findByAttendanceDateBetweenOrderByAttendanceDateDesc(
        LocalDate startDate, LocalDate endDate
    );

    long countByAttendanceDateAndStatus(LocalDate attendanceDate, String status);

    long countByAttendanceDateAndIsLateTrue(LocalDate attendanceDate);
}
