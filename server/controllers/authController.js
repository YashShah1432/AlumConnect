const User = require('../models/users');
const Otp = require('../models/otp');
const bcrypt = require('bcrypt');
const { sendOtpMail } = require('../utils/email');

const OTP_ATTEMPT_LIMIT = 5;
const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_COOLDOWN = 60 * 1000; // 60 seconds

// Helper to generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
            return res.status(400).json({ error: 'Valid email required' });

        // Check if user already exists
        if (await User.findOne({ email }))
            return res.status(400).json({ error: 'Email already registered' });

        // Check resend cooldown
        const existing = await Otp.findOne({ email });
        if (existing && Date.now() - existing.updatedAt.getTime() < OTP_RESEND_COOLDOWN)
            return res.status(429).json({ error: 'Please wait before resending OTP' });

        // Generate and hash OTP
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save or update OTP
        await Otp.findOneAndUpdate(
            { email },
            {
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000),
                attempts: 0
            },
            { upsert: true }
        );

        await sendOtpMail(email, otp);
        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

        const record = await Otp.findOne({ email });
        if (!record) return res.status(400).json({ error: 'OTP not found, request again' });

        if (record.attempts >= OTP_ATTEMPT_LIMIT)
            return res.status(429).json({ error: 'Max attempts exceeded' });

        if (record.expiresAt < new Date())
            return res.status(400).json({ error: 'OTP expired' });

        const match = await bcrypt.compare(otp, record.otp);
        if (!match) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ error: 'Invalid OTP', attempts: record.attempts });
        }

        req.session.otpVerified = true;
        req.session.otpEmail = email;
        await Otp.deleteOne({ email });
        res.json({ message: 'OTP verified' });
    } catch (err) {
        res.status(500).json({ error: 'OTP verification failed' });
    }
};

exports.register = async (req, res) => {
  try {
    const { email, ...userData } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Check session for OTP verification
    if (!req.session.otpVerified || req.session.otpEmail !== email) {
      return res.status(400).json({ error: 'OTP not verified for this email' });
    }

    // Create user (pending approval)
    const user = new User({
      ...userData,
      email,
      isApproved: false
    });
    await user.save();

    // Clear OTP session flag
    req.session.otpVerified = false;
    req.session.otpEmail = null;

    res.json({ message: 'Registration successful. Await admin approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

// Admin approval/rejection (add to admin routes)
exports.approveUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isApproved: true, rejectionReason: null }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User approved', user });
};

exports.rejectUser = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findByIdAndUpdate(id, { isApproved: false, rejectionReason: reason || 'Rejected by admin' }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Optionally: delete user instead of just flagging
    await User.findByIdAndDelete(id);
    res.json({ message: 'User rejected and deleted' });
};