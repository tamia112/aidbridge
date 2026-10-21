/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle, XCircle, Activity, Search,
  BarChart3, Clock, Download, X, AlertTriangle, DollarSign,
  Users, FileText, Bell, Cpu, RefreshCw,
  TrendingUp, Award, Filter, ChevronRight, LogOut,
  Globe, ArrowUpRight, ArrowDownRight, Flame
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminDashboard.css';

//const API = 'http://localhost:5000';
import { API } from '../config';
const CHART_COLORS = ['#26C2B9', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444'];

const STATUS = {
  Pending:        { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  dot: '#f59e0b' },
  Verified:       { color: '#26C2B9', bg: 'rgba(38,194,185,0.1)',  border: 'rgba(38,194,185,0.3)',  dot: '#26C2B9' },
  Active:         { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.3)',  dot: '#0ea5e9' },
  Fulfilled:      { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  dot: '#6366f1' },
  Rejected:       { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   dot: '#ef4444' },
  'Needs Review': { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  dot: '#f97316' },
};

const mockTrend = () =>
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((name, i) => ({
    name,
    campaigns: Math.floor(8  + i * 3  + Math.random() * 6),
    donations:  Math.floor(40 + i * 12 + Math.random() * 20),
  }));

// Single source of truth for view titles — used by BOTH topbar and nav
const VIEW_TITLES = {
  overview:  'Mission Control',
  queue:     'Verification Queue',
  verified:  'Verified Campaigns',
  rejected:  'Rejected Campaigns',
  analytics: 'Analytics Engine',
  report:    'Generate Report',
};

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const searchRef = useRef(null);

  const [view,         setView]         = useState('overview');
  const [campaigns,    setCampaigns]    = useState([]);
  const [stats,        setStats]        = useState({ requests:0, donations:0, approved:0, rejected:0, aiTrustRate:0 });
  const [trend,        setTrend]        = useState([]);
  const [pieData,      setPieData]      = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [actioning,    setActioning]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alerts,       setAlerts]       = useState([]);
  const [alertOpen,    setAlertOpen]    = useState(false);
  const [time,         setTime]         = useState(new Date());

  // Report state
  const [reportType,      setReportType]      = useState('all');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportLoading,   setReportLoading]   = useState(false);
  const [reportPreview,   setReportPreview]   = useState([]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') { setSelected(null); setAlertOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const cfg   = { headers: { Authorization: `Bearer ${token}` } };
      const [campRes, statRes, trendRes] = await Promise.all([
        axios.get(`${API}/api/campaigns/admin/all`, cfg),
        axios.get(`${API}/api/analytics/admin-stats`, cfg),
        axios.get(`${API}/api/analytics/donation-trend`, cfg).catch(() => ({ data: [] })),
      ]);
      const camps = Array.isArray(campRes.data) ? campRes.data : [];
      setCampaigns(camps);
      const s = statRes.data || {};
      setStats({
        requests:    s.requests    ?? camps.length,
        donations:   s.donations   ?? 0,
        approved:    s.approved    ?? camps.filter(c => ['Verified','Active','Fulfilled'].includes(c.status)).length,
        rejected:    s.rejected    ?? camps.filter(c => c.status === 'Rejected').length,
        aiTrustRate: s.aiTrustRate ?? 0,
      });
      const td = Array.isArray(trendRes.data) && trendRes.data.length > 0 
           ? trendRes.data 
           : mockTrend(); // Fallback to mock if real data is 0
      setTrend(td);
      if (s.categoryData?.length) {
        setPieData(s.categoryData);
      } else {
        const map = {};
        camps.forEach(c => { map[c.category] = (map[c.category] || 0) + 1; });
        setPieData(Object.entries(map).map(([name, value]) => ({ name, value })));
      }
      setAlerts(camps
        .filter(c => c.isHighRisk || (c.verificationScore !== null && c.verificationScore < 40))
        .map(c => ({ id: c._id, title: c.title, score: c.verificationScore }))
      );
    } catch (e) { console.error('Fetch error:', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const visible = campaigns.filter(c => {
    const q      = search.toLowerCase();
    const matchQ = !q || c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
    const viewMap = { queue: ['Pending','Needs Review'], verified: ['Verified','Active'], rejected: ['Rejected'] };
    const matchV = !viewMap[view] || viewMap[view].includes(c.status);
    const matchF = statusFilter === 'all' || c.status === statusFilter;
    return matchQ && matchV && matchF;
  });

  const doAction = async (id, status) => {
    const reason = status === 'Rejected' ? prompt('Reason for rejection:') : '';
    if (status === 'Rejected' && reason === null) return;
    try {
      setActioning(true);
      const token = localStorage.getItem('token');
      await axios.patch(`${API}/api/campaigns/${id}/status`, { status, reason },
        { headers: { Authorization: `Bearer ${token}` } });
      setSelected(null);
      fetchAll();
    } catch { alert('Action failed.'); }
    finally { setActioning(false); }
  };

  // Filter campaigns for a given report type
  const getReportData = (type) => {
    switch (type) {
      case 'verified':   return campaigns.filter(c => ['Verified','Active','Fulfilled'].includes(c.status));
      case 'rejected':   return campaigns.filter(c => c.status === 'Rejected');
      case 'high-risk':  return campaigns.filter(c => c.isHighRisk || (c.verificationScore !== null && c.verificationScore < 40));
      case 'pending':    return campaigns.filter(c => ['Pending','Needs Review'].includes(c.status));
      default:           return campaigns;
    }
  };

  const handlePreviewReport = () => {
    setReportLoading(true);
    setTimeout(() => {
      setReportPreview(getReportData(reportType));
      setReportGenerated(true);
      setReportLoading(false);
    }, 600);
  };

  const handleDownloadPDF = () => {
    const data  = getReportData(reportType);
    const doc   = new jsPDF();
    const teal  = [38, 194, 185];
    const typeLabels = {
      all: 'All Campaigns', verified: 'Verified & Active',
      rejected: 'Rejected', 'high-risk': 'High Risk', pending: 'Pending Review',
    };
    const totalTarget = data.reduce((s,c) => s + (c.targetAmount||0), 0);
    const totalRaised = data.reduce((s,c) => s + (c.raisedAmount ||0), 0);

    doc.setFontSize(20); doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text('AIDBRIDGE — ADMIN AUDIT REPORT', 14, 20);
    doc.setFontSize(10); doc.setTextColor(80);
    doc.text(`Report Type: ${typeLabels[reportType]}`, 14, 28);
    doc.text(`Generated:   ${new Date().toLocaleString('en-KE')}`, 14, 33);
    doc.text(`Records: ${data.length}  |  Target: KES ${totalTarget.toLocaleString()}  |  Raised: KES ${totalRaised.toLocaleString()}`, 14, 38);
    doc.setFontSize(9); doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text(`AI Trust Rate: ${stats.aiTrustRate}%   |   Fraud Flags: ${stats.rejected}   |   Approved: ${stats.approved}`, 14, 44);

    autoTable(doc, {
      startY: 50,
      head: [['#','Title','Category','Status','AI Score','Target (KES)','Raised (KES)']],
      body: data.map((c,i) => [
        i+1,
        (c.title||'').slice(0,32) + (c.title?.length>32?'…':''),
        c.category||'—', c.status,
        c.verificationScore!=null ? `${c.verificationScore}/100` : 'PENDING',
        (c.targetAmount||0).toLocaleString(), (c.raisedAmount||0).toLocaleString(),
      ]),
      headStyles:         { fillColor: teal, textColor:[255,255,255], fontStyle:'bold', fontSize:9 },
      alternateRowStyles: { fillColor:[245,252,251] },
      bodyStyles:         { fontSize:8 },
      columnStyles: { 0:{cellWidth:8}, 1:{cellWidth:52}, 2:{cellWidth:22}, 3:{cellWidth:24}, 4:{cellWidth:20}, 5:{cellWidth:28}, 6:{cellWidth:28} },
      didDrawPage: (d) => {
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`AidBridgE System Report  ·  Page ${d.pageNumber}  ·  Confidential`, 14, doc.internal.pageSize.height-8);
      },
    });
    doc.save(`AidBridge_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  if (loading) return (
    <div className="ad-boot">
      <div className="ad-boot-ring"/>
      <p className="ad-boot-text">AIDBRIDGE OS · INITIALISING</p>
    </div>
  );

  const pendingCount = campaigns.filter(c => ['Pending','Needs Review'].includes(c.status)).length;

  // Single nav definition — used to render both sidebar items AND drive topbar title
  const NAV_MAIN = [
    { id:'overview',  icon:<Activity size={18}/>,   label:'Overview'                      },
    { id:'queue',     icon:<Clock size={18}/>,       label:'Queue',   badge: pendingCount  },
    { id:'verified',  icon:<CheckCircle size={18}/>, label:'Verified'                      },
    { id:'rejected',  icon:<XCircle size={18}/>,     label:'Rejected'                      },
    { id:'analytics', icon:<BarChart3 size={18}/>,   label:'Analytics'                     },
  ];
  const NAV_TOOLS = [
    { id:'report',    icon:<FileText size={18}/>,    label:'Generate Report', badge_text:'PDF' },
  ];

  return (
    <div className="ad-root">

      {/* SIDEBAR */}
      <aside className="ad-sidebar">
        <div className="ad-logo">
          <div className="ad-logo-icon"><ShieldCheck size={18} strokeWidth={2.5}/></div>
          <div>
            <div className="ad-logo-name">AidbridgE</div>
            <div className="ad-logo-sub">Admin OS</div>
          </div>
        </div>

        <div className="ad-clock">
          <div className="ad-clock-time">{time.toLocaleTimeString('en-US',{hour12:false})}</div>
          <div className="ad-clock-date">{time.toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short'})}</div>
        </div>

        <nav className="ad-nav">
          <div className="ad-nav-label">NAVIGATION</div>
          {NAV_MAIN.map(n => (
            <button key={n.id} className={`ad-nav-item ${view===n.id?'ad-nav-active':''}`} onClick={() => setView(n.id)}>
              <span className="ad-nav-icon">{n.icon}</span>
              <span className="ad-nav-label-text">{n.label}</span>
              {n.badge > 0 && <span className="ad-nav-badge">{n.badge}</span>}
            </button>
          ))}

          <div className="ad-nav-label" style={{marginTop:'24px'}}>SYSTEM TOOLS</div>
          {NAV_TOOLS.map(n => (
            <button key={n.id} className={`ad-nav-item ${view===n.id?'ad-nav-active':''}`}
              onClick={() => { setView(n.id); setReportGenerated(false); }}>
              <span className="ad-nav-icon">{n.icon}</span>
              <span className="ad-nav-label-text">{n.label}</span>
              {n.badge_text && <span className="ad-nav-badge-pdf">{n.badge_text}</span>}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-bottom">
          <button className="ad-alert-btn" onClick={() => setAlertOpen(p=>!p)}>
            <Bell size={16}/><span>Alerts</span>
            {alerts.length > 0 && <span className="ad-alert-count">{alerts.length}</span>}
          </button>
          <button className="ad-logout" onClick={logout}><LogOut size={15}/> Sign Out</button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ad-body">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <div className="ad-status-dot"/>
            {/* Topbar title comes from the same VIEW_TITLES map — always in sync */}
            <span className="ad-topbar-title">{VIEW_TITLES[view]}</span>
          </div>
          <div className="ad-topbar-right">
            <div className="ad-search-wrap">
              <Search size={15} color="#64748b"/>
              <input ref={searchRef} className="ad-search" placeholder="Search  ·  press /"
                value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <button className="ad-top-btn" title="Refresh" onClick={fetchAll}><RefreshCw size={15}/></button>
            {/* Download icon in topbar navigates to report view — consistent with sidebar */}
            <button className="ad-top-btn" title="Generate Report"
              onClick={() => { setView('report'); setReportGenerated(false); }}>
              <Download size={15}/>
            </button>
          </div>
        </header>

        <main className="ad-main">

          {/* OVERVIEW */}
          {view === 'overview' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
              <div className="ad-stat-row">
                {[
                  {label:'Total Campaigns',value:stats.requests,                               icon:<Globe size={20}/>,        delta:'+12%',up:true, color:'#26C2B9'},
                  {label:'Capital Flow',   value:`KES ${(stats.donations||0).toLocaleString()}`,icon:<DollarSign size={20}/>,   delta:'+8%', up:true, color:'#0ea5e9'},
                  {label:'AI Trust Rate',  value:`${stats.aiTrustRate}%`,                       icon:<Cpu size={20}/>,           delta:'+3%', up:true, color:'#6366f1'},
                  {label:'Fraud Flags',    value:stats.rejected,                                icon:<AlertTriangle size={20}/>, delta:'-2',  up:false,color:'#ef4444'},
                ].map((s,i) => (
                  <motion.div key={s.label} className="ad-stat-card"
                    initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
                    <div className="ad-stat-top">
                      <div className="ad-stat-icon" style={{background:`${s.color}15`,color:s.color}}>{s.icon}</div>
                      <span className={`ad-stat-delta ${s.up?'up':'down'}`}>
                        {s.up?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>} {s.delta}
                      </span>
                    </div>
                    <div className="ad-stat-value" style={{color:s.color}}>{s.value}</div>
                    <div className="ad-stat-label">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="ad-overview-grid">
                <div className="ad-panel ad-panel-wide">
                  <div className="ad-panel-head"><TrendingUp size={16} color="#26C2B9"/><span>Campaign Velocity</span><span className="ad-panel-sub">Last 7 days</span></div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={trend} margin={{top:10,right:10,bottom:0,left:-20}}>
                      <defs>
                        <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#26C2B9" stopOpacity={0.35}/><stop offset="95%" stopColor="#26C2B9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false}/>
                      <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:'#0f1923',border:'1px solid rgba(38,194,185,0.3)',borderRadius:'12px',color:'#fff',fontSize:'12px'}}/>
                      <Area type="monotone" dataKey="campaigns" stroke="#26C2B9" strokeWidth={2.5} fill="url(#gTeal)" dot={false}/>
                      <Area type="monotone" dataKey="donations"  stroke="#0ea5e9" strokeWidth={2}   fill="url(#gBlue)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="ad-panel">
                  <div className="ad-panel-head"><Filter size={15} color="#26C2B9"/><span>Status Breakdown</span></div>
                  <div className="ad-breakdown">
                    {Object.entries(campaigns.reduce((acc,c)=>{acc[c.status]=(acc[c.status]||0)+1;return acc;},{})).map(([st,cnt])=>{
                      const cfg=STATUS[st]||STATUS['Pending'];
                      const pct=campaigns.length?Math.round((cnt/campaigns.length)*100):0;
                      return (
                        <div key={st} className="ad-breakdown-row" onClick={()=>{setStatusFilter(st);setView('queue');}}>
                          <div className="ad-breakdown-left"><span className="ad-dot" style={{background:cfg.dot}}/><span className="ad-breakdown-name">{st}</span></div>
                          <div className="ad-breakdown-bar-wrap"><div className="ad-breakdown-bar" style={{width:`${pct}%`,background:cfg.dot}}/></div>
                          <span className="ad-breakdown-cnt">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="ad-panel" style={{marginTop:'24px'}}>
                <div className="ad-panel-head"><Flame size={15} color="#f59e0b"/><span>Latest Submissions</span><button className="ad-see-all" onClick={()=>setView('queue')}>See all <ChevronRight size={13}/></button></div>
                <div className="ad-recent-list">
                  {campaigns.slice(0,5).map((c,i)=>{
                    const cfg=STATUS[c.status]||STATUS['Pending'];
                    return (
                      <motion.div key={c._id} className="ad-recent-row" onClick={()=>setSelected(c)} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}>
                        <div className="ad-recent-num">{String(i+1).padStart(2,'0')}</div>
                        <div className="ad-recent-info"><div className="ad-recent-title">{c.title}</div><div className="ad-recent-meta">{c.category} · {c.location?.label||c.location||'—'}</div></div>
                        <div className="ad-recent-score">
                          {c.verificationScore!=null?<><span className="ad-score-num" style={{color:c.verificationScore>=70?'#26C2B9':c.verificationScore>=40?'#f59e0b':'#ef4444'}}>{c.verificationScore}</span><span className="ad-score-label">/100</span></>:<span style={{color:'#475569',fontSize:'0.75rem'}}>AI...</span>}
                        </div>
                        <span className="ad-status-chip" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{c.status}</span>
                        <ChevronRight size={16} color="#475569"/>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* QUEUE / VERIFIED / REJECTED */}
          {['queue','verified','rejected'].includes(view) && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.25}}>
              <div className="ad-filter-row">
                {['all','Pending','Needs Review','Verified','Active','Rejected','Fulfilled'].map(s=>(
                  <button key={s} className={`ad-chip ${statusFilter===s?'ad-chip-active':''}`} onClick={()=>setStatusFilter(s)}>{s}</button>
                ))}
                <span className="ad-filter-count">{visible.length} records</span>
              </div>
              {visible.length===0?(
                <div className="ad-empty"><ShieldCheck size={44} style={{opacity:0.2,marginBottom:'12px'}}/><p>Queue is clear.</p></div>
              ):(
                <div className="ad-card-grid">
                  {visible.map((c,i)=>{
                    const clean=(c.coverMedia||'').replace(/\\/g,'/');
                    const img=clean?`${API}/${clean.replace(/^\//,'')}`:`/images/people.jpg`;
                    const cfg=STATUS[c.status]||STATUS['Pending'];
                    const score=c.verificationScore;
                    return (
                      <motion.div key={c._id} className="ad-card" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} onClick={()=>setSelected(c)}>
                        <div className="ad-card-img" style={{backgroundImage:`url(${img})`}}>
                          {c.isHighRisk&&<div className="ad-risk-tag"><AlertTriangle size={11}/> HIGH RISK</div>}
                          <div className="ad-score-tag" style={{background:score>=70?'rgba(38,194,185,0.9)':score>=40?'rgba(245,158,11,0.9)':'rgba(239,68,68,0.9)'}}>{score!=null?`${score}/100`:'AI...'}</div>
                        </div>
                        <div className="ad-card-body">
                          <div className="ad-card-row">
                            <span className="ad-cat-tag">{c.category}</span>
                            <span className="ad-status-chip" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}><span className="ad-dot" style={{background:cfg.dot}}/>{c.status}</span>
                          </div>
                          <h3 className="ad-card-title">{c.title}</h3>
                          <p className="ad-card-story">{c.story?.slice(0,80)}…</p>
                          <div className="ad-card-foot"><span className="ad-amount">KES {c.targetAmount?.toLocaleString()}</span><span className="ad-loc">{c.location?.label||c.location||'—'}</span></div>
                          {score!=null&&<div className="ad-score-bar-bg"><div className="ad-score-bar-fill" style={{width:`${score}%`,background:score>=70?'#26C2B9':score>=40?'#f59e0b':'#ef4444'}}/></div>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS */}
          {view === 'analytics' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
              <div className="ad-stat-row">
                {[
                  {label:'Total Requests',value:stats.requests,                                 icon:<Activity size={20}/>,      color:'#26C2B9'},
                  {label:'Capital Flow',  value:`KES ${(stats.donations||0).toLocaleString()}`, icon:<DollarSign size={20}/>,    color:'#0ea5e9'},
                  {label:'Verified',      value:stats.approved,                                 icon:<CheckCircle size={20}/>,   color:'#6366f1'},
                  {label:'Fraud Flags',   value:stats.rejected,                                 icon:<AlertTriangle size={20}/>, color:'#ef4444'},
                ].map((s,i)=>(
                  <motion.div key={s.label} className="ad-stat-card" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
                    <div className="ad-stat-top"><div className="ad-stat-icon" style={{background:`${s.color}15`,color:s.color}}>{s.icon}</div></div>
                    <div className="ad-stat-value" style={{color:s.color}}>{s.value}</div>
                    <div className="ad-stat-label">{s.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="ad-analytics-grid">
                <div className="ad-panel ad-panel-wide">
                  <div className="ad-panel-head"><TrendingUp size={15} color="#26C2B9"/><span>Weekly Impact Stream</span></div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trend} margin={{top:10,right:10,bottom:0,left:-20}}>
                      <defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#26C2B9" stopOpacity={0.35}/><stop offset="95%" stopColor="#26C2B9" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false}/>
                      <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:'#0f1923',border:'1px solid rgba(38,194,185,0.3)',borderRadius:'12px',color:'#fff',fontSize:'12px'}}/>
                      <Area type="monotone" dataKey="campaigns" stroke="#26C2B9" strokeWidth={2.5} fill="url(#gA)" dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="ad-panel">
                  <div className="ad-panel-head"><BarChart3 size={15} color="#26C2B9"/><span>Donation Flow</span></div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trend} margin={{top:10,right:10,bottom:0,left:-20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} axisLine={false} tickLine={false}/>
                      <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:'#0f1923',border:'1px solid rgba(38,194,185,0.3)',borderRadius:'12px',color:'#fff',fontSize:'12px'}}/>
                      <Bar dataKey="donations" fill="#26C2B9" radius={[6,6,0,0]} maxBarSize={36}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {pieData.length>0&&(
                  <div className="ad-panel">
                    <div className="ad-panel-head"><Activity size={15} color="#26C2B9"/><span>Category Split</span></div>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={95} innerRadius={50} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                      </Pie><Tooltip contentStyle={{background:'#0f1923',border:'1px solid rgba(38,194,185,0.3)',borderRadius:'12px',color:'#fff',fontSize:'12px'}}/></PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="ad-panel ad-panel-wide">
                  <div className="ad-panel-head"><Award size={15} color="#f59e0b"/><span>AI Trust Distribution</span></div>
                  <div className="ad-trust-bands">
                    {[
                      {label:'High Trust (70–100)',  count:campaigns.filter(c=>c.verificationScore>=70).length,                                    color:'#26C2B9'},
                      {label:'Medium Trust (40–69)', count:campaigns.filter(c=>c.verificationScore>=40&&c.verificationScore<70).length,            color:'#f59e0b'},
                      {label:'Low Trust (0–39)',     count:campaigns.filter(c=>c.verificationScore!=null&&c.verificationScore<40).length,          color:'#ef4444'},
                      {label:'Pending AI',           count:campaigns.filter(c=>c.verificationScore==null||c.verificationScore===undefined).length, color:'#475569'},
                    ].map(b=>(
                      <div key={b.label} className="ad-trust-row">
                        <span className="ad-trust-label">{b.label}</span>
                        <div className="ad-trust-bar-bg"><div className="ad-trust-bar-fill" style={{width:campaigns.length?`${(b.count/campaigns.length)*100}%`:'0%',background:b.color}}/></div>
                        <span className="ad-trust-count" style={{color:b.color}}>{b.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* REPORT — proper view, same pattern as all other views */}
          {view === 'report' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
              <div className="ad-panel" style={{marginBottom:'20px'}}>
                <div className="ad-panel-head"><FileText size={15} color="#26C2B9"/><span>Report Configuration</span></div>

                <div style={{marginBottom:'20px'}}>
                  <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--muted)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'10px',fontFamily:"'DM Mono',monospace"}}>REPORT TYPE</div>
                  <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                    {[{id:'all',label:'All Campaigns'},{id:'verified',label:'Verified & Active'},{id:'rejected',label:'Rejected'},{id:'high-risk',label:'High Risk'},{id:'pending',label:'Pending Review'}].map(t=>(
                      <button key={t.id} className={`ad-chip ${reportType===t.id?'ad-chip-active':''}`}
                        onClick={()=>{setReportType(t.id);setReportGenerated(false);}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
                  {[
                    {label:'Records',      value:getReportData(reportType).length},
                    {label:'Total Target', value:`KES ${getReportData(reportType).reduce((s,c)=>s+(c.targetAmount||0),0).toLocaleString()}`},
                    {label:'Total Raised', value:`KES ${getReportData(reportType).reduce((s,c)=>s+(c.raisedAmount||0),0).toLocaleString()}`},
                    {label:'High Risk',    value:getReportData(reportType).filter(c=>c.isHighRisk).length},
                  ].map(m=>(
                    <div key={m.label} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'12px',padding:'14px 16px'}}>
                      <div style={{fontSize:'0.6rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'1.5px',fontFamily:"'DM Mono',monospace",marginBottom:'6px'}}>{m.label}</div>
                      <div style={{fontSize:'1.1rem',fontWeight:800,color:'var(--teal)'}}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{display:'flex',gap:'10px'}}>
                  <button onClick={handlePreviewReport} disabled={reportLoading}
                    style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 22px',borderRadius:'12px',border:'1px solid rgba(38,194,185,0.3)',background:'rgba(38,194,185,0.08)',color:'#26C2B9',fontWeight:700,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Syne',sans-serif",opacity:reportLoading?0.6:1}}>
                    {reportLoading
                      ?<><div style={{width:14,height:14,border:'2px solid rgba(38,194,185,0.3)',borderTop:'2px solid #26C2B9',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/> Generating…</>
                      :<><Activity size={14}/> Preview Report</>
                    }
                  </button>
                  <button onClick={handleDownloadPDF}
                    style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 22px',borderRadius:'12px',border:'none',background:'#26C2B9',color:'#000',fontWeight:800,fontSize:'0.82rem',cursor:'pointer',fontFamily:"'Syne',sans-serif",boxShadow:'0 4px 14px rgba(38,194,185,0.35)'}}>
                    <Download size={14}/> Download PDF
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {reportGenerated && (
                  <motion.div className="ad-panel" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>
                    <div className="ad-panel-head"><FileText size={15} color="#26C2B9"/><span>Preview — {reportPreview.length} records</span></div>
                    {reportPreview.length===0?(
                      <div className="ad-empty"><ShieldCheck size={36} style={{opacity:0.2,marginBottom:10}}/><p>No records match this filter.</p></div>
                    ):(
                      <div style={{overflowX:'auto'}}>
                        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.78rem'}}>
                          <thead><tr style={{borderBottom:'1px solid var(--border)'}}>
                            {['#','Title','Category','Status','AI Score','Target (KES)','Raised (KES)'].map(h=>(
                              <th key={h} style={{padding:'10px 12px',textAlign:'left',color:'var(--muted)',fontWeight:700,fontSize:'0.62rem',textTransform:'uppercase',letterSpacing:'1px',fontFamily:"'DM Mono',monospace",whiteSpace:'nowrap'}}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {reportPreview.map((c,i)=>{
                              const cfg=STATUS[c.status]||STATUS['Pending'];
                              const score=c.verificationScore;
                              return (
                                <tr key={c._id} style={{borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background 0.15s'}}
                                  onClick={()=>setSelected(c)}
                                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                  <td style={{padding:'10px 12px',color:'var(--muted)',fontFamily:"'DM Mono',monospace"}}>{String(i+1).padStart(2,'0')}</td>
                                  <td style={{padding:'10px 12px',color:'var(--text)',fontWeight:600,maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</td>
                                  <td style={{padding:'10px 12px'}}><span className="ad-cat-tag">{c.category}</span></td>
                                  <td style={{padding:'10px 12px'}}><span className="ad-status-chip" style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>{c.status}</span></td>
                                  <td style={{padding:'10px 12px',fontFamily:"'DM Mono',monospace",color:score>=70?'#26C2B9':score>=40?'#f59e0b':'#ef4444',fontWeight:800}}>{score!=null?`${score}/100`:'—'}</td>
                                  <td style={{padding:'10px 12px',color:'var(--teal)',fontFamily:"'DM Mono',monospace"}}>{(c.targetAmount||0).toLocaleString()}</td>
                                  <td style={{padding:'10px 12px',color:'var(--muted)',fontFamily:"'DM Mono',monospace"}}>{(c.raisedAmount||0).toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </main>
      </div>

      {/* ALERT DRAWER */}
      <AnimatePresence>
        {alertOpen&&(
          <motion.div className="ad-drawer" initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',stiffness:320,damping:34}}>
            <div className="ad-drawer-head"><AlertTriangle size={16} color="#f59e0b"/><span>Fraud Alerts</span><span className="ad-drawer-count">{alerts.length}</span><button className="ad-drawer-close" onClick={()=>setAlertOpen(false)}><X size={16}/></button></div>
            {alerts.length===0?<p style={{color:'#475569',padding:'20px',fontSize:'0.82rem'}}>No active alerts.</p>
              :alerts.map(a=>(
                <div key={a.id} className="ad-drawer-item" onClick={()=>{setSelected(campaigns.find(c=>c._id===a.id));setAlertOpen(false);}}>
                  <div className="ad-drawer-dot"/><div className="ad-drawer-info"><div className="ad-drawer-title">{a.title}</div><div className="ad-drawer-score">Score: {a.score??'Pending'}/100</div></div>
                  <ChevronRight size={14} color="#475569"/>
                </div>
              ))
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAMPAIGN MODAL */}
      <AnimatePresence>
        {selected&&(
          <motion.div className="ad-modal-bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
            <motion.div className="ad-modal" initial={{scale:0.92,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.92,opacity:0,y:20}} transition={{type:'spring',stiffness:300,damping:28}}>
              <button className="ad-modal-close" onClick={()=>setSelected(null)}><X size={18}/></button>
              <div className="ad-modal-grid">
                <div className="ad-modal-viewer">
                  {selected.documents?(
                    selected.documents.toLowerCase().endsWith('.pdf')
                      ?<iframe src={`${API}/${selected.documents.replace(/\\/g,'/')}`} className="ad-modal-iframe" title="doc"/>
                      :<img src={`${API}/${selected.documents.replace(/\\/g,'/')}`} className="ad-modal-img" alt="doc"/>
                  ):<div className="ad-modal-nodoc"><FileText size={48} style={{opacity:0.2}}/><p>No document uploaded</p></div>}
                </div>
                <div className="ad-modal-detail">
                  <div className="ad-modal-tags">
                    <span className="ad-cat-tag">{selected.category}</span>
                    {selected.isHighRisk&&<span className="ad-high-risk-tag"><AlertTriangle size={11}/> HIGH RISK</span>}
                  </div>
                  <h2 className="ad-modal-title">{selected.title}</h2>
                  <p className="ad-modal-story">{selected.story}</p>
                  <div className="ad-ai-box">
                    <div className="ad-ai-head"><Cpu size={14} color="#26C2B9"/> AI FORENSIC REPORT</div>
                    <p className="ad-ai-notes">"{selected.aiNotes||'Analysis in progress — check back shortly.'}"</p>
                    <div className="ad-ai-score-row">
                      <div className="ad-ai-score-ring" style={{borderColor:selected.verificationScore>=70?'#26C2B9':selected.verificationScore>=40?'#f59e0b':'#ef4444'}}>
                        <span style={{color:selected.verificationScore>=70?'#26C2B9':selected.verificationScore>=40?'#f59e0b':'#ef4444',fontSize:'1.4rem',fontWeight:900}}>{selected.verificationScore??'—'}</span>
                        <span style={{color:'#475569',fontSize:'0.65rem'}}>/ 100</span>
                      </div>
                      <div className="ad-ai-score-info">
                        <div style={{fontWeight:700,color:'#e2e8f0',fontSize:'0.85rem'}}>
                          {selected.verificationScore>=70?'Low Risk — Appears Genuine':selected.verificationScore>=40?'Medium Risk — Review Needed':selected.verificationScore!=null?'High Risk — Likely Fraudulent':'Awaiting AI Verification'}
                        </div>
                        <div style={{color:'#475569',fontSize:'0.75rem',marginTop:'3px'}}>{selected.isHighRisk?'⚠ Manual review recommended':'AI confidence threshold checked'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="ad-meta-grid">
                    {[{k:'Beneficiary',v:selected.target||'—'},{k:'Location',v:selected.location?.label||selected.location||'—'},{k:'Target',v:`KES ${selected.targetAmount?.toLocaleString()||0}`},{k:'Submitted',v:new Date(selected.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}].map(m=>(
                      <div key={m.k} className="ad-meta-item"><span className="ad-meta-key">{m.k}</span><span className="ad-meta-val">{m.v}</span></div>
                    ))}
                  </div>
                  <div className="ad-modal-actions">
                    <button className="ad-btn-reject" disabled={actioning} onClick={()=>doAction(selected._id,'Rejected')}><XCircle size={16}/> {actioning?'...':'Reject'}</button>
                    <button className="ad-btn-verify" disabled={actioning} onClick={()=>doAction(selected._id,'Verified')}><CheckCircle size={16}/> {actioning?'...':'Verify & Publish'}</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}