package com.emsproject.emsapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalanceDto {
    private String leaveType;
    private String label;
    private String icon;
    private int totalAllocated;
    private int usedDays;
    private int pendingDays;
    private int remainingDays;
    private int availableDays;
}
