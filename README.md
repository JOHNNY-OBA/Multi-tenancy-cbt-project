# Attendance System - Role-Based Access with Admin Approval

## System Overview

This is a complete role-based attendance system where:
- **Teachers** and **Students** can signup and await admin approval
- **Admin** approves or rejects registrations and generates unique IDs
- Teachers access via **Staff ID** (format: TCH-XXXXX)
- Students access via **Registration Number** (format: STU-XXXXXXX)
- Each user has their own dashboard after approval

---

## Project Structure

```
attendance/
├── models/
│   ├── admin.js              # User schema (students, teachers, admins)
│   └── school.js             # School registration schema
├── utils/
│   └── idGenerator.js        # Generates unique Staff IDs and Student IDs
├── server.js                 # Express backend with all endpoints
├── auth.js                   # Client-side authentication logic
├── style.css                 # Global styles
├── login.html                # Unified login page
├── teacher-signup.html       # Teacher registration form
├── student-signup.html       # Student registration form
├── teacher-dashboard.html    # Teacher dashboard
├── student-dashboard.html    # Student dashboard
├── admin-dashboard.html      # Admin approval panel
├── adminsign.html            # Admin registration
├── signup.html               # School registration
└── index.html                # Home page
```

---

## Key Features

### 1. **Teacher Signup & Approval Flow**
- Teacher fills registration form with email, password, phone, department
- System generates temporary **Registration Number** (STU-XXXXX)
- Admin reviews and approves
- Upon approval: **Staff ID** (TCH-XXXXX) is generated
- Teacher receives approval email with Staff ID
- Can now login and access dashboard

### 2. **Student Signup & Approval Flow**
- Student fills registration form with email, password, phone
- System generates temporary **Registration Number** (STU-XXXXX)
- Admin reviews and approves
- Upon approval: Final **Registration Number** is confirmed
- Student receives approval email
- Can now login and access dashboard

### 3. **Admin Approval Panel**
- View all pending teacher and student registrations
- Filter by role (teachers/students)
- Approve users (generates unique IDs, sends email)
- Reject users (optional reason provided)
- Real-time statistics of pending approvals

### 4. **Role-Based Access**
- Students/Teachers cannot access dashboard until **approved**
- Login checks approval status before granting access
- Each role has dedicated dashboard
- Logout clears authentication

---

## API Endpoints

### Teacher/Student Operations

```
POST /teacherSignup
{
  fullName: string,
  email: string,
  password: string,
  phoneNumber: string,
  department: string,
  schoolCode: string
}

POST /studentSignup
{
  fullName: string,
  email: string,
  password: string,
  phoneNumber: string,
  schoolCode: string
}

POST /userLogin
{
  email: string,
  password: string
}
Returns: { token, user: { id, fullName, email, role, staffId, registrationNumber } }

GET /userDashboard/:userId
Returns: { user: { all user data } }
```

### Admin Operations

```
GET /pendingUsers/:adminEmail
Returns: { pendingUsers: [] }

POST /approveUser
{
  userId: string,
  adminEmail: string
}
Returns: { message, generatedId }

POST /rejectUser
{
  userId: string,
  adminEmail: string,
  reason: string (optional)
}

POST /adminLogin
{
  email: string,
  password: string
}
Returns: { message, token }
```

---

## User Registration Numbers & IDs

### ID Generation Logic

**Staff ID (Teachers)**
- Format: `TCH-XXXXX` (e.g., TCH-12345)
- Generated on admin approval
- Unique per teacher
- Used for teacher identification

**Registration Number (Students)**
- Format: `STU-XXXXXXX` (e.g., STU-123456789)
- Generated on admin approval
- Unique per student
- Used for student identification

---

## Database Schema

### User Schema (admin.js)
```javascript
{
  role: "teacher" | "student" | "admin",
  fullName: string,
  email: string (unique),
  password: string (hashed with bcrypt),
  phoneNumber: string,
  department: string (teachers only),
  schoolId: ObjectId (reference to school),
  
  // Generated IDs
  staffId: string (teachers),
  registrationNumber: string (students),
  
  // Approval System
  approvalStatus: "pending" | "approved" | "rejected",
  approvedAt: Date,
  approvedBy: ObjectId (admin who approved),
  
  // Account Status
  status: "active" | "inactive",
  createdAt: Date
}
```

---

## Setup & Running

### Prerequisites
- Node.js
- MongoDB
- Gmail account (for email notifications)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/attendance
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Start server:**
   ```bash
   node server.js
   ```

4. **Open in browser:**
   ```
   http://localhost:5000
   ```

---

## User Flows

### Teacher Flow
1. Visit `teacher-signup.html`
2. Fill registration form
3. Submit (account created with `approvalStatus: "pending"`)
4. Wait for admin approval (email notification)
5. Upon approval: Receive email with Staff ID
6. Login at `login.html` → Select "Student/Teacher" → Enter credentials
7. Access `teacher-dashboard.html` showing Staff ID and registration info

### Student Flow
1. Visit `student-signup.html`
2. Fill registration form
3. Submit (account created with `approvalStatus: "pending"`)
4. Wait for admin approval (email notification)
5. Upon approval: Receive email with confirmation
6. Login at `login.html` → Select "Student/Teacher" → Enter credentials
7. Access `student-dashboard.html` showing Registration Number and info

### Admin Flow
1. Login at `login.html` → Select "Admin"
2. Access `admin-dashboard.html`
3. View pending teacher and student registrations
4. Click "Approve" or "Reject"
5. System automatically generates ID and sends email
6. View real-time statistics of approvals

---

## Security Features

- Passwords hashed with **bcryptjs**
- JWT token-based authentication
- Role-based access control
- Email verification for critical actions
- Unique constraints on email and IDs
- Admin approval gate for user access

---

## Email Templates

### Teacher Registration Pending
- Sent to teacher upon signup
- Confirms submission and indicates pending approval

### Student Registration Pending
- Sent to student upon signup
- Confirms submission and indicates pending approval

### Account Approved
- Sent upon admin approval
- Includes generated Staff ID or Registration Number
- Contains login link

### Account Rejected
- Sent upon admin rejection
- Includes optional reason
- Directs to contact school administration

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "User not found" on login | Check email spelling, ensure account was created |
| "Account not yet approved" | Wait for admin approval, check email |
| Email not received | Check spam folder, verify GMAIL_USER and GMAIL_PASS |
| Can't submit signup | Verify school code exists and is entered correctly |
| Invalid token error | Clear localStorage, login again |
| MongoDB connection error | Check MONGO_URI in .env file |

---

## Future Enhancements

- [ ] Attendance marking feature
- [ ] Attendance reports and analytics
- [ ] Class management for teachers
- [ ] Parent notifications
- [ ] Mobile app
- [ ] Two-factor authentication
- [ ] Bulk user import from CSV
- [ ] User dashboard customization
- [ ] API rate limiting
- [ ] Activity logging

---

## Support

For issues or questions, check server console logs and browser developer tools for detailed error messages.

#   M u l t i - t e n a n c y - c b t - p r o j e c t  
 