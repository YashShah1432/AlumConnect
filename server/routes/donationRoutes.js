// server/routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const Donation = require('../models/donation');
const Opportunity = require('../models/opportunity');
const User = require('../models/users');
const { uploadBufferToCloudinary, cloudinary } = require('../utils/cloudinary');
const { isAuthenticated } = require('../middleware/isAuthenticated');

// Multer memory storage (so we can validate size before upload)
const uploadProof = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 }, // 512KB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// POST /api/donations
// Create donation with default status "pending" + upload proof image to Cloudinary
router.post('/', isAuthenticated, uploadProof.single('paymentProof'), async (req, res) => {
  try {
    const {
      // name, batch, email,  // ❌ don't trust these from client for identity
      amount,
      purpose,
      comments,
      utrNo,
      paymentDate,
      opportunityId
    } = req.body;

    // ✅ ensure only alumni can create donations
    if (req.user?.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create donations.' });
    }

    // ✅ take identity from session user
    const name = req.user?.name || '';
    const batch = req.user?.batch || '';
    const email = String(req.user?.email || '').toLowerCase().trim();

    // Basic validations
    const missing = [];
    if (!name) missing.push('name');
    if (!batch) missing.push('batch');
    if (!email) missing.push('email');
    if (!amount && amount !== 0) missing.push('amount');
    if (!purpose) missing.push('purpose');
    if (!utrNo) missing.push('utrNo');
    if (!paymentDate) missing.push('paymentDate');

    if (missing.length) {
      return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
    }

    // UTR: exactly 12 digits
    if (!/^\d{12}$/.test(String(utrNo))) {
      return res.status(400).json({ message: 'UTR No. must be exactly 12 digits' });
    }

    // Payment date: must be valid date
    const parsedPaymentDate = new Date(paymentDate);
    if (Number.isNaN(parsedPaymentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid payment date' });
    }

    // Proof file required
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Payment proof image is required' });
    }

    // ✅ Atomic lock (prevents race conditions)
    // NOTE: we lock first, then create donation. If something fails after lock,
    // we unlock in the catch block.
    let lockedOpportunity = null;

    if (opportunityId) {
      lockedOpportunity = await Opportunity.findOneAndUpdate(
        {
          _id: opportunityId,
          status: { $in: ['approved', 'accepted'] },
          donationState: { $ne: 'fulfilled' },
          $or: [{ donationState: { $exists: false } }, { donationState: 'open' }]
        },
        {
          $set: {
            donationState: 'locked',
            lockedAt: new Date()
          }
        },
        { new: true }
      );

      if (!lockedOpportunity) {
        return res.status(409).json({
          message: 'This funding request is already locked or fulfilled. Please pick another one.'
        });
      }
    }

    // Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'donations/payment-proofs'
    });

    const donationData = {
      userId: req.user._id,
      name,
      batch,
      email,
      amount: Number(amount),
      purpose,
      comments,
      utrNo: String(utrNo),
      paymentDate: new Date(paymentDate),
      paymentProofUrl: uploadResult.secure_url,
      role: 'alumni',
      opportunityId: opportunityId ? opportunityId : null
    };

    const donation = new Donation(donationData);
    await donation.save();

    // ✅ Attach donation id to the lock
    if (lockedOpportunity) {
      await Opportunity.findByIdAndUpdate(lockedOpportunity._id, {
        lockedByDonationId: donation._id
      });
    }

    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);

    // Best-effort unlock if donation failed after locking
    try {
      const opportunityId = req.body?.opportunityId;
      if (opportunityId) {
        await Opportunity.findOneAndUpdate(
          { _id: opportunityId, donationState: 'locked' },
          { $set: { donationState: 'open', lockedByDonationId: null, lockedAt: null } }
        );
      }
    } catch (unlockErr) {
      console.error('Unlock after failure failed:', unlockErr);
    }

    if (error?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Payment proof image must be <= 512KB' });
    }

    return res.status(400).json({ message: error.message || 'Error creating donation' });
  }
});

