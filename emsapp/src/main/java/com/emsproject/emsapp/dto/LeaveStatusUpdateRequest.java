package com.emsproject.emsapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status; // APPROVED, REJECTED
    private String reviewComment;
}
