const express = require('express');
const router = express.Router();
const axios = require('axios');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const auth = require('../Middleware/authMiddleware');
// --- CONFIGURATION ---
const NGROK_URL = "https://unfractious-hydropically-clarence.ngrok-free.dev";



// --- 1. GENERATE DARAJA TOKEN ---
const generateToken = async (req, res, next) => {
    const key = process.env.DARAJA_CONSUMER_KEY;
    const secret = process.env.DARAJA_CONSUMER_SECRET;
    const authHeader = Buffer.from(`${key}:${secret}`).toString('base64');

    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            { headers: { Authorization: `Basic ${authHeader}` } }
        );
        req.token = response.data.access_token;
        next();
    } catch (err) {
        console.error("❌ Daraja Token Error:", err.response?.data || err.message);
        res.status(500).json({ error: "M-Pesa authentication failed" });
    }
};

// --- 2. INITIATE STK PUSH ---
router.post('/mpesa-stk', auth, generateToken, async (req, res) => {
    const { phone, amount, campaignId } = req.body;
    const shortCode = "174379"; 
    const passkey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');

    try {
        console.log(`🚀 Initiating STK Push for KES ${amount} to campaign ${campaignId}...`);

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: Math.round(amount),
                PartyA: phone,
                PartyB: shortCode,
                PhoneNumber: phone,
                // Construct the full callback path
                CallBackURL: `${NGROK_URL}/api/payment/callback`, 
                AccountReference: "AidbridgE",
                TransactionDesc: `Donation to ${campaignId}`
            },
            { headers: { Authorization: `Bearer ${req.token}` } }
        );

        if (response.data.ResponseCode === "0") {
            const newDonation = new Donation({
                donor: req.user.id,
                campaign: campaignId,
                amount: Number(amount),
                transactionId: response.data.CheckoutRequestID,
                status: 'pending'
            });
            await newDonation.save();
            
            console.log("✅ STK Push Sent Successfully. CheckoutID:", response.data.CheckoutRequestID);
            res.status(200).json({ 
                success: true, 
                checkoutID: response.data.CheckoutRequestID 
            });
        }
    } catch (err) {
        console.error("❌ STK Push Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Payment initiation failed" });
    }
});

// --- 3. CALLBACK URL (The real money update happens here) ---
router.post('/callback', async (req, res) => {
    try {
        const { Body } = req.body;
        console.log("📩 Incoming M-Pesa Callback Data...");

        if (!Body.stkCallback) {
            return res.status(400).send("Invalid callback format");
        }

        const resultCode = Body.stkCallback.ResultCode;
        const checkoutID = Body.stkCallback.CheckoutRequestID;

        if (resultCode === 0) {
            const metadata = Body.stkCallback.CallbackMetadata.Item;
            const amountPaid = metadata.find(i => i.Name === 'Amount')?.Value;
            const receipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

            console.log(`💰 Payment SUCCESS! Amount: KES ${amountPaid}, Receipt: ${receipt}`);

            // 1. Update Donation Status
            const donation = await Donation.findOneAndUpdate(
                { transactionId: checkoutID },
                { status: 'completed', mpesaReceiptNumber: receipt },
                { new: true }
            );

            if (donation) {
                // 2. Increment Campaign Raised Amount
                // We use $inc to ensure atomic updates (prevent data loss)
                const updatedCampaign = await Campaign.findByIdAndUpdate(
                    donation.campaign, 
                    { 
                        $inc: { 
                            raisedAmount: Number(amountPaid), 
                            donationsCount: 1 
                        } 
                    },
                    { new: true }
                );

                console.log(`✨ Database Updated: ${updatedCampaign.title} now at KES ${updatedCampaign.raisedAmount}`);
            } else {
                console.warn("⚠️ Donation record not found for CheckoutID:", checkoutID);
            }
        } else {
            console.error(`❌ Payment Failed/Cancelled. ResultCode: ${resultCode}`);
            await Donation.findOneAndUpdate({ transactionId: checkoutID }, { status: 'failed' });
        }

        res.status(200).send("Success");
    } catch (err) {
        console.error("❌ Callback Processing Error:", err.message);
        res.status(500).send("Internal Server Error");
    }
});

// --- 4. STATUS CHECK ---
router.get('/status/:checkoutID', async (req, res) => {
    try {
        const donation = await Donation.findOne({ transactionId: req.params.checkoutID });
        res.json({ status: donation ? donation.status : 'not_found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;