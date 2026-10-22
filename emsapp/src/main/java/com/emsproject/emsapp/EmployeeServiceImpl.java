package com.emsproject.emsapp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import com.emsproject.emsapp.dto.DashboardStatsDto;
import com.emsproject.emsapp.dto.PaginatedResponse;
import jakarta.persistence.criteria.Predicate;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Employee createEmployee(Employee employee) {
        EmployeeEntity employeeEntity = new EmployeeEntity();
        BeanUtils.copyProperties(employee, employeeEntity);
        // Ensure new entity gets a generated ID
        employeeEntity.setId(null);

        if (employeeEntity.getStatus() == null || employeeEntity.getStatus().trim().isEmpty()) {
            employeeEntity.setStatus("ACTIVE");
        }
        if (employeeEntity.getDepartment() == null || employeeEntity.getDepartment().trim().isEmpty()) {
            employeeEntity.setDepartment("General");
        }
        if (employeeEntity.getRole() == null || employeeEntity.getRole().trim().isEmpty()) {
            employeeEntity.setRole("Staff");
        }
        if (employeeEntity.getCreatedAt() == null) {
            employeeEntity.setCreatedAt(LocalDateTime.now());
        }

        EmployeeEntity savedEntity = employeeRepository.save(employeeEntity);
        Employee savedEmployee = new Employee();
        BeanUtils.copyProperties(savedEntity, savedEmployee);
        return savedEmployee;
    }

    @Override
    public Employee readEmployee(Long id) {
        Optional<EmployeeEntity> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return null;
        }
        Employee employee = new Employee();
        BeanUtils.copyProperties(optionalEmployee.get(), employee);
        return employee;
    }

    @Override
    public List<Employee> readEmployees() {
        List<EmployeeEntity> employeeList = employeeRepository.findAll();
        List<Employee> employees = new ArrayList<>();
        for (EmployeeEntity employeeEntity : employeeList) {
            Employee emp = new Employee();
            BeanUtils.copyProperties(employeeEntity, emp);
            employees.add(emp);
        }
        return employees;
    }

    @Override
    public boolean deleteEmployee(Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Employee updateEmployee(Long id, Employee employee) {
        Optional<EmployeeEntity> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return null;
        }
        EmployeeEntity existingEmployee = optionalEmployee.get();
        existingEmployee.setName(employee.getName());
        existingEmployee.setEmail(employee.getEmail());
        existingEmployee.setPhone(employee.getPhone());

        if (employee.getDepartment() != null && !employee.getDepartment().trim().isEmpty()) {
            existingEmployee.setDepartment(employee.getDepartment().trim());
        }
        if (employee.getRole() != null && !employee.getRole().trim().isEmpty()) {
            existingEmployee.setRole(employee.getRole().trim());
        }
        if (employee.getStatus() != null && !employee.getStatus().trim().isEmpty()) {
            existingEmployee.setStatus(employee.getStatus().trim().toUpperCase());
        }
        if (employee.getSalary() != null) {
            existingEmployee.setSalary(employee.getSalary());
        }
        if (employee.getProfileImage() != null) {
            existingEmployee.setProfileImage(employee.getProfileImage());
        }

        EmployeeEntity savedEntity = employeeRepository.save(existingEmployee);
        Employee updatedEmployee = new Employee();
        BeanUtils.copyProperties(savedEntity, updatedEmployee);
        return updatedEmployee;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        List<EmployeeEntity> allEntities = employeeRepository.findAll();

        long totalEmployees = allEntities.size();
        long activeEmployees = 0;
        long onLeaveEmployees = 0;
        long inactiveEmployees = 0;

        Map<String, Long> deptDistribution = new LinkedHashMap<>();
        List<Employee> leaveEmployees = new ArrayList<>();

        for (EmployeeEntity entity : allEntities) {
            String status = entity.getStatus() != null ? entity.getStatus().trim().toUpperCase() : "ACTIVE";
            if ("ON_LEAVE".equals(status) || "LEAVE".equals(status)) {
                onLeaveEmployees++;
                Employee emp = new Employee();
                BeanUtils.copyProperties(entity, emp);
                leaveEmployees.add(emp);
            } else if ("INACTIVE".equals(status)) {
                inactiveEmployees++;
            } else {
                activeEmployees++;
            }

            String dept = entity.getDepartment() != null && !entity.getDepartment().trim().isEmpty()
                    ? entity.getDepartment().trim()
                    : "General";
            deptDistribution.put(dept, deptDistribution.getOrDefault(dept, 0L) + 1L);
        }

        // Recent employees: sorted descending by createdAt or id, top 5
        List<Employee> recentEmployees = allEntities.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                        return b.getCreatedAt().compareTo(a.getCreatedAt());
                    }
                    if (a.getId() != null && b.getId() != null) {
                        return b.getId().compareTo(a.getId());
                    }
                    return 0;
                })
                .limit(5)
                .map(entity -> {
                    Employee emp = new Employee();
                    BeanUtils.copyProperties(entity, emp);
                    return emp;
                })
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .onLeaveEmployees(onLeaveEmployees)
                .inactiveEmployees(inactiveEmployees)
                .totalDepartments(deptDistribution.size())
                .departmentDistribution(deptDistribution)
                .recentEmployees(recentEmployees)
                .leaveEmployees(leaveEmployees)
                .build();
    }

    @Override
    public PaginatedResponse<Employee> getAdvancedEmployees(
            String search,
            String department,
            String role,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        String safeSortBy = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy.trim() : "id";
        // Map common sort aliases
        if ("jobTitle".equalsIgnoreCase(safeSortBy)) safeSortBy = "role";

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, safeSortBy));

        Specification<EmployeeEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by Name, Employee ID, or Email
            if (StringUtils.hasText(search)) {
                String term = search.trim().toLowerCase();
                // strip optional prefix like "emp-" or "#"
                String numericTerm = term.replaceAll("[^0-9]", "");

                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(cb.like(cb.lower(root.get("name")), "%" + term + "%"));
                searchPredicates.add(cb.like(cb.lower(root.get("email")), "%" + term + "%"));
                searchPredicates.add(cb.like(root.get("id").as(String.class), "%" + (numericTerm.isEmpty() ? term : numericTerm) + "%"));

                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            // Filter by Department
            if (StringUtils.hasText(department) && !"ALL".equalsIgnoreCase(department.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("department")), department.trim().toLowerCase()));
            }

            // Filter by Job Title / Role
            if (StringUtils.hasText(role) && !"ALL".equalsIgnoreCase(role.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("role")), role.trim().toLowerCase()));
            }

            // Filter by Status
            if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<EmployeeEntity> pageResult = employeeRepository.findAll(spec, pageable);

        List<Employee> employeeList = pageResult.getContent().stream()
                .map(entity -> {
                    Employee emp = new Employee();
                    BeanUtils.copyProperties(entity, emp);
                    return emp;
                })
                .collect(Collectors.toList());

        return PaginatedResponse.<Employee>builder()
                .content(employeeList)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .isFirst(pageResult.isFirst())
                .isLast(pageResult.isLast())
                .build();
    }

    @Override
    public List<String> getAllJobTitles() {
        return employeeRepository.findAll().stream()
                .map(EmployeeEntity::getRole)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAllDepartments() {
        return employeeRepository.findAll().stream()
                .map(EmployeeEntity::getDepartment)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public void seedDemoEmployees() {
        if (employeeRepository.count() > 0) {
            return;
        }

        List<EmployeeEntity> demoList = List.of(
            EmployeeEntity.builder()
                .name("Sarah Jenkins")
                .email("sarah.jenkins@example.com")
                .phone("+1 555-0192")
                .department("Engineering")
                .role("Lead Architect")
                .status("ACTIVE")
                .salary(125000.0)
                .profileImage("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(30))
                .build(),
            EmployeeEntity.builder()
                .name("Alex Rivera")
                .email("alex.rivera@example.com")
                .phone("+1 555-0183")
                .department("Engineering")
                .role("Senior Fullstack Developer")
                .status("ACTIVE")
                .salary(105000.0)
                .profileImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(20))
                .build(),
            EmployeeEntity.builder()
                .name("Elena Rostova")
                .email("elena.rostova@example.com")
                .phone("+1 555-0144")
                .department("Human Resources")
                .role("HR Director")
                .status("ACTIVE")
                .salary(98000.0)
                .profileImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(15))
                .build(),
            EmployeeEntity.builder()
                .name("David Kim")
                .email("david.kim@example.com")
                .phone("+1 555-0175")
                .department("Marketing")
                .role("Marketing Lead")
                .status("ON_LEAVE")
                .salary(88000.0)
                .profileImage("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(10))
                .build(),
            EmployeeEntity.builder()
                .name("Maria Gonzalez")
                .email("maria.g@example.com")
                .phone("+1 555-0126")
                .department("Finance")
                .role("Financial Analyst")
                .status("ACTIVE")
                .salary(92000.0)
                .profileImage("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(7))
                .build(),
            EmployeeEntity.builder()
                .name("James Wilson")
                .email("james.w@example.com")
                .phone("+1 555-0167")
                .department("Sales")
                .role("Account Executive")
                .status("ACTIVE")
                .salary(85000.0)
                .profileImage("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build(),
            EmployeeEntity.builder()
                .name("Priya Sharma")
                .email("priya.s@example.com")
                .phone("+1 555-0138")
                .department("Engineering")
                .role("DevOps Specialist")
                .status("ON_LEAVE")
                .salary(110000.0)
                .profileImage("https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build(),
            EmployeeEntity.builder()
                .name("Lucas Meyer")
                .email("lucas.m@example.com")
                .phone("+1 555-0199")
                .department("Design")
                .role("Product Designer")
                .status("ACTIVE")
                .salary(89000.0)
                .profileImage("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build()
        );

        employeeRepository.saveAll(demoList);
    }
}