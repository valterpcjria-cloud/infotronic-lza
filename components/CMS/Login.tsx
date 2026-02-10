
import React, { useState } from 'react';
import Logo from '../Logo';
import { dbService } from '../../services/dbService';

interface LoginProps {
  onLogin: (success: boolean, role?: 'superadmin' | 'admin') => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await dbService.login(username, password);
      if (data.success) {
        onLogin(true, data.user?.role, data.user?.id);
      } else {
        setError('Credenciais inválidas. Verifique seu usuário e senha.');
      }
    } catch (err: any) {
      if (err.message?.includes('Failed to fetch')) {
        setError('Não foi possível conectar ao servidor (api.php). Verifique se o backend está online.');
      } else {
        setError(err.message || 'Erro de autenticação interno.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy p-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-red rounded-full filter blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full filter blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white/95 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl border border-white/20">
          <div className="flex flex-col items-center mb-10">
            <Logo className="h-16 mb-6" />
            <div className="text-center">
              <h2 className="text-xl font-black text-brand-navy uppercase tracking-tighter">Acesso Restrito</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Management System</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Usuário de Acesso</label>
              <input
                type="text"
                required
                className="w-full bg-slate-100 border-2 border-transparent focus:border-brand-navy rounded-2xl px-6 py-4 outline-none transition-all font-bold text-brand-navy"
                placeholder="Ex: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Senha de Segurança</label>
              <input
                type="password"
                required
                className="w-full bg-slate-100 border-2 border-transparent focus:border-brand-navy rounded-2xl px-6 py-4 outline-none transition-all font-bold text-brand-navy"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 text-brand-red text-[10px] font-black uppercase tracking-widest p-4 rounded-xl border border-red-100 animate-bounce">
                {error}
              </div>
            )}

            <div className="pt-4 flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-navy hover:bg-brand-red text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-brand-navy/20 uppercase tracking-widest text-xs flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span>Entrar no Sistema</span>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-navy transition-colors py-2"
              >
                Voltar para o Site
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-8 text-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">
          Powered by Infotronic Security protocols
        </p>
      </div>
    </div>
  );
};

export default Login;