// GET /api/donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'accepted' }).sort({ createdAt: -1 });

    const donationsWithUserName = await Promise.all(
      donations.map(async (donation) => {
        const user = await User.findOne({ email: donation.email });
        const donationObj = donation.toObject();
        donationObj.userName = user ? user.name : 'Unknown User';
        donationObj.userRole = user ? user.role : undefined;
        return donationObj;
      })
    );

    res.json(donationsWithUserName);
  } catch (error) {
    console.error('Error fetching accepted donations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ GET /api/donations/me
// Alumni-only: return logged-in user's donations (pending + accepted + rejected)
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    if (req.user?.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can view donation transactions.' });
    }

    // Prefer userId if you store it; fallback to email
    const userId = req.user?._id;
    const email = String(req.user?.email || '').toLowerCase().trim();

    const myDonations = await Donation.find({
      $or: [{ userId }, { email }]
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(myDonations);
  } catch (error) {
    console.error('Error fetching my donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/donations/:id/certificate
// Returns a Cloudinary forced-download URL (no redirect; frontend navigates to it)
router.get('/:id/certificate', isAuthenticated, async (req, res) => {
  try {
    const donationId = req.params.id;

    const donation = await Donation.findById(donationId).lean();
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (!donation.certificateNo) {
      return res.status(404).json({ message: 'Certificate not available' });
    }

    const role = req.user?.role;
    const userEmail = String(req.user?.email || '').toLowerCase().trim();

    if (role !== 'admin') {
      if (role !== 'alumni') {
        return res.status(403).json({ message: 'Only alumni/admin can download certificates.' });
      }
      const donationEmail = String(donation.email || '').toLowerCase().trim();
      if (donationEmail !== userEmail) {
        return res.status(403).json({ message: 'You can only download your own certificate.' });
      }
    }

    // Prefer stored Cloudinary public_id, else reconstruct it (NO extension)
    let publicIdRaw =
      donation.certificatePublicId ||
      `donations/tax-certificates/tax_certificate_${donation.certificateNo}`;

    // If already encoded (%2F etc), decode it back
    try {
      if (/%2f/i.test(String(publicIdRaw)) || /%[0-9a-f]{2}/i.test(String(publicIdRaw))) {
        publicIdRaw = decodeURIComponent(String(publicIdRaw));
      }
    } catch {
      // ignore decode errors
    }

    // Normalize: remove trailing ".pdf" and accidental ".pdf.pdf"
    let publicId = String(publicIdRaw).replace(/(\.pdf)+$/i, '');
    publicId = publicId.replace(/^\/+/, '');

    // Keep slashes; encode only each segment
    const safePublicId = publicId
      .split('/')
      .filter(Boolean)
      .map((seg) => encodeURIComponent(seg))
      .join('/');

    const attachmentName = `TaxExemptionCertificate_${donation.certificateNo}.pdf`;

    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment:${encodeURIComponent(
      attachmentName
    )}/${safePublicId}.pdf`;

    // ✅ Console logs requested
    console.log('[CERT DOWNLOAD] donationId:', donationId);
    console.log('[CERT DOWNLOAD] certificateNo:', donation.certificateNo);
    console.log('[CERT DOWNLOAD] certificatePublicId (stored):', donation.certificatePublicId);
    console.log('[CERT DOWNLOAD] certificateUrl (stored):', donation.certificateUrl);
    console.log('[CERT DOWNLOAD] publicIdRaw (after decode step):', publicIdRaw);
    console.log('[CERT DOWNLOAD] publicId (normalized):', publicId);
    console.log('[CERT DOWNLOAD] safePublicId:', safePublicId);
    console.log('[CERT DOWNLOAD] GENERATED url:', url);

    // What the "correct" url should look like (example explanation)
    // It should NOT contain "%2F" (slashes must remain as "/")
    // It should NOT end in ".pdf.pdf" (only one ".pdf")
    //
    // Example correct format:
    // https://res.cloudinary.com/<cloud>/raw/upload/fl_attachment:TaxExemptionCertificate_<CERTNO>.pdf/donations/tax-certificates/tax_certificate_<CERTNO>.pdf
    //
    // Your logs above will show whether safePublicId became:
    // donations/tax-certificates/tax_certificate_<CERTNO>
    // (this is correct)

    return res.json({ url });
  } catch (error) {
    console.error('Error building certificate download URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.get('/__ping', (req, res) => {
//   res.json({ ok: true, route: 'donationRoutes' });
// });

module.exports = router;