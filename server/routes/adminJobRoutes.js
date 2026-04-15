// server/routes/adminJobRoutes.js
const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET all jobs for admin
router.get('/', verifyAdmin, async (req, res) => {
  try {
    // Build dynamic filter from query params
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.location) filter.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.employmentType) filter.employmentType = req.query.employmentType;

    // 1. Find all active jobs with deadline passed
    const now = new Date();
    const expiredJobs = await Job.find({
      status: 'active',
      applicationDeadline: { $ne: null, $lt: now }
    });

    // 2. Update their status to 'filled'
    if (expiredJobs.length > 0) {
      const expiredIds = expiredJobs.map(j => j._id);
      await Job.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: 'filled' } }
      );
    }

    // 3. Fetch jobs with updated statuses
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update job status
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'filled', 'pending', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    job.status = status;
    await job.save();
    res.json({ message: 'Job status updated', data: job });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE job opportunity
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
