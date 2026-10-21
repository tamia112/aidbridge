/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, LayoutDashboard, User, Bell, LogOut,
  Wallet, TrendingUp, Clock, ChevronRight, Search,
  Menu, X, ShieldCheck, CheckCircle, AlertTriangle,
  XCircle, Hourglass, Sparkles
} from 'lucide-react';
import NotificationItem from '../../components/NotificationItem';
import ProfileTab from '../../components/ProfileTab';

/* ─── Campaign status config ─────────────────────────────────────── */
const STATUS_CFG = {
  Pending:   { label: 'Pending Review', color: '#f59e0b', bg: '#fef3c7', textColor: '#92400e', icon: <Hourglass size={13}/> },
  Verified:  { label: 'AI Verified',    color: '#1db09c', bg: '#d1fae5', textColor: '#065f46', icon: <ShieldCheck size={13}/> },
  Active:    { label: 'Active',         color: '#3b82f6', bg: '#dbeafe', textColor: '#1e40af', icon: <CheckCircle size={13}/> },
  Fulfilled: { label: 'Fulfilled',      color: '#8b5cf6', bg: '#ede9fe', textColor: '#5b21b6', icon: <Sparkles size={13}/> },
  Rejected:  { label: 'Rejected',       color: '#ef4444', bg: '#fee2e2', textColor: '#991b1b', icon: <XCircle size={13}/> },
  'Needs Review': { label: 'Needs Review', color: '#f97316', bg: '#ffedd5', textColor: '#9a3412', icon: <AlertTriangle size={13}/> },
};

const getStatus = (camp) => {
  if (camp.verificationScore === null || camp.verificationScore === undefined) {
    return STATUS_CFG['Pending'];
  }
  if (camp.isHighRisk) return STATUS_CFG['Needs Review'];
  if (camp.verificationScore >= 70) return STATUS_CFG['Verified'];
  return STATUS_CFG['Needs Review'];
};

