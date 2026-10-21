/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import {
  Upload, Check, Loader2,
  MapPin, Heart, Target, Image as ImageIcon,
  FileText, Sparkles, ShieldCheck, DollarSign,
  ArrowRight, Users, Home, Shirt, AlertTriangle,
  Apple, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config';

const CATEGORIES = [
  { label: 'Medical',   icon: <Heart size={22}/>,         desc: 'Hospital bills, treatment, surgery' },
  { label: 'Education', icon: <GraduationCap size={22}/>, desc: 'School fees, supplies, training' },
  { label: 'Emergency', icon: <AlertTriangle size={22}/>, desc: 'Disaster relief, urgent needs' },
  { label: 'Animals',   icon: <span style={{fontSize:'20px'}}>🐾</span>, desc: 'Rescue, shelter, veterinary care' },
  { label: 'Food',      icon: <Apple size={22}/>,         desc: 'Nutrition, meals, food security' },
  { label: 'Clothes',   icon: <Shirt size={22}/>,         desc: 'Clothing, blankets, essentials' },
  { label: 'Shelter',   icon: <Home size={22}/>,          desc: 'Housing, repairs, homelessness' },
  { label: 'Family',    icon: <Users size={22}/>,         desc: 'Family support, child welfare' },
];

const StartCampaign = () => {
  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [loadingMsg, setLoadingMsg]   = useState('Saving your campaign…');
  const [coverPreview, setCoverPreview] = useState(null);
  const countries = useMemo(() => countryList().getData(), []);
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({
    location: null, category: '', target: '',
    targetAmount: '', coverMedia: null,
    title: '', story: '', documents: null,
  });

  const nextStep = () => setStep(p => p + 1);
  const prevStep = () => setStep(p => p - 1);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, [field]: file });
    if (field === 'coverMedia') setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const msgs = ['Saving your campaign…', 'Uploading files…', 'Almost done…'];
    let idx = 0;
    setLoadingMsg(msgs[0]);
    const msgTimer = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setLoadingMsg(msgs[idx]);
    }, 2500);

    const data = new FormData();
    data.append('title',        formData.title);
    data.append('category',     formData.category);
    data.append('target',       formData.target);
    data.append('targetAmount', formData.targetAmount);
    data.append('story',        formData.story);
    data.append('location',     JSON.stringify(formData.location));
    if (formData.coverMedia) data.append('coverMedia', formData.coverMedia);
    if (formData.documents)  data.append('documents',  formData.documents);

    try {
      const token = localStorage.getItem('token');
      if (!token) { clearInterval(msgTimer); navigate('/login'); return; }

      const response = await fetch(`${API}/api/campaigns/launch`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    data,
      });

      clearInterval(msgTimer);

      if (response.ok) {
        navigate('/BeneficiaryDashboard');
      } else {
        const err = await response.json();
        alert(err.error || 'Launch failed. Please try again.');
      }
    } catch (err) {
      clearInterval(msgTimer);
      console.error(err);
      alert('Could not connect to server. Make sure your backend is running on port 5000.');
    } finally {
      setLoading(false);
      setLoadingMsg('Saving your campaign…');
    }
  };

  const totalSteps  = 6;
  const progressPct = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div style={pg.page}>
      <div style={pg.layout}>

        {/* SIDEBAR */}
        <aside style={pg.sidebar}>
          <div style={pg.sidebarInner}>
            <div style={pg.brandRow} onClick={() => navigate('/')}>
              <div style={pg.brandDot}>A</div>
              <div>
                <div style={pg.brandName}>AidbridgE</div>
                <div style={pg.brandSub}>Launch Aid Campaign</div>
              </div>
            </div>

            <div style={pg.progressTrack}>
              <div style={{ ...pg.progressFill, height: `${progressPct}%` }} />
            </div>

            <div style={pg.steps}>
              {[
                { n: 1, icon: <MapPin size={16}/>,     label: 'Location' },
                { n: 2, icon: <Heart size={16}/>,      label: 'Cause'    },
                { n: 3, icon: <Target size={16}/>,     label: 'Goal'     },
                { n: 4, icon: <ImageIcon size={16}/>,  label: 'Visuals'  },
                { n: 5, icon: <FileText size={16}/>,   label: 'Story'    },
                { n: 6, icon: <ShieldCheck size={16}/>,label: 'Verify'   },
              ].map(s => (
                <div key={s.n} style={pg.stepRow}>
                  <div style={{
                    ...pg.stepCircle,
                    backgroundColor: step >= s.n ? '#1db09c' : 'rgba(255,255,255,0.08)',
                    boxShadow: step === s.n ? '0 0 0 4px rgba(29,176,156,0.25)' : 'none',
                  }}>
                    {step > s.n
                      ? <Check size={14} color="white"/>
                      : <span style={{ color: step === s.n ? 'white' : 'rgba(255,255,255,0.3)' }}>{s.icon}</span>
                    }
                  </div>
                  <div style={pg.stepInfo}>
                    <div style={pg.stepNum}>Step 0{s.n}</div>
                    <div style={{
                      ...pg.stepLabel,
                      color:      step === s.n ? 'white' : step > s.n ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)',
                      fontWeight: step === s.n ? '700' : '500',
                    }}>{s.label}</div>
                  </div>
                  {step === s.n && <div style={pg.stepPip}/>}
                </div>
              ))}
            </div>

            <div style={pg.sideStats}>
              <div style={pg.sideStatItem}>
                <div style={pg.sideStatNum}>2.4k+</div>
                <div style={pg.sideStatLabel}>Campaigns</div>
              </div>
              <div style={pg.sideStatDiv}/>
              <div style={pg.sideStatItem}>
                <div style={pg.sideStatNum}>94%</div>
                <div style={pg.sideStatLabel}>Success Rate</div>
              </div>
            </div>

            <div style={pg.aiBadge}>
              <ShieldCheck size={18} color="#1db09c"/>
              <div>
                <div style={pg.aiBadgeTitle}>AI Verified</div>
                <div style={pg.aiBadgeText}>All campaigns reviewed by our Llama3 fraud detection system</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CARD */}
        <main style={pg.main}>
          <div style={pg.topBar}><div style={pg.topBarFill(progressPct)}/></div>
          <div style={pg.stepCounter}>Step {step} of {totalSteps}</div>

          <div style={pg.formArea}>
            <AnimatePresence mode="wait">

              {step === 1 && (
                <motion.div key="s1" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}>
                  <StepHeader tag="Let's Begin" title="Where is help needed?" sub="Select the country where the aid campaign will take place." />
                  <Select options={countries} styles={selectStyles} placeholder="Search country…"
                    onChange={v => setFormData({...formData, location: v})} value={formData.location}/>
                  {formData.location && <div style={pg.pill}><MapPin size={14} color="#1db09c"/> {formData.location.label}</div>}
                  <NavButtons onNext={nextStep} nextDisabled={!formData.location} showBack={false}/>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}>
                  <StepHeader tag="Category" title="What describes your cause?" sub="Choose the category that best fits the aid needed." />
                  <div style={pg.catGrid}>
                    {CATEGORIES.map(c => (
                      <button key={c.label} style={{...pg.catTile, borderColor: formData.category===c.label?'#1db09c':'#f1f5f9', backgroundColor: formData.category===c.label?'rgba(29,176,156,0.06)':'white'}}
                        onClick={() => { setFormData({...formData, category: c.label}); nextStep(); }}>
                        <div style={{...pg.catIcon, backgroundColor: formData.category===c.label?'rgba(29,176,156,0.12)':'#f8fafc', color: formData.category===c.label?'#1db09c':'#94a3b8'}}>{c.icon}</div>
                        <div style={pg.catLabel}>{c.label}</div>
                        <div style={pg.catDesc}>{c.desc}</div>
                        {formData.category===c.label && <div style={pg.catCheck}><Check size={12} color="white"/></div>}
                      </button>
                    ))}
                  </div>
                  <NavButtons onBack={prevStep} showNext={false}/>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}>
                  <StepHeader tag="Goal" title="Set your fundraising target" sub="Tell us who needs help and how much is required." />
                  <div style={pg.fieldGroup}>
                    <label style={pg.label}>Beneficiary Name</label>
                    <input style={pg.input} placeholder="Full name of person receiving aid"
                      value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})}/>
                  </div>
                  <div style={pg.fieldGroup}>
                    <label style={pg.label}>Target Amount (KES)</label>
                    <div style={{position:'relative'}}>
                      <DollarSign size={18} color="#94a3b8" style={{position:'absolute',left:'16px',top:'14px'}}/>
                      <input type="number" min="1" style={{...pg.input, paddingLeft:'44px'}} placeholder="0"
                        value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})}/>
                    </div>
                    {formData.targetAmount && <div style={pg.hint}>KES {Number(formData.targetAmount).toLocaleString()} goal</div>}
                  </div>
                  <NavButtons onBack={prevStep} onNext={nextStep} nextDisabled={!formData.targetAmount||!formData.target}/>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}>
                  <StepHeader tag="Visuals" title="Add a cover photo" sub="A clear photo helps donors connect with your story emotionally." />
                  <label style={pg.uploadZone(!!coverPreview)}>
                    <input type="file" style={{display:'none'}} accept="image/*" onChange={e => handleFileChange(e,'coverMedia')}/>
                    {coverPreview ? (
                      <div style={pg.previewWrap}>
                        <img src={coverPreview} alt="Cover" style={pg.previewImg}/>
                        <div style={pg.previewOverlay}><Upload size={20} color="white"/><span style={{color:'white',fontSize:'0.85rem',fontWeight:'700'}}>Change Photo</span></div>
                      </div>
                    ) : (
                      <div style={pg.uploadInner}>
                        <div style={pg.uploadIconBox}><ImageIcon size={28} color="#1db09c"/></div>
                        <div style={pg.uploadTitle}>Click to upload cover photo</div>
                        <div style={pg.uploadSub}>JPG or PNG, max 5MB</div>
                      </div>
                    )}
                  </label>
                  <NavButtons onBack={prevStep} onNext={nextStep} nextDisabled={!formData.coverMedia}/>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="s5" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}>
                  <StepHeader tag="Your Story" title="Tell the world" sub="A compelling story increases your chance of getting support." />
                  <div style={pg.fieldGroup}>
                    <label style={pg.label}>Campaign Headline</label>
                    <input style={pg.input} placeholder="e.g. Help John cover his surgery costs"
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}/>
                    <div style={pg.charCount}>{formData.title.length} / 80</div>
                  </div>
                  <div style={pg.fieldGroup}>
                    <label style={pg.label}>Full Story</label>
                    <textarea style={{...pg.input, minHeight:'180px', resize:'vertical'}}
                      placeholder="Describe the situation, the need, and what the funds will be used for…"
                      value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})}/>
                    <div style={pg.charCount}>{formData.story.length} characters</div>
                  </div>
                  <NavButtons onBack={prevStep} onNext={nextStep} nextDisabled={!formData.title||!formData.story}/>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div key="s6" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.25}}>
                  <StepHeader tag="Final Step" title="AI Verification" sub="Upload a supporting document. AI runs in the background — you won't wait on this screen." />
                  <div style={pg.aiBox}>
                    <div style={pg.aiBoxIcon}><ShieldCheck size={22} color="#1db09c"/></div>
                    <div>
                      <div style={pg.aiBoxTitle}>How verification works</div>
                      <div style={pg.aiBoxText}>Your campaign saves instantly. Llama3 AI checks your document in the background. The result appears as a badge on your dashboard.</div>
                    </div>
                  </div>
                  <label style={pg.docZone(!!formData.documents)}>
                    <input type="file" style={{display:'none'}} accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileChange(e,'documents')}/>
                    <div style={pg.docInner}>
                      <FileText size={22} color={formData.documents?'#1db09c':'#94a3b8'}/>
                      <div style={{flex:1}}>
                        <div style={{...pg.docTitle, color: formData.documents?'#1db09c':'#475569'}}>
                          {formData.documents ? formData.documents.name : 'Choose Verification Document'}
                        </div>
                        <div style={pg.docSub}>PDF, JPG or PNG — medical letter, ID, or legal document</div>
                      </div>
                      <Upload size={16} color="#94a3b8"/>
                    </div>
                  </label>
                  <div style={pg.summary}>
                    <div style={pg.summaryTitle}>Campaign Summary</div>
                    <div style={pg.summaryGrid}>
                      {[
                        {label:'Location', value: formData.location?.label},
                        {label:'Category', value: formData.category},
                        {label:'Target',   value: formData.targetAmount ? `KES ${Number(formData.targetAmount).toLocaleString()}` : '—'},
                        {label:'Headline', value: formData.title||'—'},
                      ].map(item => (
                        <div key={item.label} style={pg.summaryRow}>
                          <span style={pg.summaryLabel}>{item.label}</span>
                          <span style={pg.summaryValue}>{item.value||'—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={pg.launchRow}>
                    <button onClick={prevStep} style={pg.backBtn}>Back</button>
                    <button onClick={handleSubmit} disabled={loading||!formData.documents}
                      style={{...pg.launchBtn, opacity:(loading||!formData.documents)?0.55:1, cursor:(loading||!formData.documents)?'not-allowed':'pointer'}}>
                      {loading
                        ? <><Loader2 size={20} style={{animation:'spin 1s linear infinite'}}/> {loadingMsg}</>
                        : <><Sparkles size={18}/> Launch Campaign</>}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const StepHeader = ({ tag, title, sub }) => (
  <div style={{marginBottom:'32px'}}>
    <div style={{color:'#1db09c',fontWeight:'800',fontSize:'0.75rem',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px'}}>{tag}</div>
    <h2 style={{fontSize:'1.9rem',fontWeight:'900',color:'#0f172a',margin:'0 0 8px',lineHeight:1.2}}>{title}</h2>
    <p style={{color:'#64748b',fontSize:'0.95rem',margin:0}}>{sub}</p>
  </div>
);

const NavButtons = ({ onBack, onNext, nextDisabled, showBack=true, showNext=true }) => (
  <div style={{display:'flex',justifyContent:'center',gap:'12px',marginTop:'36px'}}>
    {showBack && <button onClick={onBack} style={pg.backBtn}>Back</button>}
    {showNext && <button onClick={onNext} disabled={nextDisabled} style={{...pg.nextBtn, opacity:nextDisabled?0.45:1}}>Continue <ArrowRight size={18}/></button>}
  </div>
);

const pg = {
  page:        { minHeight:'100vh', backgroundColor:'#f1f5f9', fontFamily:"'Segoe UI', sans-serif" },
  layout:      { maxWidth:'1280px', margin:'0 auto', padding:'40px 24px', display:'grid', gridTemplateColumns:'360px 1fr', gap:'32px', alignItems:'start' },
  sidebar:     { position:'sticky', top:'40px' },
  sidebarInner:{ backgroundColor:'#0f172a', borderRadius:'28px', padding:'36px 28px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', gap:'4px' },
  brandRow:    { display:'flex', alignItems:'center', gap:'14px', marginBottom:'36px', cursor:'pointer' },
  brandDot:    { width:'42px', height:'42px', borderRadius:'12px', backgroundColor:'#1db09c', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'900', fontSize:'1.1rem', flexShrink:0 },
  brandName:   { color:'white', fontWeight:'900', fontSize:'1.05rem' },
  brandSub:    { color:'rgba(255,255,255,0.38)', fontSize:'0.68rem', fontWeight:'600' },
  progressTrack:{ position:'absolute', left:'22px', top:'120px', bottom:'220px', width:'2px', backgroundColor:'rgba(255,255,255,0.08)', borderRadius:'2px' },
  progressFill: { width:'100%', backgroundColor:'#1db09c', borderRadius:'2px', transition:'height 0.5s ease', position:'absolute', top:0 },
  steps:       { display:'flex', flexDirection:'column', gap:'22px', paddingLeft:'8px', marginBottom:'24px' },
  stepRow:     { display:'flex', alignItems:'center', gap:'16px', position:'relative' },
  stepCircle:  { width:'38px', height:'38px', minWidth:'38px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s ease' },
  stepInfo:    { flex:1 },
  stepNum:     { color:'rgba(255,255,255,0.28)', fontSize:'0.63rem', fontWeight:'800', letterSpacing:'1px', textTransform:'uppercase' },
  stepLabel:   { fontSize:'0.9rem', transition:'all 0.3s' },
  stepPip:     { width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#1db09c', flexShrink:0 },
  sideStats:   { display:'flex', alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'14px 18px', margin:'8px 0', border:'1px solid rgba(255,255,255,0.07)' },
  sideStatItem:{ flex:1, textAlign:'center' },
  sideStatNum: { color:'#1db09c', fontWeight:'900', fontSize:'1.1rem' },
  sideStatLabel:{ color:'rgba(255,255,255,0.3)', fontSize:'0.65rem', fontWeight:'600', marginTop:'2px' },
  sideStatDiv: { width:'1px', height:'32px', backgroundColor:'rgba(255,255,255,0.09)' },
  aiBadge:     { display:'flex', gap:'12px', alignItems:'flex-start', backgroundColor:'rgba(255,255,255,0.04)', borderRadius:'16px', padding:'16px', border:'1px solid rgba(255,255,255,0.07)', marginTop:'8px' },
  aiBadgeTitle:{ color:'white', fontWeight:'700', fontSize:'0.85rem', marginBottom:'3px' },
  aiBadgeText: { color:'rgba(255,255,255,0.38)', fontSize:'0.73rem', lineHeight:'1.5' },
  main:        { backgroundColor:'white', borderRadius:'28px', overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' },
  topBar:      { height:'4px', backgroundColor:'#f1f5f9' },
  topBarFill:  (p) => ({ height:'100%', width:`${p}%`, backgroundColor:'#1db09c', transition:'width 0.4s ease' }),
  stepCounter: { padding:'16px 40px 0', fontSize:'0.73rem', color:'#94a3b8', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase' },
  formArea:    { padding:'32px 40px 40px' },
  catGrid:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'8px' },
  catTile:     { padding:'20px', borderRadius:'16px', border:'2px solid', cursor:'pointer', textAlign:'left', position:'relative', transition:'all 0.2s', background:'white' },
  catIcon:     { width:'44px', height:'44px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px', transition:'all 0.2s' },
  catLabel:    { fontWeight:'800', fontSize:'0.95rem', color:'#0f172a', marginBottom:'4px' },
  catDesc:     { fontSize:'0.75rem', color:'#94a3b8', lineHeight:'1.4' },
  catCheck:    { position:'absolute', top:'12px', right:'12px', backgroundColor:'#1db09c', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center' },
  fieldGroup:  { marginBottom:'20px' },
  label:       { display:'block', fontSize:'0.77rem', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px' },
  input:       { width:'100%', padding:'13px 16px', backgroundColor:'#f8fafc', border:'2px solid #f1f5f9', borderRadius:'12px', fontSize:'0.95rem', fontWeight:'500', outline:'none', boxSizing:'border-box', color:'#0f172a' },
  hint:        { fontSize:'0.8rem', color:'#1db09c', fontWeight:'600', marginTop:'6px' },
  charCount:   { fontSize:'0.73rem', color:'#94a3b8', marginTop:'6px', textAlign:'right' },
  pill:        { display:'inline-flex', alignItems:'center', gap:'6px', backgroundColor:'rgba(29,176,156,0.1)', color:'#1db09c', padding:'6px 14px', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'700', marginTop:'12px' },
  uploadZone:  (h) => ({ display:'block', cursor:'pointer', border:`2px dashed ${h?'#1db09c':'#e2e8f0'}`, borderRadius:'20px', overflow:'hidden', backgroundColor: h?'rgba(29,176,156,0.03)':'#fafafa' }),
  uploadInner: { padding:'48px 24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' },
  uploadIconBox:{ width:'64px', height:'64px', borderRadius:'16px', backgroundColor:'rgba(29,176,156,0.1)', display:'flex', alignItems:'center', justifyContent:'center' },
  uploadTitle: { fontWeight:'700', color:'#1e293b', fontSize:'0.95rem' },
  uploadSub:   { fontSize:'0.8rem', color:'#94a3b8' },
  previewWrap: { position:'relative', height:'220px' },
  previewImg:  { width:'100%', height:'100%', objectFit:'cover' },
  previewOverlay:{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' },
  docZone:     (h) => ({ display:'block', cursor:'pointer', border:`2px solid ${h?'#1db09c':'#f1f5f9'}`, borderRadius:'16px', backgroundColor: h?'rgba(29,176,156,0.04)':'#f8fafc', marginBottom:'24px' }),
  docInner:    { padding:'20px', display:'flex', alignItems:'center', gap:'14px' },
  docTitle:    { fontWeight:'700', fontSize:'0.9rem', marginBottom:'2px' },
  docSub:      { fontSize:'0.73rem', color:'#94a3b8' },
  aiBox:       { backgroundColor:'rgba(29,176,156,0.06)', border:'1px solid rgba(29,176,156,0.2)', borderRadius:'16px', padding:'20px', display:'flex', gap:'14px', marginBottom:'24px' },
  aiBoxIcon:   { width:'40px', height:'40px', borderRadius:'10px', backgroundColor:'rgba(29,176,156,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  aiBoxTitle:  { fontWeight:'800', color:'#0f172a', fontSize:'0.9rem', marginBottom:'4px' },
  aiBoxText:   { fontSize:'0.82rem', color:'#475569', lineHeight:'1.6' },
  summary:     { backgroundColor:'#f8fafc', borderRadius:'16px', padding:'20px' },
  summaryTitle:{ fontWeight:'800', color:'#0f172a', fontSize:'0.83rem', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'0.5px' },
  summaryGrid: { display:'flex', flexDirection:'column', gap:'10px' },
  summaryRow:  { display:'flex', justifyContent:'space-between', alignItems:'center' },
  summaryLabel:{ fontSize:'0.82rem', color:'#94a3b8', fontWeight:'600' },
  summaryValue:{ fontSize:'0.85rem', color:'#0f172a', fontWeight:'700' },
  launchRow:   { display:'flex', alignItems:'center', gap:'12px', marginTop:'32px' },
  launchBtn:   { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'16px 28px', borderRadius:'14px', border:'none', backgroundColor:'#1db09c', color:'white', fontWeight:'800', fontSize:'1rem', boxShadow:'0 4px 16px rgba(29,176,156,0.35)', transition:'all 0.2s' },
  backBtn:     { padding:'13px 24px', borderRadius:'12px', border:'none', backgroundColor:'#f1f5f9', color:'#475569', fontWeight:'700', cursor:'pointer', fontSize:'0.9rem', flexShrink:0 },
  nextBtn:     { display:'flex', alignItems:'center', gap:'8px', padding:'13px 32px', borderRadius:'12px', border:'none', backgroundColor:'#1db09c', color:'white', fontWeight:'700', cursor:'pointer', fontSize:'0.9rem' },
};

const selectStyles = {
  control:     (b,s) => ({...b, padding:'8px 4px', borderRadius:'12px', border: s.isFocused?'2px solid #1db09c':'2px solid #f1f5f9', backgroundColor:'#f8fafc', boxShadow:'none', '&:hover':{borderColor:'#1db09c'}}),
  placeholder: (b)   => ({...b, fontWeight:'600', color:'#94a3b8'}),
  option:      (b,s) => ({...b, backgroundColor: s.isSelected?'#1db09c': s.isFocused?'rgba(29,176,156,0.08)':'white', color: s.isSelected?'white':'#0f172a', fontWeight:'600'}),
};

export default StartCampaign;