import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  
  schoolName: {type: String, required: true},

  schoolEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Please enter a valid email address"
    ]
  },

  schoolType: {
    type: String,
    required: true
  },
schoolCode: {
    type: String,
    unique: true,
    required: true
  },
  schoolPhoneNumber: {
    type: Number,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },
  schoolAddress: {
    type: String,
    required: true
  },
 
//   adminFullName: {
//     type: String,
//     required: true
//   },
// adminEmail: {
//    type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [
//       /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
//       "Please enter a valid email address"
//     ]
// },

// adminPhoneNumber: {
//     type: Number,
//     required: true
// },
  

  isVerified: {
   type: Boolean,
   default: false
  },

//   adminPassword: {
//     type: String,
//     required: true
//   },
//     createdAt: {
//     type: Date,
//     default: Date.now 
//   },
//  role: {
//   type: String,
//   enum: ["school_admin", "teacher", "student"],
//   default: "school_admin",
//   required: true
// },
  // emailVerifyToken: String,
  // emailVerifyExpires: Date
});

const school = mongoose.model("school", userSchema);
export default school
