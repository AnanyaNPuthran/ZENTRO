import React, { createContext, useContext, useState, useCallback } from 'react';

export type Page =
  | 'home'
  | 'checkout'
  | 'order-success'
  | 'my-orders'
  | 'my-account';

interface NavigationContextType {
  page: Page;
  orderId: string | null;
  navigateTo: (p: Page, orderId?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [orderId, setOrderId] = useState<string | null>(null);

  const navigateTo = useCallback((p: Page, id?: string) => {
    setPage(p);

    if (id !== undefined) {
      setOrderId(id);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider value={{ page, orderId, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);

  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }

  return ctx;
}