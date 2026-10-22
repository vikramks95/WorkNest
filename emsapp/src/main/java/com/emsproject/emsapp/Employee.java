package com.emsproject.emsapp;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Employee {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String department;
    private String role; // job title / role
    private String status; // ACTIVE, ON_LEAVE, INACTIVE
    private Double salary;
    private String profileImage;
    private LocalDateTime createdAt;
}
