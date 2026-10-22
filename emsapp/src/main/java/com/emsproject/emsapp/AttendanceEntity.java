package com.emsproject.emsapp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "attendance_records",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employeeId", "attendanceDate"})
    }
)
public class AttendanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    private String employeeName;
    private String employeeEmail;
    private String department;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    // Working hours as decimal (e.g. 8.25 for 8h 15m)
    private Double workingHours;

    // PRESENT, LATE, HALF_DAY, ABSENT, ON_LEAVE
    @Column(length = 30)
    private String status;

    @Builder.Default
    private Boolean isLate = false;

    @Builder.Default
    private Integer lateMinutes = 0;

    @Column(length = 500)
    private String notes;

    // SELF, HR, ADMIN, SYSTEM
    private String recordedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.attendanceDate == null) {
            this.attendanceDate = LocalDate.now();
        }
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "PRESENT";
        }
        if (this.isLate == null) {
            this.isLate = false;
        }
        if (this.lateMinutes == null) {
            this.lateMinutes = 0;
        }
        if (this.workingHours == null) {
            this.workingHours = 0.0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
