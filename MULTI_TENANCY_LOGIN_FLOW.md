# Multi-Tenancy CBT Website - Login Flow Documentation

## Overview
This document describes the new multi-tenancy login flow for the attendance system. The flow now implements school-first selection before role-based login.

## Login Flow - 3 Step Process

### Step 1: School Selection
Users start by searching for their school by code or name.

**Frontend:**
- Input field for school code or name
- Auto-complete suggestions appear as user types
- Displays: School Name, Code, Type, State

**Backend Endpoint:**
```
GET /searchSchools?query={query}
```

Returns verified schools matching the query with:
- `_id`: School MongoDB ID
- `schoolName`: Name of the school
- `schoolCode`: School code
- `schoolType`: Type (Primary, Secondary, etc.)
- `state`: State/Province

### Step 2: Role Selection
After school is selected, user chooses their role:
- **Student**: For student users
- **Teacher**: For teaching staff
- **Admin**: For school administrators

### Step 3: Credentials Login
Based on the selected role, user provides login credentials:
- **Email**: User email address
- **Password**: User password

## Login Endpoints

### User Login (Student/Teacher)
```
POST /userLogin
Headers: Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student" or "teacher",
  "schoolId": "MongoDB school ID"
}

Response (Success):
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "staffId": null,
    "registrationNumber": "STU123456",
    "schoolId": "school_id"
  }
}

Response (Error):
{
  "message": "Your account is not yet approved. Please wait for admin approval."
}
```

### Admin Login
```
POST /adminLogin
Headers: Content-Type: application/json

Body:
{
  "email": "admin@example.com",
  "password": "password123",
  "schoolId": "MongoDB school ID"
}

Response (Success):
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "admin": {
    "id": "admin_id",
    "fullName": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "schoolId": "school_id"
  }
}
```

## Frontend Implementation

### Helper Functions (auth.js)

**`userLogin(email, password, role, schoolId)`**
- Calls `/userLogin` endpoint
- Stores user data in localStorage:
  - `userToken`
  - `userId`
  - `userRole`
  - `userEmail`
  - `schoolId` (multi-tenancy)

**`adminLogin(email, password, schoolId)`**
- Calls `/adminLogin` endpoint
- Stores admin data in localStorage:
  - `adminToken`
  - `adminId`
  - `adminEmail`
  - `schoolId` (multi-tenancy)

**`getCurrentUser()`**
- Returns current user from localStorage
- Includes school context

**`getCurrentAdmin()`**
- Returns current admin from localStorage
- Includes school context

**`logout()`**
- Clears all authentication data
- Redirects to login page

**`isUserAuthenticated()`**
- Checks if user token exists

**`isAdminAuthenticated()`**
- Checks if admin token exists

### Frontend Navigation

After successful login, users are redirected:
- **Student**: `student-dashboard.html`
- **Teacher**: `teacher-dashboard.html`
- **Admin**: `admin-dashboard.html`

## Multi-Tenancy Features

### School Verification
- Only verified schools appear in search results
- Query: `isVerified: true`

### Data Isolation
- All user queries include `schoolId` filter
- Admin can only access users within their school
- Teachers/Students only see data for their school

### JWT Token Payload
Tokens include school context:
```javascript
{
  id: user_id,
  role: user_role,
  email: user_email,
  schoolId: school_id,
  iat: timestamp,
  exp: expiration
}
```

### Approval Workflow
1. User signs up with school code
2. Account status: `pending`
3. Admin approves user
4. IDs generated:
   - Teacher: Staff ID (e.g., "STF2024001")
   - Student: Registration Number (e.g., "STU20240001")
5. Email notification sent
6. User can now login

## Data Storage

### localStorage Keys
```javascript
// User session
userToken              // JWT token
userId                 // User ID
userRole              // student/teacher
userEmail             // User email
schoolId              // School ID (multi-tenancy)
schoolName            // School name (display)

// Admin session
adminToken            // JWT token
adminId              // Admin ID
adminEmail           // Admin email
schoolId             // School ID (multi-tenancy)
schoolName           // School name (display)
```

## Security Considerations

1. **Password Hashing**: All passwords hashed with bcryptjs
2. **JWT Authentication**: Tokens expire after 24 hours
3. **School Isolation**: schoolId validation on all endpoints
4. **Role-Based Access**: Endpoints verify user role
5. **Email Verification**: School and Admin registration require email verification

## Error Handling

Common errors returned:
- `Invalid school`: School not found or not verified
- `Invalid email or password`: Authentication failed
- `Your account is not yet approved`: Awaiting admin approval
- `Unauthorized`: Invalid token or insufficient permissions
- `Server error`: Internal server error

## Migration Notes

### Old Endpoints (Deprecated)
- `POST /login` (school-only login) - REMOVED
- `POST /userLogin` without schoolId - REPLACED with multi-tenancy version
- `POST /adminLogin` without schoolId - REPLACED with multi-tenancy version
- `GET /pendingUsers/:adminEmail` - REPLACED with JWT-based version
- `POST /approveUser` (email-based) - REPLACED with JWT-based version

### New Files/Functions Added
- `login.html`: Updated with 3-step flow
- `auth.js`: New helper functions for multi-tenancy
- `server.js`: New `/searchSchools` endpoint
- Multi-tenancy validation in all user operations

## Testing Checklist

- [ ] School search returns only verified schools
- [ ] School search filters by name and code
- [ ] Role selection updates UI correctly
- [ ] Student login stores correct localStorage keys
- [ ] Teacher login stores correct localStorage keys
- [ ] Admin login stores correct localStorage keys
- [ ] Logout clears all localStorage data
- [ ] JWT token includes schoolId
- [ ] Unapproved users cannot login
- [ ] Wrong password shows error
- [ ] Invalid school shows error
- [ ] Multiple users from different schools work independently
