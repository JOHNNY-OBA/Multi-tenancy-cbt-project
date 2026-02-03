# Complete Testing Example

## Step-by-Step Testing Walkthrough

This document shows exactly how to test your complete system end-to-end.

---

## Prerequisites

✅ Node.js installed  
✅ MongoDB running (local or cloud)  
✅ .env file configured  
✅ `npm install` completed  
✅ `node server.js` running  

---

## Test Scenario 1: Teacher Approval Flow

### Step 1: Teacher Signup

**URL:** `http://localhost:5000/teacher-signup.html`

**Fill Form:**
```
Full Name:    John Smith
Email:        john.smith@example.com
Password:     TestPassword123
Phone:        +1-555-1234
Department:   Mathematics
School Code:  SCHOOL001
```

**Click:** Create Account

**Expected Result:**
```
✓ Signup successful! Check your email for updates.
→ Redirects to login.html after 2 seconds
```

**Database State:**
```
{
  _id: ObjectId,
  role: "teacher",
  fullName: "John Smith",
  email: "john.smith@example.com",
  password: "hashed_password",
  phoneNumber: "+1-555-1234",
  department: "Mathematics",
  registrationNumber: "STU-123456789",
  approvalStatus: "pending",  ← KEY: Not approved yet
  createdAt: 2024-01-28...
}
```

**Email Received:**
```
Subject: Teacher Registration Submitted
Body: 
- Dear John Smith,
- Your teacher registration has been submitted 
  and is pending approval from the school admin.
- You will receive another email once your 
  account is approved.
```

---

### Step 2: Teacher Tries to Login (Before Approval)

**URL:** `http://localhost:5000/login.html`

**Select:** "Student/Teacher" tab

**Fill Form:**
```
Email:    john.smith@example.com
Password: TestPassword123
```

**Click:** Login

**Expected Result:**
```
✗ Your account is not yet approved. 
  Please wait for admin approval.
```

**Why?** `approvalStatus: "pending"` (not "approved" yet)

---

### Step 3: Admin Reviews & Approves

**URL:** `http://localhost:5000/login.html`

**Select:** "Admin" tab

**Fill Form:**
```
Email:    admin@example.com
Password: AdminPassword123
```

**Click:** Login

**Redirects to:** `admin-dashboard.html`

**Displays:**
```
PENDING APPROVALS: 1
├── Teachers: 1
└── Students: 0

Pending Users Table:
┌──────────────┬──────────────────────┬────────┐
│ Name         │ Email                │ Role   │
├──────────────┼──────────────────────┼────────┤
│ John Smith   │ john.smith@...       │ TEACH  │
└──────────────┴──────────────────────┴────────┘
   [Approve] [Reject]
```

**Click:** Approve button for John Smith

**Backend Does:**
```javascript
1. Verify admin is logged in ✓
2. Find John's user document
3. Generate Staff ID: "TCH-12045"
4. Update document:
   {
     staffId: "TCH-12045",
     approvalStatus: "approved",  ← Changed from "pending"
     approvedAt: Date.now(),
     approvedBy: adminObjectId
   }
5. Send approval email to john.smith@example.com
```

**Expected Result:**
```
✓ User approved successfully!
Generated ID: TCH-12045
```

**Dashboard Updates:**
```
PENDING APPROVALS: 0 ← Count decreased
├── Teachers: 0
└── Students: 0

[No pending users - All approved!]
```

**Email Received by John:**
```
Subject: Account Approved!

Body:
- Dear John Smith,
- Congratulations! Your teacher account 
  has been approved.
- Staff ID: TCH-12045
- You can now log in to your dashboard 
  using your email and password.
- [Login Now]
```

**Database State (Updated):**
```
{
  _id: ObjectId,
  role: "teacher",
  fullName: "John Smith",
  email: "john.smith@example.com",
  staffId: "TCH-12045",           ← NEW
  registrationNumber: "STU-123456789",
  approvalStatus: "approved",     ← CHANGED
  approvedAt: Date.now(),         ← NEW
  approvedBy: ObjectId,           ← NEW (admin's ID)
  createdAt: 2024-01-28...
}
```

