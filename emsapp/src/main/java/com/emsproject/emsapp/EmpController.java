package com.emsproject.emsapp;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
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
import com.emsproject.emsapp.dto.DashboardStatsDto;
import com.emsproject.emsapp.dto.PaginatedResponse;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/employees")
public class EmpController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private UserRepository userRepository;

    private UserEntity getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByUsername(auth.getName()).orElse(null);
    }

    private boolean isAdminOrHR(UserEntity user) {
        if (user == null || user.getRole() == null) return false;
        String r = user.getRole().toUpperCase();
        return r.contains("ADMIN") || r.contains("HR");
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.readEmployees());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyEmployeeProfile() {
        UserEntity user = getCurrentUserEntity();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Not authenticated"));
        }

        Employee emp = null;
        if (user.getEmployeeId() != null) {
            emp = employeeService.readEmployee(user.getEmployeeId());
        }

        if (emp == null && StringUtils.hasText(user.getEmail())) {
            List<Employee> all = employeeService.readEmployees();
            for (Employee e : all) {
                if (user.getEmail().equalsIgnoreCase(e.getEmail())) {
                    emp = e;
                    break;
                }
            }
        }

        if (emp != null) {
            return ResponseEntity.ok(emp);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, "No associated employee record found for user."));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyEmployeeProfile(@RequestBody Employee employee) {
        UserEntity user = getCurrentUserEntity();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Not authenticated"));
        }

        Employee existing = null;
        if (user.getEmployeeId() != null) {
            existing = employeeService.readEmployee(user.getEmployeeId());
        }
        if (existing == null && StringUtils.hasText(user.getEmail())) {
            List<Employee> all = employeeService.readEmployees();
            for (Employee e : all) {
                if (user.getEmail().equalsIgnoreCase(e.getEmail())) {
                    existing = e;
                    break;
                }
            }
        }

        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, "Employee profile not found."));
        }

        // Permitted updates for employees: name, phone, email, profileImage
        existing.setName(employee.getName());
        existing.setPhone(employee.getPhone());
        existing.setEmail(employee.getEmail());
        existing.setProfileImage(employee.getProfileImage());

        Employee updated = employeeService.updateEmployee(existing.getId(), existing);

        // Keep UserEntity synced with new name and email
        if (StringUtils.hasText(employee.getName())) {
            user.setName(employee.getName());
        }
        if (StringUtils.hasText(employee.getEmail())) {
            user.setEmail(employee.getEmail());
        }
        userRepository.save(user);

        return ResponseEntity.ok(updated);
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<Employee>> searchEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PaginatedResponse<Employee> response = employeeService.getAdvancedEmployees(
                search, department, role, status, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/meta/job-titles")
    public ResponseEntity<List<String>> getJobTitles() {
        return ResponseEntity.ok(employeeService.getAllJobTitles());
    }

    @GetMapping("/meta/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(employeeService.getAllDepartments());
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(employeeService.getDashboardStats());
    }

    @PostMapping("/seed-demo-data")
    public ResponseEntity<ApiResponse> seedDemoData() {
        employeeService.seedDemoEmployees();
        return ResponseEntity.ok(new ApiResponse(true, "Demo employees seeded successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.readEmployee(id);
        if (employee != null) {
            return ResponseEntity.ok(employee);
        }
        return ResponseEntity.notFound().build();
    } 

    @PostMapping
    public ResponseEntity<?> createEmployee(@RequestBody Employee employee) {
        UserEntity user = getCurrentUserEntity();
        if (!isAdminOrHR(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Access Denied: Only Admin and HR can create employee records."));
        }

        if (employee.getName() == null || employee.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Employee name is required");
        }
        Employee created = employeeService.createEmployee(employee);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        UserEntity user = getCurrentUserEntity();
        if (!isAdminOrHR(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse(false, "Access Denied: Only Admin and HR can delete employee records."));
        }

        if (employeeService.deleteEmployee(id)) {
            return ResponseEntity.ok(new ApiResponse(true, "Employee deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, "Employee not found"));    
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        UserEntity user = getCurrentUserEntity();
        Employee existing = employeeService.readEmployee(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, "Employee not found"));
        }

        // If not Admin or HR, check if the employee is updating their own permitted personal details
        if (!isAdminOrHR(user)) {
            boolean isSelf = (user != null && user.getEmployeeId() != null && user.getEmployeeId().equals(id))
                    || (user != null && StringUtils.hasText(user.getEmail()) && user.getEmail().equalsIgnoreCase(existing.getEmail()));

            if (!isSelf) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Access Denied: Employees can only view and update their own permitted personal details."));
            }

            // Permitted updates only
            existing.setName(employee.getName());
            existing.setPhone(employee.getPhone());
            existing.setEmail(employee.getEmail());
            existing.setProfileImage(employee.getProfileImage());
            // Department, role, status, and salary remain unchanged for employee edits

            Employee updated = employeeService.updateEmployee(id, existing);
            return ResponseEntity.ok(updated);
        }

        // Admin and HR can update all fields
        Employee updated = employeeService.updateEmployee(id, employee);
        return ResponseEntity.ok(updated);
    }
}