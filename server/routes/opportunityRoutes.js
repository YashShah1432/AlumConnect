//// filepath: d:\Major Project Changes\12-04-2026\server\routes\opportunityRoutes.js
// server/routes/opportunityRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Opportunity = require('../models/opportunity');
const User = require('../models/users');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

// NEW: Multer memory storage for approval certificate (<= 512KB)
const uploadCertificate = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 }, // 512KB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!file.mimetype || !allowed.includes(file.mimetype)) {
      return cb(new Error('Approval certificate must be a PNG, JPG, or PDF'), false);
    }
    cb(null, true);
  }
});

// Get all opportunities + filters
router.get('/', async (req, res) => {
  try {
    const filter = {};

    // Only show requests that are NOT fulfilled
    filter.donationState = { $ne: 'fulfilled' };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { details: { $regex: req.query.search, $options: 'i' } },
        { studentName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });

    const opportunitiesWithAuthors = await Promise.all(
      opportunities.map(async (opp) => {
        const author = await User.findOne({ email: opp.authorEmail });
        return {
          ...opp.toObject(),
          authorName: author ? author.name : 'Unknown Author'
        };
      })
    );

    res.json(opportunitiesWithAuthors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new opportunity (multipart/form-data with file)
router.post(
  '/createOpportunity',
  isAuthenticated,
  uploadCertificate.single('approvalCertificate'),
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can create funding requests' });
      }

      const {
        studentName,
        title,
        category,
        amount,
        batch,
        details,
        description // backward compat (optional)
      } = req.body;

      const missing = [];
      if (!studentName) missing.push('studentName');
      if (!title) missing.push('title');
      if (!category) missing.push('category');
      if (!amount && amount !== 0) missing.push('amount');
      if (!batch) missing.push('batch');
      if (!details) missing.push('details');

      if (missing.length) {
        return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
      }

      // Proof file required
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: 'Approval certificate is required' });
      }

      // Upload to Cloudinary
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'opportunities/approval-certificates',
        resource_type: 'auto'
      });

      const opportunityData = {
        studentName: String(studentName).trim(),
        title: String(title).trim(),
        category,
        amount: Number(amount),
        batch: String(batch).trim(),
        details: String(details).trim(),
        description: description ? String(description).trim() : '',
        authorEmail: req.user.email,
        approvalCertificateUrl: uploadResult.secure_url,
        tags: req.body.tags || [],
        role: 'student',
        status: 'pending'
      };

      const opportunity = new Opportunity(opportunityData);
      await opportunity.save();

      res.status(201).json(opportunity);
    } catch (error) {
      console.error('Error in createOpportunity:', error);

      if (error?.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Approval certificate must be <= 512KB' });
      }

      res.status(400).json({
        message: error.message,
        details: error.errors
      });
    }
  }
);

router.get('/author/:email', async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ authorEmail: req.params.email });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in student's own funding requests
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their funding requests.' });
    }

    const email = String(req.user.email || '').toLowerCase().trim();

    const myOpportunities = await Opportunity.find({
      authorEmail: email
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(myOpportunities);
  } catch (error) {
    console.error('Error fetching my opportunities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;