# System Architecture Overview

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEACHER/STUDENT SIGNUP                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Fill Registration Form
                    (email, password, phone, etc)
                              ↓
                    Account Created in Database
                    approvalStatus: "pending"
                              ↓
              Email Sent: "Registration Submitted"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN APPROVAL                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  Admin views admin-dashboard.html
                  Sees all pending registrations
                              ↓
              ┌─────────────┬──────────────┐
              ↓             ↓              ↓
          APPROVE       REJECT         FILTER
              ↓             ↓
        Generate ID   Mark Rejected
        Update Status  Send Email
        Send Email
              ↓             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              Verify email exists & password correct
                              ↓
                  Check approvalStatus === "approved"
                              ↓
              ┌─────────────────────────────┐
              ↓                             ↓
          APPROVED                      PENDING
              ↓                             ↓
        Generate JWT          Show Error:
        Store Token       "Not Yet Approved"
        Redirect to
        Dashboard
              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER DASHBOARD                                │
└─────────────────────────────────────────────────────────────────┘
              ↓
        Display User Info
        Show Staff ID (teachers)
        Show Registration Number
        Display Account Status
        Show Attendance Records
```

---

## Database Structure

```
SCHOOLS Collection
├── schoolName
├── schoolEmail (unique)
├── schoolCode (unique)
├── isVerified
└── country, state, etc.

USERS (admin collection)
├── Teacher Documents
│   ├── role: "teacher"
│   ├── fullName
│   ├── email (unique)
│   ├── password (hashed)
│   ├── department
│   ├── phoneNumber
│   ├── staffId: "TCH-XXXXX" ← Generated on approval
│   ├── registrationNumber: "STU-XXXXXXX"
│   ├── approvalStatus: "pending" → "approved" → dashboard
│   ├── schoolId (reference)
│   └── approvedBy, approvedAt
│
├── Student Documents
│   ├── role: "student"
│   ├── fullName
│   ├── email (unique)
│   ├── password (hashed)
│   ├── phoneNumber
│   ├── registrationNumber: "STU-XXXXXXX" ← Generated on approval
│   ├── approvalStatus: "pending" → "approved" → dashboard
│   ├── schoolId (reference)
│   └── approvedBy, approvedAt
│
└── Admin Documents
    ├── role: "admin"
    ├── fullName
    ├── email (unique)
    ├── password (hashed)
    └── [can approve/reject users]
```

---

## Frontend Architecture

```
LOGIN PAGE (login.html)
├── Role Selector
│   ├── Student/Teacher Tab → userLoginForm
│   └── Admin Tab → adminLoginForm
├── User Login
│   ├── POST /userLogin
│   ├── Check approvalStatus
│   └── Redirect to dashboard
└── Admin Login
    ├── POST /adminLogin
    └── Redirect to admin-dashboard.html

TEACHER SIGNUP (teacher-signup.html)
├── Form: fullName, email, password, phone, department, schoolCode
├── Validation
├── POST /teacherSignup
└── Email notification sent

STUDENT SIGNUP (student-signup.html)
├── Form: fullName, email, password, phone, schoolCode
├── Validation
├── POST /studentSignup
└── Email notification sent

TEACHER DASHBOARD (teacher-dashboard.html)
├── Check localStorage token & userId
├── GET /userDashboard/:userId
├── Display:
│   ├── Staff ID (TCH-XXXXX)
│   ├── Registration Number
│   ├── Attendance records
│   └── Account status
└── Logout functionality

STUDENT DASHBOARD (student-dashboard.html)
├── Check localStorage token & userId
├── GET /userDashboard/:userId
├── Display:
│   ├── Registration Number (STU-XXXXXXX)
│   ├── Attendance records
│   └── Account status
└── Logout functionality

ADMIN DASHBOARD (admin-dashboard.html)
├── Check admin token in localStorage
├── GET /pendingUsers/:adminEmail
├── Display pending registrations
├── Statistics: total, teachers, students
├── Filter by role
├── Approve button → POST /approveUser
│   └── Generates ID, sends email
├── Reject button → POST /rejectUser
│   └── Modal for rejection reason
└── Auto-refresh every 30 seconds
```

---

## ID Generation System

### Generating Staff IDs (Teachers)

```javascript
// utils/idGenerator.js
export const generateStaffId = () => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return "TCH-" + timestamp + random;
};
// Example: TCH-12045
```

### Generating Registration Numbers (Students)

```javascript
export const generateStudentRegNo = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return "STU-" + timestamp + random;
};
// Example: STU-123456789
```

**Why timestamp + random?**
- Timestamp ensures uniqueness across time
- Random suffix prevents collision
- Human-readable format
- Can be sorted by creation time

---

## Approval Status State Machine

```
┌────────────┐
│   signup   │  ← Teacher/Student registers
└─────┬──────┘
      │
      ↓
 ┌─────────────┐
 │   PENDING   │  ← Awaiting admin review
 └─────┬───────┘
       │
    ┌──┴──┐
    ↓     ↓
