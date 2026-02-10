
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


export interface User {
  id: string;
  username: string;
  name: string;
  role: 'superadmin' | 'admin' | 'staff';
  is_active?: boolean | number;
  created_at?: string;
  password?: string; // Only used when creating/updating
}

export interface AppState {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  isAdmin: boolean;
  userRole?: 'superadmin' | 'admin' | 'staff';
  settings: Settings;
}

export interface Settings {
  whatsapp_main: string;
  whatsapp_cart: string;
  address: string;
  instagram?: string;
  facebook?: string;
}