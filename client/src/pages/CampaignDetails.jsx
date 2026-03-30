/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, ShieldCheck, Loader2, ArrowRight, TrendingUp, 
  MapPin, CheckCircle2, Users, Sparkles, X, Heart, Info,
  Plus, Minus, Edit2
} from 'lucide-react';
import './CampaignDetails.css';

const CampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [phone, setPhone] = useState('254');
  const [isPaying, setIsPaying] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const BACKEND_URL = 'http://localhost:5000';

  // Function to fetch latest campaign data
  const fetchCampaignData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/campaigns/${id}`);
      const data = await res.json();
      setCampaign(data);
    } catch (err) {
      console.error("Error fetching campaign:", err);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setShowCustomInput(false);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      if (value !== '') {
        setSelectedAmount(parseInt(value));
      }
    }
  };

  const handleCustomAmountBlur = () => {
    if (customAmount && parseInt(customAmount) > 0) {
      setSelectedAmount(parseInt(customAmount));
    } else {
      setCustomAmount('');
      setShowCustomInput(false);
      setSelectedAmount(100);
    }
  };

  const toggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
    if (!showCustomInput) {
      setCustomAmount('');
    } else if (customAmount) {
      setSelectedAmount(parseInt(customAmount));
    }
  };

  // The Updated handlePay with Polling Logic
  const handlePay = async () => {
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
    if (formattedPhone.startsWith('7')) formattedPhone = '254' + formattedPhone;
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);

    if (formattedPhone.length !== 12) return alert("Please use format 2547XXXXXXXX");
    if (!selectedAmount || selectedAmount < 10) return alert("Minimum donation is KES 10");
    
    setIsPaying(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/mpesa-stk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          phone: formattedPhone, 
          amount: selectedAmount, 
          campaignId: id 
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`🚀 Request Sent! Please check your phone for the M-Pesa PIN prompt.`);
        
        // --- POLLING LOGIC START ---
        // We check the server every 3 seconds to see if the campaign amount has updated
        let attempts = 0;
        const maxAttempts = 10; // Poll for 30 seconds total

        const pollInterval = setInterval(async () => {
          attempts++;
          const checkRes = await fetch(`${BACKEND_URL}/api/campaigns/${id}`);
          const updatedCampaign = await checkRes.json();

          // If the raised amount has changed, the transaction was successful!
          if (updatedCampaign.raisedAmount !== campaign.raisedAmount) {
            setCampaign(updatedCampaign);
            clearInterval(pollInterval);
            setIsPaying(false);
            alert("✨ Thank you! Your donation has been received.");
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setIsPaying(false);
          }
        }, 3000);
        // --- POLLING LOGIC END ---

      } else {
        alert(data.error || "M-Pesa request failed.");
        setIsPaying(false);
      }
    } catch (err) {
      alert("Could not connect to the payment server.");
      setIsPaying(false);
    }
  };

  if (!campaign) return (
    <div className="campaign-details-loader">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
  const displayName = campaign.beneficiary?.name || campaign.beneficiaryName || campaign.creator?.name || "Verified Member";

  return (
    <div className="campaign-details-container">
      {/* Story Modal */}
      <AnimatePresence>
        {showStoryModal && (
          <div className="story-modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowStoryModal(false)}
              className="story-modal-backdrop"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="story-modal-content"
            >
              <div className="story-modal-header-bar" />
              <div className="story-modal-body">
                <button 
                  onClick={() => setShowStoryModal(false)}
                  className="story-modal-close-btn"
                >
                  <X size={24} />
                </button>
                
                <div className="story-modal-title-section">
                  <div className="story-modal-icon">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="story-modal-title">The Full Mission</h3>
                    <p className="story-modal-subtitle">Advocated by {displayName}</p>
                  </div>
                </div>

                <p className="story-modal-text">
                  {campaign.story}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="campaign-details-grid">
        <div className="campaign-details-left">
          <header className="campaign-header">
            <div className="campaign-badge-container">
              <span className="campaign-category-badge">
                {campaign.category || 'Humanity'}
              </span>
              <div className="campaign-location">
                <MapPin size={12} /> {campaign.location?.city || 'Kenya'}
              </div>
            </div>
            <h1 className="campaign-title">
              {campaign.title}
            </h1>
          </header>

          <div className="campaign-image-container">
            <img 
              src={`${BACKEND_URL}/${campaign.coverMedia?.replace(/\\/g, '/')}`} 
              className="campaign-image" 
              alt="Campaign" 
            />
          </div>

          <div className="impact-agent-card">
            <div className="impact-agent-icon">
              <Users size={28} />
            </div>
            <div>
              <p className="impact-agent-label">Impact Agent</p>
              <p className="impact-agent-name">
                {displayName} <CheckCircle2 size={20} />
              </p>
            </div>
          </div>
        </div>

        <div className="campaign-details-right">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="donation-widget"
          >
            <div className="donation-widget-header">
              <div className="live-support-badge">
                <TrendingUp size={14} />
                <span>Live Support</span>
              </div>
              <h2 className="raised-amount">
                <span className="currency-symbol">KES</span>
                {campaign.raisedAmount?.toLocaleString()}
              </h2>
              <p className="goal-amount">
                Goal: KES {campaign.targetAmount?.toLocaleString()}
              </p>
            </div>

            <div className="progress-section">
              <div className="progress-bar-container">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }}
                  className="progress-bar-fill"
                />
              </div>
              <div className="progress-stats">
                <span>{campaign.donationsCount || 0} supporters</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="amount-selection">
              <div className="section-header">
                <p className="section-label">Choose Amount</p>
                <button onClick={toggleCustomInput} className="custom-amount-toggle">
                  <Edit2 size={14} />
                  {showCustomInput ? 'Preset Amounts' : 'Custom'}
                </button>
              </div>
              
              {!showCustomInput ? (
                <div className="amount-buttons">
                  {[100, 500, 1000, 2500, 5000].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => handleAmountSelect(amt)}
                      className={`amount-btn ${selectedAmount === amt && !customAmount ? 'amount-btn-active' : 'amount-btn-inactive'}`}
                    >
                      KES {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="custom-amount-container">
                  <div className="custom-amount-input-wrapper">
                    <span className="currency-prefix">KES</span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      onBlur={handleCustomAmountBlur}
                      placeholder="Enter amount"
                      className="custom-amount-input"
                      autoFocus
                    />
                    <div className="amount-adjust-buttons">
                      <button onClick={() => {
                        const newAmount = Math.max(10, (parseInt(customAmount) || 0) - 100);
                        setCustomAmount(newAmount.toString());
                        setSelectedAmount(newAmount);
                      }} className="adjust-btn">
                        <Minus size={16} />
                      </button>
                      <button onClick={() => {
                        const newAmount = (parseInt(customAmount) || 0) + 100;
                        setCustomAmount(newAmount.toString());
                        setSelectedAmount(newAmount);
                      }} className="adjust-btn">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="quick-add-buttons">
                    <button onClick={() => {
                      const newAmount = (parseInt(customAmount) || 0) + 500;
                      setCustomAmount(newAmount.toString());
                      setSelectedAmount(newAmount);
                    }} className="quick-add-btn">+500</button>
                    <button onClick={() => {
                      const newAmount = (parseInt(customAmount) || 0) + 1000;
                      setCustomAmount(newAmount.toString());
                      setSelectedAmount(newAmount);
                    }} className="quick-add-btn">+1000</button>
                    <button onClick={() => {
                      const newAmount = (parseInt(customAmount) || 0) + 5000;
                      setCustomAmount(newAmount.toString());
                      setSelectedAmount(newAmount);
                    }} className="quick-add-btn">+5000</button>
                  </div>
                </div>
              )}
              
              <div className="selected-amount-display">
                <span className="selected-label">You're donating:</span>
                <span className="selected-value">KES {selectedAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="phone-input-section">
              <p className="section-label">M-Pesa Number</p>
              <div className="phone-input-container">
                <Phone size={18} className="phone-icon" />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="phone-input"
                  placeholder="2547XXXXXXXX"
                />
              </div>
            </div>

            <div className="payment-section">
              <button onClick={handlePay} disabled={isPaying} className="pay-button">
                {isPaying ? <Loader2 className="animate-spin" size={20} /> : `Donate KES ${selectedAmount?.toLocaleString()}`}
                {!isPaying && <ArrowRight size={18} />}
              </button>

              <div className="security-info">
                <ShieldCheck size={22} />
                <p className="security-text">
                  Secured by M-Pesa Daraja. Funds go directly to {displayName}.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="story-side-card">
            <div className="story-card-header">
              <span style={{ color: '#26C2B9' }}><Info size={20} /></span>
              <h3 className="story-card-title">Campaign Story</h3>
            </div>
            <p className="story-card-text">
              {campaign.story.length > 280 
                ? `${campaign.story.substring(0, 280)}...` 
                : campaign.story}
            </p>
            <button 
              onClick={() => setShowStoryModal(true)}
              className="story-read-more-btn"
            >
              Read Full Story <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;