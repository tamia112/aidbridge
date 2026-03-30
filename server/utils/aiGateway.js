const axios = require('axios');

/**
 * Sends extracted document text to the Python AI service for verification.
 * Optimized for AidbridgE Analytics & Fraud Detection (SCI-04)
 */
const verifyDocument = async (text) => {
    try {
        // Calling your Flask service on port 5001
        const response = await axios.post('http://localhost:5001/verify-document', {
            text: text
        });
        
        const result = response.data;
        
        // --- ANALYTICS UPDATES ---
        // Flag high risk if score is critically low for the Admin "AI Trust Rate" stat
        result.isHighRisk = result.verificationScore < 30;
        
        // Ensure status is always passed for frontend conditional rendering
        result.status = "Success";
        
        return result;
    } catch (error) {
        console.error("AI Service Connection Failed:", error.message);
        return { 
            status: "error", 
            verificationScore: 0, 
            aiNotes: "AI Service Unreachable. Manual review required by Admin.",
            isHighRisk: true // Treat connectivity failure as high risk for safety
        };
    }
};

module.exports = { verifyDocument};