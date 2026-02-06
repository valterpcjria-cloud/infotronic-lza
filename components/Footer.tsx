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
    <footer className="bg-brand-navy text-slate-400 py-20 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-8">
              <Logo className="h-14 invert brightness-200" />
            </div>
            <p className="max-w-md mb-8 leading-relaxed text-lg">
              Desde workstations de alta performance a sistemas críticos de segurança eletrônica. A Infotronic é o seu parceiro estratégico em tecnologia.
            </p>
            <div className="flex space-x-4">
              {['fb', 'ig', 'in', 'yt'].map(s => (
                <div key={s} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all cursor-pointer group">
                  <span className="uppercase text-xs font-black group-hover:scale-110 transition-transform">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Menu Técnico</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
              <li><a href="#" className="hover:text-brand-red transition-colors">Segurança Digital</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Servidores & Redes</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Periféricos Gamer</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Suporte Remoto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-[0.2em] text-xs">Unidade Central</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start space-x-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <span className="font-medium text-slate-300 whitespace-pre-line">{address}</span>
              </li>
              <li className="flex items-center space-x-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <svg className="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="font-black text-white text-lg">{phone}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
          <p>© 2024 INFOTRONIC INFORMÁTICA E ELETRÔNICA. PROJETADO PARA PERFORMANCE.</p>
          <div className="flex space-x-8 mt-6 md:mt-0 opacity-60">
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
