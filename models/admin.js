import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    required: true
  },

  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  // Reference to school
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    sparse: true
  },

  // SYSTEM / ADMIN GENERATED IDs
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },

  staffId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Approval Status
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  // Account Status
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },

  // Additional fields for teachers/students
  department: {
    type: String,
    sparse: true
  },

  phoneNumber: {
    type: String,
    sparse: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  approvedAt: {
    type: Date,
    sparse: true
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    sparse: true
  }
}, 
);

const admin = mongoose.model("admin", userSchema);
export default admin 