---

### Step 4: Teacher Logs In (After Approval)

**URL:** `http://localhost:5000/login.html`

**Select:** "Student/Teacher" tab

**Fill Form:**
```
Email:    john.smith@example.com
Password: TestPassword123
```

**Click:** Login

**Backend Does:**
```javascript
1. Find user with email "john.smith@example.com"
2. Verify password matches
3. Check approvalStatus === "approved" ✓
4. Generate JWT token
5. Return token + user data
```

**Frontend Does:**
```javascript
localStorage.setItem("userToken", jwt_token);
localStorage.setItem("userId", ObjectId);
localStorage.setItem("userRole", "teacher");
localStorage.setItem("userEmail", "john.smith@example.com");
```

**Expected Result:**
```
✓ Login successful!
→ Redirects to teacher-dashboard.html
```

---

### Step 5: Teacher Accesses Dashboard

**URL:** `http://localhost:5000/teacher-dashboard.html`

**Page Loads:**
1. Checks localStorage for "userToken" ✓
2. Calls GET `/userDashboard/:userId`
3. Returns full user document

**Displays:**
```
┌─ Welcome, John Smith! 👋 ─────────────┐
│ Email: john.smith@example.com         │
│ Department: Mathematics               │
│ Status: ✓ Approved                    │
└───────────────────────────────────────┘

┌─ STAFF ID ────────┬─ REGISTRATION NUMBER ─┐
│                  │                        │
│   TCH-12045      │   STU-123456789        │
│                  │                        │
│ Your Unique      │   System ID            │
│ Identifier       │                        │
└──────────────────┴────────────────────────┘

RECENT ATTENDANCE RECORDS:
(No records yet)
```

**Success!** ✓ Teacher can now:
- View their dashboard
- See their Staff ID (TCH-12045)
- See their registration number
- Access attendance records (when feature added)
- Logout anytime

---

## Test Scenario 2: Student Approval Flow (Similar to Above)

### Quick Version:
1. **Student signs up** at `student-signup.html`
   - Fields: Full Name, Email, Password, Phone, School Code
   
2. **Admin approves** at `admin-dashboard.html`
   - Generates Registration Number: STU-123456789
   
3. **Student logs in** at `login.html`
   - Selects "Student/Teacher" tab
   - Enters credentials
   
4. **Views dashboard** at `student-dashboard.html`
   - Shows Registration Number (STU-123456789)
   - Shows account status

---

## Test Scenario 3: Rejection Flow

### Step 1: New Teacher Signup
Same as above, but we'll reject this time.

### Step 2: Admin Rejects
**At admin-dashboard.html:**

**Click:** Reject button for teacher

**Modal Appears:**
```
┌─ Reject User Registration ────────────────┐
│                                           │
│ Are you sure you want to reject this user?
│                                           │
│ Reason (Optional):                        │
│ ┌─────────────────────────────────────┐  │
│ │ Does not meet qualifications        │  │
│ └─────────────────────────────────────┘  │
│                                           │
│        [Cancel]        [Reject]           │
└─────────────────────────────────────────┘
```

**Click:** Reject

**Backend Does:**
```javascript
1. Update user document:
   {
     approvalStatus: "rejected"
   }
2. Send rejection email with reason
```

**Expected Result:**
```
✓ User rejected successfully!
```

**Email Received:**
```
Subject: Registration Not Approved

Body:
- Dear [Teacher Name],
- Your registration has not been approved 
  at this time.
- Reason: Does not meet qualifications
- Please contact your school administration 
  for more details.
```

**Database State:**
```
{
  approvalStatus: "rejected",  ← Changed from "pending"
  [other fields unchanged]
}
```

**When User Tries to Login:**
```
✗ Your account is not yet approved. 
  Please wait for admin approval.
```

---

## Test Scenario 4: Filtering in Admin Dashboard

**At admin-dashboard.html:**

**Scenario:** You have:
- 3 teachers pending
- 2 students pending

**Filter Dropdown:**
```
Select: "Teachers"
```

