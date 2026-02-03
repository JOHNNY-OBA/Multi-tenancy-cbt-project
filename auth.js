const API_URL = "http://localhost:5000";

// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const schoolName = document.getElementById("SchoolName").value;
    const schoolEmail = document.getElementById("SchoolEmail").value;
    // const password = document.getElementById("password").value;
    const schoolType = document.getElementById("schoolType").value;
    const schoolCode = document.getElementById("schoolCode").value;
    const schoolPhoneNumber = document.getElementById("schoolPhoneNumber").value;
    const country = document.getElementById("country").value;
    const state = document.getElementById("state").value;
    const schoolAddress = document.getElementById("schoolAddress").value;
    // const adminFullName = document.getElementById("adminFullName").value;
    // const adminEmail = document.getElementById("adminEmail").value;
    // const adminPhoneNumber = document.getElementById("adminPhoneNumber").value;
    // const adminPassword = document.getElementById("adminPassword").value;
    // const message = document.getElementById("message");
    // const name = document.getElementById("name").value;
    // const email = document.getElementById("email").value;
    // const papssword = document.getElementById("password").value;
    // const role = document.getElementById("role").value;
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName, schoolEmail, schoolType, schoolCode, schoolPhoneNumber, country, state, schoolAddress })
      });

      const data = await res.json();
      message.textContent = data.message;

      if (res.ok) {
        message.textContent = "Registration successful";
        message.style.color = "green";
      }

    } catch (err) {
      message.textContent = "Server error";
    }
  });
}
const signupAdminform = document.getElementById("signupAdminform")

if(signupAdminform){
 signupAdminform.addEventListener("submit", async (e) => {
    e.preventDefault();


   try {
      const res = await fetch(`${API_URL}/adminRegister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role })
      });

      const data = await res.json();
      message.textContent = data.message;

      if (res.ok) {
        message.textContent = "Registration successful";
        message.style.color = "green";
      }

    } catch (err) {
      message.textContent = "Server error";
        message.style.color = "red";
      }
  });
}


// ============= MULTI-TENANCY LOGIN HELPER FUNCTIONS =============

/**
 * User Login (Student/Teacher) - Multi-tenancy
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (student or teacher)
 * @param {string} schoolId - School ID for multi-tenancy
 */
async function userLogin(email, password, role, schoolId) {
  try {
    const res = await fetch(`${API_URL}/userLogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, schoolId })
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message };
    }

    // Save multi-tenancy data
    localStorage.setItem("userToken", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userRole", data.user.role);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("schoolId", schoolId);

    return { success: true, user: data.user, token: data.token };

  } catch (err) {
    console.error("User login error:", err);
    return { success: false, message: "Server error" };
  }
}

/**
 * Admin Login - Multi-tenancy
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} schoolId - School ID for multi-tenancy
 */
async function adminLogin(email, password, schoolId) {
  try {
    const res = await fetch(`${API_URL}/adminLogin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, schoolId })
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message };
    }

    // Save multi-tenancy data
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminId", data.admin.id);
    localStorage.setItem("adminEmail", email);
    localStorage.setItem("schoolId", schoolId);

    return { success: true, admin: data.admin, token: data.token };

  } catch (err) {
    console.error("Admin login error:", err);
    return { success: false, message: "Server error" };
  }
}

/**
 * Get current user info from localStorage
 */
function getCurrentUser() {
  return {
    token: localStorage.getItem("userToken"),
    id: localStorage.getItem("userId"),
    role: localStorage.getItem("userRole"),
    email: localStorage.getItem("userEmail"),
    schoolId: localStorage.getItem("schoolId")
  };
}

/**
 * Get current admin info from localStorage
 */
function getCurrentAdmin() {
  return {
    token: localStorage.getItem("adminToken"),
    id: localStorage.getItem("adminId"),
    email: localStorage.getItem("adminEmail"),
    schoolId: localStorage.getItem("schoolId")
  };
}

/**
 * Logout function
 */
function logout() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminId");
  localStorage.removeItem("adminEmail");
  localStorage.removeItem("schoolId");
  localStorage.removeItem("schoolName");
  window.location.href = "login.html";
}

/**
 * Check if user is authenticated
 */
function isUserAuthenticated() {
  return localStorage.getItem("userToken") !== null;
}

/**
 * Check if admin is authenticated
 */
function isAdminAuthenticated() {
  return localStorage.getItem("adminToken") !== null;
}

