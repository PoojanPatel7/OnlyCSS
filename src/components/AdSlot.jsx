import React from 'react';

const AdSlot = ({ format = 'horizontal', className = '' }) => {
  const isHorizontal = format === 'horizontal';

  return (
    <div className={`relative flex items-center justify-center bg-white/5 border border-dashed border-white/10 rounded-xl overflow-hidden shadow-inner ${
      isHorizontal 
        ? 'w-full max-w-4xl h-[60px] sm:h-[90px] mx-auto my-8' 
        : 'w-full max-w-[300px] h-[250px] mx-auto my-6'
    } ${className}`}>
      <span className="absolute top-1.5 right-2 text-[8px] text-text-primary/40 uppercase tracking-widest font-bold">Advertisement</span>
      <div className="text-text-primary/30 text-xs font-medium flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-cyan/20 animate-pulse"></span>
        {isHorizontal ? 'Sponsor Space' : 'Discover More'}
      </div>
    </div>
  );
};

export default AdSlot;
