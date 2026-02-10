
import { Product, Category, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'api.php';
const API_KEY = import.meta.env.VITE_API_KEY || 'infotronic_secure_key_2024_xyz';

let requesterId = '';
let requesterRole = '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
  'X-Requester-ID': requesterId,
  'X-Requester-Role': requesterRole
});

export const dbService = {
  setRequesterInfo(id: string, role: string) {
    requesterId = id;
    requesterRole = role;
  },

  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_URL}?resource=categories`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Falha ao buscar categorias:", err);
      return [];
    }
  },

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_URL}?resource=products`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Falha ao buscar produtos:", err);
      return [];
    }
  },

  async saveProduct(product: Product): Promise<void> {
    const res = await fetch(`${API_URL}?resource=products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errData.error || 'Erro ao salvar produto');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_URL}?resource=products&id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao deletar produto');
  },

  async saveCategory(category: Category): Promise<void> {
    const res = await fetch(`${API_URL}?resource=categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error('Erro ao salvar categoria');
  },

  async login(username: string, password: string): Promise<any> {
    const res = await fetch(`${API_URL}?resource=login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Autenticação falhou' }));
      throw new Error(errData.error || 'Credenciais inválidas');
    }
    return await res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_URL}?resource=categories&id=${id}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': API_KEY }
    });
    if (!res.ok) throw new Error('Erro ao deletar categoria');
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}?resource=upload`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY
        // Content-Type is set automatically by fetch for FormData
      },
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Falha no upload' }));
      throw new Error(errData.error || 'Erro ao enviar imagem ao servidor');
    }

    const data = await res.json();
    return data.url; // Retorna a URL serve_image gerada pelo backend
  },

  async getSettings(): Promise<any> {
    try {
      const res = await fetch(`${API_URL}?resource=settings`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Erro ao buscar configurações');
      return await res.json();
    } catch (err) {
      console.error("Falha ao buscar settings:", err);
      return {};
    }
  },

  async saveSettings(settings: any): Promise<void> {
    const res = await fetch(`${API_URL}?resource=settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Erro desconhecido ao salvar' }));
      throw new Error(errData.error || 'Erro ao salvar configurações');
    }
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_URL}?resource=users`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao buscar usuários');
    return await res.json();
  },

  async saveUser(user: Partial<User>): Promise<void> {
    const res = await fetch(`${API_URL}?resource=users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Erro ao salvar usuário');
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_URL}?resource=users&id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao deletar usuário');
  }
};

export const resolveImageUrl = (url: string) => {
  if (!url || typeof url !== 'string' || !url.trim()) return 'https://picsum.photos/seed/infotronic/800/600';
  url = url.trim();

  // Caso especial: Ícones de referência (shorthand Lucide)
  // Se não for uma URL nem um caminho de arquivo, retornamos um ícone padrão ou tentamos mapear
  const isUrl = url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:') || url.includes('/') || url.includes('.');

  if (!isUrl) {
    // Se for apenas um nome de ícone (ex: 'Laptop', 'Camera'), retornamos um placeholder correspondente
    // ou mantemos para processamento no componente se necessário. 
    // Para simplificar e não quebrar o <img>, retornamos uma imagem de tecnologia genérica
    return `https://img.icons8.com/ios-filled/100/334155/${url.toLowerCase()}.png`;
  }

  // Se for uma URL absoluta, retorna como está
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'api.php';

  if (apiUrl.startsWith('http')) {
    const base = apiUrl.substring(0, apiUrl.lastIndexOf('/') + 1);
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return base + cleanUrl;
  }

  const path = window.location.pathname;
  const baseFolder = path.substring(0, path.lastIndexOf('/') + 1);
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

  return window.location.origin + baseFolder + cleanUrl;
};
