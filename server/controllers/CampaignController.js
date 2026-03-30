// POST: /api/campaigns/launch
router.post('/launch', auth, upload.fields([
  { name: 'coverMedia', maxCount: 1 },
  { name: 'documents', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, category, targetAmount, story, location, target } = req.body;

    // 1. OCR & AI Processing
    let combinedText = "";
    if (req.files['documents']) {
      combinedText = await extractTextFromImage(req.files['documents'][0].path);
    }
    const aiResult = await verifyDocumentWithAI(combinedText);

    // 2. Create MongoDB Document
    const newCampaign = new Campaign({
      // FIX 1: Changed 'beneficiary' to 'userId' to match your Schema
      userId: req.user.id, 
      title,
      category,
      target,
      targetAmount: Number(targetAmount),
      story,
      location: location ? JSON.parse(location) : {},
      coverMedia: req.files['coverMedia'] ? req.files['coverMedia'][0].path : null,
      
      // FIX 2: Changed from Array to String to match your Schema's 'type: String'
      documents: req.files['documents'] ? req.files['documents'][0].path : null,
      
      verificationScore: aiResult.verificationScore || 0,
      aiNotes: aiResult.aiNotes || "Processing...",
      extractedText: combinedText,
      
      // Ensure status allows it to show up in Discover later
      status: 'Pending' 
    });

    const saved = await newCampaign.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error("Launch Error:", err);
    res.status(500).json({ error: "Creation failed: " + err.message });
  }
});