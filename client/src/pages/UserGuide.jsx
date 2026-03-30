/* eslint-disable react-hooks/static-components */
/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronRight, ChevronDown, Shield, Heart,
  Users, Bell, HelpCircle, AlertTriangle,
  CheckCircle, XCircle, Clock, Search,
  ArrowRight, Mail, Zap, FileText, BarChart3,
  MessageSquare, LogIn, Home, Cpu, Award, LifeBuoy
} from 'lucide-react';

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap';
const HERO_IMG = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop';

const C = {
  teal: '#26C2B9', dark: '#0F172A', slate: '#334155',
  muted: '#64748B', light: '#F8FAFC', white: '#FFFFFF',
  red: '#EF4444', amber: '#F59E0B', green: '#10B981',
};

const SECTIONS = [
  { id: 'intro', icon: <BookOpen size={17} />, label: 'Introduction' },
  { id: 'start', icon: <LogIn size={17} />, label: 'Getting Started' },
  { id: 'beneficiary', icon: <Heart size={17} />, label: 'Beneficiary Guide' },
  { id: 'donor', icon: <Users size={17} />, label: 'Donor Guide' },
  { id: 'admin', icon: <Shield size={17} />, label: 'Admin Guide' },
  { id: 'faq', icon: <HelpCircle size={17} />, label: 'FAQ' },
  { id: 'support', icon: <Mail size={17} />, label: 'Support' },
];

/* ── UI Components ──────────────────────────────────────────────── */

const InfoBox = ({ type = 'info', title, children }) => {
  const cfg = {
    info: { bg: 'rgba(38,194,185,0.07)', border: 'rgba(38,194,185,0.3)', icon: <Zap size={15} />, color: C.teal },
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.35)', icon: <AlertTriangle size={15} />, color: C.amber },
    danger: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.3)', icon: <XCircle size={15} />, color: C.red },
  }[type];
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '16px', padding: '24px', margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cfg.color, fontWeight: 800, fontSize: '0.75rem', marginBottom: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>
        {cfg.icon} {title}
      </div>
      <div style={{ color: C.slate, fontSize: '0.95rem', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
};

const StepCard = ({ number, title, children }) => (
  <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: C.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0, fontFamily: "'DM Mono', monospace" }}>
      {number}
    </div>
    <div style={{ paddingTop: '6px' }}>
      <div style={{ fontWeight: 800, color: C.dark, fontSize: '1.05rem', marginBottom: '6px' }}>{title}</div>
      <div style={{ color: C.slate, fontSize: '0.92rem', lineHeight: 1.75 }}>{children}</div>
    </div>
  </div>
);

/* ── Main Layout ────────────────────────────────────────────────── */

