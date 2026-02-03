# CBT System – Role-Based Access with Admin Approval

## Overview of what has been done

This repository contains a role-based attendance management system built with **Node.js, Express, MongoDB, and JWT authentication**. The system enforces **admin-controlled onboarding**, ensuring that only approved users can access protected resources.

The application is designed with a strong emphasis on:

* Security best practices
* Clear separation of concerns
* Role-based access control (RBAC)
* Safe, non-revealing user-facing responses

### Supported Roles

* **Student**
* **Teacher**
* **Admin**

Students and teachers must be explicitly approved by an admin before they can authenticate and access their respective dashboards.

---

## Design Goals

* Prevent unauthorized access through approval gating
* Eliminate privilege escalation via strict role checks
* Avoid account enumeration through generic auth responses
* Keep internal logic and identifiers opaque to clients
* Maintain a clean, extensible backend structure

---

## Project Structure

```
attendance/
├── models/
│   ├── user.js               # Mongoose user schema (students, teachers, admins)
│   └── school.js             # School schema
├── utils/
│   └── idGenerator.js        # Internal unique ID generation
├── middleware/
│   └── auth.js               # JWT authentication & role authorization
├── server.js                 # Express application entry point
├── public/
│   ├── login.html
│   ├── teacher-signup.html
│   ├── student-signup.html
│   ├── admin-dashboard.html
│   ├── teacher-dashboard.html
│   ├── student-dashboard.html
│   └── style.css
└── .env
```

---

## Registration & Approval Flow

### Teacher Registration

1. Teacher submits registration details.
2. User record is created with `approvalStatus = "pending"`.
3. Confirmation email is sent.
4. Admin reviews the request.
5. On approval, the system generates a unique internal identifier.
6. Teacher is notified and can log in to access the dashboard.

> Internal ID formats and approval logic are not exposed to the client.

---

### Student Registration

1. Student submits registration details.
2. User record is created with `approvalStatus = "pending"`.
3. Confirmation email is sent.
4. Admin reviews the request.
5. On approval, the student is notified and granted access.

---

## Admin Capabilities

Authenticated admins can:

* View all pending registrations
* Filter requests by role
* Approve or reject users
* Monitor pending approval counts

All admin routes are protected by JWT authentication and role-based middleware.

---

## Authentication & Authorization

* Authentication is handled using **JWT**
* Authorization is enforced via middleware that validates:

  * Token authenticity
  * User role
  * Account approval status

### Access Rules

* Pending or rejected users cannot authenticate
* Users can only access routes permitted to their role
* Admin-only actions cannot be invoked by non-admins
* Role or identity is never inferred from client payloads

---

## API Endpoints

### Authentication

```
POST /auth/teacher/register
POST /auth/student/register
POST /auth/login
```

Authentication responses are intentionally generic to prevent user enumeration.

---

### Admin (Protected)

```
GET  /admin/pending-users
POST /admin/approve-user
POST /admin/reject-user
```

Admin identity and permissions are derived exclusively from the JWT token.

---

## Identifier Management

* User identifiers are generated server-side upon approval
* Identifier formats are treated as implementation details
* Identifiers are unique, non-guessable, and immutable
* Identifiers are never used as login credentials

---

## User Schema (Simplified)

```js
{
  role: "student" | "teacher" | "admin",
  fullName: String,
  email: { type: String, unique: true },
  password: String, // bcrypt-hashed
  phoneNumber: String,
  department: String,
  schoolId: ObjectId,

  uniqueId: String,

  approvalStatus: "pending" | "approved" | "rejected",
  approvedAt: Date,
  approvedBy: ObjectId,

  status: "active" | "inactive",
  createdAt: Date
}
```

---

## Environment Variables

```env
MONGO_URI=your_database_connection
JWT_SECRET=strong_random_secret
EMAIL_PROVIDER_API_KEY=secure_key
```

Use app-specific credentials or email APIs. Never store raw email passwords.

---

## Security Considerations

* Passwords hashed using bcrypt
* JWT-based stateless authentication
* Role-based authorization middleware
* Generic error and auth responses
* Unique database constraints
* Approval-based access gating
* Input validation and sanitization

---

## Troubleshooting

| Issue              | Resolution                               |
| ------------------ | ---------------------------------------- |
| Login fails        | Verify credentials and approval status   |
| Access denied      | Ensure the account has been approved     |
| Email not received | Check spam or email configuration        |
| Token errors       | Clear client storage and re-authenticate |

---

## Planned Enhancements

* Attendance tracking
* Attendance analytics and reports
* Class and subject management
* CBT Application
* LMS Application 
* Parent/guardian notifications
* Mobile client
* Two-factor authentication
* Rate limiting
* Audit and activity logging

---

## Notes

This system is intentionally conservative in what it exposes to clients. Internal workflows, identifiers, and authorization logic are treated as private implementation details to reduce attack surface and improve long-term maintainability.
