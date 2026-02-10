
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Product, Category, Settings, User } from '../../types';
import { generateProductDescription } from '../../services/geminiService';
import { dbService, resolveImageUrl } from '../../services/dbService';

interface CMSDashboardProps {
  products: Product[];
  categories: Category[];
  userRole?: 'superadmin' | 'admin' | 'staff';
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onClose: () => void;
}

type StockFilter = 'all' | 'in_stock' | 'out_of_stock';

// Fix: Completed the component implementation and added default export to fix the App.tsx import error
const CMSDashboard: React.FC<CMSDashboardProps> = ({
  products,
  categories,
  userRole = 'admin',
  setProducts,
  setCategories,
  onClose
}) => {
  /* Existing imports and props */
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'users'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  /* stats... */
  const [settings, setSettings] = useState<Settings>({
    whatsapp_main: '',
    whatsapp_cart: '',
    address: '',
    instagram: '',
    facebook: ''
  });

  /* State Variables for Logic */
  const [filter, setFilter] = useState<StockFilter>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    loadSettings();
    if (userRole === 'superadmin' || userRole === 'admin') {
      loadUsers();
    }
  }, [userRole]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await dbService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadSettings = async () => {
    const data = await dbService.getSettings();
    if (data) setSettings(data);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.saveSettings(settings);
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      alert(`Erro ao salvar configurações: ${error.message}`);
    }
  };

  /* Logic & Handlers */
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filter === 'in_stock') return (p.stockQuantity || 0) > 0;
      if (filter === 'out_of_stock') return (p.stockQuantity || 0) <= 0;
      return true;
    });
  }, [products, filter]);

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await dbService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert('Erro ao deletar produto');
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await dbService.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        alert('Erro ao deletar categoria');
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const productToSave = {
        ...editingProduct,
        id: editingProduct.id || crypto.randomUUID(),
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || 0,
        categoryId: editingProduct.categoryId || '',
        images: editingProduct.images || [],
        specs: editingProduct.specs || {},
        stockQuantity: editingProduct.stockQuantity || 0,
        refCode: editingProduct.refCode || ''
      } as Product;

      await dbService.saveProduct(productToSave);

      setProducts(prev => {
        const exists = prev.find(p => p.id === productToSave.id);
        if (exists) {
          return prev.map(p => p.id === productToSave.id ? productToSave : p);
        }
        return [...prev, productToSave];
      });

      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const categoryToSave = {
        ...editingCategory,
        id: editingCategory.id || crypto.randomUUID(),
        name: editingCategory.name || '',
        icon: editingCategory.icon || ''
      } as Category;

      await dbService.saveCategory(categoryToSave);

      setCategories(prev => {
        const exists = prev.find(c => c.id === categoryToSave.id);
        if (exists) {
          return prev.map(c => c.id === categoryToSave.id ? categoryToSave : c);
        }
        return [...prev, categoryToSave];
      });

      setEditingCategory(null);
    } catch (error) {
      alert('Erro ao salvar categoria');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await dbService.saveUser(editingUser as User);
      alert('Usuário salvo com sucesso!');
      loadUsers();
      setEditingUser(null);
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Erro ao salvar usuário: ${error.message || 'Erro técnico'}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Deseja realmente excluir este usuário?')) {
      try {
        await dbService.deleteUser(id);
        loadUsers();
      } catch (error) {
        alert('Erro ao deletar usuário');
      }
    }
  };

  const handleAiDescription = async () => {
    if (!editingProduct?.name) return;
    setIsGenerating(true);
    try {
      const category = categories.find(c => c.id === editingProduct.categoryId)?.name || 'Geral';
      const desc = await generateProductDescription(editingProduct.name, category);
      setEditingProduct(prev => prev ? { ...prev, description: desc } : null);
    } catch (error) {
      alert('Erro ao gerar descrição com IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const url = await dbService.uploadImage(e.target.files[0]);
        setEditingProduct(prev => prev ? {
          ...prev,
          images: [...(prev.images || []), url]
        } : null);
      } catch (error) {
        alert('Erro ao enviar imagem');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 overflow-y-auto">
      {/* Header with Navigation and Logout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'products'
              ? 'bg-brand-red text-white shadow-lg shadow-brand-red/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'categories'
              ? 'bg-brand-red text-white shadow-lg shadow-brand-red/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categorias
          </button>
          {userRole !== 'staff' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'settings'
                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </button>
          )}

          {(userRole === 'superadmin' || userRole === 'admin') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${activeTab === 'users'
                ? 'bg-brand-red text-white shadow-lg shadow-brand-red/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group"
        >
          <svg className="w-4 h-4 text-brand-red group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Finalizar Sessão
        </button>
      </div>


      {
        activeTab === 'products' ? (
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* List Section */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex flex-wrap gap-3 mb-10">
                {(['all', 'in_stock', 'out_of_stock'] as StockFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${filter === f
                      ? 'bg-white text-brand-navy border-white shadow-lg'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                  >
                    {f === 'all' ? 'Todos os Itens' : f === 'in_stock' ? 'Em Estoque' : 'Sem Estoque'}
                  </button>
                ))}

                <button
                  onClick={() => setEditingProduct({})}
                  className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all bg-brand-red text-white border border-brand-red shadow-lg shadow-brand-red/20 ml-auto flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  Novo Produto
                </button>
              </div>

              <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Equipamento</th>
                        <th className="px-8 py-5">Ref / SKU</th>
                        <th className="px-8 py-5 text-center">Estoque</th>
                        <th className="px-8 py-5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                <img src={resolveImageUrl(p.images[0])} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-black text-sm uppercase tracking-tight">{p.name}</p>
                                <p className="text-brand-red font-bold text-xs">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-mono font-bold text-slate-400 uppercase">
                            {p.refCode || p.id.slice(0, 8)}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border ${(p.stockQuantity || 0) > 0
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                              {p.stockQuantity || 0} UN
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProduct(p);
                                }}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-400 transition-all border border-transparent hover:border-blue-400/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-brand-red transition-all border border-transparent hover:border-brand-red/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhum equipamento encontrado nesta categoria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Editor Sidebar Section */}
            <div className="lg:col-span-1">
              {editingProduct ? (
                /* ... product editor form (already updated) ... */
                <form
                  /* (Keeping previous logic but making sure it's wrapped in a single container) */
                  onSubmit={handleSaveProduct} className="bg-white/5 rounded-[40px] border border-white/10 p-10 sticky top-28 backdrop-blur-md shadow-2xl space-y-6"
                >
                  {/* ... reusing content from the large block below ... */}
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center">
                    <span className="w-2 h-8 bg-brand-red rounded-full mr-4"></span>
                    {editingProduct.id ? 'Editar Cadastro' : 'Novo Cadastro'}
                  </h3>

                  {/* Form fields here (omitted for brevity in replacement, but I will include them in a subsequent step if needed or just replace the whole block) */}
                  {/* Actually, let's include the whole block for certainty */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Nome do Equipamento</label>
                    <input
                      className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                      value={editingProduct.name || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="Ex: Câmera Speed Dome 4K"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Categoria</label>
                      <select
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10 appearance-none"
                        value={editingProduct.categoryId || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                        required
                      >
                        <option value="" disabled className="bg-brand-navy">Selecionar</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-brand-navy">{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Preço</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                          value={editingProduct.price || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição Comercial</label>
                      <button
                        type="button"
                        onClick={handleAiDescription}
                        disabled={isGenerating || !editingProduct.name}
                        className="text-[9px] font-black uppercase text-brand-red hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                        <span>{isGenerating ? 'Processando IA...' : 'Gerar com Gemini'}</span>
                      </button>
                    </div>
                    <textarea
                      className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-medium h-32 resize-none outline-none transition-all focus:bg-white/10 leading-relaxed"
                      value={editingProduct.description || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Descreva as funcionalidades e benefícios técnicos..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4 ml-1">Galeria de Fotos</label>
                    <div className="space-y-3">
                      {(editingProduct.images || []).map((img, idx) => (
                        <div key={idx} className="flex items-center space-x-2 group">
                          <div className="flex-grow bg-white/5 border-2 border-transparent rounded-xl px-4 py-3 text-xs font-bold text-slate-400 truncate">
                            {img.startsWith('http') ? img : `Arquivo: ${img.split('name=').pop()}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = [img, ...(editingProduct.images || []).filter((_, i) => i !== idx)];
                              setEditingProduct({ ...editingProduct, images: newImgs });
                            }}
                            className={`p-3 rounded-xl transition-all ${idx === 0 ? 'bg-brand-red text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                            title={idx === 0 ? "Foto de Capa" : "Definir como Capa"}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = (editingProduct.images || []).filter((_, i) => i !== idx);
                              setEditingProduct({ ...editingProduct, images: newImgs });
                            }}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-brand-red transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}

                      <div className="flex flex-col space-y-2">
                        <label className="w-full relative cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          <div className={`w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center space-x-3 transition-all ${isUploading
                            ? 'bg-white/5 border-white/10 cursor-not-allowed'
                            : 'border-brand-red/30 hover:border-brand-red hover:bg-brand-red/5'
                            }`}>
                            {isUploading ? (
                              <div className="flex items-center space-x-2">
                                <span className="w-4 h-4 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Enviando Arquivo...</span>
                              </div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">Carregar do Computador</span>
                              </>
                            )}
                          </div>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt("Insira a URL da imagem:");
                            if (url) {
                              setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), url] });
                            }
                          }}
                          className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all text-center"
                        >
                          Ou adicionar por URL externa
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Referência / SKU</label>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingProduct.refCode || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, refCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Estoque Disponível</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingProduct.stockQuantity || 0}
                        onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Technical Specifications Section */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4 ml-1">Especificações Técnicas</label>
                    <div className="space-y-3">
                      {Object.entries(editingProduct.specs || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2 group">
                          <div className="flex-grow bg-white/5 border-2 border-transparent rounded-xl px-4 py-3 text-xs font-bold">
                            <span className="text-slate-400">{key}:</span> <span className="text-white">{value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newSpecs = { ...(editingProduct.specs || {}) };
                              delete newSpecs[key];
                              setEditingProduct({ ...editingProduct, specs: newSpecs });
                            }}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-brand-red transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="flex-1 bg-white/5 border-2 border-transparent focus:border-brand-red rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all focus:bg-white/10"
                          placeholder="Nome (ex: Resolução)"
                          value={newSpecKey}
                          onChange={e => setNewSpecKey(e.target.value)}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-white/5 border-2 border-transparent focus:border-brand-red rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all focus:bg-white/10"
                          placeholder="Valor (ex: 4K)"
                          value={newSpecValue}
                          onChange={e => setNewSpecValue(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newSpecKey.trim() && newSpecValue.trim()) {
                              setEditingProduct({
                                ...editingProduct,
                                specs: { ...(editingProduct.specs || {}), [newSpecKey.trim()]: newSpecValue.trim() }
                              });
                              setNewSpecKey('');
                              setNewSpecValue('');
                            }
                          }}
                          className="p-3 bg-brand-red hover:bg-red-700 rounded-xl text-white transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col space-y-3">
                    <button
                      type="submit"
                      className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      <span>Efetivar Cadastro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Descartar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white/5 rounded-[40px] border-2 border-dashed border-white/10 p-16 text-center flex flex-col items-center justify-center sticky top-28">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] max-w-[180px] leading-relaxed">
                    Selecione um item da lista para editar ou use o botão superior para novo cadastro.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'categories' ? (
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Category List Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex justify-between items-center mb-6">
                <div></div>
                <button
                  onClick={() => setEditingCategory({})}
                  className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all bg-brand-red text-white border border-brand-red shadow-lg shadow-brand-red/20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  Nova Categoria
                </button>
              </div>
              <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Categoria</th>
                        <th className="px-8 py-5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-2">
                                <img src={cat.icon} alt="" className="w-full h-full object-contain" />
                              </div>
                              <p className="font-black text-sm uppercase tracking-tight">{cat.name}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingCategory(cat)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-400 transition-all border border-transparent hover:border-blue-400/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-brand-red transition-all border border-transparent hover:border-brand-red/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Category Editor Sidebar */}
            <div className="lg:col-span-1">
              {editingCategory ? (
                <div className="bg-white/5 rounded-[40px] border border-white/10 p-10 sticky top-28 backdrop-blur-md shadow-2xl">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center">
                    <span className="w-2 h-8 bg-brand-red rounded-full mr-4"></span>
                    {editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
                  </h3>

                  <form onSubmit={handleSaveCategory} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Nome da Categoria</label>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingCategory.name || ''}
                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="Ex: Câmeras IP"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">URL do Ícone (PNG/SVG)</label>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingCategory.icon || ''}
                        onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="pt-6 flex flex-col space-y-3">
                      <button
                        type="submit"
                        className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        <span>Salvar Categoria</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        Descartar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white/5 rounded-[40px] border-2 border-dashed border-white/10 p-16 text-center flex flex-col items-center justify-center sticky top-28">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] max-w-[180px] leading-relaxed">
                    Selecione uma categoria para editar ou use o botão superior para novo cadastro.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="max-w-2xl mx-auto bg-white/5 rounded-[40px] border border-white/10 p-10 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="flex flex-col items-center text-center gap-4 mb-10">
                <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center shadow-lg shadow-brand-red/30 mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Configurações Gerais</h2>
                  <p className="text-slate-400 text-sm font-medium">Gerencie contatos e informações da empresa</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Whatsapp de Orçamentos (Principal)</label>
                  <input
                    className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                    value={settings.whatsapp_main || ''}
                    onChange={e => setSettings({ ...settings, whatsapp_main: e.target.value })}
                    placeholder="Ex: 5511999999999"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">Utilizado no botão flutuante e rodapé. Apenas números.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Whatsapp do Carrinho (Pedidos)</label>
                  <input
                    className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                    value={settings.whatsapp_cart || ''}
                    onChange={e => setSettings({ ...settings, whatsapp_cart: e.target.value })}
                    placeholder="Ex: 5511999999999"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">Número para onde os pedidos do carrinho serão enviados.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Endereço da Loja</label>
                  <textarea
                    className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10 h-32 resize-none"
                    value={settings.address || ''}
                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Endereço completo..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Link Instagram</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                      </div>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={settings.instagram || ''}
                        onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                        placeholder="Ex: https://instagram.com/perfil"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Link Facebook</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                      </div>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={settings.facebook || ''}
                        onChange={e => setSettings({ ...settings, facebook: e.target.value })}
                        placeholder="Ex: https://facebook.com/pagina"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-red hover:bg-red-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-brand-red/25 uppercase tracking-widest text-xs flex items-center justify-center space-x-2 mt-8"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Salvar Configurações</span>
              </button>
            </form>
          </div>
        ) : (
          /* USERS TAB */
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-8 py-5">Usuário</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5">Função</th>
                        <th className="px-8 py-5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                            <div>
                              <p className="font-black text-sm uppercase tracking-tight">{u.name}</p>
                              <p className="text-slate-500 text-xs font-mono">{u.username}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border ${u.is_active
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                              {u.is_active ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border ${u.role === 'superadmin'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-blue-400 transition-all border border-transparent hover:border-blue-400/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-brand-red transition-all border border-transparent hover:border-brand-red/30"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                onClick={() => setEditingUser({ role: 'admin' })}
                className="flex items-center gap-2 px-8 py-5 bg-brand-red text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-red/20 hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
                Novo Usuário
              </button>
            </div>

            <div className="lg:col-span-1">
              {editingUser ? (
                <div className="bg-white/5 rounded-[40px] border border-white/10 p-10 sticky top-28 backdrop-blur-md shadow-2xl">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center">
                    <span className="w-2 h-8 bg-brand-red rounded-full mr-4"></span>
                    {editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}
                  </h3>

                  <form onSubmit={handleSaveUser} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Nome Completo</label>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingUser.name || ''}
                        onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Usuário (Login)</label>
                      <input
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingUser.username || ''}
                        onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Senha {editingUser.id && '(Deixe em branco para manter)'}</label>
                      <input
                        type="password"
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10"
                        value={editingUser.password || ''}
                        onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                        required={!editingUser.id}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Nível de Acesso</label>
                      <select
                        className="w-full bg-white/5 border-2 border-transparent focus:border-brand-red rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all focus:bg-white/10 appearance-none text-white"
                        value={editingUser.role || 'admin'}
                        onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                        required
                      >
                        <option value="staff" className="bg-slate-900">Colaborador (Produtos/Cats)</option>
                        <option value="admin" className="bg-slate-900">Admin (Limitado)</option>
                        {userRole === 'superadmin' && <option value="superadmin" className="bg-slate-900">SuperAdmin (Total)</option>}
                      </select>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <input
                        type="checkbox"
                        id="user_active"
                        className="w-5 h-5 accent-brand-red cursor-pointer"
                        checked={editingUser.is_active !== false}
                        onChange={e => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                      />
                      <label htmlFor="user_active" className="text-sm font-bold uppercase tracking-tight cursor-pointer">
                        Conta Ativa
                      </label>
                    </div>

                    <div className="pt-6 flex flex-col space-y-3">
                      <button
                        type="submit"
                        className="w-full bg-brand-red hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-red/20 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        <span>Salvar Usuário</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                      >
                        Descartar
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white/5 rounded-[40px] border-2 border-dashed border-white/10 p-16 text-center flex flex-col items-center justify-center sticky top-28">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] max-w-[180px] leading-relaxed">
                    Selecione um usuário para editar ou use o botão para criar um novo.
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      }

    </div >
  );
};

export default CMSDashboard;
