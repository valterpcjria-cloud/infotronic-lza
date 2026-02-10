import React from 'react';
import Logo from './Logo';
import { Settings } from '../types';

interface FooterProps {
  settings?: Settings;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  const address = settings?.address || 'Setor Comercial Norte, Quadra 01\nEdifício Corporate, DF';
  const phone = settings?.whatsapp_main || '(61) 99999-9999';

  // Helper to format phone for display if needed, but for now just displaying as is or if it came from DB might need formatting.
  // Assuming the user types it formatted or we display it as is. 

  return (
    <footer className="bg-brand-navy text-slate-400 py-12 md:py-20 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-12 md:mb-16">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-6 md:mb-8">
              <Logo className="h-24 md:h-32" />
            </div>
            <p className="max-w-md mb-8 leading-relaxed text-base md:text-lg">
              Desde workstations de alta performance a sistemas críticos de segurança eletrônica. A Infotronic é o seu parceiro estratégico em tecnologia.
            </p>
            <div className="flex space-x-4">
              {[
                { id: 'fb', icon: 'M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z', link: settings?.facebook },
                { id: 'ig', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', link: settings?.instagram }
              ].map(s => (
                <a
                  key={s.id}
                  href={s.link || '#'}
                  target={s.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group ${s.link ? 'hover:bg-brand-red hover:text-white cursor-pointer' : 'opacity-40 cursor-default'}`}
                  title={s.id.toUpperCase()}
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white font-black mb-6 md:mb-8 uppercase tracking-[0.2em] text-[10px] md:text-xs">Menu Técnico</h4>
            <ul className="space-y-4 text-[11px] md:text-sm font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-brand-red transition-colors">Segurança Digital</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Servidores & Redes</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Periféricos Gamer</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Suporte Remoto</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-white font-black mb-6 md:mb-8 uppercase tracking-[0.2em] text-[10px] md:text-xs">Unidade Central</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-300 whitespace-pre-line text-xs md:text-sm">{address}</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="font-black text-white text-base md:text-lg">{phone}</span>
              </li>
              {settings?.cnpj && (
                <li className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4 pt-2">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-300 text-xs md:text-sm">CNPJ: {settings.cnpj}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col items-center md:items-start md:flex-row justify-between text-[9px] md:text-[10px] text-center md:text-left font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
          <div className="space-y-2">
            <p className="max-w-[300px] md:max-w-none">© 2024 INFOTRONIC INFORMÁTICA E ELETRÔNICA. PROJETADO PARA PERFORMANCE.</p>
          </div>
          <div className="flex space-x-6 md:space-x-8 mt-6 md:mt-0 opacity-60">
            <a href="#" className="hover:text-brand-red">Privacidade</a>
            <a href="#" className="hover:text-brand-red">Compliance</a>
            <a href="#" className="hover:text-brand-red">SAC</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
