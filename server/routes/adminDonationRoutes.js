// server/routes/adminDonationRoutes.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/donation');
const Opportunity = require('../models/opportunity'); // ✅ ADD
const { verifyAdmin } = require('../middleware/authMiddleware');
const { uploadBufferToCloudinary } = require('../utils/cloudinary'); // ✅ ADD
const { generateCertificatePdfBuffer } = require('../utils/certificateGenerator'); // ✅ ADD

const makeCertificateNo = (donation) => {
  // Example: AC-80G-2026-000123
  const yyyy = new Date().getFullYear();
  const shortId = String(donation._id).slice(-6).toUpperCase();
  return `AC-80G-${yyyy}-${shortId}`;
};

// GET /api/donations/admin
// Retrieve all funding requests (for admin review)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/donations/admin/:id/accept
// Accept a funding request by updating its status to "accepted"
router.patch('/:id/accept', verifyAdmin, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.status = 'accepted';

    // ✅ Generate certificate ONLY if not already generated
    if (!donation.certificateUrl) {
      const certificateNo = donation.certificateNo || makeCertificateNo(donation);
      const issuedAt = new Date();

      const pdfBuffer = await generateCertificatePdfBuffer({
        certificateNo,
        donorName: donation.name,
        donorEmail: donation.email,
        donorBatch: donation.batch,
        amount: donation.amount,
        purpose: donation.purpose,
        utrNo: donation.utrNo,
        paymentDate: donation.paymentDate,
        issuedAt
      });

      const uploadResult = await uploadBufferToCloudinary(pdfBuffer, {
        folder: 'donations/tax-certificates',
        resource_type: 'raw',
        public_id: `tax_certificate_${certificateNo}`,
        overwrite: true,
        format: 'pdf'
      });

      donation.certificateNo = certificateNo;
      donation.certificateUrl = uploadResult.secure_url;

      // ✅ NEW: store public_id for downloads
      donation.certificatePublicId = uploadResult.public_id;

      donation.certificateIssuedAt = issuedAt;
    }

    await donation.save();

    // ...existing code (fulfilled lock logic)...
    if (donation.opportunityId) {
      await Opportunity.findOneAndUpdate(
        { _id: donation.opportunityId, lockedByDonationId: donation._id },
        { $set: { donationState: 'fulfilled' } }
      );
    }

    res.json({ message: 'Donation accepted', data: donation });
  } catch (error) {
    console.error('Error accepting donation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/donations/admin/:id/reject
// Reject a donation by updating its status to "rejected" (do NOT delete)
router.patch('/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.status = 'rejected';

    // ✅ Unlock only if this donation is currently locking it
    if (donation.opportunityId) {
      await Opportunity.findOneAndUpdate(
        {
          _id: donation.opportunityId,
          lockedByDonationId: donation._id,
          donationState: 'locked'
        },
        {
          $set: {
            donationState: 'open',
            lockedByDonationId: null,
            lockedAt: null
          }
        }
      );
    }

    await donation.save();

    res.json({ message: 'Donation rejected', data: donation });
  } catch (error) {
    console.error('Error rejecting donation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/donations/admin/:id
// Optional: permanently delete a donation (kept for admin cleanup)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    // ✅ Unlock only if this donation is currently locking it
    if (donation.opportunityId) {
      await Opportunity.findOneAndUpdate(
        {
          _id: donation.opportunityId,
          lockedByDonationId: donation._id,
          donationState: 'locked'
        },
        {
          $set: {
            donationState: 'open',
            lockedByDonationId: null,
            lockedAt: null
          }
        }
      );
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation deleted' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
