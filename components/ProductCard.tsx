
import React from 'react';
import { Product } from '../types';
import { resolveImageUrl } from '../services/dbService';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200 p-4 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 mb-6 shadow-inner">
        <img
          src={resolveImageUrl(product.images[0])}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.currentTarget.src = 'https://picsum.photos/seed/infotronic/800/600';
          }}
        />
        <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/20 transition-colors duration-500"></div>

        {/* Ref Code Badge */}
        {product.refCode && (
          <div className="absolute top-4 left-4 bg-brand-navy text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
            Ref: {product.refCode}
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-brand-navy text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
          {product.stockQuantity && product.stockQuantity > 0 ? (
            <span>Estoque: {product.stockQuantity} un</span>
          ) : (
            <span className="text-brand-red">Sob Consulta</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-4 right-4 bg-brand-red text-white p-3.5 rounded-2xl shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="px-1" onClick={onViewDetails}>
        <div className="mb-2 cursor-pointer">
          <h3 className="font-black text-brand-navy text-lg line-clamp-1 uppercase tracking-tight group-hover:text-brand-red transition-colors">{product.name}</h3>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl font-black text-brand-navy">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          </span>
        </div>

        <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed cursor-pointer mb-6">
          {product.description}
        </p>

        <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-brand-red uppercase font-black tracking-[0.2em]">
            COD: {product.refCode || product.id.slice(0, 5)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            className="text-xs font-black text-brand-navy uppercase tracking-widest hover:text-brand-red transition-colors"
          >
            Especificações
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;