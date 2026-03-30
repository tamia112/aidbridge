import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Shield, Activity, Heart, MailOpen, Code } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-refined">
      <div className="footer-container-modern">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="brand-compact">
            <h2 className="logo">AidbridgE</h2>
            <p className="tagline-sm">
              Empowering Kenyan communities through transparent M-Pesa donations and AI-verified aid management.
            </p>
            <div className="badge-group">
              <span className="badge-mini">
                <Shield size={12} />
                AI Verified
              </span>
              <span className="badge-mini">
                <Activity size={12} />
                Real-time Tracking
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="link-section">
            <div className="link-col">
              <h4>Campaigns</h4>
              <ul>
                <li><Link to="/discover">Campaigns</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/user-guide">Helpline</Link></li>
              </ul>
            </div>
            <div className="link-col">
              <h4>My Account</h4>
              <ul>
                <li><Link to="/user-guide">Contact Us</Link></li>
                <li><Link to="/Testimonials">Testimonies</Link></li>
                <li><Link to="/Register">Start an AidbridgeE</Link></li>
              </ul>
            </div>
          </div>

          {/* Support Section */}
          <div className="support-compact">
            <h4>Support & Dev</h4>
            <div className="btn-stack">
              <button 
                className="btn-ticket-modern"
                onClick={() => {
                  const subject = encodeURIComponent("AidbridgeE: New Support Ticket");
                  const body = encodeURIComponent("Please describe your issue below:\n\n---\nIssue Type:\nDescription:");
                  window.location.href = `mailto:support@aidbridge.org?subject=${subject}&body=${body}`;
                }}
              >
                <MailOpen size={12} />
                OPEN SUPPORT TICKET
              </button>
              
              <button 
                className="btn-email-modern"
                onClick={() => {
                  const subject = encodeURIComponent("AidbridgeE: Developer Inquiry");
                  window.location.href = `mailto:tamiamwandu472@gmail.com?subject=${subject}`;
                }}
              >
                <Code size={12} />
                EMAIL DEV TEAM
              </button>
            </div>
            
            <div className="contact-micro">
              <div className="contact-row">
                <Mail size={14} className="icon-teal" />
                <span>support@aidbridge.org</span>
              </div>
              <div className="contact-row">
                <MapPin size={14} className="icon-teal" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
            
            <div className="social-micro">
              <div className="social-icon-wrapper">
                <Heart size={14} />
                <span>Sustainable impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-compact">
        <p>© 2026 AIDBRIDGE · SUSTAINABLE IMPACT</p>
        <div className="legal-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;