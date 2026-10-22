package com.emsproject.emsapp;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.emsproject.emsapp.dto.LeaveBalanceDto;
import com.emsproject.emsapp.dto.LeaveRequestDto;
import com.emsproject.emsapp.dto.LeaveStatusUpdateRequest;
import com.emsproject.emsapp.dto.LeaveSummaryDto;

@ExtendWith(MockitoExtension.class)
class LeaveRequestServiceTest {

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private LeaveRequestServiceImpl leaveService;

    @Test
    void testApplyLeave_WithLinkedEmployee() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .username("empuser")
                .name("Alice")
                .email("alice@example.com")
                .employeeId(10L)
                .role("ROLE_EMPLOYEE")
                .build();

        EmployeeEntity employee = EmployeeEntity.builder()
                .id(10L)
                .name("Alice Smith")
                .email("alice@example.com")
                .department("Engineering")
                .status("ACTIVE")
                .build();

        when(userRepository.findByUsername("empuser")).thenReturn(Optional.of(user));
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(leaveRequestRepository.findByEmployeeId(10L)).thenReturn(List.of());
        when(leaveRequestRepository.save(any(LeaveRequestEntity.class))).thenAnswer(invocation -> {
            LeaveRequestEntity entity = invocation.getArgument(0);
            entity.setId(100L);
            return entity;
        });

        LeaveRequestDto request = new LeaveRequestDto();
        request.setLeaveType("VACATION");
        request.setStartDate(LocalDate.of(2026, 11, 1));
        request.setEndDate(LocalDate.of(2026, 11, 5));
        request.setReason("Annual family vacation");

        LeaveRequestDto saved = leaveService.applyLeave(request, "empuser");

