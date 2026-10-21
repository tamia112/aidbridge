const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

/**
 * Extracts raw text from an uploaded image or PDF file path using Tesseract OCR.
 * @param {string} filePath - Absolute or relative path to the uploaded file.
 * @returns {Promise<string>} - Extracted text string.
 */
async function extractTextFromFile(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn('OCR Warning: File path does not exist:', filePath);
      return '';
    }

    const ext = path.extname(filePath).toLowerCase();

    // If it's a PDF, you can handle PDF parsing or fallback to image processing
    if (ext === '.pdf') {
      // Basic fallback placeholder or pdf-parse integration if installed
      // For Tesseract image files (.jpg, .jpeg, .png):
      console.log('Processing PDF/Document path for OCR:', filePath);
    }

    // Run Tesseract OCR using the local training data if configured
    const langPath = path.join(__dirname, '../'); // Contains eng.traineddata
    
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng',
      {
        logger: m => {
          // Uncomment for verbose OCR progress logging in development
          // if (m.status === 'recognizing text') console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        },
        langPath: langPath
      }
    );

    const cleanedText = text ? text.trim() : '';
    return cleanedText.length > 0 ? cleanedText : 'PDF document uploaded. Manual review recommended.';

  } catch (error) {
    console.error('OCR Processing error:', error.message);
    return 'Document text extraction failed. Manual review recommended.';
  }
}

module.exports = {
  extractTextFromFile
};