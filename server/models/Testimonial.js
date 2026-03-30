const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  donor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  message:   { type: String, required: true, maxlength: 600 },
}, { timestamps: true });

const TestimonialSchema = new mongoose.Schema({
  beneficiary:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beneficiaryName: { type: String, required: true },
  campaign:        { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  campaignTitle:   { type: String, default: '' },
  message:         { type: String, required: true, maxlength: 1000 },
  replies:         [ReplySchema],
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);