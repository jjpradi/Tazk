# HRMS Implementation Plan — Tazk SME (India)

**Date**: 2026-03-15
**Scope**: Comprehensive HRMS features on top of existing Attendance + Payroll system

---

## Current State Assessment

### What Already Exists (Strong Foundation)

| Area | Status | Coverage |
|------|--------|----------|
| **Attendance** | Complete | Face, QR, GPS, Selfie, WiFi, Biometric, Offline, Manual — 70+ endpoints |
| **Salary Processing** | Complete | Structures, Templates, Processing, Payslips, Bank Reports — 80+ endpoints |
| **Statutory Compliance (PF/ESI/PT)** | Complete | Effective-dated company & employee profiles, calculators, audit log |
| **Leave Management** | Complete | Types, Policies, Requests, Approvals, Balance, Carry-forward, Encashment — 50+ endpoints |
| **Shift Management** | Complete | Scheduling, Breaks, Policies, Monthly Shift — 60+ endpoints |
| **Loans & Advances** | Complete | Employee loans, Company loans, Tenure tracking — 40+ endpoints |
| **Claims/Reimbursement** | Exists | Claims with categories, approval workflow, payment processing |
| **Holidays & Special Permissions** | Complete | CRUD + approval workflow |
| **Income Tax** | Complete | Form 12BB (investment declaration), Form 16 |
| **Fuel Allowance** | Complete | Fuel types, pricing, allowance calculation |
| **Incentives** | Complete | Sales incentives, processed incentives |
| **GPS/Live Tracking** | Complete | Real-time location, visit logging, geofencing |
| **Face Registration** | Complete | Face data capture + recognition |
| **Employee Documents** | Basic | Upload + verification system (emp_verification table) |
| **Request Workflow** | Active | Configurable approver/verifier per department per request type |
| **Reports** | Extensive | Salary, Leave, Attendance, Overtime, PF, Statutory, Bank, Cost Summary, Efficiency |
| **Dashboard** | Complete | KPIs, top employees (attendance-based ranking), project management |
| **Document Template Platform** | Complete | Versioned templates, placeholders, assignments, render log — but only `payslip` configured |
| **RBAC** | Complete | Role-based menus, user-level overrides, audit log |

### What's Missing (Gap Analysis)

| # | HRMS Feature | Gap Level | Notes |
|---|-------------|-----------|-------|
| 1 | **Employee Information Management** | Partial | Profile exists but lacks: skills, certifications, emergency contacts (structured), work history, qualifications |
| 2 | **Employee Lifecycle Management** | Major | No onboarding workflow, probation tracking, confirmation, promotion, transfer, separation/exit, FnF |
| 3 | **Document Management** | Partial | emp_verification exists but needs enterprise upgrade: categories, expiry alerts, bulk upload |
| 4 | **Employee Self-Service (ESS)** | Partial | Separate login/role exists. Needs: profile edit, payslip download, tax proof upload, IT declaration |
| 5 | **HR Letter Generation** | Major | Doc template platform ready but zero HR letter types configured |
| 6 | **Recruitment / ATS** | Not Built | Completely new module needed |
| 7 | **Performance Management** | Minimal | Only attendance-based ranking (top_employee_data). No goals, KPIs, appraisals, reviews |
| 8 | **Expense & Reimbursement** | Partial | Claims module exists. Needs: receipt upload, mileage, per-diem, policy limits |
| 9 | **Asset Management (HR)** | Exists Separately | tzk-assets exists as separate subscription. Needs: HR-level asset assignment tracking |
| 10 | **HR Policies & Compliance** | Minimal | Attendance policy + leave policy exist. No policy document management, acknowledgment tracking |
| 11 | **HR Analytics & Reports** | Minimal | Attendance/salary reports exist. No headcount trends, attrition, diversity, cost analytics |
| 12 | **Organization Structure** | Partial | Departments, designations, reporting_manager exist. No org chart visualization, grade/band system |

---

## Phase-wise Implementation Plan

### Phase 1: Employee Profile & Organization Foundation (4-5 weeks)

**Why First**: Everything else depends on complete employee profiles and org structure.

#### 1A. Enhanced Employee Profile

