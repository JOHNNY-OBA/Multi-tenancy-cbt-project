import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import core from "cors";
import school from "./models/school.js";
import user from "./models/admin.js";
import nodemailer from "nodemailer";
import admin from "./models/admin.js";
import { generateStudentRegNo, generateStaffId } from "./utils/idGenerator.js";



const app = express();
app.use(express.json());
app.use(core());
// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));



// 1. Configure the Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

app.post("/register", async (req, res) => {
  try {
    const {
      schoolName,
      schoolEmail,
      schoolType,
      schoolCode,
      schoolPhoneNumber,
      country,
      state,
      schoolAddress,
      
    } = req.body;

    // Use 'School' (Capital S) to avoid initialization errors
    const existingSchool = await school.findOne({ schoolEmail });
    if (existingSchool) {
      return res.status(400).json({ message: "School already exists" });
    }

    // Hash the password
    // const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const newSchool = new school({
      schoolName,
      schoolEmail,
      schoolType,
      schoolCode,
      schoolPhoneNumber,
      country,
      state,
      schoolAddress,
      isVerified: false // Ensure this is in your Schema
    });

    await newSchool.save();

    // 2. Generate Verification Token
    const verificationToken = jwt.sign(
      { id: newSchool._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const verificationUrl = `http://localhost:5000/verify/${verificationToken}`;

    // 3. Send the Email
    await transporter.sendMail({
      from: `"School Registry" <${process.env.EMAIL_USER}>`,
      to: schoolEmail,
      subject: "Verify Your School Account",
      html: `
        <h2>Welcome to the Platform!</h2>
        <p>Please click the button below to verify your school registration:</p>
        <a href="${verificationUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(201).json({ message: "School registered! Please check your email to verify." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const school = await School.findByIdAndUpdate(decoded.id, { isVerified: true });

    if (!school) return res.status(404).send("User not found.");

    res.send("<h1>Email Verified!</h1><p>You can now log in to your dashboard.</p>");
  } catch (error) {
    res.status(400).send("Invalid or expired link.");
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { schoolCode} = req.body;

    // 1. Find the school
    const school_user = await School.findOne({ schoolCode });
    if (!school_user) {
      return res.status(400).json({ message: "Invalid School Code" });
    }

    // 2. CHECK VERIFICATION STATUS
    if (!school_user.isVerified) {
      return res.status(401).json({ 
        message: "Please verify your email before logging in. Check your inbox!" 
      });
    }


    // 4. Generate Login Token
    const token = jwt.sign(
      { id: school_user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
   
  
/* ================= VERIFY ROUTE ================= */
app.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const school = await School.findByIdAndUpdate(decoded.id, { isVerified: true });

    if (!school) return res.status(404).send("User not found.");

    res.send("<h1>Email Verified!</h1><p>You can now log in to your dashboard.</p>");
  } catch (error) {
    res.status(400).send("Invalid or expired link.");
  }
});

/*  =========  ADMIN REGISTER AND LOGIN ==========*/
 

/* ================= REGISTER ================= */
app.post("/adminRegister", async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
     password,
    } = req.body;

    const existingadmin = await admin.findOne({ email, password });
    if (existingadmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    
    const hashedAdminPassword = await bcrypt.hash(password, 10);

    const newAdmin = new admin({
      fullName,
      email,
      role,
     password,
      isVerified: false // Ensure this is in your Schema
    });

    await newAdmin.save();

    // 2. Generate Verification Token
    const verificationToken = jwt.sign(
      { id: newAdmin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    

    const verificationUrl = `http://localhost:5000/verify/${verificationToken}`;

    // 3. Send the Email
    await transporter.sendMail({
      from: `"Admin Registry" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Admin Account",
      html: `
        <h2>Welcome to the Platform!</h2>
        <p>Please click the button below to verify your admin registration:</p>
        <a href="${verificationUrl}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Account</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

res.status(201).json({
  message: "Admin registered! Please check your email to verify.",
 verificationToken: verificationToken // dev only
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= VERIFY ROUTE ================= */
app.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await admin.findByIdAndUpdate(decoded.id, { isVerified: true });

    if (!admin) return res.status(404).send("User not found.");

    res.send("<h1>Email Verified!</h1><p>You can now log in to your dashboard.</p>");
  } catch (error) {
    res.status(400).send("Invalid or expired link.");
  }
});

/* ================= LOGIN ================= */


/*  =========  TEACHER SIGNUP  ==========*/
app.post("/teacherSignup", async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, department, schoolCode } = req.body;

    // Find the school
    const schoolData = await school.findOne({ schoolCode });
    if (!schoolData) {
      return res.status(400).json({ message: "Invalid school code" });
    }

    // Check if teacher already exists
    const existingTeacher = await admin.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new teacher account
    const newTeacher = new admin({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      department,
      role: "teacher",
      schoolId: schoolData._id,
      approvalStatus: "pending",
      registrationNumber: generateStudentRegNo()
    });

    await newTeacher.save();

    // Send email notification to admin and teacher
    await transporter.sendMail({
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Teacher Registration Submitted",
      html: `
        <h2>Registration Submitted Successfully!</h2>
        <p>Dear ${fullName},</p>
        <p>Your teacher registration has been submitted and is pending approval from the school admin.</p>
        <p>You will receive another email once your account is approved.</p>
        <p>Best regards,<br>Attendance System</p>
      `,
    });

    res.status(201).json({ 
      message: "Teacher registration submitted. Awaiting admin approval.",
      userId: newTeacher._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*  =========  STUDENT SIGNUP  ==========*/
app.post("/studentSignup", async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, schoolCode } = req.body;

    // Find the school
    const schoolData = await school.findOne({ schoolCode });
    if (!schoolData) {
      return res.status(400).json({ message: "Invalid school code" });
    }

    // Check if student already exists
    const existingStudent = await admin.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student account
    const newStudent = new admin({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "student",
      schoolId: schoolData._id,
      approvalStatus: "pending",
      registrationNumber: generateStudentRegNo()
    });

    await newStudent.save();

    // Send email notification
    await transporter.sendMail({
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Student Registration Submitted",
      html: `
        <h2>Registration Submitted Successfully!</h2>
        <p>Dear ${fullName},</p>
        <p>Your student registration has been submitted and is pending approval from the school admin.</p>
        <p>You will receive another email once your account is approved.</p>
        <p>Best regards,<br>Attendance System</p>
      `,
    });

    res.status(201).json({ 
      message: "Student registration submitted. Awaiting admin approval.",
      userId: newStudent._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*  =========  MULTI-TENANCY: SCHOOL SEARCH  ==========*/
app.get("/searchSchools", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: "Query must be at least 2 characters long" });
    }

    // Search by school name or school code
    const schools = await school .find({
      isVerified: false,
      $or: [
        { schoolName: { $regex: query, $options: "i" } },
        { schoolCode: { $regex: query, $options: "i" } }
      ]
    }).select("_id schoolName schoolCode schoolType state").limit(10);

    res.status(200).json(schools);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*  =========  USER LOGIN - WITH MULTI-TENANCY  ==========*/
app.post("/userLogin", async (req, res) => {
  try {
    const { email, password, role, schoolId } = req.body;

    // Verify school exists
    const schoolData = await school.findById(schoolId);
    if (!schoolData) {
      return res.status(400).json({ message: "Invalid school" });
    }

    // Find user
    const user = await admin.findOne({ 
      email, 
      schoolId,
      role: role || { $in: ["teacher", "student"] }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check approval status
    if (user.approvalStatus !== "approved") {
      return res.status(403).json({ 
        message: "Your account is not yet approved. Please wait for admin approval." 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token with multi-tenancy info
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, schoolId: schoolId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        staffId: user.staffId,
        registrationNumber: user.registrationNumber,
        schoolId: schoolId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*  =========  ADMIN LOGIN - WITH MULTI-TENANCY  ==========*/
app.post("/adminLogin", async (req, res) => {
  try {
    const { email, password, schoolId } = req.body;

    // Verify school exists
    const schoolData = await school.findById(schoolId);
    if (!schoolData) {
      return res.status(400).json({ message: "Invalid school" });
    }

    // Find admin user
    const adminUser = await admin.findOne({ 
      email, 
      schoolId,
      role: "admin"
    });

    if (!adminUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate token with multi-tenancy info
    const token = jwt.sign(
      { id: adminUser._id, role: "admin", email: adminUser.email, schoolId: schoolId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ 
      message: "Login successful",
      token,
      admin: {
        id: adminUser._id,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: "admin",
        schoolId: schoolId
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*  =========  GET PENDING USERS (For Admin) - MULTI-TENANCY  ==========*/
app.get("/pendingUsers/:schoolId", async (req, res) => {
  try {
    const { schoolId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" || decoded.schoolId !== schoolId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all pending users in admin's school
    const pendingUsers = await admin.find({ 
      schoolId,
      approvalStatus: "pending",
      role: { $in: ["teacher", "student"] }
    });

    res.status(200).json({ pendingUsers });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*  =========  APPROVE USER (For Admin) - MULTI-TENANCY  ==========*/
app.post("/approveUser", async (req, res) => {
  try {
    const { userId, schoolId } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" || decoded.schoolId !== schoolId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user to approve
    const userToApprove = await admin.findById(userId);
    if (!userToApprove || userToApprove.schoolId.toString() !== schoolId) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate ID based on role
    let generatedId;
    if (userToApprove.role === "teacher") {
      generatedId = generateStaffId();
      userToApprove.staffId = generatedId;
    } else if (userToApprove.role === "student") {
      generatedId = generateStudentRegNo();
      userToApprove.registrationNumber = generatedId;
    }

    // Update user
    userToApprove.approvalStatus = "approved";
    userToApprove.approvedAt = new Date();
    userToApprove.approvedBy = decoded.id;

    await userToApprove.save();

    // Send approval email
    const idLabel = userToApprove.role === "teacher" ? "Staff ID" : "Registration Number";
    const idValue = userToApprove.role === "teacher" ? userToApprove.staffId : userToApprove.registrationNumber;

    await transporter.sendMail({
      from: `"Attendance System" <${process.env.EMAIL_USER}>`,
      to: userToApprove.email,
      subject: "Account Approved!",
      html: `
        <h2>Your Account Has Been Approved!</h2>
        <p>Dear ${userToApprove.fullName},</p>
        <p>Congratulations! Your ${userToApprove.role} account has been approved.</p>
        <p><strong>${idLabel}:</strong> ${idValue}</p>
        <p>You can now log in to your dashboard using your email and password.</p>
        <p><a href="http://localhost:5000/login.html" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
        <p>Best regards,<br>Attendance System</p>
      `,
    });

    res.status(200).json({ 
      message: "User approved successfully",
      generatedId: idValue
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default app;
