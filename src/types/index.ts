export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: Category;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: 'NEW' | 'SALE' | 'HOT' | 'TRENDING';
  inStock: boolean;
}

export type Category = 'All' | 'Fashion' | 'Electronics' | 'Beauty' | 'Home' | 'Footwear';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Supabase integration stubs
export interface SupabaseAuthPayload {
  email: string;
  password: string;
}
