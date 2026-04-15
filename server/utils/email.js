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

module.exports = { sendOtpMail };