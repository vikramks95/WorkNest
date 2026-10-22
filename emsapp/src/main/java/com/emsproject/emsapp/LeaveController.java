package com.emsproject.emsapp;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.emsproject.emsapp.dto.ApiResponse;
import com.emsproject.emsapp.dto.LeaveBalanceDto;
import com.emsproject.emsapp.dto.LeaveRequestDto;
import com.emsproject.emsapp.dto.LeaveStatusUpdateRequest;
import com.emsproject.emsapp.dto.LeaveSummaryDto;
import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/leaves")
public class LeaveController {

    @Autowired
    private LeaveRequestService leaveRequestService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> applyLeave(@Valid @RequestBody LeaveRequestDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "anonymous";

        try {
            LeaveRequestDto created = leaveRequestService.applyLeave(dto, username);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to apply for leave: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaves(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(leaveRequestService.getAllLeaves(status));
    }

    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequestDto>> getMyLeaves() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(leaveRequestService.getMyLeaves(username));
    }

    @GetMapping("/balances")
    public ResponseEntity<List<LeaveBalanceDto>> getMyLeaveBalances() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(leaveRequestService.getLeaveBalances(username, null));
    }

    @GetMapping("/balances/{employeeId}")
    public ResponseEntity<?> getEmployeeLeaveBalances(@PathVariable Long employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(leaveRequestService.getLeaveBalances(username, employeeId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateLeaveStatus(
            @PathVariable Long id,
            @Valid @RequestBody LeaveStatusUpdateRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String reviewerUsername = authentication != null ? authentication.getName() : "HR";

        // Check if user is HR or Admin
        boolean isAuthorized = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"));

        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Only HR and Admin can approve or reject leave requests."));
        }

        try {
            LeaveRequestDto updated = leaveRequestService.updateLeaveStatus(id, request, reviewerUsername);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelLeave(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "";

        try {
            leaveRequestService.cancelLeave(id, username);
            return ResponseEntity.ok(new ApiResponse(true, "Leave request cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<LeaveSummaryDto> getLeaveSummary() {
        return ResponseEntity.ok(leaveRequestService.getLeaveSummary());
    }
}
