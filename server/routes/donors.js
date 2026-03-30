const express = require('express');
const router = express.Router();
const { getDonorStats } = require('../controllers/donorController');
const auth = require('../Middleware/authMiddleware');

// GET: /api/donors/me/stats
router.get('/me/stats', auth, getDonorStats);

module.exports = router;
