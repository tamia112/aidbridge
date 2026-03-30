import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="w-80 h-115 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm mx-auto flex flex-col animate-pulse">
      {/* Image Placeholder */}
      <div className="h-44 bg-slate-200" />
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Title Placeholder */}
        <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-3" />
        <div className="h-4 bg-slate-200 rounded-full w-1/2 mb-6" />
        
        {/* Progress Section Placeholder */}
        <div className="mt-auto">
          <div className="h-2 bg-slate-100 rounded-full w-full mb-4" />
          <div className="flex justify-between mb-6">
            <div className="h-6 bg-slate-200 rounded-lg w-20" />
            <div className="h-4 bg-slate-200 rounded-full w-10" />
          </div>
          {/* Button Placeholder */}
          <div className="h-12 bg-slate-200 rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;