**New DB Tables:**
```sql
-- Employee extended profile
CREATE TABLE emp_qualifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  qualification_type ENUM('education','certification','skill','language') NOT NULL,
  title VARCHAR(255) NOT NULL,          -- e.g., "B.Tech Computer Science"
  institution VARCHAR(255),              -- e.g., "Anna University"
  grade VARCHAR(50),                     -- e.g., "First Class"
  from_date DATE,
  to_date DATE,
  certificate_url VARCHAR(500),          -- S3 link
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emp (company_id, employee_id)
);

-- Emergency contacts (structured, not in comments field)
CREATE TABLE emp_emergency_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  address TEXT,
  is_primary TINYINT(1) DEFAULT 0,
  isDeleted TINYINT(1) DEFAULT 0,
  INDEX idx_emp (company_id, employee_id)
);

-- Work history (previous employment)
CREATE TABLE emp_work_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),
  from_date DATE,
  to_date DATE,
  last_ctc DECIMAL(12,2),
  reason_for_leaving VARCHAR(500),
  isDeleted TINYINT(1) DEFAULT 0,
  INDEX idx_emp (company_id, employee_id)
);

-- Employee grade/band (for compensation & hierarchy)
CREATE TABLE emp_grade (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  grade_code VARCHAR(20) NOT NULL,       -- e.g., "L1", "L2", "M1"
  grade_name VARCHAR(100) NOT NULL,      -- e.g., "Junior", "Senior", "Manager"
  level INT NOT NULL,                     -- numeric for sorting
  isDeleted TINYINT(1) DEFAULT 0,
  UNIQUE KEY uk_grade (company_id, grade_code)
);
```

**Modify Existing:**
- Add `grade_id`, `blood_group`, `marital_status`, `nationality`, `aadhar_number`, `pan_number` to `pos_people`
- Add `probation_end_date`, `confirmation_date`, `notice_period_days` to `pos_employees`

**Backend**: New CRUD endpoints in tzk-payroll for qualifications, emergency contacts, work history, grades
**Frontend**: Enhanced employee profile page with tabs: Personal | Contact | Family | Qualifications | Work History | Documents | Bank & Statutory

#### 1B. Organization Structure Enhancement

**New DB Tables:**
```sql
-- Department hierarchy (tree structure)
ALTER TABLE departments ADD COLUMN parent_department_id INT DEFAULT NULL;
ALTER TABLE departments ADD COLUMN level INT DEFAULT 0;

-- Cost center (for analytics)
CREATE TABLE cost_center (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  department_id INT,
  isDeleted TINYINT(1) DEFAULT 0,
  UNIQUE KEY uk_cc (company_id, code)
);
```

**Frontend**: Org chart visualization page (tree view using MUI TreeView or react-d3-tree)
**Backend**: API to return org tree (recursive CTE query on departments + reporting_manager)

---

### Phase 2: Employee Lifecycle & HR Letters (5-6 weeks)

**Why Second**: Core HR workflow — handles employee journey from joining to exit.

#### 2A. Employee Lifecycle Management