**Display Updates:**
```
PENDING APPROVALS: 3 ← Shows teachers only

Teacher 1 [Approve] [Reject]
Teacher 2 [Approve] [Reject]
Teacher 3 [Approve] [Reject]

Students hidden ✓
```

**Select:** "Students"

**Display Updates:**
```
PENDING APPROVALS: 2 ← Shows students only

Student 1 [Approve] [Reject]
Student 2 [Approve] [Reject]

Teachers hidden ✓
```

**Select:** "" (All Roles)

**Display Updates:**
```
PENDING APPROVALS: 5 ← All shown

Teacher 1 [Approve] [Reject]
Teacher 2 [Approve] [Reject]
Teacher 3 [Approve] [Reject]
Student 1 [Approve] [Reject]
Student 2 [Approve] [Reject]
```

---

## Database Queries Reference

### View All Pending Users
```javascript
db.admins.find({ approvalStatus: "pending" })
```

### View All Approved Teachers
```javascript
db.admins.find({ 
  role: "teacher", 
  approvalStatus: "approved" 
})
```

### Check User by Email
```javascript
db.admins.findOne({ email: "john.smith@example.com" })
```

### Count Statistics
```javascript
// Pending
db.admins.countDocuments({ approvalStatus: "pending" })

// Teachers
db.admins.countDocuments({ role: "teacher" })

// Students
db.admins.countDocuments({ role: "student" })
```

---

## Expected Database State After Tests

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "role": "teacher",
    "fullName": "John Smith",
    "email": "john.smith@example.com",
    "password": "$2b$10$...[hashed]...",
    "phoneNumber": "+1-555-1234",
    "department": "Mathematics",
    "registrationNumber": "STU-123456789",
    "staffId": "TCH-12045",
    "approvalStatus": "approved",
    "approvedAt": "2024-01-28T10:30:00Z",
    "approvedBy": "507f1f77bcf86cd799439012",
    "status": "active",
    "createdAt": "2024-01-28T10:25:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "role": "student",
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "$2b$10$...[hashed]...",
    "phoneNumber": "+1-555-5678",
    "registrationNumber": "STU-987654321",
    "approvalStatus": "approved",
    "approvedAt": "2024-01-28T10:32:00Z",
    "approvedBy": "507f1f77bcf86cd799439012",
    "status": "active",
    "createdAt": "2024-01-28T10:28:00Z"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "role": "teacher",
    "fullName": "Bob Johnson",
    "email": "bob.johnson@example.com",
    "password": "$2b$10$...[hashed]...",
    "phoneNumber": "+1-555-9012",
    "department": "English",
    "registrationNumber": "STU-456789012",
    "approvalStatus": "rejected",
    "status": "active",
    "createdAt": "2024-01-28T10:29:00Z"
  }
]
```

---

## Console Output (Should Look Like)

**Server Console:**
```
MongoDB connected
Server running on port 5000

[Teacher Signup]
POST /teacherSignup → 201 Created

[Admin Approval]
GET /pendingUsers/admin@example.com → 200 OK
POST /approveUser → 200 OK
✉️ Email sent: Account Approved!

[Teacher Login]
POST /userLogin → 200 OK
JWT token generated

[Dashboard Load]
GET /userDashboard/507f... → 200 OK
```

**Browser Console (No Errors):**
```
✓ Signup successful
✓ Login successful
✓ Dashboard loaded
No 404 errors
No 500 errors
```

---

## Success Criteria Checklist

- [ ] Teachers can signup
- [ ] Students can signup
- [ ] Admin can view pending users
- [ ] Admin can approve users
- [ ] Admin can reject users
- [ ] Teachers receive approval email with Staff ID
- [ ] Students receive approval email
- [ ] Teachers cannot login before approval
- [ ] Students cannot login before approval
- [ ] Teachers can login after approval
- [ ] Students can login after approval
- [ ] Teacher dashboard shows Staff ID
- [ ] Student dashboard shows Registration Number
- [ ] Logout clears localStorage
- [ ] Rejected users get rejection email
- [ ] Filter works in admin dashboard
- [ ] Statistics update correctly
- [ ] No console errors
- [ ] All API calls return correct status codes
- [ ] Email sending works

✅ If all pass → **System is working correctly!**

