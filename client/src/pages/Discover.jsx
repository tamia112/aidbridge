/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CampaignCard from '../components/CampaignCard';
import SkeletonCard from '../components/SkeletonCard';
import { API } from '../config';
const Discover = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Medical', 'Education', 'Emergency', 'Animals', 'Food', 'Clothes', 'Shelter', 'Family', 'Community', 'Creative'];
  const activeCategory = new URLSearchParams(search).get('category') || 'All';

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const catParam = activeCategory !== 'All' ? `&category=${activeCategory}` : '';
      const searchParam = searchTerm ? `&search=${searchTerm}` : '';
      const response = await fetch(`${API}/api/campaigns?page=${currentPage}&limit=8${catParam}${searchParam}`);
      const data = await response.json();
      if (data?.campaigns) {
        setCampaigns(data.campaigns);
        setTotalPages(data.totalPages || Math.ceil(data.total / 8) || 1);
      }
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setTimeout(() => setLoading(false), 500); }
  }, [activeCategory, searchTerm, currentPage]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleCategoryChange = (cat) => {
    setCurrentPage(1);
    cat === 'All' ? navigate('/discover') : navigate(`/discover?category=${cat}`);
  };

  // --- FORCE CENTER STYLES ---
  const s = {
    container: "min-h-screen bg-[#FDFDFD] pb-40 pt-32 flex flex-col items-center w-full overflow-x-hidden",
    hero: "w-full max-w-4xl text-center px-6 mb-59 flex flex-col items-center",
    badge: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 mb-6",
    badgeText: "text-[#26C2B9] font-black text-[10px] uppercase tracking-[0.2em]",
    
    title: "text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6 whitespace-nowrap text-center",
    
    controls: "w-full max-w-6xl px-6 mb-32 sticky top-10 z-40",
    glass: "bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col lg:flex-row items-center gap-6",
    
    categoryScroll: "flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto py-1",
    catBtn: (isActive) => `px-6 py-3.5 rounded-2xl text-[15px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      isActive ? 'bg-[#26C2B9] text-white shadow-lg shadow-teal-100 scale-105' : 'text-slate-400 hover:text-slate-600'
    }`,
    
    searchWrapper: "relative w-full lg:flex-1",
    input: "w-full pl-14 pr-8 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-[#26C2B9]/20",
    content: "w-full max-w-7xl px-10",
     grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16",
    
    pagination: "mt-24 flex justify-center items-center gap-12"
  };

  return (
    <div className={s.container}>
      {/* 1. CENTERED HERO */}
      <header className={s.hero}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
         
          <h1 className={s.title}>
            Discover <span className="text-[#26C2B9]">Real</span> Impact.
          </h1>
          
        </motion.div>
      </header>

      {/* 2. CENTERED CONTROLS BAR */}
      <div className={s.controls}>
        <div className={s.glass}>
          <div className={s.categoryScroll}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} className={s.catBtn(activeCategory === cat)}>
                {cat}
              </button>
            ))}
          </div>

          <div className="hidden lg:block w-px h-8 bg-slate-100 mx-2" />

          <div className={s.searchWrapper}>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by title or category..." 
              className={s.input}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* 3. CAMPAIGN GRID */}
      <main className="w-full flex flex-col items-center">
        {loading ? (
          <div className={s.grid}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className={s.grid}>
              <AnimatePresence mode="popLayout">
                {campaigns.map((c) => (
                  <motion.div key={c._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CampaignCard campaign={c} /> 
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {campaigns.length === 0 && (
              <div className="text-center py-40">
                <AlertCircle size={48} className="text-slate-200 mx-auto mb-4" />
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Campaigns Found</h3>
                <p className="text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}

            {/* CENTERED PAGINATION */}
            {totalPages > 1 && (
              <div className={s.pagination}>
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-10"
                >
                  <ChevronLeft size={20} /> Prev
                </button>
                
                <span className="text-sm font-black text-slate-900 tracking-widest uppercase">
                  Page {currentPage} of {totalPages}
                </span>

                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-10"
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Discover;