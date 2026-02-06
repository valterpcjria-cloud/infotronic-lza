
import React, { useState } from 'react';
import { Product } from '../types';
import { resolveImageUrl } from '../services/dbService';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 bg-white shadow-xl hover:bg-slate-50 p-3 rounded-full transition-all"
        >
          <svg className="w-6 h-6 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-hidden">
          {/* Gallery */}
          <div className="lg:w-1/2 p-8 bg-slate-50 flex flex-col justify-center border-r border-slate-100">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-xl mb-6 flex items-center justify-center p-4">
              <img
                src={resolveImageUrl(product.images[activeImage])}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/seed/infotronic/800/600';
                }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-24 h-24 flex-shrink-0 rounded-2xl border-2 overflow-hidden transition-all shadow-md ${activeImage === idx ? 'border-brand-red ring-4 ring-brand-red/10' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={resolveImageUrl(img)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://picsum.photos/seed/infotronic/800/600';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:w-1/2 p-12 lg:overflow-y-auto bg-white flex flex-col relative">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="bg-brand-red/10 text-brand-red text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Referência: {product.refCode || 'S/R'}
                </span>
                <span className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 font-black uppercase tracking-widest">
                  SISTEMA INFOTRONIC
                </span>
              </div>

              <h2 className="text-4xl font-black text-brand-navy mb-4 leading-none uppercase tracking-tighter">{product.name}</h2>

              <span className="text-3xl font-black text-brand-navy">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
              </span>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
              <p className="text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="mb-10">
              <h4 className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] mb-4 border-b pb-2 border-slate-100">Especificações Técnicas</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex flex-col space-y-1">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{key}</span>
                    <span className="text-sm text-brand-navy font-bold">{value}</span>
                  </div>
                ))}
              </div>
              {Object.keys(product.specs).length === 0 && (
                <p className="text-xs text-slate-400 italic">Nenhuma especificação adicional listada.</p>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <button
                onClick={() => { onAddToCart(product); onClose(); }}
                className="w-full bg-brand-navy hover:bg-brand-red text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all shadow-2xl shadow-brand-navy/30 uppercase tracking-widest text-xs"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
                <span>Incluir no Orçamento</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ProductModal;