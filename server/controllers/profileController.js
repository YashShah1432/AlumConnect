const User = require('../models/users');

const updateProfile = async (req, res) => {
  try {
    console.log('updateProfile body:', req.body);
    console.log('updateProfile user:', req.user && req.user.id);
    // Retrieve the user document from the database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // List of allowed fields for general updates
    const allowedUpdates = [
      'location',
      // 'personalEmail',
      'currentCompany',
      'currentCompanyRole',
      'socialLinks',    
      'phone',   // optional: allow updating phone
      'PRN'      // or 'prnNumber' depending on your UserSchema field name
    ];

    // Update allowed fields on the user document
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Handle password update
    if (req.body.currentPassword && req.body.newPassword) {
      // Verify that the current password is correct
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
      // Assign the new password (this will trigger the pre-save hook on save())
      user.password = req.body.newPassword;
    }

    // Save the user document; the pre-save hook will hash the password if it was updated
    await user.save();

    // Convert to a plain object and remove the password field before sending the response
    const userData = user.toObject();
    delete userData.password;

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  updateProfile
};