┌─────────┐ ┌───────────┐
│APPROVED │ │ REJECTED  │
└────┬────┘ └───────────┘
     │
     ↓
CAN LOGIN
     │
     ↓
DASHBOARD ACCESS
```

---

## API Flow Diagrams

### User Signup & Approval Flow

```
Client                Server                Database
  │                     │                      │
  ├─POST /teacherSignup─→                      │
  │                     ├─Check email exists──→│
  │                     │                 No? ↓
  │                     ├─Hash password        │
  │                     │                      │
  │                     ├─Create user doc─────→│
  │                     │  {approvalStatus: "pending"}
  │                     │                      │
  │                     ├─Send email           │
  │                ←─Response OK───┐           │
  │                     │          │           │
  │ (waiting...)        │          │           │
  │                     │          │           │
  │ (admin approves)    │          │           │
  │                     │          │           │
  │ (email received)    │          │           │
  │                     │          │           │
  ├─POST /userLogin─────→          │           │
  │                     ├─Find user────────────→
  │                     │          ↓ {approvalStatus: "approved", staffId: "TCH-123"}
  │                     ├─Verify password      │
  │                     ├─Generate JWT         │
  │                ←─Response + Token──┐       │
  │                     │              │       │
  ├─GET /userDashboard──→              │       │
  │  (with token)       ├─Verify token │       │
  │                     ├─Get user doc────────→
  │                     │              ↓ Full user data
  │                ←─Response + Data───┐       │
  │                     │              │       │
 [Render Dashboard]     │              │       │
  │                     │              │       │
```

### Admin Approval Flow

```
Client                Server                Database
  │                     │                      │
  ├─GET /pendingUsers───→                      │
  │                     ├─Verify admin────────→
  │                     │                      │
  │                     ├─Query users with─────→
  │                     │  approvalStatus: "pending"
  │                     │                      │
  │                ←─Array of users───┐        │
  │                     │              │       │
 [Admin sees pending]   │              │       │
  │                     │              │       │
  ├─POST /approveUser───→              │       │
  │  {userId, adminEmail}             │       │
  │                     ├─Verify admin────────→
  │                     │                      │
  │                     ├─Generate staffId     │
  │                     │                      │
  │                     ├─Update user doc─────→│
  │                     │  {staffId: "TCH-123"
  │                     │   approvalStatus: "approved"}
  │                     │                      │
  │                     ├─Send email           │
  │                     │  (with staffId)      │
  │                ←─Success response──┐       │
  │                     │              │       │
 [Notification shown]   │              │       │
```

---

## Security & Authentication

### Password Security
- Hashed with **bcryptjs** (salt rounds: 10)
- Never stored as plain text
- Verified on login using `bcrypt.compare()`

### Token System
- **JWT (JSON Web Token)** with 24h expiration
- Contains: `{id, role, email}`
- Stored in localStorage (client-side)
- Verified on protected routes

### Approval Gate
- Users cannot login until `approvalStatus === "approved"`
- Admin has full access via admin role
- Email verification via admin approval

### Database Security
- Email fields are unique (prevents duplicates)
- ID fields are unique and sparse
- References between collections (foreign keys)
- Validation on server-side

---

## Error Handling

```
User Signup
├── Email already registered? → Return error
├── School code invalid? → Return error
└── Password too short? → Return error

User Login
├── Email not found? → "Invalid email or password"
├── Password incorrect? → "Invalid email or password"
├── Status not approved? → "Account not yet approved"
└── Success → Generate token + redirect

Admin Operations
├── Not authenticated as admin? → 401 Unauthorized
├── User not found? → 404 Not Found
├── Database error? → 500 Server Error
└── Success → Updated + email sent
```

---

## Future Enhancement Opportunities

```
Current System:
├── User registration
├── Admin approval
├── ID generation
└── Role-based access

Can Add:
├── Attendance Marking
│   ├── Daily check-in/out
│   ├── Mark by QR code
│   └── Manual by teacher
│
├── Reports & Analytics
│   ├── Attendance percentage
│   ├── Absence patterns
│   └── Export to CSV
│
├── Advanced Features
│   ├── Two-factor auth
│   ├── Bulk import users
│   ├── Department management
│   └── Class scheduling
│
└── Notifications
    ├── SMS alerts
    ├── Push notifications
    └── Parent notifications
```

---

## Deployment Checklist

- [ ] Environment variables set (.env)
- [ ] MongoDB Atlas cluster created
- [ ] Gmail app password generated
- [ ] CORS properly configured
- [ ] JWT_SECRET is strong
- [ ] Error handling tested
- [ ] All endpoints working
- [ ] Email sending verified
- [ ] Security headers added
- [ ] Rate limiting implemented
- [ ] Logging enabled
- [ ] Backup strategy in place