**New DB Tables:**
```sql
-- Lifecycle events log
CREATE TABLE emp_lifecycle_event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  event_type ENUM('onboarding','confirmation','promotion','transfer','increment','separation','rehire') NOT NULL,
  event_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  -- Promotion/Transfer details
  from_department_id INT,
  to_department_id INT,
  from_designation VARCHAR(255),
  to_designation VARCHAR(255),
  from_grade_id INT,
  to_grade_id INT,
  from_location_id INT,
  to_location_id INT,
  from_reporting_manager INT,
  to_reporting_manager INT,
  -- Increment details
  from_ctc DECIMAL(12,2),
  to_ctc DECIMAL(12,2),
  increment_percentage DECIMAL(5,2),
  -- Separation details
  separation_type ENUM('resignation','termination','retirement','absconding','contract_end'),
  separation_reason TEXT,
  last_working_date DATE,
  notice_served_till DATE,
  exit_interview_done TINYINT(1) DEFAULT 0,
  -- Common
  remarks TEXT,
  letter_generated TINYINT(1) DEFAULT 0,
  letter_template_id INT,
  approved_by INT,
  status ENUM('draft','pending','approved','completed','cancelled') DEFAULT 'draft',
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  INDEX idx_emp (company_id, employee_id),
  INDEX idx_type (company_id, event_type)
);

-- Onboarding checklist template
CREATE TABLE onboarding_checklist_template (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  responsible_type ENUM('hr','manager','employee','it') NOT NULL,
  sort_order INT DEFAULT 0,
  is_mandatory TINYINT(1) DEFAULT 1,
  isDeleted TINYINT(1) DEFAULT 0
);

-- Onboarding checklist per employee
CREATE TABLE emp_onboarding_checklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  checklist_item_id INT NOT NULL,
  status ENUM('pending','in_progress','completed','skipped') DEFAULT 'pending',
  completed_date DATE,
  completed_by INT,
  remarks TEXT,
  INDEX idx_emp (company_id, employee_id)
);

-- Full & Final Settlement
CREATE TABLE emp_fnf_settlement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  lifecycle_event_id INT NOT NULL,
  last_working_date DATE NOT NULL,
  -- Earnings
  pending_salary DECIMAL(12,2) DEFAULT 0,
  leave_encashment_days INT DEFAULT 0,
  leave_encashment_amount DECIMAL(12,2) DEFAULT 0,
  bonus_amount DECIMAL(12,2) DEFAULT 0,
  gratuity_amount DECIMAL(12,2) DEFAULT 0,
  other_earnings DECIMAL(12,2) DEFAULT 0,
  -- Deductions
  notice_period_recovery DECIMAL(12,2) DEFAULT 0,
  loan_recovery DECIMAL(12,2) DEFAULT 0,
  advance_recovery DECIMAL(12,2) DEFAULT 0,
  asset_recovery DECIMAL(12,2) DEFAULT 0,
  other_deductions DECIMAL(12,2) DEFAULT 0,
  -- Totals
  total_earnings DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  net_payable DECIMAL(12,2) DEFAULT 0,
  -- Status
  status ENUM('draft','pending_approval','approved','paid','cancelled') DEFAULT 'draft',
  approved_by INT,
  approved_date DATE,
  payment_date DATE,
  payment_ref VARCHAR(255),
  remarks TEXT,
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp (company_id, employee_id)
);
```

**Key Workflows:**
1. **Onboarding**: New hire → checklist creation → document collection → bank/statutory setup → ID card → system access
2. **Probation → Confirmation**: Auto-alert on probation end → HR reviews → confirmation/extension/termination
3. **Promotion/Transfer**: HR initiates → approval → letter generation → salary revision → department/designation update
4. **Separation**: Resignation/termination → notice period → handover → FnF calculation → exit interview → relieving

**Frontend Pages:**
- Onboarding Dashboard (pending onboardings, checklist progress)
- Lifecycle Events (searchable log per employee)
- Separation & FnF (wizard: initiate → calculate → approve → pay)
- Probation Tracker (auto-populated from pos_employees.probation_end_date)

#### 2B. HR Letter Generation

**Leverage existing doc_template platform.** No new tables needed — just configuration.

**New Document Types to Register:**
```
offer_letter, appointment_letter, confirmation_letter, promotion_letter,
increment_letter, transfer_letter, warning_letter, termination_letter,
relieving_letter, experience_letter, internship_letter, address_proof_letter,
salary_certificate, employment_certificate, noc_letter, bonafide_letter
```

**Implementation:**
1. Add document types to `DOC_TYPES` array in frontend
2. Register placeholders in `doc_placeholder_registry` for each type:
   - Employee: name, employee_id, designation, department, doj, dol
   - Salary: ctc, basic, hra, allowances
   - Company: name, address, logo, authorized signatory
   - Event-specific: new_designation, new_department, new_ctc, increment_percentage
3. Create default templates (HTML) for each letter type
4. Wire letter generation into lifecycle events (e.g., confirmation event → auto-generate confirmation letter)

**Frontend:**
- HR Letters page: select employee → select letter type → preview → download/print
- Auto-generate from lifecycle events
- Letter history with render log

---

### Phase 3: Employee Self-Service Enhancement & Document Management (3-4 weeks)

#### 3A. ESS Portal Enhancement

**Existing**: Separate ESS login/role already exists.

**Enhancements Needed:**

| Feature | Status | Work Needed |
|---------|--------|-------------|
| View/Edit personal profile | Partial | Add edit capability with HR approval workflow |
| View payslips | Exists | Already in place via payslip template |
| View/Download Form 16 | Exists | Already in place |
| Apply leave | Exists | Already in place |
| Apply permission | Exists | Already in place |
| Attendance regularization | Exists | Already in place |
| Submit claims | Exists | Already in place |
| View loan details | Exists | Already in place |
| **IT Declaration (Form 12BB)** | **Partial** | Add proof upload against each declaration |
| **Tax computation sheet** | **New** | Monthly tax projection based on declared investments |
| **Salary structure view** | **New** | Read-only view of current salary structure |
| **Team view (for managers)** | **New** | Manager sees team attendance, leaves, pending approvals |
| **Holiday calendar** | **Partial** | Exists but needs ESS-friendly view |
| **Company policies** | **New** | View and acknowledge HR policies |
| **Request tracker** | **Partial** | Unified view of all pending/approved/rejected requests |

