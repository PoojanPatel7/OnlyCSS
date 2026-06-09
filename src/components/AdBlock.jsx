import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdBlock = ({ 
  title = "Unlock Premium Features", 
  description = "Get access to exclusive UI components, priority support, and advanced analytics.", 
  ctaText = "Upgrade Now",
  ctaLink = "/settings",
  variant = "default" 
}) => {
  if (variant === "compact") {
    return (
      <div className="relative group overflow-hidden rounded-2xl glass-pro p-1 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 via-accent-cyan/20 to-accent-pink/20 animate-gradient-xy opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative flex items-center justify-between p-4 bg-primary-surface/80 backdrop-blur-md rounded-xl z-10 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-lg">{title}</h4>
              <p className="text-text-muted text-sm hidden sm:block">{description}</p>
            </div>
          </div>
          <Link to={ctaLink} className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-white text-primary-bg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            {ctaText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full overflow-hidden rounded-3xl glass-pro p-1 my-12">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/30 via-accent-cyan/10 to-accent-pink/30 animate-gradient-xy"></div>
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-purple/20 rounded-full blur-[80px] -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-150"></div>
      
      {/* Content Container */}
      <div className="relative bg-primary-surface/60 backdrop-blur-xl rounded-[22px] p-8 md:p-12 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 z-10 overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer-bg opacity-30"></div>
        
        <div className="relative z-10 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white mb-4 uppercase tracking-wider backdrop-blur-sm shadow-inner">
            <Sparkles size={12} className="text-accent-gold" />
            <span>Sponsor</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-heading font-black text-white mb-4 tracking-tight drop-shadow-sm">
            {title}
          </h3>
          <p className="text-lg text-text-muted font-normal max-w-xl mx-auto md:mx-0">
            {description}
          </p>
        </div>
        
        <div className="relative z-10 flex-shrink-0">
          <Link 
            to={ctaLink} 
            className="group/btn relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary-bg font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
            <span className="relative z-10">{ctaText}</span>
            <ArrowRight size={20} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdBlock;
