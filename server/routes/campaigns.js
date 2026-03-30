const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Campaign = require('../models/Campaign');
const auth = require('../Middleware/authMiddleware');

// ── Safe optional imports ──────────────────────────────────────────
let verifyDocument, extractTextFromImage, Notification;
try { verifyDocument = require('../utils/aiGateway').verifyDocument; } catch(e) { console.warn('aiGateway not found'); }
try { extractTextFromImage = require('../utils/ocrProcessor').extractTextFromImage; } catch(e) { console.warn('ocrProcessor not found'); }
try { Notification = require('../models/Notification'); } catch(e) { console.warn('Notification model not found'); }

// ── Multer storage ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const coverUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverMedia') {
      const ok = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase());
      return ok ? cb(null, true) : cb(new Error('Cover photo must be JPG or PNG'));
    }
    const ok = /jpeg|jpg|png|pdf/.test(path.extname(file.originalname).toLowerCase());
    return ok ? cb(null, true) : cb(new Error('Documents must be PDF, JPG or PNG'));
  }
});

// ── Background AI verification ─────────────────────────────────────
async function runAIVerification(campaign) {
  try {
    console.log(`🤖 AI: Starting verification for campaign ${campaign._id}`);

    let extractedText = 'No document provided.';
    if (campaign.documents && extractTextFromImage) {
      extractedText = await extractTextFromImage(campaign.documents);
    }

    let aiResult = {
      verificationScore: 50,
      aiNotes: 'AI service unavailable. Manual review required.',
      isHighRisk: false
    };
    if (verifyDocument) {
      aiResult = await verifyDocument(extractedText);
    }

    const score = aiResult.verificationScore ?? 50;

    // UPDATE: Matches the userId field in schema
    await Campaign.findByIdAndUpdate(campaign._id, {
      verificationScore: score,
      aiNotes:           aiResult.aiNotes ?? '',
      isHighRisk:        aiResult.isHighRisk ?? false,
      aiVerifiedAt:      new Date(),
      status:            score >= 70 ? 'Verified' : 'Needs Review',
    });

    if (Notification) {
      await Notification.create({
        recipient:  campaign.userId, // Matches Schema
        title:      'Campaign AI Verification Complete',
        message:    `Your campaign "${campaign.title}" scored ${score}/100. ${
          score >= 70
            ? 'It is now visible to donors! 🎉'
            : 'An admin will review it shortly.'
        }`,
        type:       score >= 70 ? 'success' : 'warning',
        campaignId: campaign._id,
      });
    }

    console.log(`✅ AI: Done — campaign ${campaign._id} scored ${score}`);
  } catch (err) {
    console.error(`❌ AI: Verification failed for campaign ${campaign._id}:`, err.message);
  }
}

// ══════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════
// Add this to campaigns.js
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    // This fetches EVERY campaign in the database
    const campaigns = await Campaign.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
      
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const query = { status: { $in: ['Verified', 'Active', 'Fulfilled'] } };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { story:       { $regex: search, $options: 'i' } }, // Fixed to 'story' based on schema
      ];
    }
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'name location');
    const total = await Campaign.countDocuments(query);
    res.json({ campaigns, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns: ' + err.message });
  }
});

router.get('/admin/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    const campaigns = await Campaign.find({
      status: { $in: ['Pending', 'Needs Review'] }
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email location');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending campaigns: ' + err.message });
  }
});

router.get('/my-campaigns', auth, async (req, res) => {
  try {
    // FIX: Ensures we query by userId to match model
    const campaigns = await Campaign.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your campaigns: ' + err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('userId', 'name email location');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign: ' + err.message });
  }
});

router.post('/launch', auth, coverUpload.fields([
  { name: 'coverMedia', maxCount: 1 },
  { name: 'documents',  maxCount: 1 },
]), async (req, res) => {
  try {
    if (req.user.role !== 'beneficiary') {
      return res.status(403).json({ error: 'Only beneficiaries can launch campaigns' });
    }

    const { title, category, target, targetAmount, story, location } = req.body;

    if (!title || !category || !story) {
      return res.status(400).json({ error: 'Title, category and story are required' });
    }

    let parsedLocation = location;
    try { parsedLocation = typeof location === 'string' ? JSON.parse(location) : location; } catch(_) {}

    const campaign = new Campaign({
      userId:            req.user.id, // Ensure this matches schema 'userId'
      title,
      category,
      target,
      targetAmount:      Number(targetAmount) || 0,
      story,
      location:          parsedLocation,
      status:            'Pending',
      verificationScore: null,
      coverMedia:        req.files?.coverMedia?.[0]?.path || null,
      documents:         req.files?.documents?.[0]?.path  || null,
    });

    await campaign.save();

    res.status(201).json({
      message:    'Campaign saved! AI verification is running in the background.',
      campaignId: campaign._id,
    });

    runAIVerification(campaign);

  } catch (err) {
    console.error('Launch error:', err);
    res.status(500).json({ error: 'Failed to launch campaign: ' + err.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { status, reason } = req.body;
    const allowed = ['Pending', 'Verified', 'Active', 'Fulfilled', 'Rejected', 'Needs Review'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason: status === 'Rejected' ? reason : "", // Matches your Schema field
        reviewedBy:      req.user.id,
        reviewedAt:      new Date(),
      },
      { new: true }
    );

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    if (Notification) {
      await Notification.create({
        recipient:  campaign.userId,
        title:      `Campaign ${status}`,
        message:    reason 
                    ? `Your campaign "${campaign.title}" was ${status.toLowerCase()}. Reason: ${reason}`
                    : `Your campaign "${campaign.title}" has been ${status.toLowerCase()}.`,
        type:       ['Verified', 'Active', 'Fulfilled'].includes(status) ? 'success' 
                    : status === 'Rejected' ? 'error' : 'info',
        campaignId: campaign._id,
      });
    }

    res.json({ message: `Campaign ${status.toLowerCase()} successfully`, campaign });
  } catch (err) {
    res.status(500).json({ error: 'Status update failed: ' + err.message });
  }
});

module.exports = router;