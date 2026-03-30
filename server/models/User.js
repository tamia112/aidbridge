const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  role: { type: String, enum: ['beneficiary', 'donor', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },
  documents: [{ type: String }],
  lastLogin: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);