package com.emsproject.emsapp;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.emsproject.emsapp.dto.DashboardStatsDto;
import com.emsproject.emsapp.dto.PaginatedResponse;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @Test
    void testGetDashboardStats() {
        EmployeeEntity emp1 = EmployeeEntity.builder()
                .id(1L)
                .name("Alice")
                .department("Engineering")
                .status("ACTIVE")
                .build();

        EmployeeEntity emp2 = EmployeeEntity.builder()
                .id(2L)
                .name("Bob")
                .department("Engineering")
                .status("ON_LEAVE")
                .build();

        EmployeeEntity emp3 = EmployeeEntity.builder()
                .id(3L)
                .name("Charlie")
                .department("HR")
                .status("ACTIVE")
                .build();

        when(employeeRepository.findAll()).thenReturn(List.of(emp1, emp2, emp3));

        DashboardStatsDto stats = employeeService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(3, stats.getTotalEmployees());
        assertEquals(2, stats.getActiveEmployees());
        assertEquals(1, stats.getOnLeaveEmployees());
        assertEquals(2, stats.getTotalDepartments());
        assertEquals(2L, stats.getDepartmentDistribution().get("Engineering"));
        assertEquals(1L, stats.getDepartmentDistribution().get("HR"));
        assertEquals(1, stats.getLeaveEmployees().size());
        assertEquals("Bob", stats.getLeaveEmployees().get(0).getName());
    }

    @Test
    void testGetAdvancedEmployees() {
        EmployeeEntity emp1 = EmployeeEntity.builder()
                .id(1L)
                .name("Sarah Jenkins")
                .email("sarah@example.com")
                .department("Engineering")
                .role("Architect")
                .status("ACTIVE")
                .profileImage("https://images.unsplash.com/photo-1")
                .build();

        Page<EmployeeEntity> mockPage = new PageImpl<>(List.of(emp1));
        when(employeeRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(mockPage);

        PaginatedResponse<Employee> response = employeeService.getAdvancedEmployees(
                "Sarah", "Engineering", "Architect", "ACTIVE", 0, 10, "name", "asc"
        );

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Sarah Jenkins", response.getContent().get(0).getName());
        assertEquals("Engineering", response.getContent().get(0).getDepartment());
        assertEquals("https://images.unsplash.com/photo-1", response.getContent().get(0).getProfileImage());
    }
}
