import React, { createContext, useContext, useState, useCallback } from 'react';
import type { WishlistItem, Product } from '../types';

interface WishlistContextType {
  items: WishlistItem[];
  totalItems: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addToWishlist = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.product.id === product.id)) return prev;
      return [...prev, { product, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(i => i.product.id === productId);
  }, [items]);

  const clearWishlist = useCallback(() => setItems([]), []);

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ items, totalItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
