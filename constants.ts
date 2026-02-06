
import { Product, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Informática', icon: 'Laptop' },
  { id: '2', name: 'Segurança Eletrônica', icon: 'Camera' },
  { id: '3', name: 'Redes e Wi-Fi', icon: 'Wifi' },
  { id: '4', name: 'Acessórios', icon: 'Mouse' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Câmera IP Speed Dome 4K',
    refCode: 'CCT-4K-SD',
    description: 'Alta tecnologia em monitoramento 360º com visão noturna colorida e detecção de movimento por IA.',
    price: 850.00,
    categoryId: '2',
    images: ['https://picsum.photos/seed/cctv/800/600', 'https://picsum.photos/seed/security/800/600'],
    specs: { 'Resolução': '4K UHD', 'Conexão': 'Wi-Fi / Ethernet', 'Alcance': '50 metros' }
  },
  {
    id: 'p2',
    name: 'Notebook Workstation Pro 2024',
    refCode: 'NBK-WS-24',
    description: 'O parceiro ideal para produtividade pesada. Processador de última geração e tela 144Hz.',
    price: 4500.00,
    categoryId: '1',
    images: ['https://picsum.photos/seed/laptop/800/600', 'https://picsum.photos/seed/comp/800/600'],
    specs: { 'RAM': '16GB DDR5', 'SSD': '1TB NVMe', 'GPU': 'RTX 3050' }
  },
  {
    id: 'p3',
    name: 'Kit Alarme Residencial Inteligente',
    refCode: 'ALM-KIT-SMT',
    description: 'Sistema completo com sensores de porta, janela e central conectada ao smartphone.',
    price: 1200.00,
    categoryId: '2',
    images: ['https://picsum.photos/seed/alarm/800/600'],
    specs: { 'Protocolo': 'Zigbee', 'Bateria': 'Até 2 anos', 'App': 'Smart Life' }
  }
];

export const WHATSAPP_NUMBER = '556136226419'; // InfoTronic Official