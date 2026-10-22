package com.emsproject.emsapp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "leave_requests")
public class LeaveRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;

    private String leaveType; // SICK_LEAVE, CASUAL_LEAVE, VACATION, PERSONAL, MATERNITY_PATERNITY
    private LocalDate startDate;
    private LocalDate endDate;

    private Integer daysCount;

    @Column(length = 1000)
    private String reason;

    private String status; // PENDING, APPROVED, REJECTED

    private String reviewComment;
    private String reviewedBy;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "PENDING";
        }
        if (this.daysCount == null || this.daysCount <= 0) {
            if (this.startDate != null && this.endDate != null) {
                long d = java.time.temporal.ChronoUnit.DAYS.between(this.startDate, this.endDate) + 1;
                this.daysCount = (int) Math.max(1, d);
            } else {
                this.daysCount = 1;
            }
        }
    }
}
