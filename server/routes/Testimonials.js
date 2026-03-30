const express      = require('express');
const router       = express.Router();
const Testimonial  = require('../models/Testimonial');
const Campaign     = require('../models/Campaign');
const auth         = require('../Middleware/authMiddleware');

/* ──────────────────────────────────────────────────────────────────
   GET /api/testimonials
   Public — all testimonials, newest first, with pagination
────────────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { limit = 9, page = 1 } = req.query;
    const total = await Testimonial.countDocuments();
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('beneficiary', 'name')
      .populate('replies.donor', 'name');

    res.json({ testimonials, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch testimonials: ' + err.message });
  }
});

/* ──────────────────────────────────────────────────────────────────
   POST /api/testimonials
   Beneficiary only — submit & publish instantly (no moderation)
────────────────────────────────────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'beneficiary') {
      return res.status(403).json({ error: 'Only beneficiaries can post testimonials' });
    }

    const { message, campaignId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let campaignTitle = '';
    if (campaignId) {
      const camp = await Campaign.findOne({ _id: campaignId, userId: req.user.id });
      if (camp) campaignTitle = camp.title;
    }

    const testimonial = await Testimonial.create({
      beneficiary:     req.user.id,
      beneficiaryName: req.user.name || 'Anonymous',
      campaign:        campaignId || null,
      campaignTitle,
      message:         message.trim(),
    });

    res.status(201).json({
      message:     'Your testimonial has been published!',
      testimonial,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not post testimonial: ' + err.message });
  }
});

/* ──────────────────────────────────────────────────────────────────
   POST /api/testimonials/:id/reply
   Donor only — reply to a testimonial
────────────────────────────────────────────────────────────────── */
router.post('/:id/reply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ error: 'Only donors can reply to testimonials' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Reply cannot be empty' });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });

    testimonial.replies.push({
      donor:     req.user.id,
      donorName: req.user.name || 'Anonymous Donor',
      message:   message.trim(),
    });

    await testimonial.save();

    const updated = await Testimonial.findById(req.params.id)
      .populate('beneficiary', 'name')
      .populate('replies.donor', 'name');

    res.status(201).json({ message: 'Reply posted!', testimonial: updated });
  } catch (err) {
    res.status(500).json({ error: 'Could not post reply: ' + err.message });
  }
});

/* ──────────────────────────────────────────────────────────────────
   DELETE /api/testimonials/:id
   Admin only — remove a testimonial if needed
────────────────────────────────────────────────────────────────── */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;