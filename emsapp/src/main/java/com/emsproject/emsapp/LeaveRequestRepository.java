package com.emsproject.emsapp;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequestEntity, Long> {
    List<LeaveRequestEntity> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<LeaveRequestEntity> findByEmployeeEmailOrderByCreatedAtDesc(String email);
    List<LeaveRequestEntity> findByEmployeeId(Long employeeId);
    List<LeaveRequestEntity> findByEmployeeEmail(String email);
    List<LeaveRequestEntity> findByStatusOrderByCreatedAtDesc(String status);
    List<LeaveRequestEntity> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
