const ensureInstitutionalEmail = (req, res, next) => {
  // Debug
  console.log("BODY:", req.body);

  if (!req.body || !req.body.email) {
    return res.status(400).json({
      error: "Email is required"
    });
  }

  const email = req.body.email.trim();

  if (!email.endsWith("@gmail.com")) {
    return res.status(403).json({
      error: "Only @gmail.com email addresses are allowed"
    });
  }

  next();
};

module.exports = { ensureInstitutionalEmail };