        assertNotNull(saved);
        assertEquals(100L, saved.getId());
        assertEquals(10L, saved.getEmployeeId());
        assertEquals("Alice Smith", saved.getEmployeeName());
        assertEquals("Engineering", saved.getDepartment());
        assertEquals("PENDING", saved.getStatus());
        assertEquals(5, saved.getDaysCount());
        verify(leaveRequestRepository).save(any(LeaveRequestEntity.class));
    }

    @Test
    void testApplyLeave_InsufficientBalance_ThrowsException() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .username("empuser")
                .employeeId(10L)
                .build();

        LeaveRequestEntity approvedVacation = LeaveRequestEntity.builder()
                .leaveType("VACATION")
                .daysCount(14)
                .status("APPROVED")
                .build();

        when(userRepository.findByUsername("empuser")).thenReturn(Optional.of(user));
        when(leaveRequestRepository.findByEmployeeId(10L)).thenReturn(List.of(approvedVacation));

        LeaveRequestDto request = new LeaveRequestDto();
        request.setLeaveType("VACATION");
        request.setStartDate(LocalDate.of(2026, 11, 1));
        request.setEndDate(LocalDate.of(2026, 11, 5)); // 5 days requested, but only 1 left (15 - 14)
        request.setReason("Another vacation");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            leaveService.applyLeave(request, "empuser");
        });

        assertTrue(ex.getMessage().contains("Insufficient leave balance"));
    }

    @Test
    void testGetLeaveBalances() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .username("empuser")
                .employeeId(10L)
                .email("alice@example.com")
                .build();

        LeaveRequestEntity approvedVacation = LeaveRequestEntity.builder()
                .leaveType("VACATION")
                .daysCount(5)
                .status("APPROVED")
                .build();

        LeaveRequestEntity pendingSick = LeaveRequestEntity.builder()
                .leaveType("SICK_LEAVE")
                .daysCount(2)
                .status("PENDING")
                .build();

        when(userRepository.findByUsername("empuser")).thenReturn(Optional.of(user));
        when(leaveRequestRepository.findByEmployeeId(10L)).thenReturn(List.of(approvedVacation, pendingSick));

        List<LeaveBalanceDto> balances = leaveService.getLeaveBalances("empuser", null);

        assertNotNull(balances);
        assertEquals(6, balances.size());

        LeaveBalanceDto vacation = balances.stream()
                .filter(b -> "VACATION".equals(b.getLeaveType()))
                .findFirst().orElseThrow();
        assertEquals(15, vacation.getTotalAllocated());
        assertEquals(5, vacation.getUsedDays());
        assertEquals(0, vacation.getPendingDays());
        assertEquals(10, vacation.getRemainingDays());
        assertEquals(10, vacation.getAvailableDays());

        LeaveBalanceDto sick = balances.stream()
                .filter(b -> "SICK_LEAVE".equals(b.getLeaveType()))
                .findFirst().orElseThrow();
        assertEquals(10, sick.getTotalAllocated());
        assertEquals(0, sick.getUsedDays());
        assertEquals(2, sick.getPendingDays());
        assertEquals(10, sick.getRemainingDays());
        assertEquals(8, sick.getAvailableDays());
    }

    @Test
    void testCancelLeave_Success() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .username("empuser")
                .employeeId(10L)
                .build();

        LeaveRequestEntity leave = LeaveRequestEntity.builder()
                .id(99L)
                .employeeId(10L)
                .status("PENDING")
                .build();

        when(leaveRequestRepository.findById(99L)).thenReturn(Optional.of(leave));
        when(userRepository.findByUsername("empuser")).thenReturn(Optional.of(user));

        leaveService.cancelLeave(99L, "empuser");

        verify(leaveRequestRepository).delete(leave);
    }

    @Test
    void testCancelLeave_NotPending_ThrowsException() {
        LeaveRequestEntity leave = LeaveRequestEntity.builder()
                .id(99L)
                .status("APPROVED")
                .build();

        when(leaveRequestRepository.findById(99L)).thenReturn(Optional.of(leave));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            leaveService.cancelLeave(99L, "empuser");
        });

        assertTrue(ex.getMessage().contains("Only PENDING leave requests can be cancelled"));
    }

    @Test
    void testUpdateLeaveStatus_ApproveSetsEmployeeOnLeave() {
        LeaveRequestEntity leave = LeaveRequestEntity.builder()
                .id(50L)
                .employeeId(10L)
                .employeeName("Alice Smith")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        EmployeeEntity employee = EmployeeEntity.builder()
                .id(10L)
                .name("Alice Smith")
                .status("ACTIVE")
                .build();

        when(leaveRequestRepository.findById(50L)).thenReturn(Optional.of(leave));
        when(leaveRequestRepository.save(any(LeaveRequestEntity.class))).thenAnswer(i -> i.getArgument(0));
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));

        LeaveStatusUpdateRequest updateRequest = new LeaveStatusUpdateRequest();
        updateRequest.setStatus("APPROVED");
        updateRequest.setReviewComment("Approved by HR");

        LeaveRequestDto result = leaveService.updateLeaveStatus(50L, updateRequest, "hr_manager");

        assertNotNull(result);
        assertEquals("APPROVED", result.getStatus());
        assertEquals("hr_manager", result.getReviewedBy());
        assertEquals("Approved by HR", result.getReviewComment());
        assertEquals("ON_LEAVE", employee.getStatus());
        verify(employeeRepository).save(employee);
    }

    @Test
    void testGetLeaveSummary() {
        when(leaveRequestRepository.count()).thenReturn(10L);
        when(leaveRequestRepository.countByStatus("PENDING")).thenReturn(4L);
        when(leaveRequestRepository.countByStatus("APPROVED")).thenReturn(5L);
        when(leaveRequestRepository.countByStatus("REJECTED")).thenReturn(1L);

        LeaveSummaryDto summary = leaveService.getLeaveSummary();

        assertNotNull(summary);
        assertEquals(10L, summary.getTotalRequests());
        assertEquals(4L, summary.getPendingRequests());
        assertEquals(5L, summary.getApprovedRequests());
        assertEquals(1L, summary.getRejectedRequests());
    }

    @Test
    void testGetMyLeaves() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .username("empuser")
                .employeeId(10L)
                .build();

        LeaveRequestEntity leave = LeaveRequestEntity.builder()
                .id(1L)
                .employeeId(10L)
                .leaveType("SICK_LEAVE")
                .status("PENDING")
                .build();

        when(userRepository.findByUsername("empuser")).thenReturn(Optional.of(user));
        when(leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(leave));

        List<LeaveRequestDto> result = leaveService.getMyLeaves("empuser");

        assertEquals(1, result.size());
        assertEquals("SICK_LEAVE", result.get(0).getLeaveType());
    }
}
