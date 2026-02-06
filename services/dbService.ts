
import { Product, Category } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'api.php';
const API_KEY = import.meta.env.VITE_API_KEY || 'infotronic_secure_key_2024_xyz';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
});

export const dbService = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_URL}?resource=categories`, {
        headers: { 'X-API-Key': API_KEY }
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
        headers: { 'X-API-Key': API_KEY }
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
      headers: { 'X-API-Key': API_KEY }
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
        headers: { 'X-API-Key': API_KEY }
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
  }
};

export const resolveImageUrl = (url: string) => {
  if (!url || typeof url !== 'string' || !url.trim()) return 'https://picsum.photos/seed/infotronic/800/600';
  url = url.trim();

  // Se for uma URL absoluta (http, https, blob, data), retorna como está
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  // Se a URL contém 'api.php?resource=serve_image', assumimos que é uma rota interna do backend
  // Precisamos garantir que ela aponte para o local correto do api.php
  const apiUrl = import.meta.env.VITE_API_URL || 'api.php';

  // Caso 1: VITE_API_URL é absoluto (ex: http://meusite.com/api.php)
  if (apiUrl.startsWith('http')) {
    const base = apiUrl.substring(0, apiUrl.lastIndexOf('/') + 1);
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return base + cleanUrl;
  }

  // Caso 2: API é relativa ao frontend (ex: api.php na mesma pasta)
  // Usamos o window.location para construir o caminho absoluto
  const path = window.location.pathname;
  const baseFolder = path.substring(0, path.lastIndexOf('/') + 1);
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;

  // Se a url já começa com 'api.php', não precisamos concatenar nada além da base
  return window.location.origin + baseFolder + cleanUrl;
};
