
import React from 'react';
import Logo from './Logo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenCMS: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenCMS, searchQuery, setSearchQuery }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Desktop Layout - Single Row */}
      <div className="hidden md:flex container mx-auto px-4 h-48 items-center justify-between gap-4">
        <div className="flex-shrink-0">
          <Logo className="h-44 -ml-2" />
        </div>
        <div className="flex-grow max-w-md relative">
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-2 border-transparent focus:border-brand-red rounded-xl py-3 px-12 text-sm transition-all focus:bg-white focus:shadow-lg outline-none"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onOpenCMS} className="p-4 hover:bg-slate-50 rounded-xl transition-all group relative text-brand-navy" title="Painel CMS">
            <svg className="w-7 h-7 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </button>
          <button onClick={onOpenCart} className="flex items-center space-x-3 bg-brand-navy hover:bg-slate-800 text-white px-6 py-4 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap">
            <div className="relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-brand-red text-white text-[11px] font-bold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-bold text-base">Meu Orçamento</span>
          </button>
        </div>
      </div>

      {/* Mobile Layout - Stacked Two Rows */}
      <div className="md:hidden">
        {/* Row 1: Centered Logo */}
        <div className="flex justify-center items-center py-1 border-b border-slate-100">
          <Logo className="h-48" />
        </div>
        {/* Row 2: Search + Actions */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          {/* Search */}
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-2 border-transparent focus:border-brand-red rounded-lg py-2 pl-9 pr-3 text-sm transition-all focus:bg-white focus:shadow-md outline-none"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button onClick={onOpenCMS} className="p-2 hover:bg-slate-50 rounded-lg transition-all text-brand-navy" title="Painel CMS">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
            <button onClick={onOpenCart} className="flex items-center space-x-1 bg-brand-navy hover:bg-slate-800 text-white px-3 py-2 rounded-lg transition-all shadow-md active:scale-95">
              <div className="relative">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-xs">Orçamento</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