**New DB Tables:**
```sql
-- Profile change requests (ESS-initiated)
CREATE TABLE emp_profile_change_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,      -- e.g., "phone_number", "address"
  old_value TEXT,
  new_value TEXT,
  proof_url VARCHAR(500),               -- supporting document
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  approved_by INT,
  remarks TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp (company_id, employee_id)
);
```

#### 3B. Document Management Enterprise Upgrade

**Enhance existing emp_verification system:**

```sql
-- Document categories (structured)
CREATE TABLE emp_document_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  category_name VARCHAR(100) NOT NULL,   -- e.g., "Identity", "Address", "Education", "Experience"
  is_mandatory TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  isDeleted TINYINT(1) DEFAULT 0
);

-- Enhanced document management (replaces emp_verification for new features)
ALTER TABLE emp_verification ADD COLUMN category_id INT;
ALTER TABLE emp_verification ADD COLUMN file_url VARCHAR(500);
ALTER TABLE emp_verification ADD COLUMN file_size INT;
ALTER TABLE emp_verification ADD COLUMN status ENUM('pending','verified','rejected','expired') DEFAULT 'pending';
ALTER TABLE emp_verification ADD COLUMN rejection_reason VARCHAR(500);
```

**Features:**
- Categorized document upload (Identity, Address, Education, Experience, Statutory)
- Expiry tracking with auto-alerts (DL, passport, visa, certifications)
- Bulk document upload (onboarding)
- Document verification workflow (upload → review → verify/reject)
- Download/print capabilities

---

### Phase 4: Expense & Reimbursement Enhancement + HR Policies (3-4 weeks)

#### 4A. Expense Management Enhancement

**Enhance existing claims module:**

```sql
-- Expense policy rules
CREATE TABLE expense_policy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  category_id INT NOT NULL,             -- FK to claims_category
  grade_id INT,                          -- NULL = all grades
  max_amount DECIMAL(12,2),              -- per claim limit
  max_monthly DECIMAL(12,2),             -- monthly limit
  requires_receipt TINYINT(1) DEFAULT 1,
  requires_approval TINYINT(1) DEFAULT 1,
  auto_approve_below DECIMAL(12,2),      -- auto-approve if below this amount
  isDeleted TINYINT(1) DEFAULT 0,
  INDEX idx_company (company_id)
);

-- Add receipt/proof tracking to claims
ALTER TABLE claims ADD COLUMN receipt_urls JSON;
ALTER TABLE claims ADD COLUMN expense_date DATE;
ALTER TABLE claims ADD COLUMN policy_id INT;
ALTER TABLE claims ADD COLUMN violation_flag TINYINT(1) DEFAULT 0;
ALTER TABLE claims ADD COLUMN violation_reason VARCHAR(500);
```

**New Features:**
- Policy-based validation (grade-wise limits, category limits)
- Receipt upload (photos via mobile)
- Policy violation alerts
- Expense reports (by category, department, employee, period)
- Mileage/travel claims with distance calculator

#### 4B. HR Policies & Compliance

```sql
-- HR Policy documents
CREATE TABLE hr_policy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  policy_name VARCHAR(255) NOT NULL,
  policy_category ENUM('general','leave','attendance','conduct','safety','benefits','it','travel') NOT NULL,
  description TEXT,
  content_html LONGTEXT,                 -- full policy content
  document_url VARCHAR(500),             -- or uploaded PDF
  version INT DEFAULT 1,
  effective_date DATE NOT NULL,
  status ENUM('draft','active','archived') DEFAULT 'draft',
  requires_acknowledgment TINYINT(1) DEFAULT 0,
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  INDEX idx_company (company_id)
);

-- Policy acknowledgment tracking
CREATE TABLE hr_policy_acknowledgment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  policy_id INT NOT NULL,
  employee_id INT NOT NULL,
  acknowledged_at DATETIME NOT NULL,
  ip_address VARCHAR(45),
  isDeleted TINYINT(1) DEFAULT 0,
  UNIQUE KEY uk_ack (policy_id, employee_id),
  INDEX idx_emp (company_id, employee_id)
);
```

