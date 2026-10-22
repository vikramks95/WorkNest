# 🚀 Employee Management System

A **full-stack enterprise web application** built with **React (Frontend)** and **Spring Boot (Backend)** to manage workforce personnel efficiently.  
It provides **Spring Security 6 with JWT & Role-Based Access Control (RBAC)**, an interactive **Workforce Analytics Dashboard with Chart.js**, an **Advanced Employee Directory** with multi-field search and pagination, and an integrated **Leave Management System**.

---

## 👥 Roles & Permissions Matrix

The system implements 3 distinct roles with both frontend and backend authorization enforcement:

| Feature / Action | Admin (`ROLE_ADMIN`) | HR (`ROLE_HR`) | Employee (`ROLE_EMPLOYEE`) |
|---|:---:|:---:|:---:|
| **View Analytics Dashboard** | ✅ Full | ✅ Full | ✅ Full |
| **View Employee Directory & Profiles** | ✅ All | ✅ All | ✅ All |
| **Create New Employees** | ✅ Yes | ✅ Yes | ❌ Blocked |
| **Update All Employee Records** | ✅ Full Access | ✅ Full Access | ❌ Self Only (Personal Details) |
| **Update Salary, Role, Dept, Status** | ✅ Yes | ✅ Yes | ❌ Locked (Read-Only) |
| **Delete Employees** | ✅ Yes | ✅ Yes | ❌ Blocked |
| **Apply for Leave** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Review & Approve/Reject Leaves** | ✅ Yes | ✅ Yes | ❌ Blocked |
| **View Personal Leave History** | ✅ Yes | ✅ Yes | ✅ Self Only |

---

## ⚡ Instant Demo Credentials

The backend automatically seeds 3 pre-configured demo accounts on startup:

| Role | Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Full administrative control over all employees & leaves |
| **HR** | `hr` | `hr123` | Workforce management & leave request reviewer |
| **Employee** | `employee` | `emp123` | Self-service profile, permitted edits, and leave requests |

> **Tip:** The Login page includes **1-Click Quick Demo Login** buttons for instant testing of each role!

---

## ✨ Core Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Spring Security 6 & JJWT**: Stateless Bearer token authentication with `@EnableMethodSecurity`.
- **Role Assignment**: Sign up with selectable role (`Admin`, `HR`, `Employee`) or use pre-seeded demo accounts.
- **Auto Profile Association**: Automatic linking between user accounts (`users`) and employee records (`emp_tb`) by ID or email.
- **Granular Backend Guarding**:
  - `POST /employees` and `DELETE /employees/{id}` restricted to `ADMIN` and `HR`.
  - `PUT /employees/{id}` restricted so employees can only update their own permitted personal fields (`name`, `phone`, `email`, `profileImage`) and cannot tamper with `salary`, `department`, `role`, or `status`.
  - Self-service endpoints: `GET /employees/me` and `PUT /employees/me`.

### 🏖️ 2. Comprehensive Leave Management System
- **Apply for Leave**:
  - Request time off across 6 categories: Vacation (15d), Sick Leave (10d), Casual Leave (7d), Personal (5d), Maternity/Paternity (90d), and Unpaid (30d).
  - Real-time remaining balance badge and live duration calculation.
  - Policy enforcement: Blocks submission if requested days exceed remaining available balance.
- **Track Leave Balances & History**:
  - Interactive multi-segment progress bars for each category (Allocated, Used, Pending, Available).
  - Direct employee leave balance inspection for HR and Admin (`📊 Inspect Balances`).
  - Searchable and filterable request history by status, category, date, and employee.
- **Approve or Reject Requests**:
  - HR & Admin review queue with comments and one-click actions.
  - Automatic employee status synchronization to `ON_LEAVE` upon approval.
- **Pending Requests & Status Tracking**:
  - Prominent badge counters and dedicated **Pending Review Queue** tab.
  - Clear visual status badges (`⏳ Pending Review`, `✓ Approved`, `✕ Rejected`).
  - Self-service cancellation: Employees can withdraw/cancel pending requests, instantly restoring their leave balance.

