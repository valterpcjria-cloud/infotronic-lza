
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-10" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Recreated Logo Symbol */}
      <svg viewBox="0 0 100 60" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 15H50M5 30H40M5 45H30" stroke="#1D355E" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="53" cy="15" r="4" fill="#1D355E"/>
        <circle cx="43" cy="30" r="4" fill="#1D355E"/>
        <circle cx="33" cy="45" r="4" fill="#1D355E"/>
        <path d="M5 15V45" stroke="#1D355E" strokeWidth="1" strokeOpacity="0.3"/>
      </svg>
      
      <div className="flex flex-col">
        <div className="flex font-black italic tracking-tighter text-2xl leading-none">
          <span className="text-brand-navy">INFO</span>
          <span className="text-brand-red">TRONIC</span>
        </div>
        <span className="text-[9px] font-bold text-brand-navy tracking-[0.2em] uppercase -mt-0.5">
          Informática e Eletrônica
        </span>
      </div>
    </div>
  );
};

export default Logo;
