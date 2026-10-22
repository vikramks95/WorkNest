package com.emsproject.emsapp;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.emsproject.emsapp.dto.ApiResponse;
import com.emsproject.emsapp.dto.AuthResponse;
import com.emsproject.emsapp.dto.LoginRequest;
import com.emsproject.emsapp.dto.SignupRequest;
import com.emsproject.emsapp.security.JwtUtil;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername().trim())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Username is already taken!"));
        }

        if (userRepository.existsByEmail(signupRequest.getEmail().trim())) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email is already in use!"));
        }

        // Determine role
        String role = "ROLE_EMPLOYEE";
        if (StringUtils.hasText(signupRequest.getRole())) {
            String requestedRole = signupRequest.getRole().trim().toUpperCase();
            if (!requestedRole.startsWith("ROLE_")) {
                requestedRole = "ROLE_" + requestedRole;
            }
            if ("ROLE_ADMIN".equals(requestedRole) || "ROLE_HR".equals(requestedRole) || "ROLE_EMPLOYEE".equals(requestedRole)) {
                role = requestedRole;
            }
        }

        // Check if an employee record already matches this email
        Long linkedEmployeeId = null;
        List<EmployeeEntity> existingEmployees = employeeRepository.findAll();
        for (EmployeeEntity emp : existingEmployees) {
            if (signupRequest.getEmail().trim().equalsIgnoreCase(emp.getEmail())) {
                linkedEmployeeId = emp.getId();
                break;
            }
        }

        // If employee role and no employee record exists yet, automatically create an initial employee profile
        if (linkedEmployeeId == null && "ROLE_EMPLOYEE".equals(role)) {
            EmployeeEntity newEmp = EmployeeEntity.builder()
                    .name(signupRequest.getName().trim())
                    .email(signupRequest.getEmail().trim())
                    .department("Engineering")
                    .role("Software Engineer")
                    .status("ACTIVE")
                    .build();
            EmployeeEntity savedEmp = employeeRepository.save(newEmp);
            linkedEmployeeId = savedEmp.getId();
        }

        UserEntity user = UserEntity.builder()
                .name(signupRequest.getName().trim())
                .username(signupRequest.getUsername().trim())
                .email(signupRequest.getEmail().trim())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(role)
                .employeeId(linkedEmployeeId)
                .build();

        UserEntity savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getUsername());

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .employeeId(savedUser.getEmployeeId())
                .build();

        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String identifier = loginRequest.getUsername().trim();
            UserEntity user = userRepository.findByUsernameOrEmail(identifier, identifier)
                    .orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid username or password"));
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword())
            );

            // If employeeId is missing, try linking by email
            if (user.getEmployeeId() == null && "ROLE_EMPLOYEE".equals(user.getRole())) {
                List<EmployeeEntity> all = employeeRepository.findAll();
                for (EmployeeEntity emp : all) {
                    if (user.getEmail().equalsIgnoreCase(emp.getEmail())) {
                        user.setEmployeeId(emp.getId());
                        userRepository.save(user);
                        break;
                    }
                }
            }

            String token = jwtUtil.generateToken(user.getUsername());

            AuthResponse authResponse = AuthResponse.builder()
                    .token(token)
                    .type("Bearer")
                    .id(user.getId())
                    .name(user.getName())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .employeeId(user.getEmployeeId())
                    .build();

            return ResponseEntity.ok(authResponse);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid username or password"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "An error occurred during authentication: " + ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Not authenticated"));
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(AuthResponse.builder()
                        .token(null)
                        .type("Bearer")
                        .id(user.getId())
                        .name(user.getName())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .employeeId(user.getEmployeeId())
                        .build()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @Bean
    public CommandLineRunner initDemoUsers() {
        return args -> {
            // Seed demo employees first if empty
            employeeService.seedDemoEmployees();

            // 1. Admin account
            if (!userRepository.existsByUsername("admin")) {
                userRepository.save(UserEntity.builder()
                        .name("System Administrator")
                        .username("admin")
                        .email("admin@ems.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role("ROLE_ADMIN")
                        .build());
            }

            // 2. HR account
            if (!userRepository.existsByUsername("hr")) {
                Long hrEmpId = null;
                for (EmployeeEntity emp : employeeRepository.findAll()) {
                    if ("Human Resources".equalsIgnoreCase(emp.getDepartment())) {
                        hrEmpId = emp.getId();
                        break;
                    }
                }
                userRepository.save(UserEntity.builder()
                        .name("Elena Rostova (HR)")
                        .username("hr")
                        .email("elena.rostova@example.com")
                        .password(passwordEncoder.encode("hr123"))
                        .role("ROLE_HR")
                        .employeeId(hrEmpId)
                        .build());
            }

            // 3. Employee account
            if (!userRepository.existsByUsername("employee")) {
                Long empId = null;
                for (EmployeeEntity emp : employeeRepository.findAll()) {
                    if ("Engineering".equalsIgnoreCase(emp.getDepartment())) {
                        empId = emp.getId();
                        break;
                    }
                }
                userRepository.save(UserEntity.builder()
                        .name("Sarah Jenkins")
                        .username("employee")
                        .email("sarah.jenkins@example.com")
                        .password(passwordEncoder.encode("emp123"))
                        .role("ROLE_EMPLOYEE")
                        .employeeId(empId)
                        .build());
            }
        };
    }
}