### 👤 3. Advanced Employee Management
- **Full CRUD Support**: Add, view detailed profile modal, update, and delete employees.
- **Unified Multi-Field Search**: Search across **Name**, **Employee ID** (`#1`, `10`, etc.), or **Email address**.
- **Multi-Criteria Filtering**: Filter by **Department**, **Job Title / Role**, and **Employment Status** (`Active`, `On Leave`, `Inactive`) with one-click reset.
- **Server-Side Pagination**: Configurable page sizes (`5`, `10`, `25`, `50` rows per page), dynamic page numbers, and total records indicator.
- **Multi-Column Sorting**: Interactive table header sorting by Employee ID, Name, Department, Job Title, Status, or Salary.
- **Employee Profile Photos**:
  - Direct Image URL support.
  - Local image file upload (Base64 conversion).
  - 8 instant professional avatar presets.
  - Automatic fallback to stylized initials badge.

### 📊 4. Executive Workforce Dashboard
- Real-time KPIs: Total Employees, Active Workforce (%), Departments count, and Employees On Leave.
- Interactive Doughnut Chart showing department-wise employee distribution with custom color palette.
- Headcount Bar Chart comparing staff volumes across organizational teams.
- Recent Employee Additions table with timestamps, photos, and status badges.
- "Employees on Leave" tracking panel for current absences.
- Single-click demo data seeder (`⚡ Load Demo Employees`) for instant preview.

---

## 🛠 Tech Stack
- **Frontend:** React 19, React Router v7, Chart.js 4, react-chartjs-2, Axios, Bootstrap 5, Vite
- **Backend:** Spring Boot 3.5.5, Spring Security 6, JJWT 0.12.6, Spring Data JPA, Hibernate  
- **Database:** MySQL / H2
- **Build Tools:** Maven Wrapper (`mvnw`), Node 22 / npm

---

## 🔑 Key API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/auth/signup` | Register new user account with role selection | Public |
| `POST` | `/auth/login` | Authenticate user & receive JWT Bearer token | Public |
| `GET` | `/auth/me` | Fetch authenticated user profile and roles | Authenticated |

### Employee Management (`/employees`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/employees/search` | Paginated, sorted search & filter | Authenticated |
| `GET` | `/employees/meta/departments` | List distinct departments | Authenticated |
| `GET` | `/employees/meta/job-titles` | List distinct job titles | Authenticated |
| `GET` | `/employees/dashboard/stats` | Aggregated dashboard metrics & charts | Authenticated |
| `GET` | `/employees/me` | Get logged-in employee profile | Authenticated |
| `PUT` | `/employees/me` | Update logged-in employee permitted details | Authenticated |
| `GET` | `/employees` | List all employees | Authenticated |
| `GET` | `/employees/{id}` | Get employee by ID | Authenticated |
| `POST` | `/employees` | Create new employee | **Admin & HR Only** |
| `PUT` | `/employees/{id}` | Update employee (fields validated by role) | Authenticated |
| `DELETE` | `/employees/{id}` | Delete employee record | **Admin & HR Only** |

### Leave Management (`/leaves`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/leaves` | Apply for leave (validates available balance) | Authenticated |
| `GET` | `/leaves/my` | View authenticated user's leave requests | Authenticated |
| `GET` | `/leaves` | View all leave requests (filterable by status) | **Admin & HR Only** |
| `GET` | `/leaves/balances` | Fetch current user's annual leave balance breakdown | Authenticated |
| `GET` | `/leaves/balances/{employeeId}` | Inspect an employee's leave balance breakdown | **Admin & HR Only** |
| `PUT` | `/leaves/{id}/status` | Approve or reject leave request | **Admin & HR Only** |
| `DELETE` | `/leaves/{id}` | Withdraw / cancel a pending leave request | Owner / Admin / HR |
| `GET` | `/leaves/summary` | Summary counts of pending, approved, rejected | Authenticated |

---

## 🚀 How to Run the Project

### 1. Backend (Spring Boot)
1. Ensure MySQL is running on `localhost:3306` with database `emp_db` (configured in `application.properties`).
2. Open terminal in the `emsapp` folder:
   ```bash
   cd emsapp
   ./mvnw spring-boot:run
   ```
3. Backend starts at `http://localhost:9090`.

### 2. Frontend (React + Vite)
1. Open terminal in the `emsapp-view` folder:
   ```bash
   cd emsapp-view
   npm install
   npm run dev
   ```
2. Frontend opens at `http://localhost:5173`.
3. Click any of the **Quick Demo Login** buttons (`Admin`, `HR`, or `Employee`) to experience role-based capabilities!

