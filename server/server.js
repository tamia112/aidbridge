const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// --- ROUTE IMPORTS ---
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const donorRoutes = require('./routes/donors'); // NEW: Added for Donor Dashboard stats
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/payment');
const TestimonialsRoutes = require('./routes/Testimonials')

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serving the 'uploads' folder statically
// Supports: Documents, Campaign Covers, and Impact Images (Children/Stories)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- DATABASE CONNECTION ---
// Using modern Mongoose connection options for reliability (SDS 1.4)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ AidbridgE: Connected to MongoDB Atlas"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); 
  });

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes); 
app.use('/api/analytics', analyticsRoutes);
app.use('/api/donors', donorRoutes); 
app.use('/api/notifications',  notificationRoutes); 
app.use('/api/payment', paymentRoutes);
app.use('/api/Testimonials', TestimonialsRoutes);// NEW: Endpoint for Donor Impact & History


// --- SYSTEM STATUS ENDPOINT (For Admin/Donor Dashboards) ---
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "Healthy", 
    timestamp: new Date(),
    services: { db: "Connected", ai_module: "Online" } 
  });
});

// --- GLOBAL ERROR HANDLER (SDS 1.3: Robustness) ---
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${err.message}`);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : {} 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AidbridgE Command Center running on port ${PORT}`);
});