// server/models/opportunity.js
const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  // ...existing code...

  // NEW: student's full name (captured at request creation time)
  studentName: {
    type: String,
    required: true,
    trim: true
  },

  title: {
    type: String,
    required: true
  },

  // IMPORTANT: "description" is no longer used by the new form
  // Keep optional for backward compatibility with existing DB docs.
  description: {
    type: String,
    required: false,
    default: ''
  },

  amount: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    enum: ['startup', 'research', 'innovation', 'patent', 'general'],
    required: true
  },

  details: {
    type: String,
    required: true
  },

  authorEmail: {
    type: String,
    required: true,
    ref: 'User'
  },

  batch: {
    type: String,
    required: true
  },

  // NEW: approval certificate file stored in Cloudinary
  approvalCertificateUrl: {
    type: String,
    required: true,
    trim: true
  },

  tags: [{
    type: String
  }],

  role: {
    type: String,
    enum: ['student', 'alumni'],
    default: 'student'
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // donation lock + fulfillment tracking
  donationState: {
    type: String,
    enum: ['open', 'locked', 'fulfilled'],
    default: 'open',
    index: true
  },
  lockedByDonationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    default: null
  },
  lockedAt: {
    type: Date,
    default: null
  },
  
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', OpportunitySchema);