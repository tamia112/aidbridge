const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const auth = require('../Middleware/authMiddleware');

// @route   GET /api/analytics/admin-stats
// @desc    Get aggregate data for Admin Dashboard
router.get('/admin-stats', auth, async (req, res) => {
    try {
        // 1. Security Check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. Admin credentials required." });
        }

        // 2. Multi-Dimensional Aggregation
        const stats = await Campaign.aggregate([
            {
                $facet: {
                    // Overall totals for Metric Cards
                    "overview": [
                        { $group: { 
                            _id: null, 
                            total: { $sum: 1 },
                            totalDonations: { $sum: "$raisedAmount" }, 
                            avgAiScore: { $avg: "$verificationScore" }
                        }}
                    ],
                    // Breakdown by Status for Audit view logic
                    "statusCounts": [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    // Category Density for the Pie Chart
                    "categoryDistribution": [
                        { $group: { _id: "$category", value: { $sum: 1 } } },
                        { $project: { name: "$_id", value: 1, _id: 0 } }
                    ]
                }
            }
        ]);

        const data = stats[0];
        const overview = data.overview[0] || { total: 0, totalDonations: 0, avgAiScore: 0 };

        // 3. Construct Clean Response
        res.json({
            requests: overview.total,
            donations: overview.totalDonations || 0,
            approved: data.statusCounts
                .filter(s => ['Active', 'Verified', 'Fulfilled'].includes(s._id))
                .reduce((acc, curr) => acc + curr.count, 0),
            rejected: data.statusCounts.find(s => s._id === 'Rejected')?.count || 0,
            aiTrustRate: overview.avgAiScore ? Math.round(overview.avgAiScore) : 0,
            categoryData: data.categoryDistribution
        });

    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).json({ error: "OS Analytics sync failed: " + err.message });
    }
});

// @route   GET /api/analytics/donation-trend
// @desc    Get chronological donation data for Area Chart
router.get('/donation-trend', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });
  
      const trend = await Campaign.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            // Count campaigns created per day as the "impact" metric
            impact:    { $sum: 1 },
            // Sum target amounts as a proxy for donation flow
            donations: { $sum: '$targetAmount' },
          }
        },
        { $sort: { '_id': 1 } },
        { $limit: 7 }
      ]);
  
     const formatted = trend.map(item => ({
        name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
        campaigns: item.impact || 0,  // ← impact → campaigns
        donations: item.donations || 0,
      }));
  
      res.json(formatted);
    } catch (err) {
      res.status(500).json({ error: 'Trend sync failed: ' + err.message });
    }
  });

module.exports = router;