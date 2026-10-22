package com.emsproject.emsapp;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import com.emsproject.emsapp.dto.LeaveBalanceDto;
import com.emsproject.emsapp.dto.LeaveRequestDto;
import com.emsproject.emsapp.dto.LeaveStatusUpdateRequest;
import com.emsproject.emsapp.dto.LeaveSummaryDto;

@Service
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private record LeaveTypeMeta(String type, String label, String icon, int allocation) {}

    private static final List<LeaveTypeMeta> LEAVE_TYPE_METAS = List.of(
            new LeaveTypeMeta("VACATION", "Vacation", "🏖️", 15),
            new LeaveTypeMeta("SICK_LEAVE", "Sick Leave", "🤒", 10),
            new LeaveTypeMeta("CASUAL_LEAVE", "Casual Leave", "☕", 7),
            new LeaveTypeMeta("PERSONAL", "Personal Leave", "🏠", 5),
            new LeaveTypeMeta("MATERNITY_PATERNITY", "Maternity / Paternity", "👶", 90),
            new LeaveTypeMeta("UNPAID", "Unpaid Leave", "📋", 30)
    );

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private int getAllocationForType(String leaveType) {
        if (leaveType == null) return 10;
        return switch (leaveType.toUpperCase()) {
            case "VACATION" -> 15;
            case "SICK_LEAVE" -> 10;
            case "CASUAL_LEAVE" -> 7;
            case "PERSONAL" -> 5;
            case "MATERNITY_PATERNITY" -> 90;
            case "UNPAID" -> 30;
            default -> 10;
        };
    }

    @Override
    public LeaveRequestDto applyLeave(LeaveRequestDto dto, String username) {
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("End date cannot precede start date.");
        }

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;
        if (days <= 0) {
            throw new IllegalArgumentException("Invalid leave duration.");
        }

        UserEntity user = userRepository.findByUsername(username).orElse(null);

        Long employeeId = dto.getEmployeeId();
        String employeeName = dto.getEmployeeName();
        String employeeEmail = dto.getEmployeeEmail();
        String department = dto.getDepartment();

        if (user != null) {
            if (user.getEmployeeId() != null) {
                employeeId = user.getEmployeeId();
            }
            if (!StringUtils.hasText(employeeName)) {
                employeeName = user.getName();
            }
            if (!StringUtils.hasText(employeeEmail)) {
                employeeEmail = user.getEmail();
            }
        }

        // Try to associate with Employee entity
        if (employeeId != null) {
            Optional<EmployeeEntity> empOpt = employeeRepository.findById(employeeId);
            if (empOpt.isPresent()) {
                EmployeeEntity emp = empOpt.get();
                employeeName = emp.getName();
                employeeEmail = emp.getEmail();
                department = emp.getDepartment();
            }
        } else if (StringUtils.hasText(employeeEmail)) {
            List<EmployeeEntity> all = employeeRepository.findAll();
            for (EmployeeEntity emp : all) {
                if (employeeEmail.equalsIgnoreCase(emp.getEmail())) {
                    employeeId = emp.getId();
                    employeeName = emp.getName();
                    department = emp.getDepartment();
                    break;
                }
            }
        }

        // Check remaining leave balance
        List<LeaveRequestEntity> existingLeaves;
        if (employeeId != null) {
            existingLeaves = leaveRequestRepository.findByEmployeeId(employeeId);
        } else if (StringUtils.hasText(employeeEmail)) {
            existingLeaves = leaveRequestRepository.findByEmployeeEmail(employeeEmail);
        } else {
            existingLeaves = List.of();
        }

        int used = 0;
        int pending = 0;
        String requestedType = dto.getLeaveType() != null ? dto.getLeaveType().toUpperCase() : "VACATION";
        for (LeaveRequestEntity l : existingLeaves) {
            if (requestedType.equalsIgnoreCase(l.getLeaveType())) {
                int count = l.getDaysCount() != null ? l.getDaysCount() : 1;
                if ("APPROVED".equalsIgnoreCase(l.getStatus())) {
                    used += count;
                } else if ("PENDING".equalsIgnoreCase(l.getStatus())) {
                    pending += count;
                }
            }
        }

        int allocated = getAllocationForType(requestedType);
        int available = allocated - used - pending;
        if (days > available) {
            throw new IllegalArgumentException("Insufficient leave balance for " + requestedType +
                    ". Requested: " + days + " days, but only " + Math.max(0, available) +
                    " days are currently available (Allocated: " + allocated +
                    ", Approved: " + used + ", Pending: " + pending + ").");
        }

        LeaveRequestEntity entity = LeaveRequestEntity.builder()
                .employeeId(employeeId)
                .employeeName(employeeName != null ? employeeName : username)
                .employeeEmail(employeeEmail != null ? employeeEmail : "")
                .department(department != null ? department : "General")
                .leaveType(requestedType)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .daysCount((int) days)
                .reason(dto.getReason())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        LeaveRequestEntity saved = leaveRequestRepository.save(entity);
        LeaveRequestDto result = new LeaveRequestDto();
        BeanUtils.copyProperties(saved, result);
        result.setDaysCount(saved.getDaysCount());
        return result;
    }

    @Override
    public List<LeaveRequestDto> getAllLeaves(String status) {
        List<LeaveRequestEntity> list;
        if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status.trim())) {
            list = leaveRequestRepository.findByStatusOrderByCreatedAtDesc(status.trim().toUpperCase());
        } else {
            list = leaveRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream().map(entity -> {
            LeaveRequestDto dto = new LeaveRequestDto();
            BeanUtils.copyProperties(entity, dto);
            dto.setDaysCount(entity.getDaysCount() != null ? entity.getDaysCount() : 1);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestDto> getMyLeaves(String username) {
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        List<LeaveRequestEntity> list;

        if (user != null && user.getEmployeeId() != null) {
            list = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(user.getEmployeeId());
        } else if (user != null && StringUtils.hasText(user.getEmail())) {
            list = leaveRequestRepository.findByEmployeeEmailOrderByCreatedAtDesc(user.getEmail());
        } else {
            list = List.of();
        }

        return list.stream().map(entity -> {
            LeaveRequestDto dto = new LeaveRequestDto();
            BeanUtils.copyProperties(entity, dto);
            dto.setDaysCount(entity.getDaysCount() != null ? entity.getDaysCount() : 1);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public LeaveRequestDto updateLeaveStatus(Long id, LeaveStatusUpdateRequest request, String reviewerUsername) {
        LeaveRequestEntity leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with ID: " + id));

        String newStatus = request.getStatus().trim().toUpperCase();
        leave.setStatus(newStatus);
        leave.setReviewComment(request.getReviewComment());
        leave.setReviewedBy(reviewerUsername);
        leave.setReviewedAt(LocalDateTime.now());

        LeaveRequestEntity saved = leaveRequestRepository.save(leave);

        // If approved, update the employee's status to ON_LEAVE
        if ("APPROVED".equals(newStatus) && leave.getEmployeeId() != null) {
            employeeRepository.findById(leave.getEmployeeId()).ifPresent(emp -> {
                emp.setStatus("ON_LEAVE");
                employeeRepository.save(emp);
            });
        }

        LeaveRequestDto dto = new LeaveRequestDto();
        BeanUtils.copyProperties(saved, dto);
        dto.setDaysCount(saved.getDaysCount() != null ? saved.getDaysCount() : 1);
        return dto;
    }

    @Override
    public LeaveSummaryDto getLeaveSummary() {
        long total = leaveRequestRepository.count();
        long pending = leaveRequestRepository.countByStatus("PENDING");
        long approved = leaveRequestRepository.countByStatus("APPROVED");
        long rejected = leaveRequestRepository.countByStatus("REJECTED");

        return LeaveSummaryDto.builder()
                .totalRequests(total)
                .pendingRequests(pending)
                .approvedRequests(approved)
                .rejectedRequests(rejected)
                .build();
    }

    @Override
    public List<LeaveBalanceDto> getLeaveBalances(String username, Long targetEmployeeId) {
        Long empId = targetEmployeeId;
        String email = "";

        if (empId == null && StringUtils.hasText(username)) {
            UserEntity user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                empId = user.getEmployeeId();
                email = user.getEmail();
            }
        }

        List<LeaveRequestEntity> existingLeaves;
        if (empId != null) {
            existingLeaves = leaveRequestRepository.findByEmployeeId(empId);
        } else if (StringUtils.hasText(email)) {
            existingLeaves = leaveRequestRepository.findByEmployeeEmail(email);
        } else {
            existingLeaves = List.of();
        }

        List<LeaveBalanceDto> balances = new ArrayList<>();
        for (LeaveTypeMeta meta : LEAVE_TYPE_METAS) {
            int used = 0;
            int pending = 0;

            for (LeaveRequestEntity leave : existingLeaves) {
                if (meta.type().equalsIgnoreCase(leave.getLeaveType())) {
                    int count = leave.getDaysCount() != null ? leave.getDaysCount() : 1;
                    if ("APPROVED".equalsIgnoreCase(leave.getStatus())) {
                        used += count;
                    } else if ("PENDING".equalsIgnoreCase(leave.getStatus())) {
                        pending += count;
                    }
                }
            }

            int total = meta.allocation();
            int remaining = Math.max(0, total - used);
            int available = Math.max(0, total - used - pending);

            balances.add(LeaveBalanceDto.builder()
                    .leaveType(meta.type())
                    .label(meta.label())
                    .icon(meta.icon())
                    .totalAllocated(total)
                    .usedDays(used)
                    .pendingDays(pending)
                    .remainingDays(remaining)
                    .availableDays(available)
                    .build());
        }

        return balances;
    }

    @Override
    public void cancelLeave(Long id, String username) {
        LeaveRequestEntity leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with ID: " + id));

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {
            throw new RuntimeException("Only PENDING leave requests can be cancelled. Current status is " + leave.getStatus() + ".");
        }

        UserEntity user = userRepository.findByUsername(username).orElse(null);
        boolean isOwner = (user != null && user.getEmployeeId() != null && user.getEmployeeId().equals(leave.getEmployeeId()))
                || (user != null && StringUtils.hasText(user.getEmail()) && user.getEmail().equalsIgnoreCase(leave.getEmployeeEmail()))
                || (user != null && ("ROLE_ADMIN".equals(user.getRole()) || "ROLE_HR".equals(user.getRole())));

        if (!isOwner) {
            throw new RuntimeException("Unauthorized: You can only cancel your own pending leave requests.");
        }

        leaveRequestRepository.delete(leave);
    }
}
