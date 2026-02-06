
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-20 shadow-sm">
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo Component */}
        <Logo className="h-12" />

        {/* Search */}
        <div className="flex-grow max-w-md relative hidden lg:block">
          <input 
            type="text" 
            placeholder="O que você está procurando?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-2 border-transparent focus:border-brand-red rounded-xl py-2.5 px-12 text-sm transition-all focus:bg-white focus:shadow-lg outline-none"
          />
          <svg className="absolute left-4 top-3 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={onOpenCMS}
            className="p-3 hover:bg-slate-50 rounded-xl transition-all group relative text-brand-navy"
            title="Painel CMS"
          >
            <svg className="w-6 h-6 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          </button>
          
          <button 
            onClick={onOpenCart}
            className="flex items-center space-x-2 bg-brand-navy hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-brand-red text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold text-sm">Meu Orçamento</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