**Features:**
- Policy CRUD with versioning
- Employee acknowledgment tracking
- Auto-notify on new/updated policies
- ESS: view policies + acknowledge
- Compliance dashboard: who has/hasn't acknowledged

---

### Phase 5: Performance Management (5-6 weeks)

**Why Later**: Requires stable employee profiles, grades, and org structure from earlier phases.

```sql
-- Appraisal cycles
CREATE TABLE perf_appraisal_cycle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  cycle_name VARCHAR(255) NOT NULL,      -- e.g., "FY 2026-27 Annual Review"
  cycle_type ENUM('annual','half_yearly','quarterly') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  self_review_deadline DATE,
  manager_review_deadline DATE,
  hr_review_deadline DATE,
  status ENUM('draft','active','self_review','manager_review','hr_review','completed') DEFAULT 'draft',
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company (company_id)
);

-- KRA/KPI templates per role
CREATE TABLE perf_kra_template (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  designation VARCHAR(255),              -- optional: role-specific
  department_id INT,                     -- optional: dept-specific
  grade_id INT,                          -- optional: grade-specific
  isDeleted TINYINT(1) DEFAULT 0,
  INDEX idx_company (company_id)
);

CREATE TABLE perf_kra_template_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  kra_name VARCHAR(255) NOT NULL,        -- Key Result Area
  kpi_name VARCHAR(255),                 -- Key Performance Indicator
  weightage DECIMAL(5,2) NOT NULL,       -- percentage
  target_description TEXT,
  measurement_type ENUM('numeric','percentage','rating','boolean') DEFAULT 'rating',
  sort_order INT DEFAULT 0,
  isDeleted TINYINT(1) DEFAULT 0,
  INDEX idx_template (template_id)
);

-- Employee appraisals
CREATE TABLE perf_employee_appraisal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  cycle_id INT NOT NULL,
  template_id INT,
  -- Ratings
  self_rating DECIMAL(3,1),
  manager_rating DECIMAL(3,1),
  hr_rating DECIMAL(3,1),
  final_rating DECIMAL(3,1),
  -- Comments
  self_comments TEXT,
  manager_comments TEXT,
  hr_comments TEXT,
  employee_feedback TEXT,                -- employee's response to review
  -- Outcome
  rating_label VARCHAR(50),              -- e.g., "Exceeds Expectations"
  increment_recommended TINYINT(1) DEFAULT 0,
  promotion_recommended TINYINT(1) DEFAULT 0,
  training_recommended TEXT,
  -- Status
  status ENUM('not_started','self_review','manager_review','hr_review','completed') DEFAULT 'not_started',
  self_submitted_at DATETIME,
  manager_submitted_at DATETIME,
  hr_submitted_at DATETIME,
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp (company_id, employee_id),
  INDEX idx_cycle (company_id, cycle_id)
);

-- KRA scores per appraisal
CREATE TABLE perf_appraisal_kra_score (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appraisal_id INT NOT NULL,
  kra_template_item_id INT NOT NULL,
  self_score DECIMAL(3,1),
  self_comments TEXT,
  manager_score DECIMAL(3,1),
  manager_comments TEXT,
  final_score DECIMAL(3,1),
  INDEX idx_appraisal (appraisal_id)
);

-- Goals (separate from KRAs — employee-level goals)
CREATE TABLE perf_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_id INT NOT NULL,
  cycle_id INT,
  goal_title VARCHAR(255) NOT NULL,
  goal_description TEXT,
  target_value VARCHAR(100),
  achieved_value VARCHAR(100),
  weightage DECIMAL(5,2),
  due_date DATE,
  status ENUM('not_started','in_progress','completed','deferred') DEFAULT 'not_started',
  progress_percentage INT DEFAULT 0,
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp (company_id, employee_id)
);
```

**Features:**
- Appraisal cycle management (create, activate, track progress)
- KRA/KPI templates (reusable per role/department/grade)
- Self-review → Manager review → HR review workflow
- Rating scale configuration (1-5 with labels)
- Goal setting and tracking
- Performance dashboard (ratings distribution, completion status)
- Link to increment/promotion lifecycle events
- Existing `top_employee_data` (attendance-based) feeds into appraisal as one input

