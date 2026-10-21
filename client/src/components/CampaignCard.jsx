/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, ArrowRight, Heart } from 'lucide-react';
import { API } from '../config';
const VerifiedBadge = ({ score }) => (
  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-teal-100">
    <ShieldCheck size={14} className="text-[#26C2B9]" />
    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
      AI Verified {score || 0}%
    </span>
  </div>
);

const ProgressCard = ({ raised, target }) => {
  const amountRaised = raised || 0;
  const amountTarget = target || 1;
  const percentage = Math.min(Math.round((amountRaised / amountTarget) * 100), 100);
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Centered Progress Header */}
      <div className="flex flex-col items-center mb-4">
        <span className="text-[10px] font-black text-[#26C2B9] uppercase tracking-[0.2em] mb-1">{percentage}% Funded</span>
        <span className="text-2xl font-black text-slate-900">${amountRaised.toLocaleString()}</span>
      </div>
      
      {/* Clean Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
        <motion.div 
          className="h-full bg-[#26C2B9] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
      
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Target: ${amountTarget.toLocaleString()}
      </p>
    </div>
  );
};

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  //const BACKEND_URL = 'http://localhost:5000';
  const BACKEND_URL = API;

  // --- Styles Object for "Spacious Center" ---
  const s = {
    card: "group bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all flex flex-col w-full max-w-[360px] h-[420px] mx-auto cursor-pointer",
    mediaArea: "h-56 bg-slate-100 relative overflow-hidden shrink-0",
    content: "p-10 flex-1 flex flex-col items-center text-center", // Centering everything
    location: "flex items-center gap-2 mb-6 text-[10px] text-slate-400 font-black uppercase tracking-widest",
    title: "text-2xl font-black text-slate-900 mb-6 group-hover:text-[#26C2B9] transition-colors line-clamp-2 leading-tight",
    aiBox: "w-full bg-slate-50 p-5 rounded-[1.5rem] mb-8 border border-slate-100",
    footer: "mt-auto w-full pt-6 border-t border-slate-50"
  };

  const cleanPath = campaign.coverMedia?.replace(/\\/g, '/') || '';
  const imageSrc = cleanPath ? `${BACKEND_URL}/${cleanPath.replace(/^\//, '')}` : '';

  return (
    <motion.div 
      whileHover={{ y: -12 }}
      className={s.card}
      onClick={() => navigate(`/campaign/${campaign._id}`)}
    >
      {/* 1. MEDIA AREA */}
      <div className={s.mediaArea}>
      <div className="absolute top-6 left-6 z-20">

          <VerifiedBadge score={campaign.verificationScore} />
        </div>
        <img 
          src={imageSrc} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={campaign.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* 2. CONTENT AREA */}
      <div className={s.content}>
        <div className={s.location}>
          <MapPin size={12} className="text-[#26C2B9]" />
          {typeof campaign.location === 'string' ? campaign.location : "Nairobi, Kenya"}
        </div>

        <h3 className={s.title}>{campaign.title}</h3>

        <div className={s.aiBox}>
          <p className="text-[11px] text-slate-500 italic leading-relaxed">
            <span className="font-black text-[#26C2B9] not-italic block mb-1">COGNITION NOTE</span> 
            {campaign.aiNotes || "Trust-verified documentation provided."}
          </p>
        </div>

        {/* 3. PROGRESS & ACTION */}
        <div className={s.footer}>
          <ProgressCard raised={campaign.raisedAmount} target={campaign.targetAmount} />
          
          <button className="w-full mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#26C2B9] hover:shadow-xl hover:shadow-[#26C2B9]/20 transition-all flex items-center justify-center gap-3">
            Give Now <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;