
import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-[75vh] flex items-center overflow-hidden bg-brand-navy">
      {/* Background with advanced overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80"
          alt="High Tech Security"
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy via-brand-navy/80 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/40"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] md:text-xs font-black px-4 py-2 rounded-lg mb-6 md:mb-8 tracking-[0.2em] uppercase">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
              </span>
              Líder em Soluções Inteligentes
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-white mb-6 md:mb-8 leading-[1.1] text-shadow">
              INFRAESTRUTURA DE <br className="hidden md:block" />
              <span className="text-brand-red">ALTA PERFORMANCE</span>
            </h1>

            <p className="text-slate-300 text-base md:text-xl mb-8 md:mb-12 leading-relaxed max-w-xl">
              De workstations de elite a sistemas críticos de segurança eletrônica. A Infotronic entrega a tecnologia que o seu futuro exige.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
              <a
                href="#catalog"
                className="bg-brand-red hover:bg-red-700 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-black transition-all transform hover:-translate-y-1 shadow-2xl shadow-brand-red/40 uppercase tracking-wider text-center text-sm md:text-base"
              >
                Ver Catálogo
              </a>
            </div>


          </div>

          <div className="hidden lg:block relative animate-float">
            <div className="relative z-10 rounded-3xl overflow-hidden border-8 border-white/5 shadow-2xl rotate-2">
              <img
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
                alt="Monitoring Center"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-red rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-navy-light rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
