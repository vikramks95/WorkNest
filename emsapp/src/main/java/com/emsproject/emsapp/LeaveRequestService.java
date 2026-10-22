package com.emsproject.emsapp;

import java.util.List;
import com.emsproject.emsapp.dto.LeaveBalanceDto;
import com.emsproject.emsapp.dto.LeaveRequestDto;
import com.emsproject.emsapp.dto.LeaveStatusUpdateRequest;
import com.emsproject.emsapp.dto.LeaveSummaryDto;

public interface LeaveRequestService {
    LeaveRequestDto applyLeave(LeaveRequestDto dto, String username);
    List<LeaveRequestDto> getAllLeaves(String status);
    List<LeaveRequestDto> getMyLeaves(String username);
    LeaveRequestDto updateLeaveStatus(Long id, LeaveStatusUpdateRequest request, String reviewerUsername);
    LeaveSummaryDto getLeaveSummary();
    List<LeaveBalanceDto> getLeaveBalances(String username, Long employeeId);
    void cancelLeave(Long id, String username);
}
