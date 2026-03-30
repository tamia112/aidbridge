/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, Wallet, Search, ShieldCheck, ArrowRight, 
  Star, LogOut, User, LayoutDashboard, Bell, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileTab from '../../components/ProfileTab';
import NotificationItem from '../../components/NotificationItem';
import CampaignCard from '../../components/CampaignCard';

import './DonorDashboard.css';

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myDonations, setMyDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ totalContributed: 0, livesImpacted: 0, activeSupports: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5000";
  
const getImageUrl = (path) => {
  if (!path) return '/images/adoption.jpg';
  if (path.startsWith('http')) return path;

  // 1. Normalize slashes (Windows to Unix)
  // 2. Remove any leading slashes so we start fresh
  let cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');

  // 3. Check if 'uploads/' is already at the start of the string.
  // If it's NOT there, we add it, because your backend requires it.
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }

  return `${API_BASE}/${cleanPath}`;
};

  

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [statsRes, userRes, notifRes] = await Promise.all([
          axios.get(`${API_BASE}/api/donors/me/stats`, config),
          axios.get(`${API_BASE}/api/auth/me`, config),
          axios.get(`${API_BASE}/api/notifications/me`, config)
        ]);
        
        setMyDonations(statsRes.data.history || []);
        setStats(statsRes.data.summary || { totalContributed: 0, livesImpacted: 0, activeSupports: 0 });
        setUserData(userRes.data);
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonorData();
  }, [navigate]);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`${API_BASE}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex-center">
      <div className="spinner"></div>
      <p style={{ color: '#64748b', fontWeight: '600' }}>Syncing your impact...</p>
    </div>
  );

  return (
    <div className="donor-wrapper">
      <div className="donor-container">
        
        {/* SIDEBAR */}
        <aside className="donor-sidebar">
          <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon"><Heart fill="white" size={20}/></div>
            <span>AidbridgE</span>
          </div>
          
          <nav className="side-nav">
            <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18}/> <span>Overview</span>
            </button>

            <button className={`nav-link ${activeTab === 'notif' ? 'active' : ''}`} onClick={() => setActiveTab('notif')}>
              <Bell size={18}/> <span>Updates</span>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>

            <button className="nav-link" onClick={() => navigate('/discover')}>
              <Search size={18}/> <span>Find Campaigns</span>
            </button>

            <button className="nav-link" onClick={() => navigate('/Testimonials')}>
              <Star size={18}/> <span>Impact Stories</span>
            </button>

            <button className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <User size={18}/> <span>My Profile</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn"><LogOut size={18}/> <span>Sign Out</span></button>
            <div className="ai-status">
              <ShieldCheck size={14} color="#26C2B9"/>
              <span>AI Security Active</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="donor-main">
          <header className="donor-header">
            <div className="welcome-text">
              <h1>
                {activeTab === 'dashboard' && 'Giving Dashboard'}
                {activeTab === 'notif' && 'Impact Updates'}
                {activeTab === 'profile' && 'Account Settings'}
              </h1>
              <p>Welcome back, {userData?.name?.split(' ')[0] || 'Donor'}.</p>
            </div>
            <div className="user-nav">
                <div className="user-avatar">{userData?.name?.charAt(0) || 'U'}</div>
            </div>
          </header>

          <div className="donor-scroll-area">
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <section className="hero-impact-section">
                    <div className="hero-image-container">
                      <img 
                        src="/images/child.png" 
                        alt="Impact" 
                        className="hero-main-img" 
                        onError={(e) => { e.target.src = '/images/people.png'; }}
                      />
                      <div className="hero-overlay">
                        <div className="hero-content">
                          <span className="hero-tag">Community Impact</span>
                          <h2>Empowering the next generation</h2>
                          <p>Through your verified contributions, you are helping bridge the gap for medical aid in Nairobi.</p>
                          <button className="hero-btn" onClick={() => navigate('/discover')}>
                            See Active Causes <ArrowRight size={16}/>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="impact-stats-vertical">
                      <StatCard 
                        label="Total Donated" 
                        value={`KES ${stats.totalContributed.toLocaleString()}`} 
                        icon={<Wallet color="#26C2B9"/>} 
                      />
                      <StatCard 
                        label="Causes Supported" 
                        value={`${stats.livesImpacted}`} 
                        icon={<Heart color="#ef4444"/>} 
                      />
                    </div>
                  </section>

                  <div className="dashboard-grid">
                    <div className="history-panel">
                      <div className="panel-header">
                        <h3>Recent Activity</h3>
                        <button className="view-all" onClick={() => navigate('/discover')}>View More</button>
                      </div>
                      
                      <div className="donation-cards-scroll">
                        {myDonations.length > 0 ? (
                          myDonations.slice(0, 3).map((item, idx) => (
                            <div key={item._id || idx} className="donor-campaign-card">
                              <div className="donor-card-img-wrap" style={{ position: 'relative' }}>
                                <img 
                                  src={getImageUrl(item.coverMedia)} 
                                  className="donor-card-img" 
                                  alt={item.campaignTitle} 
                                  onError={(e) => {
                                    e.target.src = '/images/adoption.jpg';
                                    e.target.onerror = null;
                                  }} 
                                />
                                <div className="verified-overlay-badge">
                                  <TrendingUp size={10} color="#26C2B9"/> Verified
                                </div>
                              </div>
                                
                              <div className="donor-card-details">
                                <span className="donor-card-cat">Impact Tracking</span>
                                <h4>{item.campaignTitle}</h4>
                                <div className="donor-card-badge">
                                  KES {item.amount?.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state-mini">
                            <p className="empty-msg">No recent donations found.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="trust-panel">
                      <div className="trust-header">
                        <ShieldCheck color="#26C2B9" size={24}/>
                        <h3>Verified Safe</h3>
                      </div>
                      <p>Every campaign you support is analyzed by AI to ensure your funds reach those in genuine medical need.</p>
                      <div className="trust-meter">
                        <div className="meter-label">Platform Trust Rate <span>98.2%</span></div>
                        <div className="meter-bar">
                          <div className="meter-fill" style={{width: '98.2%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notif' && (
                <motion.div 
                  key="notif"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="notif-view"
                >
                  <div className="notif-container">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <NotificationItem key={n._id} notification={n} onMarkRead={handleMarkAsRead} />
                      ))
                    ) : (
                      <div className="empty-notif">
                        <Bell size={40} color="#cbd5e1"/>
                        <h3>No updates yet</h3>
                        <p>When a campaign you support reaches a milestone, you'll hear about it here.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProfileTab userData={userData} onUpdate={(u) => setUserData(u)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="mini-impact-card">
    <div className="m-icon-box">{icon}</div>
    <div className="m-text">
      <label>{label}</label>
      <span className="m-val">{value}</span>
    </div>
  </div>
);

export default DonorDashboard;