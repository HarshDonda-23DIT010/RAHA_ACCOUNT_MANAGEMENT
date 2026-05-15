const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const protect = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { sectionId, password } = req.body;
    if (!sectionId || !password)
      return res.status(400).json({ message: 'Please provide section ID and password' });

    const user = await User.findOne({ sectionId: sectionId.toUpperCase() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid Section ID or Password' });

    res.json({
      _id: user._id,
      name: user.name,
      sectionId: user.sectionId,
      section: user.section,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: 'Provide old and new password' });

    const user = await User.findById(req.user.id);
    if (!user || !(await user.matchPassword(oldPassword)))
      return res.status(401).json({ message: 'Old password is incorrect' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/seed  — create default admin (run once)
router.post('/seed', async (req, res) => {
  try {
    const existing = await User.findOne({ sectionId: 'ADMIN-01' });
    if (existing) return res.json({ message: 'Seed already done' });

    await User.create([
      { name: 'Admin',         sectionId: 'ADMIN-01',   password: 'admin123',   section: 'admin',   role: 'admin' },
      { name: 'Beauty Manager',sectionId: 'BEAUTY-01',  password: 'beauty123',  section: 'beauty',  role: 'user'  },
      { name: 'Bangles Manager',sectionId: 'BANGLES-01', password: 'bangles123', section: 'bangles', role: 'user'  },
    ]);
    res.json({ message: 'Default users created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