export default function UserGuide() {
  const navigate = useNavigate();
  const [active, setActive] = useState('intro');
  const sectionRefs = useRef({});

  useEffect(() => {
    if (!document.getElementById('ug-fonts')) {
      const l = document.createElement('link');
      l.id = 'ug-fonts'; l.rel = 'stylesheet'; l.href = FONT_LINK;
      document.head.appendChild(l);
    }
  }, []);

  const scrollTo = (id) => {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // FIXED: Renamed from Sec to Section to match your JSX usage
  const Section = ({ id, title, icon, children }) => (
    <div ref={el => { sectionRefs.current[id] = el; }} style={{ marginBottom: '100px', scrollMarginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(38,194,185,0.1)', color: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 900, color: C.dark, margin: 0 }}>{title}</h2>
      </div>
      <div style={{ height: '4px', width: '60px', background: C.teal, borderRadius: '10px', marginBottom: '40px' }} />
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.white, fontFamily: "'DM Sans', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{ width: '280px', flexShrink: 0, background: C.dark, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            </div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px' }}></div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontFamily: "'DM Mono', monospace", letterSpacing: '2px' }}></div>
        </div>

        <nav style={{ flex: 1, padding: '24px 12px' }}>
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: active === s.id ? 'rgba(38,194,185,0.15)' : 'transparent', color: active === s.id ? C.teal : 'rgba(255,255,255,0.5)', fontWeight: active === s.id ? 700 : 500, fontSize: '0.88rem', textAlign: 'left', transition: '0.2s', marginBottom: '4px' }}>
              {s.icon} <span style={{ flex: 1 }}>{s.label}</span>
              {active === s.id && <motion.div layoutId="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.teal }} />}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' }}>
        <div style={{ height: '480px', position: 'relative', overflow: 'hidden' }}>
          <img src={HERO_IMG} alt="Manual Header" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0F172A 30%, transparent 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(38,194,185,0.2)', border: '1px solid rgba(38,194,185,0.4)', borderRadius: '30px', padding: '6px 16px', marginBottom: '24px', width: 'fit-content' }}>
              <span style={{ color: C.teal, fontSize: '0.7rem', fontWeight: 900, fontFamily: "'DM Mono', monospace", letterSpacing: '2px' }}>SYSTEM TRAINING MANUAL</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '4.5rem', color: '#fff', margin: '0 0 20px', fontWeight: 900, lineHeight: 1 }}>
              Master the <br /><span style={{ color: C.teal }}>Ecosystem.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '500px', lineHeight: 1.6 }}>
              Technical workflows, AI verification logic, and step-by-step guides for every AidbridgE user role.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 40px' }}>
          
          <Section id="intro" title="Platform Overview" icon={<BookOpen size={22} />}>
            <p style={{ fontSize: '1.1rem', color: C.slate, lineHeight: 1.8, marginBottom: '32px' }}>
              AidbridgE is built on the <strong>MERN Stack</strong> to provide a high-reliability bridge between those in need and those who can give. 
              Our "Trust-First" architecture ensures that every request is scrutinized by <strong>Llama3-8B AI</strong> before reaching the public grid.
            </p>
            <div style={{ background: C.light, borderRadius: '24px', padding: '40px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: C.dark, marginBottom: '16px' }}>Layman's Terms: How it Works</h4>
                  <ul style={{ color: C.slate, lineHeight: 2, paddingLeft: '20px' }}>
                    <li><strong>Beneficiaries</strong> share their story & proof.</li>
                    <li><strong>AI Agents</strong> verify the authenticity of documents.</li>
                    <li><strong>Admins</strong> perform the final quality gate.</li>
                    <li><strong>Donors</strong> fulfill requests with 100% confidence.</li>
                  </ul>
                </div>
                <div style={{ width: '300px', height: '200px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop" alt="Dashboard Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
          </Section>

          <Section id="start" title="Getting Started" icon={<Zap size={22} />}>
            <StepCard number="1" title="Account Selection">
              Choose your role carefully. <strong>Beneficiaries</strong> gain access to campaign creation tools, while <strong>Donors</strong> receive the Discover Grid and AI Forensic Reports.
            </StepCard>
            <StepCard number="2" title="Profile Completion">
              A complete profile increases the AI Trust Score by 15%. Upload a clear profile image and link your social verification if available.
            </StepCard>
            <InfoBox type="warning" title="TECHNICAL REQUIREMENT">
              AidbridgE requires <strong>Node.js v18+</strong> compatibility for local dashboard interactions. Ensure your browser is updated to the latest version.
            </InfoBox>
          </Section>

          <Section id="beneficiary" title="Beneficiary Workflows" icon={<Heart size={22} />}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Creating a Campaign</h3>
            <p style={{ color: C.slate, marginBottom: '30px' }}>To maintain platform integrity, all campaigns follow a strict submission pipeline:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { t: 'Drafting', d: 'Enter your title, category, and funding goal.' },
                { t: 'Documentation', d: 'Upload IDs, medical letters, or bills (PDF/JPG).' },
                { t: 'AI Scoring', d: 'Wait 30s for the Llama3 agent to scan for fraud.' },
                { t: 'Live Grid', d: 'Once Admin-approved, you are visible to donors.' }
              ].map((item, i) => (
                <div key={i} style={{ padding: '24px', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
                  <div style={{ fontWeight: 900, fontSize: '0.75rem', color: C.teal, marginBottom: '8px', fontFamily: "'DM Mono', monospace" }}>STAGE 0{i+1}</div>
                  <div style={{ fontWeight: 800, color: C.dark, marginBottom: '4px' }}>{item.t}</div>
                  <div style={{ fontSize: '0.85rem', color: C.muted }}>{item.d}</div>
                </div>
              ))}
            </div>
          </Section>

           <Section id="support" title="Technical Support" icon={<LifeBuoy size={22} />}>
            <div style={{ background: C.dark, borderRadius: '32px', padding: '60px', textAlign: 'center', color: '#fff' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '16px' }}>Need Human Help?</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                Our engineering team is available for system integration issues or account recovery.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                  <button style={{ padding: '16px 32px', background: C.teal, border: 'none', borderRadius: '14px', fontWeight: 900, color: C.dark, cursor: 'pointer' }}>
                    OPEN SUPPORT TICKET
                  </button>
                  <button onClick={() => window.location.href = 'mailto:tamiamwandu472@gmail.com'} style={{ padding: '16px 32px', background: 'transparent', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '14px', fontWeight: 900, color: '#fff', cursor: 'pointer' }}>
                    EMAIL DEV TEAM
                   </button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Mono', monospace", fontSize: '0.9rem' }}>
                  Support Line: +254 768 393 986
                </div>
              </div>
            </div>
          </Section>

        </div>
      </main>
    </div>
  );
}