**Frontend Pages:**
- Appraisal Cycles (HR)
- KRA Templates (HR)
- My Appraisal (ESS)
- Team Appraisals (Manager)
- Goals (ESS + Manager)
- Performance Dashboard (HR)

---

### Phase 6: Recruitment / Applicant Tracking (5-6 weeks)

**Completely new module.**

```sql
-- Job positions/requisitions
CREATE TABLE recruit_job_position (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  department_id INT NOT NULL,
  designation VARCHAR(255),
  grade_id INT,
  location_id INT,
  reporting_to INT,                      -- employee_id of hiring manager
  -- Requirements
  job_description LONGTEXT,
  requirements TEXT,
  experience_min INT,                    -- years
  experience_max INT,
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  no_of_positions INT DEFAULT 1,
  -- Status
  status ENUM('draft','open','on_hold','filled','cancelled') DEFAULT 'draft',
  posted_date DATE,
  target_date DATE,
  -- Source
  internal_posting TINYINT(1) DEFAULT 0,
  external_posting TINYINT(1) DEFAULT 1,
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdBy INT,
  INDEX idx_company (company_id),
  INDEX idx_dept (company_id, department_id)
);

-- Candidates/Applicants
CREATE TABLE recruit_candidate (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  current_company VARCHAR(255),
  current_designation VARCHAR(255),
  experience_years DECIMAL(3,1),
  current_ctc DECIMAL(12,2),
  expected_ctc DECIMAL(12,2),
  notice_period_days INT,
  resume_url VARCHAR(500),
  source ENUM('portal','referral','agency','walk_in','linkedin','naukri','other') DEFAULT 'other',
  referred_by INT,                       -- employee_id if referral
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company (company_id)
);

-- Applications (candidate → job position)
CREATE TABLE recruit_application (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  candidate_id INT NOT NULL,
  job_position_id INT NOT NULL,
  status ENUM('applied','screening','shortlisted','interview','offered','accepted','rejected','withdrawn') DEFAULT 'applied',
  current_stage INT DEFAULT 1,
  rejection_reason VARCHAR(500),
  offer_ctc DECIMAL(12,2),
  offer_date DATE,
  joining_date DATE,
  converted_employee_id INT,             -- link to pos_employees after joining
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_job (company_id, job_position_id),
  INDEX idx_candidate (company_id, candidate_id)
);

-- Interview schedule
CREATE TABLE recruit_interview (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  application_id INT NOT NULL,
  round_number INT NOT NULL,
  round_name VARCHAR(100),               -- e.g., "Technical Round 1", "HR Round"
  interview_date DATETIME NOT NULL,
  interview_mode ENUM('in_person','phone','video') DEFAULT 'in_person',
  location VARCHAR(255),
  -- Interviewers
  interviewer_ids JSON,                  -- array of employee_ids
  -- Feedback
  rating DECIMAL(3,1),
  feedback TEXT,
  result ENUM('pending','pass','fail','on_hold') DEFAULT 'pending',
  isDeleted TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_app (company_id, application_id)
);

-- Recruitment pipeline stages (configurable)
CREATE TABLE recruit_stage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  stage_name VARCHAR(100) NOT NULL,
  stage_order INT NOT NULL,
  is_default TINYINT(1) DEFAULT 0,
  isDeleted TINYINT(1) DEFAULT 0
);
```

**Features:**
- Job requisition creation and approval
- Candidate database
- Application tracking (Kanban board — reuse @hello-pangea/dnd)
- Interview scheduling with calendar integration
- Interviewer feedback collection
- Offer management
- Candidate → Employee conversion (auto-create employee on joining)
- Recruitment dashboard (pipeline, time-to-hire, source effectiveness)
- Email notifications (interview invites, offer letters)

**Frontend Pages:**
- Job Positions (list + create/edit)
- Candidates (list + profile)
- Recruitment Pipeline (Kanban)
- Interview Calendar
- Recruitment Reports

---

### Phase 7: HR Analytics & Reports (3-4 weeks)

**Build on existing report infrastructure.**

