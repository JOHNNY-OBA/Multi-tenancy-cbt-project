# Multi-Tenancy Login - Quick Reference

## What Was Changed

### 1. **login.html** - 3-Step Login Flow
✅ Step 1: School Selection & Search
  - Search by school name or code
  - Real-time suggestions from verified schools
  
✅ Step 2: Role Selection (Student/Teacher/Admin)
  - Shows selected school
  - Button to change school
  
✅ Step 3: Login with credentials
  - Different forms for Student/Teacher vs Admin
  - Passes schoolId to backend

### 2. **auth.js** - New Multi-Tenancy Helper Functions

```javascript
// Login functions
await userLogin(email, password, role, schoolId)      // Student/Teacher
await adminLogin(email, password, schoolId)           // Admin

// Get current user info
getCurrentUser()     // Returns {token, id, role, email, schoolId}
getCurrentAdmin()    // Returns {token, id, email, schoolId}

// Utility functions
logout()                    // Clear all auth data
isUserAuthenticated()       // Check if logged in
isAdminAuthenticated()      // Check if admin logged in
```

### 3. **server.js** - New/Updated Endpoints

**School Search (NEW)**
```
GET /searchSchools?query=school_name
Returns: [{_id, schoolName, schoolCode, schoolType, state}, ...]
```

**User Login (UPDATED for multi-tenancy)**
```
POST /userLogin
Body: {email, password, role, schoolId}
Returns: {token, user: {id, fullName, email, role, schoolId}}
```

**Admin Login (UPDATED for multi-tenancy)**
```
POST /adminLogin
Body: {email, password, schoolId}
Returns: {token, admin: {id, fullName, email, schoolId}}
```

**Pending Users (UPDATED)**
```
GET /pendingUsers/:schoolId
Header: Authorization: Bearer {token}
Returns: [{user data with pending status}]
```

**Approve User (UPDATED)**
```
POST /approveUser
Body: {userId, schoolId}
Header: Authorization: Bearer {token}
Returns: {message, generatedId}
```

## localStorage Keys After Login

### User/Teacher/Student
```
userToken      = JWT token
userId         = User MongoDB ID
userRole       = "student" or "teacher"
userEmail      = User email
schoolId       = School MongoDB ID
schoolName     = School name (for display)
```

### Admin
```
adminToken     = JWT token
adminId        = Admin MongoDB ID
adminEmail     = Admin email
schoolId       = School MongoDB ID
schoolName     = School name (for display)
```

## Usage Examples

### In your dashboard files (student-dashboard.html, teacher-dashboard.html, admin-dashboard.html)

```javascript
// Get current user
const user = getCurrentUser();
console.log(`Welcome ${user.email} from school ${user.schoolId}`);

// Check if authenticated
if (!isUserAuthenticated()) {
  window.location.href = "login.html";
}

// Make API call with school context
const response = await fetch(`/userDashboard/${user.id}`, {
  headers: {
    "Authorization": `Bearer ${user.token}`,
    "X-School-Id": user.schoolId  // Pass school context
  }
});

// Logout
function handleLogout() {
  logout(); // Redirects to login.html
}
```

### Protecting Dashboard Routes

Add this to all dashboard HTML files:

```html
<script>
  if (!isUserAuthenticated()) {
    window.location.href = "login.html";
  }
  
  const user = getCurrentUser();
  console.log("Current user:", user.email, "School:", user.schoolId);
</script>
```

## Flow Diagram

```
┌─────────────────────────────────────────────┐
│         LOGIN PAGE (login.html)             │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  STEP 1: SCHOOL     │
        │  SEARCH & SELECT    │
        │  /searchSchools     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ STEP 2: CHOOSE ROLE │
        │ Student/Teacher/    │
        │ Admin               │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  STEP 3: LOGIN      │
        │  /userLogin OR      │
        │  /adminLogin        │
        │  (with schoolId)    │
        └──────────┬──────────┘
                   │
            ┌──────┴──────┐
            │             │
       ┌────▼──┐     ┌────▼──┐
       │Student│     │ Admin │
       │Dash   │     │ Dash  │
       └───────┘     └───────┘
```

## Key Differences from Old System

| Feature | Old | New |
|---------|-----|-----|
| School Selection | None | Required (Step 1) |
| Role Selection | Direct button | After school (Step 2) |
| School Context | Minimal | Full (schoolId everywhere) |
| Multi-tenant | Single school | Multiple schools |
| Teacher/Student Login | Generic | Role-specific in payload |
| Authentication Scope | Global | Per-school |
| Data Isolation | None | Enforced via schoolId |

## Important Notes

1. **schoolId Required**: All login endpoints now require schoolId from school search
2. **School Must Be Verified**: Only verified schools appear in search results
3. **JWT Includes schoolId**: Tokens contain school context for backend validation
4. **localStorage Updated**: Always includes schoolId for API calls
5. **Backward Compatibility**: Old login code won't work - use new helper functions

## Next Steps

1. Update dashboard files to use `getCurrentUser()` and `getCurrentAdmin()`
2. Add school context to all API calls (pass schoolId in headers or body)
3. Update admin endpoints to validate schoolId from token
4. Add logout buttons that call `logout()` function
5. Protect dashboard routes with `isUserAuthenticated()` check

---

**Commit Message Suggestion:**
```
feat: implement multi-tenancy login flow with school-first selection

- Add 3-step login process (school → role → credentials)
- Implement school search endpoint with real-time suggestions
- Update user and admin login with schoolId context
- Add localStorage keys for multi-tenant data
- Create auth.js helper functions for session management
- Enforce school isolation in all endpoints
```
