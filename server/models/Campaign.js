const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  // CHANGED: renamed from 'beneficiary' to 'userId' to match your routes
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    enum: [
      'Medical', 
      'Education', 
      'Emergency', 
      'Animals', 
      'Food', 
      'Clothes', 
      'Shelter', 
      'Family', 
      'Community', 
      'Creative'
    ],
    
    required: true 
  },
  target: { 
    type: String, 
    required: true 
  },
  location: { 
    type: Object, // Stores { label: "Nairobi", city: "Nairobi", ... }
    required: true 
  },
  story: { 
    type: String, 
    required: true 
  },
  targetAmount: { 
    type: Number, 
    required: true,
    min: [1, 'Target amount must be at least 1']
  },
  raisedAmount: { 
    type: Number, 
    default: 0 
  },
  coverMedia: { 
    type: String 
  },
  // CHANGED: Simplified to String to match your single-file upload logic in routes
  documents: { 
    type: String 
  },
  
  // --- AI VERIFICATION FIELDS ---
  verificationScore: { 
    type: Number, 
    default: null // null helps frontend show "Processing..." state
  },
  aiNotes: { 
    type: String,
    default: "Awaiting analysis..."
  },
  extractedText: { 
    type: String,
    default: ""
  },
  // ADDED: These are used in your runAIVerification function
  isHighRisk: { 
    type: Boolean, 
    default: false 
  },
  aiVerifiedAt: { 
    type: Date 
  },
  
  // --- DONOR ENGAGEMENT ---
  donorsCount: { 
    type: Number, 
    default: 0 
  },
  lastDonationAt: { 
    type: Date 
  },
  
  // --- CAMPAIGN STATUS ---
  status: { 
    type: String, 
    // ADDED: 'Verified' and 'Needs Review' to support your AI logic
    enum: ['Pending', 'Verified', 'Needs Review', 'Active', 'Rejected', 'Fulfilled'], 
    default: 'Pending' 
  },

  // --- ADMIN FEEDBACK ---
  rejectionReason: {
    type: String,
    default: ""
  },
  // ADDED: Supports the admin status update route
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Ensures virtuals show up in API responses
  toObject: { virtuals: true }
});

// --- VIRTUAL: Progress Percentage ---
campaignSchema.virtual('progress').get(function() {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  return Math.round((this.raisedAmount / this.targetAmount) * 100);
});

module.exports = mongoose.model('Campaign', campaignSchema);