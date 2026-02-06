
import React from 'react';
import { CartItem } from '../types';
import { resolveImageUrl } from '../services/dbService';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout
}) => {
  const total = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Seu Orçamento</h2>
            <p className="text-xs text-slate-500">{items.length} itens selecionados</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="font-medium text-slate-900">O carrinho está vazio</p>
              <p className="text-sm">Selecione produtos do catálogo para solicitar orçamento.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex space-x-4 group">
                <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={resolveImageUrl(item.product.images[0])}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://picsum.photos/seed/infotronic/800/600';
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.product.name}</h3>
                    <button
                      onClick={() => onRemove(item.product.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.price)}
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-slate-100 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-l-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded-r-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-slate-50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-500 font-medium">Estimativa Total:</span>
              <span className="text-xl font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all"
            >
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.301-.15-1.767-.872-2.036-.969-.269-.099-.465-.148-.663.15-.197.298-.765.968-.938 1.166-.173.199-.347.224-.648.075-.301-.15-1.27-.468-2.418-1.492-.894-.798-1.497-1.784-1.672-2.083-.173-.299-.018-.461.13-.61.134-.134.301-.351.452-.527.151-.176.201-.299.301-.498.101-.199.05-.373-.025-.522-.075-.15-.663-1.597-.909-2.193-.24-.58-.483-.501-.663-.51l-.564-.01c-.198 0-.52.074-.792.372-.272.299-1.039 1.016-1.039 2.479 0 1.462 1.064 2.877 1.213 3.076.149.198 2.094 3.197 5.071 4.487.708.306 1.261.489 1.691.626.711.226 1.358.194 1.87.118.571-.085 1.767-.72 2.016-1.418.249-.698.249-1.297.174-1.418-.075-.122-.276-.197-.577-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.551 4.116 1.516 5.85L0 24l6.32-1.657C7.994 23.449 9.932 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.833 9.833 0 0 1-5.013-1.373l-.36-.214-3.727.977.994-3.633-.234-.373A9.831 9.831 0 0 1 2.16 12c0-5.426 4.414-9.84 9.84-9.84s9.84 4.414 9.84 9.84-4.414 9.84-9.84 9.84z" />
              </svg>
              <span>Enviar para WhatsApp</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 uppercase font-bold tracking-widest">
              Nenhuma transação financeira é feita por este site
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
