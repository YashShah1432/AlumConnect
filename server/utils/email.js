const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendOtpMail = async (to, otp) => {
  return transporter.sendMail({
    from: `"Alumni Portal" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your OTP for Alumni Portal Registration',
    html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
  });
};

const sendApprovalMail = async (to, loginUrl) => {
  return transporter.sendMail({
    from: `"Alumni Portal" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your Alumni Portal Registration is Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #2563eb;">Congratulations!</h2>
        <p>Your registration has been <b>approved</b>. You can now log in to the Alumni Portal.</p>
        <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">Login to Alumni Portal</a>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  });
};

const sendRejectionMail = async (to, reason) => {
  return transporter.sendMail({
    from: `"Alumni Portal" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your Alumni Portal Registration was Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #dc2626;">Registration Rejected</h2>
        <p>We're sorry, but your registration was <b>rejected</b> for the following reason:</p>
        <blockquote style="background:#f3f4f6;padding:12px;border-radius:6px;color:#dc2626;">${reason || 'No reason provided.'}</blockquote>
        <p>If you believe this is a mistake, please contact support.</p>
      </div>
    `
  });
};

module.exports = { sendOtpMail, sendApprovalMail, sendRejectionMail };