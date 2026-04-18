const User = require('../models/users');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Resume upload and parsing
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("FILE PATH:", req.file.path);

    // send file to Python service
    const formData = new FormData();
    formData.append("resume", fs.createReadStream(req.file.path));

    const response = await axios.post(
      "http://localhost:5001/parse",
      formData,
      { headers: formData.getHeaders() }
    );

    console.log("PARSED:", response.data);

    res.json({
      message: "Resume uploaded & parsed",
      data: response.data
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({ message: "Failed" });
  }
};
module.exports = {
    uploadResume,
};