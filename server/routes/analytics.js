const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');

// ==========================================
// @route   GET /api/analytics/summary
// @desc    Get high-level Mission Control metrics & chart data
// @access  Public (or Protected via authMiddleware)
// ==========================================
router.get('/summary', async (req, res) => {
  try {
    // 1. Execute database aggregations concurrently
    const [
      totalCampaigns,
      totalUsers,
      totalDonations,
      pendingCount,
      verifiedCount,
      rejectedCount
    ] = await Promise.all([
      Campaign.countDocuments(),
      User.countDocuments(),
      Donation.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, totalRaised: { $sum: '$amount' } } }
      ]),
      Campaign.countDocuments({ status: { $in: ['Pending', 'Needs Review'] } }),
      Campaign.countDocuments({ status: { $in: ['Verified', 'Active'] } }),
      Campaign.countDocuments({ status: 'Rejected' })
    ]);

    const totalCapitalRaised = totalDonations.length > 0 ? totalDonations[0].totalRaised : 0;

    // 2. Aggregate AI Trust Scores
    const highRiskCount = await Campaign.countDocuments({ aiTrustScore: { $lt: 40 } });
    const mediumRiskCount = await Campaign.countDocuments({ aiTrustScore: { $gte: 40, $lt: 70 } });
    const lowRiskCount = await Campaign.countDocuments({ aiTrustScore: { $gte: 70 } });

    // 3. Aggregate Monthly Funding Stats (for Recharts visualizations)
    const monthlyStats = await Donation.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyData = monthlyStats.map(item => ({
      month: monthNames[item._id - 1] || 'Unknown',
      amount: item.amount
    }));

    res.json({
      telemetry: {
        totalCapitalRaised,
        totalCampaigns,
        totalUsers,
        pendingCount,
        verifiedCount,
        rejectedCount,
        highRiskCount
      },
      statusBreakdown: [
        { name: 'Verified', value: verifiedCount },
        { name: 'Pending', value: pendingCount },
        { name: 'Rejected', value: rejectedCount }
      ],
      aiRiskBreakdown: [
        { name: 'Low Risk', value: lowRiskCount },
        { name: 'Medium Risk', value: mediumRiskCount },
        { name: 'High Risk', value: highRiskCount }
      ],
      monthlyFunding: formattedMonthlyData
    });

  } catch (err) {
    console.error('Error fetching analytics summary:', err.message);
    res.status(500).json({ message: 'Failed to aggregate analytics metrics.' });
  }
});

// ==========================================
// @route   GET /api/analytics/beneficiary/:userId
// @desc    Get funding performance metrics for a specific beneficiary
// @access  Public
// ==========================================
router.get('/beneficiary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userCampaigns = await Campaign.find({ createdBy: userId });
    const totalTarget = userCampaigns.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
    const totalRaised = userCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);

    res.json({
      campaignCount: userCampaigns.length,
      totalTarget,
      totalRaised,
      progressPercentage: totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0,
      campaigns: userCampaigns
    });

  } catch (err) {
    console.error('Error fetching beneficiary analytics:', err.message);
    res.status(500).json({ message: 'Error retrieving beneficiary metrics.' });
  }
});

module.exports = router;