/* ─── Main Component ─────────────────────────────────────────────── */
const BeneficiaryDashboard = () => {
  const [activeTab, setActiveTab]       = useState('campaigns');
  const [campaigns, setCampaigns]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5000';

  /* close sidebar on ESC */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* data fetch */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || storedUser?.role?.toLowerCase() !== 'beneficiary') {
        localStorage.clear(); navigate('/login'); return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [userRes, campRes, notifRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/me`, { headers }),
          fetch(`${API_BASE}/api/campaigns/my-campaigns`, { headers }),
          fetch(`${API_BASE}/api/notifications/me`, { headers }),
        ]);
        if (userRes.ok)  setUserData(await userRes.json());
        if (campRes.ok)  { const d = await campRes.json();  setCampaigns(Array.isArray(d) ? d : []); }
        if (notifRes.ok) { const d = await notifRes.json(); setNotifications(Array.isArray(d) ? d : []); }
      } catch (err) { console.error('Dashboard sync error:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const switchTab = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  if (loading) return (
    <div style={s.loaderWrap}>
      <div style={s.spinner} />
      <p style={s.loaderText}>Loading your dashboard…</p>
      <style>{spinnerCSS}</style>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalRaised = campaigns.reduce((a, b) => a + (b.raisedAmount || 0), 0);

  /* ── NAV ITEMS ── */
  const NAV = [
    { id: 'campaigns', icon: <LayoutDashboard size={20}/>, label: 'Dashboard' },
    { id: 'notif',     icon: <Bell size={20}/>,            label: 'Updates',  badge: unreadCount },
    { id: 'profile',   icon: <User size={20}/>,            label: 'Profile' },
  ];

  /* ── SIDEBAR CONTENT (reused for both mobile overlay + desktop) ── */
  const SidebarContent = () => (
    <div style={s.sidebarInner}>
      {/* Brand */}
      <div style={s.brand} onClick={() => navigate('/')}>
        <div style={s.brandDot}>A</div>
        <div>
          <div style={s.brandName}>AidbridgE</div>
          <div style={s.brandSub}>Beneficiary Portal</div>
        </div>
      </div>

      {/* Nav */}
      <div style={s.navSection}>
        <div style={s.navLabel}>MAIN MENU</div>
        {NAV.map(item => (
          <button
            key={item.id}
            style={activeTab === item.id ? s.navActive : s.navItem}
            onClick={() => switchTab(item.id)}
          >
            <span style={activeTab === item.id ? s.navIconActive : s.navIcon}>{item.icon}</span>
            <span style={s.navText}>{item.label}</span>
            {item.badge > 0 && <span style={s.badge}>{item.badge}</span>}
            {activeTab === item.id && <div style={s.navPip} />}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={s.sideStats}>
        <div style={s.sideStatItem}>
          <div style={s.sideStatNum}>KES {totalRaised.toLocaleString()}</div>
          <div style={s.sideStatLabel}>Total Raised</div>
        </div>
        <div style={s.sideStatDivider} />
        <div style={s.sideStatItem}>
          <div style={s.sideStatNum}>{campaigns.length}</div>
          <div style={s.sideStatLabel}>Campaigns</div>
        </div>
      </div>

      {/* New campaign CTA */}
      <button style={s.newCampBtn} onClick={() => navigate('/StartCampaign')}>
        <PlusCircle size={17}/> New Campaign
      </button>

      {/* Logout */}
      <button style={s.logoutBtn} onClick={handleLogout}>
        <LogOut size={18}/> Sign Out
      </button>

      {/* AI badge */}
      <div style={s.aiBadge}>
        <ShieldCheck size={16} color="#1db09c"/>
        <div>
          <div style={s.aiBadgeTitle}>AI Protected</div>
          <div style={s.aiBadgeText}>All campaigns verified by Llama3</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{globalCSS}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside data-sidebar="desktop" style={s.desktopSidebar}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY BACKDROP ── */}
      <div
        data-overlay="true"
        ref={overlayRef}
        style={{ ...s.overlay, opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'all' : 'none' }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── MOBILE SLIDING SIDEBAR ── */}
      <aside data-sidebar="mobile" style={{ ...s.mobileSidebar, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <button style={s.closeBtn} onClick={() => setSidebarOpen(false)}>
          <X size={20} color="rgba(255,255,255,0.7)"/>
        </button>
        <SidebarContent />
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>

        {/* Top header */}
        <header style={s.header}>
          {/* Hamburger — always visible */}
          <button style={s.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={22} color="#1e293b"/>
          </button>

          <div style={s.searchBar}>
            <Search size={17} color="#94a3b8"/>
            <input placeholder="Search campaigns…" style={s.searchInput}/>
          </div>

          <div style={s.userChip}>
            <div style={s.userInfo}>
              <span style={s.userName}>{userData?.name || 'User'}</span>
              <span style={s.userRole}>Beneficiary</span>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'U')}&background=1db09c&color=fff&bold=true`}
              style={s.avatar} alt="avatar"
            />
          </div>
        </header>

        {/* Scrollable content */}
        <div style={s.scroll}>

          {/* ── CAMPAIGNS TAB ── */}
          {activeTab === 'campaigns' && (
            <>
              <div style={s.welcomeRow}>
                <div>
                  <h1 style={s.h1}>Welcome back, {userData?.name?.split(' ')[0]}! 👋</h1>
                  <p style={s.subtitle}>Here's what's happening with your aid campaigns.</p>
                </div>
                <button style={s.primaryBtn} onClick={() => navigate('/StartCampaign')}>
                  <PlusCircle size={18}/> New Campaign
                </button>
              </div>

              {/* Stat cards */}
              <div style={s.statsGrid}>
                <StatCard
                  title="Total Raised" icon={<Wallet size={20} color="#1db09c"/>}
                  value={`KES ${totalRaised.toLocaleString()}`} sub="Lifetime earnings" color="#1db09c"
                />
                <StatCard
                  title="Active" icon={<TrendingUp size={20} color="#3b82f6"/>}
                  value={campaigns.filter(c => c.status === 'Active' || c.status === 'Verified').length}
                  sub="Live campaigns" color="#3b82f6"
                />
                <StatCard
                  title="Pending AI" icon={<Clock size={20} color="#f59e0b"/>}
                  value={campaigns.filter(c => c.verificationScore === null || c.verificationScore === undefined).length}
                  sub="Awaiting verification" color="#f59e0b"
                />
              </div>

              {/* Campaign grid */}
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Your Campaigns</h2>
                <span style={s.sectionCount}>{campaigns.length} total</span>
              </div>

              {campaigns.length > 0 ? (
                <div style={s.campGrid}>
                  {campaigns.map(camp => (
                    <CampaignCard key={camp._id} camp={camp} API_BASE={API_BASE}/>
                  ))}
                </div>
              ) : (
                <div style={s.empty}>
                  <div style={s.emptyIcon}>🌱</div>
                  <h3 style={s.emptyTitle}>No campaigns yet</h3>
                  <p style={s.emptyText}>Launch your first campaign and start receiving aid from donors.</p>
                  <button style={s.primaryBtn} onClick={() => navigate('/StartCampaign')}>
                    <PlusCircle size={18}/> Start Campaign
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notif' && (
            <div style={{ maxWidth: '760px' }}>
              <h1 style={s.h1}>Notifications</h1>
              <p style={s.subtitle}>Updates about your campaigns and donations.</p>
              <div style={{ marginTop: '28px' }}>
                {notifications.length > 0
                  ? notifications.map(n => <NotificationItem key={n._id} notification={n} onMarkRead={handleMarkAsRead}/>)
                  : <div style={s.empty}><div style={s.emptyIcon}>🔔</div><h3 style={s.emptyTitle}>All caught up!</h3><p style={s.emptyText}>No new notifications.</p></div>
                }
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <ProfileTab userData={userData} onUpdate={(u) => setUserData(u)}/>
          )}
        </div>
      </main>
    </div>
  );
};

/* ─── StatCard ───────────────────────────────────────────────────── */
const StatCard = ({ title, icon, value, sub, color }) => (
  <div style={s.statCard}>
    <div style={{ ...s.statIconBox, backgroundColor: `${color}18` }}>{icon}</div>
    <div style={{ ...s.statValue, color }}>{value}</div>
    <div style={s.statTitle}>{title}</div>
    <div style={s.statSub}>{sub}</div>
  </div>
);

/* ─── CampaignCard ───────────────────────────────────────────────── */
const CampaignCard = ({ camp, API_BASE }) => {
  const progress = Math.min(((camp.raisedAmount || 0) / (camp.targetAmount || 1)) * 100, 100);
  const statusCfg = STATUS_CFG[camp.status] || getStatus(camp);

  return (
    <div style={s.campCard} className="camp-card">
      {/* Cover image */}
      <div style={s.campImgWrap}>
        <img
          src={camp.coverMedia ? `${API_BASE}/${camp.coverMedia}` : '/images/people.png'}
          style={s.campImg} alt={camp.title}
          onError={e => { e.target.src = '/images/people.png'; }}
        />
        {/* Status badge */}
        <div style={{ ...s.statusBadge, backgroundColor: statusCfg.bg, color: statusCfg.textColor, border: `1px solid ${statusCfg.color}40` }}>
          {statusCfg.icon} {statusCfg.label}
        </div>
        {/* AI score pill */}
        {camp.verificationScore !== null && camp.verificationScore !== undefined && (
          <div style={s.scorePill}>
            <ShieldCheck size={11} color="#1db09c"/> {camp.verificationScore}/100
          </div>
        )}
      </div>

      <div style={s.campBody}>
        <div style={s.campCategory}>{camp.category}</div>
        <h3 style={s.campTitle}>{camp.title}</h3>

        {/* Progress */}
        <div style={s.progRow}>
          <span style={s.progLabel}>KES {(camp.raisedAmount || 0).toLocaleString()}</span>
          <span style={s.progPct}>{Math.round(progress)}%</span>
        </div>
        <div style={s.progBg}>
          <div style={{ ...s.progFill, width: `${progress}%`, backgroundColor: statusCfg.color }}/>
        </div>
        <div style={s.progGoal}>of KES {(camp.targetAmount || 0).toLocaleString()} goal</div>

        <button style={s.manageBtn} className="manage-btn">
          Manage Campaign <ChevronRight size={15}/>
        </button>
      </div>
    </div>
  );
};

/* ─── STYLES ─────────────────────────────────────────────────────── */
const TEAL = '#1db09c';
const DARK = '#0f172a';

const s = {
  page:           { display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif", overflow: 'hidden' },

  /* Desktop sidebar — always visible at ≥900px */
  desktopSidebar: { width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column' },

  /* Mobile sliding sidebar */
  mobileSidebar:  { position: 'fixed', top: 0, left: 0, height: '100%', width: '300px', zIndex: 1000, transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)', willChange: 'transform' },

  overlay:        { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 999, transition: 'opacity 0.3s ease', backdropFilter: 'blur(2px)' },

  /* Shared sidebar inner */
  sidebarInner:   { backgroundColor: DARK, height: '100%', padding: '28px 22px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' },
  brand:          { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer' },
  brandDot:       { width: '40px', height: '40px', borderRadius: '11px', backgroundColor: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '1.1rem', flexShrink: 0 },
  brandName:      { color: 'white', fontWeight: '900', fontSize: '1.05rem', letterSpacing: '0.3px' },
  brandSub:       { color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', fontWeight: '600' },

  navSection:     { marginBottom: '20px' },
  navLabel:       { color: 'rgba(255,255,255,0.25)', fontSize: '0.63rem', fontWeight: '800', letterSpacing: '1.5px', marginBottom: '10px', paddingLeft: '4px' },
  navItem:        { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: 'none', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.45)', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', marginBottom: '4px', position: 'relative' },
  navActive:      { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', border: 'none', backgroundColor: 'rgba(29,176,156,0.12)', color: TEAL, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: '700', marginBottom: '4px', position: 'relative' },
  navIcon:        { color: 'rgba(255,255,255,0.35)', display: 'flex' },
  navIconActive:  { color: TEAL, display: 'flex' },
  navText:        { flex: 1, fontSize: '0.9rem' },
  navPip:         { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: TEAL },
  badge:          { backgroundColor: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '2px 7px', borderRadius: '20px' },

  sideStats:      { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '14px 18px', margin: '8px 0', border: '1px solid rgba(255,255,255,0.07)' },
  sideStatItem:   { flex: 1, textAlign: 'center' },
  sideStatNum:    { color: TEAL, fontWeight: '900', fontSize: '1.05rem' },
  sideStatLabel:  { color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: '600', marginTop: '2px' },
  sideStatDivider:{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.08)' },

  newCampBtn:     { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: TEAL, color: 'white', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', margin: '8px 0', transition: 'all 0.2s' },
  logoutBtn:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', border: 'none', backgroundColor: 'transparent', color: '#f87171', borderRadius: '12px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', marginTop: '4px' },
  aiBadge:        { display: 'flex', gap: '10px', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto' },
  aiBadgeTitle:   { color: 'white', fontWeight: '700', fontSize: '0.8rem', marginBottom: '2px' },
  aiBadgeText:    { color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', lineHeight: '1.4' },

  closeBtn:       { position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 },

  /* Main area */
  main:           { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:         { height: '72px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 28px', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  menuBtn:        { width: '40px', height: '40px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' },
  searchBar:      { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '9px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', flex: 1, maxWidth: '320px' },
  searchInput:    { border: 'none', backgroundColor: 'transparent', outline: 'none', fontSize: '0.88rem', width: '100%', color: '#1e293b' },
  userChip:       { display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' },
  userInfo:       { textAlign: 'right' },
  userName:       { display: 'block', fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' },
  userRole:       { fontSize: '0.72rem', color: '#94a3b8' },
  avatar:         { width: '42px', height: '42px', borderRadius: '11px', objectFit: 'cover', border: `2px solid ${TEAL}30` },

  scroll:         { flex: 1, overflowY: 'auto', padding: '36px 32px' },

  welcomeRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  h1:             { fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' },
  subtitle:       { color: '#64748b', fontSize: '0.92rem' },
  primaryBtn:     { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: TEAL, color: 'white', padding: '11px 22px', borderRadius: '11px', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 14px ${TEAL}40`, transition: 'all 0.2s' },

  statsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '36px' },
  statCard:       { backgroundColor: 'white', borderRadius: '18px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statIconBox:    { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' },
  statValue:      { fontSize: '1.8rem', fontWeight: '900', marginBottom: '2px' },
  statTitle:      { fontWeight: '700', fontSize: '0.88rem', color: '#1e293b', marginBottom: '2px' },
  statSub:        { fontSize: '0.75rem', color: '#94a3b8' },

  sectionHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  sectionTitle:   { fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' },
  sectionCount:   { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' },

  campGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' },
  campCard:       { backgroundColor: 'white', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' },
  campImgWrap:    { position: 'relative', height: '175px' },
  campImg:        { width: '100%', height: '100%', objectFit: 'cover' },
  statusBadge:    { position: 'absolute', top: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' },
  scorePill:      { position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(15,23,42,0.75)', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)' },
  campBody:       { padding: '18px 20px 20px' },
  campCategory:   { fontSize: '0.7rem', fontWeight: '800', color: TEAL, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' },
  campTitle:      { fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px', lineHeight: 1.3 },
  progRow:        { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '7px' },
  progLabel:      {},
  progPct:        { color: '#0f172a', fontWeight: '800' },
  progBg:         { height: '7px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' },
  progFill:       { height: '100%', borderRadius: '10px', transition: 'width 0.6s ease' },
  progGoal:       { fontSize: '0.72rem', color: '#94a3b8', marginBottom: '16px' },
  manageBtn:      { width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#1e293b', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' },

  empty:          { backgroundColor: 'white', borderRadius: '20px', padding: '60px 32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  emptyIcon:      { fontSize: '3rem', marginBottom: '16px' },
  emptyTitle:     { fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  emptyText:      { color: '#64748b', marginBottom: '24px', fontSize: '0.92rem' },

  loaderWrap:     { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#f1f5f9' },
  spinner:        { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: `4px solid ${TEAL}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loaderText:     { color: '#64748b', fontWeight: '600', fontSize: '0.9rem' },
};

const spinnerCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;

const globalCSS = `
  @keyframes spin { to { transform: rotate(360deg); } }

  .camp-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.10) !important;
  }
  .manage-btn:hover {
    background-color: #f8fafc !important;
    border-color: #1db09c !important;
    color: #1db09c !important;
  }

  /* Hide desktop sidebar on small screens */
  @media (max-width: 900px) {
    [data-sidebar="desktop"] { display: none !important; }
  }

  /* On desktop, hide mobile sidebar (it overlaps) */
  @media (min-width: 901px) {
    [data-sidebar="mobile"] { display: none !important; }
    [data-overlay] { display: none !important; }
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

export default BeneficiaryDashboard;