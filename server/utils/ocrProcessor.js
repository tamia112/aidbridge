const Tesseract = require('tesseract.js');
const path = require('path');

const extractTextFromImage = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    // PDFs cannot be read by Tesseract.js directly
    // Return empty string so AI still runs with fallback score
    if (ext === '.pdf') {
        console.log("OCR: PDF detected — skipping OCR, sending to AI for scoring only.");
        return "PDF document uploaded. Manual review recommended.";
    }

    try {
        console.log("OCR: Processing image...");
        const { data: { text } } = await Tesseract.recognize(
            filePath,
            'eng',
            { logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }}
        );
        return text;
    } catch (error) {
        console.error("OCR Error:", error.message);
        return ""; // Safe fallback — AI will still run with empty text
    }
};

module.exports = { extractTextFromImage };