**New Reports:**
| Report | Data Source |
|--------|------------|
| Headcount & FTE | pos_employees + pos_people (active vs total) |
| Attrition Report | emp_lifecycle_event (separation events) |
| New Joiner Report | pos_people.dateOfJoining |
| Tenure Analysis | pos_people.dateOfJoining vs current date |
| Department-wise Strength | pos_people_departments |
| Gender Diversity | pos_people.gender |
| Age Distribution | pos_people.dob |
| Salary Cost Analysis | ss_processed_salary by department/grade |
| Leave Balance Report | employee_leave_type_balance |
| Attendance Compliance | attendance + attendance_policy |
| Probation Tracker | pos_employees.probation_end_date |
| Document Expiry | emp_verification.expiry_date |
| Appraisal Status | perf_employee_appraisal (Phase 5) |
| Recruitment Pipeline | recruit_application (Phase 6) |
| Policy Acknowledgment | hr_policy_acknowledgment (Phase 4) |
| Employee Cost Summary | All salary + statutory + claims |

**Dashboard Widgets:**
- Headcount trend (line chart)
- Attrition rate (gauge)
- Open positions vs filled (bar chart)
- Leave trends (stacked bar)
- Upcoming events: probation due, document expiry, birthdays, work anniversaries

**No new tables needed** — all analytics come from existing + new tables from earlier phases.

---

## Implementation Summary

| Phase | Features | Duration | Dependencies |
|-------|----------|----------|--------------|
| **1** | Employee Profile + Org Structure | 4-5 weeks | None |
| **2** | Lifecycle Management + HR Letters | 5-6 weeks | Phase 1 |
| **3** | ESS Enhancement + Document Mgmt | 3-4 weeks | Phase 1 |
| **4** | Expense Enhancement + HR Policies | 3-4 weeks | Phase 1 |
| **5** | Performance Management | 5-6 weeks | Phase 1, 2 |
| **6** | Recruitment / ATS | 5-6 weeks | Phase 1 |
| **7** | HR Analytics & Reports | 3-4 weeks | Phase 1-6 |

**Total: ~28-35 weeks (7-9 months)**

Phases 3, 4, and 6 can run in parallel with Phase 2 (they only depend on Phase 1).

```
Phase 1 ──→ Phase 2 ──→ Phase 5 ──→ Phase 7
        ├──→ Phase 3 ──────────────→ Phase 7
        ├──→ Phase 4 ──────────────→ Phase 7
        └──→ Phase 6 ──────────────→ Phase 7
```

With parallel execution: **~18-22 weeks (4.5-5.5 months)**

---

## Architecture Principles

1. **Non-breaking**: All changes are additive — new tables, new columns (nullable), new API modules. Zero modifications to existing attendance/salary/leave logic.
2. **Multi-tenant**: All tables include `company_id`. Existing RBAC controls access.
3. **Effective dating**: Follow the pattern established in statutory tables (`effective_from`/`effective_to`) for salary revisions, policy changes.
4. **Soft delete**: All tables use `isDeleted` flag — consistent with existing pattern.
5. **Encryption**: Sensitive PII (Aadhar, PAN, bank details) encrypted via existing `Company.Encryption()` pattern.
6. **Request workflow**: New approval flows (profile changes, lifecycle events, FnF) integrate with existing `request_config_mapping` system by adding new `request_type` values.
7. **Doc template reuse**: HR letters use the existing doc_template platform — no new rendering engine needed.
8. **Existing module naming**: New backend modules go into tzk-payroll following existing folder structure pattern (`src/api/<module>/`).

---

## Asset Management (HR Integration) Note

tzk-assets exists as a separate service with subscription-based access. For HR asset tracking:
- **Option A** (Recommended): Add a lightweight `emp_asset_assignment` table in tzk-payroll that tracks which assets are assigned to which employee (for FnF recovery). Cross-reference with tzk-assets via asset_id.
- **Option B**: Add employee_id column to tzk-assets tables and build integration API.

This keeps both systems independent while enabling FnF asset recovery calculation.

---

## Database Changes Summary

| Phase | New Tables | Altered Tables | New Procedures |
|-------|-----------|----------------|----------------|
| 1 | 5 | 2 (pos_people, departments) | 1 (org tree CTE) |
| 2 | 4 | 0 | 2 (FnF calculation, probation alerts) |
| 3 | 2 | 1 (emp_verification) | 0 |
| 4 | 3 | 1 (claims) | 0 |
| 5 | 6 | 0 | 1 (rating rollup) |
| 6 | 5 | 0 | 0 |
| 7 | 0 | 0 | 5-8 (report procedures) |
| **Total** | **25** | **4** | **9-11** |
