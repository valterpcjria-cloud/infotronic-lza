
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  specs: { [key: string]: string };
  refCode?: string; // Dedicated product reference code
  stockQuantity?: number; // New field for stock management
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppState {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  isAdmin: boolean;
  settings: Settings;
}

export interface Settings {
  whatsapp_main: string;
  whatsapp_cart: string;
  address: string;
}