import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, WHATSAPP_NUMBER } from './constants';
import { Product, Category, CartItem, Settings } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartSidebar from './components/CartSidebar';
import CMSDashboard from './components/CMS/CMSDashboard';
import Login from './components/CMS/Login';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import { dbService, resolveImageUrl } from './services/dbService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'superadmin' | 'admin' | undefined>();
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<Settings>({
    whatsapp_main: WHATSAPP_NUMBER,
    whatsapp_cart: WHATSAPP_NUMBER,
    address: 'Setor Comercial Norte, Quadra 01\nEdifício Corporate, DF',
    instagram: '',
    facebook: '',
    cnpj: ''
  });

  // Sincronização com o Banco de Dados MySQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dbProducts, dbCategories, dbSettings] = await Promise.all([
          dbService.getProducts(),
          dbService.getCategories(),
          dbService.getSettings()
        ]);

        // Se temos dados no banco, usamos eles. Se não temos nenhumm dado (DB vazio), 
        // mantemos os mockups apenas se não houver NENHUM registro mesmo.
        if (dbProducts.length > 0 || dbCategories.length > 0) {
          setProducts(dbProducts);
          setCategories(dbCategories);
        } else {
          // Se o banco retornar vazio, mostramos os mockups iniciais para o site não ficar "morto".
          setProducts(INITIAL_PRODUCTS);
          setCategories(INITIAL_CATEGORIES);
        }

        if (dbSettings && Object.keys(dbSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...dbSettings }));
        }

      } catch (error) {
        console.error("Erro ao conectar com o banco de dados:", error);
        setProducts(INITIAL_PRODUCTS);
        setCategories(INITIAL_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? p.categoryId === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const sendOrderToWhatsApp = () => {
    const itemsText = cart.map(item =>
      `• ${item.quantity}x ${item.product.name} (Ref: ${item.product.refCode || item.product.id})`
    ).join('%0A');

    const message = `Olá Infotronic! Gostaria de solicitar um orçamento para os seguintes produtos:%0A%0A${itemsText}%0A%0AAguardando retorno!`;
    const phone = settings.whatsapp_cart || settings.whatsapp_main || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleLoginSuccess = (success: boolean, role?: 'superadmin' | 'admin', userId?: string) => {
    if (success) {
      setIsAdmin(true);
      setUserRole(role);
      if (userId && role) {
        dbService.setRequesterInfo(userId, role);
      }
      setShowLogin(false);
    }
  };

  const handleLogout = () => setIsAdmin(false);

  if (isAdmin) {
    return (
      <CMSDashboard
        products={products}
        categories={categories}
        userRole={userRole}
        setProducts={setProducts}
        setCategories={setCategories}
        onClose={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCMS={() => setShowLogin(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-grow">
        <Hero />

        {/* Categories Bar - top-[240px] for mobile (logo 192px + minimal py + actions ~44px), md:top-48 for desktop */}
        <div className="bg-white border-b border-slate-200 sticky top-[240px] md:top-48 z-30 overflow-x-auto shadow-sm">
          <div className="container mx-auto px-4 py-4 md:py-6 flex items-center space-x-3 md:space-x-4 no-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeCategory === null ? 'bg-brand-navy text-white shadow-xl' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${activeCategory === null ? 'bg-white/20' : 'bg-white'}`}>
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </div>
              <span>Todos</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl text-[10px] md:text-xs font-black transition-all whitespace-nowrap uppercase tracking-widest ${activeCategory === cat.id ? 'bg-brand-red text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center overflow-hidden border ${activeCategory === cat.id ? 'bg-white border-white/20' : 'bg-white border-slate-200'}`}>
                  <img src={resolveImageUrl(cat.icon)} alt={cat.name} className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                </div>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <section id="catalog" className="container mx-auto px-4 py-12 md:py-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-[10px] font-black text-brand-navy uppercase tracking-widest">Acessando Database Infotronic...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
                <div>
                  <h2 className="text-2xl md:text-4xl font-black text-brand-navy mb-2 uppercase tracking-tighter">
                    {activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'Catálogo Principal'}
                  </h2>
                  <div className="h-1 w-16 md:h-1.5 md:w-24 bg-brand-red rounded-full"></div>
                </div>
                <span className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em]">{filteredProducts.length} Equipamentos Disponíveis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum equipamento correspondente.</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer settings={settings} />
      <WhatsAppWidget phoneNumber={settings.whatsapp_main || WHATSAPP_NUMBER} />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={sendOrderToWhatsApp}
      />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {showLogin && (
        <Login
          onLogin={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default App;
