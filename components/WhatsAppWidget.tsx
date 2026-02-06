
import React, { useState, useEffect } from 'react';
import { WHATSAPP_NUMBER } from '../constants';

interface WhatsAppWidgetProps {
  phoneNumber?: string;
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ phoneNumber }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const message = "Olá Infotronic! Estou navegando no site e gostaria de tirar algumas dúvidas sobre seus serviços e equipamentos.";
    const phone = phoneNumber || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Tooltip / Welcome Bubble */}
      {showTooltip && (
        <div className="mb-3 bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-2xl border border-slate-100 max-w-[220px] relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -right-2 bg-slate-200 text-slate-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-slate-300 transition-colors"
          >
            ✕
          </button>
          <p className="text-xs font-bold leading-tight">
            Olá! 👋 Como a <span className="text-brand-navy">INFOTRONIC</span> pode ajudar você hoje?
          </p>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-100"></div>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        className="group relative bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:hidden"></span>
        <svg
          className="w-8 h-8 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.767-.872-2.036-.969-.269-.099-.465-.148-.663.15-.197.298-.765.968-.938 1.166-.173.199-.347.224-.648.075-.301-.15-1.27-.468-2.418-1.492-.894-.798-1.497-1.784-1.672-2.083-.173-.299-.018-.461.13-.61.134-.134.301-.351.452-.527.151-.176.201-.299.301-.498.101-.199.05-.373-.025-.522-.075-.15-.663-1.597-.909-2.193-.24-.58-.483-.501-.663-.51l-.564-.01c-.198 0-.52.074-.792.372-.272.299-1.039 1.016-1.039 2.479 0 1.462 1.064 2.877 1.213 3.076.149.198 2.094 3.197 5.071 4.487.708.306 1.261.489 1.691.626.711.226 1.358.194 1.87.118.571-.085 1.767-.72 2.016-1.418.249-.698.249-1.297.174-1.418-.075-.122-.276-.197-.577-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.551 4.116 1.516 5.85L0 24l6.32-1.657C7.994 23.449 9.932 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.833 9.833 0 0 1-5.013-1.373l-.36-.214-3.727.977.994-3.633-.234-.373A9.831 9.831 0 0 1 2.16 12c0-5.426 4.414-9.84 9.84-9.84s9.84 4.414 9.84 9.84-4.414 9.84-9.84 9.84z" />
        </svg>
      </button>
    </div>
  );
};

export default WhatsAppWidget;
