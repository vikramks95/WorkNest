package com.emsproject.emsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInRequestDto {
    // If not provided, will automatically use current authenticated employee's ID
    private Long employeeId;
    private String notes;
}
