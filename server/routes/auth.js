const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aidbridge_super_secret_2024_tamia');
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    if (!name || !email || !password || !phone || !location || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      phone,
      location,
      role
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: { id: savedUser._id, name: savedUser.name, role: savedUser.role } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ error: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================= GET CURRENT USER =================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching user data" });
  }
});

// ================= UPDATE USER PROFILE (New!) =================
// This handles the PUT request from your ProfileTab component
router.put('/update-me', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // 1. Find and Update the user
    // { new: true } returns the updated document instead of the old one
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, email, phone } },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ error: "This email is already in use" });
    }
    res.status(500).json({ error: "Failed to update profile info" });
  }
});

module.exports = router;
// Exporting middleware separately so it can be used in other routes (like campaigns)
module.exports.authMiddleware = authMiddleware;