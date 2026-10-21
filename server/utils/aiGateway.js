const axios = require('axios');

// Default to Python Flask AI microservice on port 5001
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * Sends extracted document text to the Python/Ollama AI microservice for forensic verification.
 * @param {string} text - The raw text extracted from the uploaded PDF/image document.
 * @returns {Promise<Object>} - Contains verificationScore, aiNotes, and isHighRisk.
 */
async function verifyDocumentWithAI(text) {
  try {
    if (!text || text.trim() === '') {
      return {
        verificationScore: 45,
        aiNotes: 'No extractable text found in document. Manual admin review required.',
        isHighRisk: false,
        status: 'Warning'
      };
    }

    const response = await axios.post(`${AI_SERVICE_URL}/verify-document`, {
      text: text
    }, {
      timeout: 35000 // 35s timeout to account for local CPU LLM inference
    });

    return {
      verificationScore: response.data.verificationScore ?? 50,
      aiNotes: response.data.aiNotes || 'AI analysis completed.',
      isHighRisk: response.data.isHighRisk ?? false,
      status: response.data.status || 'Success'
    };

  } catch (error) {
    console.error('AI Gateway communication error:', error.message);
    
    // Fallback response if the Python microservice or Ollama is offline
    return {
      verificationScore: 50,
      aiNotes: 'AI service unreachable or timed out. Default baseline score assigned; manual review recommended.',
      isHighRisk: false,
      status: 'Fallback'
    };
  }
}

/**
 * Checks if the Python AI microservice is online and responsive.
 */
async function checkAIServiceHealth() {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
    return response.data;
  } catch (error) {
    console.warn('AI microservice health check failed:', error.message);
    return { status: 'Offline' };
  }
}

module.exports = {
  verifyDocumentWithAI,
  checkAIServiceHealth
};