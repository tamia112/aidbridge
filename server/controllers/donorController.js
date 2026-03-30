const mongoose = require('mongoose');
const Donation = require('../models/Donation');

exports.getDonorStats = async (req, res) => {
    try {
        const donorId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Calculate Summary Stats (Only for finished payments)
        const stats = await Donation.aggregate([
            // Ensure status 'completed' matches what you save in your payment route
            { $match: { donor: donorId, status: 'completed' } }, 
            {
                $group: {
                    _id: null,
                    totalContributed: { $sum: "$amount" },
                    uniqueCampaigns: { $addToSet: "$campaign" }
                }
            }
        ]);

        // 2. Fetch Recent History (Include pending so they know it's processing)
        const history = await Donation.find({ donor: donorId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('campaign', 'title');

        const summary = stats[0] || { totalContributed: 0, uniqueCampaigns: [] };

        res.json({
            summary: {
                totalContributed: summary.totalContributed,
                livesImpacted: summary.uniqueCampaigns.length,
                activeSupports: summary.uniqueCampaigns.length
            },
            history: history.map(d => ({
                _id: d._id,
                amount: d.amount,
                date: d.createdAt,
                status: d.status, // Added: To show 'pending' vs 'completed' in UI
                transactionId: d.transactionId, // Added: The CheckoutRequestID or M-Pesa Code
                campaignTitle: d.campaign ? d.campaign.title : "Archived Campaign"
            }))
        });
    } catch (err) {
        console.error("Donor Stats Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};