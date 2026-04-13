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
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: { type: String, required: true, minlength: 8 },
 
  phone: {
    type: String,
    required: true,          // required for ALL
    unique: true,            // must be unique
    trim: true,
    validate: {
      validator: function (v) {
        // only digits, 10–15 length (adjust as needed)
        return /^\d{10,15}$/.test(v);
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

  role: { type: String, enum: ['student', 'admin', 'alumni']},
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  // New fields:
  dob: { type: Date },
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
  currentCompany: { type: String, default: null},
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
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Add password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
