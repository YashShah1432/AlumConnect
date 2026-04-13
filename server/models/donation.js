// server/models/donation.js
const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  batch: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  purpose: {
    type: String,
    enum: ['startup', 'research', 'innovation','patent', 'general'],
    required: true
  },
  comments: {
    type: String
  },

  // NEW: payment metadata
  utrNo: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid UTR number! UTR must be exactly 12 digits.`
    }
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentProofUrl: {
    type: String,
    required: true,
    trim: true
  },

  role: {
    type: String,
    enum: ['alumni', 'student'],
    default: 'alumni'
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  // NEW: tax exemption certificate info (generated after admin acceptance)
  certificateNo: {
    type: String,
    default: null,
    index: true
  },
  certificateUrl: {
    type: String,
    default: null,
    trim: true
  },
  // ✅ NEW: needed for reliable server-side download
  certificatePublicId: {
    type: String,
    default: null,
    trim: true,
    index: true
  },
  certificateIssuedAt: {
    type: Date,
    default: null
  },

  // ✅ Link donation to the authenticated user who created it
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },

  // NEW: if this donation was made for a specific student funding request
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null,
    index: true
  },
  
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);