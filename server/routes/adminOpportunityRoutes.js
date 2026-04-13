//// filepath: c:\Sigma 6.0\Web Development\Major\Alum-Connect\server\routes\adminOpportunityRoutes.js
// server/routes/adminOpportunityRoutes.js
const express = require('express');
const router = express.Router();
const Opportunity = require('../models/opportunity');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET /api/opportunities/admin
// Retrieve all student funding requests (for admin review)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/opportunities/admin/:id/accept
// Approve a funding request by updating its status to "approved"
router.patch('/:id/accept', verifyAdmin, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    opportunity.status = 'approved';
    await opportunity.save();
    res.json({ message: 'Funding request approved', data: opportunity });
  } catch (error) {
    console.error('Error approving opportunity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/opportunities/admin/:id
// Reject a funding request by deleting it from the database
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Funding request rejected and deleted' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;