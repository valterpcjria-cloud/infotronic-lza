
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo-infotronic.jpg"
        alt="Infotronic Logo"
        className="h-full w-auto object-contain"
      />
    </div>
  );
};

export default Logo;
