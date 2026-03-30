/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Globe, ShieldCheck, 
  AlertCircle, ChevronRight, LayoutGrid 
} from 'lucide-react';
import { motion } from 'framer-motion';

import CampaignCard from '../components/CampaignCard';
import SkeletonCard from '../components/SkeletonCard';

const TEAL = '#26C2B9';

const Homepage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryData = [
    { name: 'Adoption', img: '/images/adoption.jpg' },
    { name: 'Animals', img: '/images/animals.jpg' },
    { name: 'Education', img: '/images/education.jpg' },
    { name: 'Medical', img: '/images/medical.jpg' },
    { name: 'Emergency', img: '/images/emergency.jpg' },
    { name: 'Clothes', img: '/images/clothes.jpg' },
  ];

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/campaigns?limit=3');
        if (!response.ok) throw new Error('AidbridgE Cloud is temporarily unreachable.');
        const data = await response.json();

        if (Array.isArray(data)) {
          setCampaigns(data);
        } else if (data && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
        } else {
          setCampaigns([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', fontFamily: "system-ui, -apple-system, sans-serif", color: '#0f172a', overflowY: 'auto' }}>
      
      {/* --- HERO SECTION --- */}
      <section style={{ position: 'relative', height: '80vh', minHeight: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
           <img src="/images/hero.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Community" />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.6) 50%, #0f172a 100%)' }} />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}
        >
          <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 900, color: '#fff', marginBottom: '24px', tracking: '-0.05em', lineHeight: 1 }}>
            HELP & <span style={{ color: TEAL }}>HOPE</span> <br/>
            GO HAND-IN-HAND
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#e2e8f0', marginBottom: '40px', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', fontWeight: 500, lineHeight: 1.625, opacity: 0.9 }}>
            AidbridgE is the global leader in community fundraising. Join thousands of donors bridging the gap for those in need with AI-verified transparency.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/register')} 
              style={{ padding: '20px 40px', backgroundColor: TEAL, color: '#white', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.125rem', cursor: 'pointer', boxShadow: '0 25px 50px -12px rgba(38, 194, 185, 0.5)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start an AidbridgE <ArrowRight size={22} />
            </button>
            <button  onClick={() => navigate('/user-guide')} style={{ padding: '20px 40px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', fontWeight: 900, fontSize: '1.125rem', backdropFilter: 'blur(12px)', cursor: 'pointer' }}>
              How it Works
            </button>
          </div>
        </motion.div>
      </section>

      {/* --- TRENDING CAMPAIGNS SECTION --- */}
      <section style={{ padding: '128px 24px', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Trending Campaigns</h2>
            <div style={{ h: '6px', width: '96px', backgroundColor: TEAL, marginTop: '16px', borderRadius: '9999px', height: '6px' }}></div>
            <p style={{ color: '#64748b', marginTop: '16px', fontWeight: 500, fontSize: '1.125rem' }}>Impactful stories updated in real-time.</p>
          </div>
          <button 
            onClick={() => navigate('/discover')}
            style={{ color: TEAL, background: 'none', border: 'none', fontWeight: 900, fontSize: '1.125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            Browse All Campaigns <ChevronRight size={24} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px' }}>
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '96px 24px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '3rem', border: '1px solid #fee2e2' }}>
            <AlertCircle size={48} style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>Connection Error</p>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '96px 24px', backgroundColor: '#f8fafc', borderRadius: '3rem', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 500, textAlign: 'center' }}>There are no active campaigns at the moment. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '40px' }}>
            {campaigns.map((c) => (
              <CampaignCard 
                key={typeof c._id === 'string' ? c._id : Math.random().toString()} 
                campaign={c} 
              />
            ))}
          </div>
        )}
      </section>

      {/* --- CATEGORIES GRID SECTION --- */}
      <section style={{ padding: '128px 0', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 24px', textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.025em' }}>Browse by Category</h2>
          <p style={{ color: '#64748b', fontWeight: 500, fontSize: '1.125rem' }}>Find a cause that speaks to your heart</p>
        </div>
        
        <div style={{ maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '32px' }}>
          {categoryData.map((cat) => (
            <div 
              key={cat.name} 
              onClick={() => navigate(`/discover?category=${cat.name}`)}
              style={{ position: 'relative', height: '12rem', borderRadius: '2.5rem', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'all 0.5s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
              }}
            >
              <img 
                src={cat.img} 
                alt={cat.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '0.75rem', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <LayoutGrid size={20} />
                </div>
                <span style={{ fontWeight: 900, color: '#fff', fontSize: '1.125rem', letterSpacing: '-0.025em', textTransform: 'uppercase' }}>
                  {cat.name}
                </span>
              </div>
            </div>
          ))}

          <button 
            onClick={() => navigate('/discover')}
            style={{ position: 'relative', height: '12rem', borderRadius: '2.5rem', overflow: 'hidden', backgroundColor: '#C82333', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a71d2a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C82333'}
          >
            <span style={{ fontWeight: 900, color: '#fff', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              View All
            </span>
          </button>
        </div>
      </section>

      {/* --- STORY SECTION --- */}
      <section style={{ padding: '128px 24px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '96px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ aspectRatio: '4/3', borderRadius: '4rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transform: 'rotate(2deg)', transition: 'transform 0.5s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(2deg)'}
            >
              <img src="/images/sides.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Community Support" />
            </div>
            <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', backgroundColor: '#0f172a', padding: '40px', borderRadius: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'block' }}>
              <p style={{ fontSize: '3rem', fontWeight: 900, color: TEAL, margin: 0 }}>10+</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '8px' }}>Years of Trust</p>
            </div>
          </div>
          
          <div style={{ paddingLeft: '0' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.75rem)', fontWeight: 900, color: '#0f172a', marginBottom: '32px', lineHeight: 1.1, letterSpacing: '-0.05em' }}>
              Technology as a <br/>
              <span style={{ color: TEAL }}>Bridge to Kindness</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.25rem', lineHeight: 1.625, marginBottom: '40px', fontWeight: 500 }}>
              Every donation on AidbridgE goes through our AI-trust filter, ensuring transparency and accountability for every cent raised.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#f0fdfa', color: TEAL, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={24} />
                </div>
                <span style={{ fontWeight: 700, color: '#334155' }}>Global Presence</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '3rem', height: '3rem', backgroundColor: '#f0fdfa', color: TEAL, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                <span style={{ fontWeight: 700, color: '#334155' }}>AI-Verified</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/about')} 
              style={{ padding: '20px 48px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.125rem', cursor: 'pointer', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              Read Our Full Story
            </button>
          </div>
        </div>
      </section>
      <div style={{ height: '80px' }} />
    </div>
  );
};

export default Homepage;