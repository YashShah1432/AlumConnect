// server\models\users.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (v) {
        // At least 1 upper, 1 lower, 1 digit, 1 special, min 8 chars
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(v);
      },
      message: props => 'Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.'
    }
  },

  phone: {
    type: String,
    required: true,          // required for ALL
    unique: true,            // must be unique
    trim: true,
    validate: {
      validator: function (v) {
        // only digits, 10–15 length (adjust as needed)
        return /^\d{10,12}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  PRN: {
    type: String,
    unique: true,            // must be unique
    trim: true,
    required: function () {
      // required only for students
      return this.role === 'student';
    },
    validate: {
      validator: function (v) {
        if (!v) return true; // allow empty when not required (non‑students)
        // EXACTLY 10 digits, numeric only
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid PRN number! PRN must be exactly 10 digits.`
    }
  },

  role: { type: String, enum: ['student', 'admin', 'alumni'] },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  rejectionReason: { type: String, default: null },
  lastLogin: { type: Date },
  // New fields:
  dob: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        if (!v) return false;
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 18);
        return v <= minDate;
      },
      message: props => `Date of birth must be at least 18 years ago.`
    }
  },
  branch: {
    type: String,
    enum: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electronics and Computer Engineering'
    ],
    required: true
  },
  branchCode: {
    type: String,
    enum: ['CSE', 'IT', 'E&TC', 'MECH', 'CIVIL', 'ECM'],
    required: true
  },
  currentCompany: { type: String, default: null },
  currentCompanyRole: { type: String, default: null },
  location: { type: String },
  batch: { type: String },
  homeTown: { type: String },
  socialLinks: {  // Changed from socialLinks to socialLinks
    linkedin: { type: String, default: null },
    instagram: { type: String, default: null },
    github: { type: String, default: null },
    x: { type: String, default: null }  // Changed from twitter to x to match your data
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Add password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
