/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, MessageCircle, ChevronDown, ChevronUp,
  Quote, CheckCircle, AlertCircle, Sparkles,
  X, ArrowRight, Heart, Calendar, User,
  PlusCircle
} from 'lucide-react';

const API  = 'http://localhost:5000';
const TEAL = '#26C2B9';

/* ── Avatar ──────────────────────────────────────────────────────── */
const AVATAR_COLORS = ['#26C2B9','#0ea5e9','#6366f1','#10b981','#f59e0b','#ec4899'];

function Avatar({ name = '', size = 44, colorIndex = 0 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const bg       = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${bg}, ${bg}bb)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 900, fontSize: size * 0.37,
      boxShadow: `0 4px 12px ${bg}44`, userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      exit={{    opacity: 0, y: 50, scale: 0.9 }}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
        background: type === 'error' ? '#fff1f2' : '#0f172a',
        border: `1px solid ${type === 'error' ? '#fecdd3' : 'rgba(38,194,185,0.4)'}`,
        borderRadius: 16, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)', maxWidth: 360,
      }}
    >
      {type === 'error'
        ? <AlertCircle size={18} color="#ef4444" />
        : <CheckCircle size={18} color={TEAL}    />
      }
      <span style={{ fontSize: '0.86rem', fontWeight: 600, flex: 1,
        color: type === 'error' ? '#ef4444' : '#e2e8f0' }}>
        {msg}
      </span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
        color: '#94a3b8', padding: 2, display: 'flex' }}>
        <X size={14}/>
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
export default function Testimonials() {
  const navigate  = useNavigate();
  const formRef   = useRef(null);

  const user  = JSON.parse(localStorage.getItem('user')  || 'null');
  const token = localStorage.getItem('token');

  const [testimonials, setTestimonials] = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);

  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  const [form,        setForm]       = useState({ message: '', campaignId: '' });
  const [myCampaigns, setMyCampaigns]= useState([]);

  const [replyOpen,  setReplyOpen]  = useState(null);   // testimonial _id
  const [replyText,  setReplyText]  = useState('');
  const [replySub,   setReplySub]   = useState(false);
  const [expanded,   setExpanded]   = useState({});     // which reply lists are open

  /* ── helpers ── */
  const toast$ = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── fetch testimonials ── */
  const fetchPage = async (pg = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const res  = await fetch(`${API}/api/testimonials?limit=9&page=${pg}`);
      const data = await res.json();
      setTestimonials(prev => append ? [...prev, ...data.testimonials] : data.testimonials);
      setTotal(data.total || 0);
    } catch {
      toast$('Could not load testimonials.', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* ── fetch beneficiary's campaigns ── */
  const fetchCampaigns = async () => {
    if (!token || user?.role !== 'beneficiary') return;
    try {
      const res  = await fetch(`${API}/api/campaigns/my-campaigns`,
        { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMyCampaigns(Array.isArray(data)
        ? data.filter(c => ['Fulfilled','Active','Verified'].includes(c.status))
        : []);
    } catch {}
  };

  useEffect(() => { fetchPage(1); fetchCampaigns(); }, []);

  /* ── submit testimonial ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return toast$('Please write your story.', 'error');
    try {
      setSubmitting(true);
      const res  = await fetch(`${API}/api/testimonials`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return toast$(data.error || 'Failed to submit', 'error');

      /* prepend new testimonial so it appears first */
      setTestimonials(prev => [data.testimonial, ...prev]);
      setTotal(t => t + 1);
      setForm({ message: '', campaignId: '' });
      setShowForm(false);
      toast$('Your story is now live! Thank you 🎉');
    } catch {
      toast$('Server error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── submit reply ── */
  const handleReply = async (tid) => {
    if (!replyText.trim()) return toast$('Reply cannot be empty.', 'error');
    try {
      setReplySub(true);
      const res  = await fetch(`${API}/api/testimonials/${tid}/reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: replyText }),
      });
      const data = await res.json();
      if (!res.ok) return toast$(data.error || 'Could not reply', 'error');

      setTestimonials(prev =>
        prev.map(t => t._id === tid ? data.testimonial : t)
      );
      setExpanded(prev => ({ ...prev, [tid]: true }));
      setReplyText('');
      setReplyOpen(null);
      toast$('Reply posted!');
    } catch {
      toast$('Server error.', 'error');
    } finally {
      setReplySub(false);
    }
  };

  const hasMore = testimonials.length < total;

  /* ══ RENDER ══ */
  return (
    <div style={pg.root}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={pg.hero}>
        {/* decorative blobs */}
        <div style={pg.blob1}/>
        <div style={pg.blob2}/>

        <motion.div style={pg.heroInner}
          initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>

          <div style={pg.heroPill}><Sparkles size={13}/> Real Stories · Real Impact</div>

          <h1 style={pg.heroH1}>
            Voices of <span style={{ color: TEAL }}>Hope</span>
          </h1>
          <p style={pg.heroSub}>
            Every story here represents a life changed by the generosity of donors and the power of community.
            Read, be inspired — and if AidBridgE helped you, share your experience.
          </p>

          {/* stat chips */}
          <div style={pg.heroStats}>
            <div style={pg.heroStat}>
              <span style={pg.heroStatVal}>{total}</span>
              <span style={pg.heroStatLbl}>Stories</span>
            </div>
            <div style={pg.heroDivider}/>
            <div style={pg.heroStat}>
              <span style={pg.heroStatVal}>100%</span>
              <span style={pg.heroStatLbl}>Verified</span>
            </div>
            <div style={pg.heroDivider}/>
            <div style={pg.heroStat}>
              <span style={pg.heroStatVal}>🇰🇪</span>
              <span style={pg.heroStatLbl}>Kenya</span>
            </div>
          </div>

          {/* CTAs */}
          <div style={pg.heroBtns}>
            {user?.role === 'beneficiary' && (
              <button style={pg.btnTeal} onClick={() => {
                setShowForm(true);
                setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 120);
              }}>
                <Quote size={16}/> Share Your Story
              </button>
            )}
            {!user && (
              <button style={pg.btnTeal} onClick={() => navigate('/register')}>
                Join AidBridgE <ArrowRight size={16}/>
              </button>
            )}
            <button style={pg.btnGhost} onClick={() => navigate('/discover')}>
              Browse Campaigns
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── SUBMIT FORM ──────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && user?.role === 'beneficiary' && (
          <motion.div ref={formRef}
            initial={{ opacity:0, scaleY:0.85, originY:0 }}
            animate={{ opacity:1, scaleY:1 }}
            exit={{    opacity:0, scaleY:0.85 }}
            transition={{ duration:0.3 }}
            style={pg.formWrap}>
            <div style={pg.formCard}>

              {/* form header */}
              <div style={pg.formHeader}>
                <div style={pg.formHeaderLeft}>
                  <div style={pg.formIcon}><Heart size={20} color={TEAL}/></div>
                  <div>
                    <h2 style={pg.formTitle}>Share Your Story</h2>
                    <p style={pg.formSub}>Your testimonial goes live immediately so it can inspire donors right away.</p>
                  </div>
                </div>
                <button style={pg.closeBtn} onClick={() => setShowForm(false)}><X size={18}/></button>
              </div>

              <form onSubmit={handleSubmit}>

                {/* campaign picker */}
                {myCampaigns.length > 0 && (
                  <div style={pg.field}>
                    <label style={pg.label}>
                      Which campaign helped you?
                      <span style={pg.optTag}> optional</span>
                    </label>
                    <select style={pg.select}
                      value={form.campaignId}
                      onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))}>
                      <option value="">Select a campaign…</option>
                      {myCampaigns.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* story */}
                <div style={pg.field}>
                  <label style={pg.label}>
                    Your Story <span style={{ color:'#ef4444' }}>*</span>
                  </label>
                  <textarea style={pg.textarea}
                    placeholder="Tell us how AidBridgE made a difference in your life. What happened? How did the support help? What would you like donors to know?"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={5}
                    maxLength={1000}
                  />
                  <div style={pg.charCount}>{form.message.length} / 1000</div>
                </div>

                <button type="submit" disabled={submitting}
                  style={{ ...pg.btnTeal, width:'100%', justifyContent:'center',
                    opacity: submitting ? 0.6 : 1, padding:'15px' }}>
                  {submitting
                    ? 'Publishing…'
                    : <><Send size={16}/> Publish My Story</>
                  }
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={pg.section}>
        <div style={pg.sectionHead}>
          <div>
            <h2 style={pg.sectionTitle}>Community Stories</h2>
            <p style={pg.sectionSub}>{total} {total === 1 ? 'story' : 'stories'} shared by our community</p>
          </div>
          {user?.role === 'beneficiary' && !showForm && (
            <button style={pg.btnOutline} onClick={() => {
              setShowForm(true);
              setTimeout(() => formRef.current?.scrollIntoView({ behavior:'smooth' }), 120);
            }}>
              <PlusCircle size={16}/> Add Yours
            </button>
          )}
        </div>

        {/* loading skeletons */}
        {loading ? (
          <div style={pg.grid}>
            {[...Array(6)].map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        ) : testimonials.length === 0 ? (
          <div style={pg.empty}>
            <Quote size={52} color={TEAL} style={{ opacity:0.2, marginBottom:16 }}/>
            <h3 style={{ color:'#0f172a', marginBottom:8, fontSize:'1.2rem' }}>No stories yet</h3>
            <p style={{ color:'#64748b', fontSize:'0.9rem' }}>
              {user?.role === 'beneficiary'
                ? 'Be the first to share your experience!'
                : 'Stories will appear here once beneficiaries share them.'}
            </p>
          </div>
        ) : (
          <>
            <div style={pg.grid}>
              {testimonials.map((t, i) => (
                <TestimonialCard
                  key={t._id}
                  t={t}
                  index={i}
                  user={user}
                  token={token}
                  replyOpen={replyOpen}
                  setReplyOpen={setReplyOpen}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  onReply={handleReply}
                  replySub={replySub}
                  expanded={expanded}
                  setExpanded={setExpanded}
                />
              ))}
            </div>

            {/* load more */}
            {hasMore && (
              <div style={{ textAlign:'center', marginTop:40 }}>
                <button style={pg.loadMoreBtn} disabled={loadingMore}
                  onClick={() => { const next = page + 1; setPage(next); fetchPage(next, true); }}>
                  {loadingMore ? 'Loading…' : <><ChevronDown size={17}/> Load More Stories</>}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      {!user && (
        <section style={pg.bottomBand}>
          <motion.div style={pg.bottomInner}
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.6 }}>
            <h2 style={pg.bottomH2}>Your story could be next</h2>
            <p style={pg.bottomP}>
              Join thousands of Kenyans connecting on AidBridgE — whether you need help or want to give it.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <button style={pg.btnTeal}   onClick={() => navigate('/register')}>Get Started <ArrowRight size={16}/></button>
              <button style={pg.btnGhost}  onClick={() => navigate('/about')}>Learn More</button>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── TOAST ────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   TESTIMONIAL CARD
══════════════════════════════════════════════════════════════════ */
function TestimonialCard({ t, index, user, token, replyOpen, setReplyOpen,
  replyText, setReplyText, onReply, replySub, expanded, setExpanded }) {

  const isReplying  = replyOpen  === t._id;
  const showReplies = expanded[t._id];
  const replyCount  = t.replies?.length || 0;

  const dateStr = new Date(t.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <motion.div style={cd.card}
      initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.05, duration:0.35 }}
      whileHover={{ y:-5, boxShadow:'0 24px 52px rgba(0,0,0,0.1)' }}>

      {/* decorative quote mark */}
      <div style={cd.bigQuote}>"</div>

      {/* header: avatar + name + date */}
      <div style={cd.header}>
        <Avatar name={t.beneficiaryName} size={50} colorIndex={index}/>
        <div style={cd.headerInfo}>
          <div style={cd.name}>{t.beneficiaryName}</div>
          {t.campaignTitle && (
            <div style={cd.campaign}>
              <CheckCircle size={11} color={TEAL}/> {t.campaignTitle}
            </div>
          )}
          <div style={cd.date}>
            <Calendar size={11} color="#94a3b8"/> {dateStr}
          </div>
        </div>
      </div>

      {/* story */}
      <p style={cd.story}>"{t.message}"</p>

      {/* replies summary */}
      <div style={cd.footer}>
        {replyCount > 0 && (
          <button style={cd.repliesBtn}
            onClick={() => setExpanded(p => ({ ...p, [t._id]: !p[t._id] }))}>
            <MessageCircle size={14} color={TEAL}/>
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            {showReplies ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        )}

        {/* donor: reply button */}
        {user?.role === 'donor' && !isReplying && (
          <button style={cd.replyBtn} onClick={() => { setReplyOpen(t._id); setReplyText(''); }}>
            <MessageCircle size={13}/> Reply
          </button>
        )}
      </div>

      {/* expanded replies list */}
      <AnimatePresence>
        {showReplies && replyCount > 0 && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} style={{ overflow:'hidden' }}>
            <div style={cd.repliesList}>
              {t.replies.map((r, ri) => (
                <div key={ri} style={cd.reply}>
                  <Avatar name={r.donorName} size={30} colorIndex={ri + 2}/>
                  <div style={cd.replyBody}>
                    <div style={cd.replyTop}>
                      <span style={cd.replyName}>{r.donorName}</span>
                      <span style={cd.donorTag}>Donor</span>
                      <span style={cd.replyDate}>
                        {new Date(r.createdAt).toLocaleDateString('en-KE', { day:'numeric', month:'short' })}
                      </span>
                    </div>
                    <p style={cd.replyMsg}>{r.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* reply input */}
      <AnimatePresence>
        {isReplying && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:8 }} style={cd.replyForm}>
            <Avatar name={user?.name || 'D'} size={34} colorIndex={3}/>
            <div style={{ flex:1 }}>
              <textarea style={cd.replyInput}
                placeholder="Write an encouraging message…"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                maxLength={600}
                autoFocus
              />
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button disabled={replySub} onClick={() => onReply(t._id)}
                  style={{ ...pg.btnTeal, padding:'8px 18px', fontSize:'0.78rem',
                    opacity: replySub ? 0.6 : 1 }}>
                  <Send size={12}/> {replySub ? 'Posting…' : 'Post'}
                </button>
                <button onClick={() => { setReplyOpen(null); setReplyText(''); }}
                  style={{ ...pg.btnOutline, padding:'8px 14px', fontSize:'0.78rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ ...cd.card, overflow:'hidden' }}>
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        <div style={{ width:50, height:50, borderRadius:'50%', background:'#f1f5f9' }}/>
        <div style={{ flex:1 }}>
          <div style={{ height:14, background:'#f1f5f9', borderRadius:8, width:'55%', marginBottom:8 }}/>
          <div style={{ height:11, background:'#f1f5f9', borderRadius:8, width:'35%' }}/>
        </div>
      </div>
      <div style={{ height:12, background:'#f1f5f9', borderRadius:8, width:'100%', marginBottom:8 }}/>
      <div style={{ height:12, background:'#f1f5f9', borderRadius:8, width:'90%',  marginBottom:8 }}/>
      <div style={{ height:12, background:'#f1f5f9', borderRadius:8, width:'75%'  }}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════ */
const pg = {
  root: { minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI',sans-serif" },

  /* hero */
  hero:      { position:'relative', padding:'100px 24px 80px', background:'#0f172a', textAlign:'center', overflow:'hidden' },
  blob1:     { position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'140%', background:'radial-gradient(circle, rgba(38,194,185,0.15) 0%, transparent 65%)', pointerEvents:'none' },
  blob2:     { position:'absolute', bottom:'-30%', right:'-5%', width:'50%', height:'120%', background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', pointerEvents:'none' },
  heroInner: { position:'relative', zIndex:1, maxWidth:720, margin:'0 auto' },
  heroPill:  { display:'inline-flex', alignItems:'center', gap:7, background:'rgba(38,194,185,0.12)', border:'1px solid rgba(38,194,185,0.3)', color:TEAL, padding:'6px 16px', borderRadius:20, fontSize:'0.75rem', fontWeight:700, marginBottom:22, letterSpacing:'0.5px' },
  heroH1:    { fontSize:'clamp(2.4rem,6vw,4rem)', fontWeight:900, color:'#fff', margin:'0 0 18px', lineHeight:1.1, letterSpacing:'-1.5px' },
  heroSub:   { fontSize:'1.05rem', color:'rgba(255,255,255,0.62)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.75 },

  heroStats:   { display:'flex', justifyContent:'center', alignItems:'center', gap:28, marginBottom:36, flexWrap:'wrap' },
  heroStat:    { display:'flex', flexDirection:'column', alignItems:'center', gap:4 },
  heroStatVal: { fontSize:'2rem', fontWeight:900, color:TEAL },
  heroStatLbl: { fontSize:'0.65rem', color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'1.5px' },
  heroDivider: { width:1, height:36, background:'rgba(255,255,255,0.1)' },

  heroBtns: { display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' },

  /* form wrapper */
  formWrap: { maxWidth:720, margin:'0 auto', padding:'32px 24px 0' },
  formCard: { background:'#fff', borderRadius:28, padding:'36px', boxShadow:'0 8px 32px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' },
  formHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, gap:16 },
  formHeaderLeft: { display:'flex', gap:14, alignItems:'flex-start' },
  formIcon: { width:44, height:44, borderRadius:14, background:'rgba(38,194,185,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  formTitle: { fontSize:'1.25rem', fontWeight:800, color:'#0f172a', margin:0 },
  formSub:   { fontSize:'0.82rem', color:'#64748b', marginTop:5, lineHeight:1.55 },
  closeBtn:  { background:'#f1f5f9', border:'none', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, color:'#475569' },

  field:     { marginBottom:22 },
  label:     { display:'block', fontSize:'0.75rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:9 },
  optTag:    { color:'#94a3b8', fontWeight:500, textTransform:'none', letterSpacing:0 },
  select:    { width:'100%', padding:'12px 14px', background:'#f8fafc', border:'2px solid #f1f5f9', borderRadius:12, fontSize:'0.9rem', color:'#0f172a', outline:'none', cursor:'pointer', fontFamily:'inherit' },
  textarea:  { width:'100%', padding:'13px 14px', background:'#f8fafc', border:'2px solid #f1f5f9', borderRadius:12, fontSize:'0.9rem', color:'#0f172a', resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.65 },
  charCount: { textAlign:'right', fontSize:'0.7rem', color:'#94a3b8', marginTop:5 },

  /* section */
  section:     { maxWidth:1280, margin:'0 auto', padding:'56px 24px 80px' },
  sectionHead: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40, flexWrap:'wrap', gap:16 },
  sectionTitle:{ fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:900, color:'#0f172a', margin:0, letterSpacing:'-0.5px' },
  sectionSub:  { color:'#64748b', fontSize:'0.9rem', marginTop:6 },

  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px,1fr))', gap:28 },
  empty:       { textAlign:'center', padding:'80px 24px', gridColumn:'1/-1' },

  loadMoreBtn: { display:'inline-flex', alignItems:'center', gap:8, background:'#fff', border:'2px solid #e2e8f0', color:'#475569', padding:'12px 32px', borderRadius:14, fontSize:'0.88rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' },

  /* bottom band */
  bottomBand:  { background:'#0f172a', padding:'80px 24px' },
  bottomInner: { maxWidth:600, margin:'0 auto', textAlign:'center' },
  bottomH2:    { fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, color:'#fff', margin:'0 0 14px', letterSpacing:'-0.5px' },
  bottomP:     { color:'rgba(255,255,255,0.58)', fontSize:'1rem', lineHeight:1.7, marginBottom:36 },

  /* buttons */
  btnTeal:   { display:'inline-flex', alignItems:'center', gap:8, background:TEAL, color:'#fff', border:'none', padding:'13px 26px', borderRadius:12, fontWeight:800, fontSize:'0.9rem', cursor:'pointer', boxShadow:`0 6px 20px ${TEAL}44`, transition:'all 0.2s', fontFamily:'inherit' },
  btnGhost:  { display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.08)', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', padding:'13px 24px', borderRadius:12, fontWeight:700, fontSize:'0.9rem', cursor:'pointer', backdropFilter:'blur(6px)', fontFamily:'inherit' },
  btnOutline:{ display:'inline-flex', alignItems:'center', gap:7, background:'transparent', color:'#475569', border:'1px solid #e2e8f0', padding:'10px 18px', borderRadius:10, fontWeight:700, fontSize:'0.82rem', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' },
};

const cd = {
  card:      { background:'#fff', borderRadius:24, padding:28, border:'1px solid #f1f5f9', boxShadow:'0 4px 16px rgba(0,0,0,0.04)', transition:'all 0.3s ease', position:'relative', overflow:'hidden', cursor:'default' },
  bigQuote:  { position:'absolute', top:-14, left:18, fontSize:'7rem', color:`${TEAL}10`, fontFamily:'Georgia,serif', lineHeight:1, userSelect:'none', pointerEvents:'none' },

  header:     { display:'flex', gap:14, alignItems:'flex-start', marginBottom:18 },
  headerInfo: { flex:1, minWidth:0 },
  name:       { fontWeight:800, fontSize:'1rem', color:'#0f172a', marginBottom:3 },
  campaign:   { display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:TEAL, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 },
  date:       { display:'flex', alignItems:'center', gap:4, fontSize:'0.68rem', color:'#94a3b8' },

  story: { fontSize:'0.88rem', color:'#475569', lineHeight:1.75, margin:'0 0 18px', fontStyle:'italic', position:'relative', zIndex:1 },

  footer:     { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', borderTop:'1px solid #f8fafc', paddingTop:14 },
  repliesBtn: { display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:TEAL, fontSize:'0.76rem', fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit' },
  replyBtn:   { display:'flex', alignItems:'center', gap:5, marginLeft:'auto', background:'none', border:'1px solid #e2e8f0', color:'#64748b', fontSize:'0.74rem', fontWeight:700, padding:'5px 13px', borderRadius:20, cursor:'pointer', transition:'all 0.2s', fontFamily:'inherit' },

  repliesList: { background:'#f8fafc', borderRadius:14, padding:14, marginTop:14, display:'flex', flexDirection:'column', gap:12 },
  reply:       { display:'flex', gap:10, alignItems:'flex-start' },
  replyBody:   { flex:1 },
  replyTop:    { display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' },
  replyName:   { fontWeight:800, fontSize:'0.8rem', color:'#0f172a' },
  donorTag:    { background:'rgba(14,165,233,0.1)', color:'#0ea5e9', fontSize:'0.58rem', fontWeight:800, padding:'2px 7px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.5px' },
  replyDate:   { fontSize:'0.65rem', color:'#94a3b8', marginLeft:'auto' },
  replyMsg:    { fontSize:'0.82rem', color:'#475569', margin:0, lineHeight:1.6 },

  replyForm:  { borderTop:'1px solid #f1f5f9', paddingTop:16, marginTop:8, display:'flex', gap:10, alignItems:'flex-start' },
  replyInput: { width:'100%', padding:'10px 13px', background:'#f8fafc', border:'2px solid #e2e8f0', borderRadius:12, fontSize:'0.84rem', color:'#0f172a', resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.5 },
};