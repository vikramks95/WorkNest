package com.emsproject.emsapp;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long>, JpaSpecificationExecutor<EmployeeEntity> {
    List<EmployeeEntity> findByStatus(String status);
    List<EmployeeEntity> findTop5ByOrderByIdDesc();
    List<EmployeeEntity> findTop5ByOrderByCreatedAtDesc();
    java.util.Optional<EmployeeEntity> findByEmail(String email);
    java.util.Optional<EmployeeEntity> findByName(String name);
}

