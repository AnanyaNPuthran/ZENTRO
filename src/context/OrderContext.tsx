import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';

import type { CartItem } from '../types';
import { useAuth } from './AuthContext';

export type DeliveryStatus =
  | 'Processing'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered';

export interface PlacedOrder {
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];

  address: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  payment: string;
  paymentMethod?: string;
  paymentStatus?: string;

  totalPrice: number;
  shipping: number;
  gst: number;
  grandTotal: number;

  placedAt: string;
  status: DeliveryStatus;
}

interface OrderContextType {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  updateOrderStatus: (
    orderId: string,
    status: DeliveryStatus
  ) => void;
  refreshOrders: () => Promise<void>;
  totalOrders: number;
}

const OrderContext = createContext<OrderContextType | null>(null);

const STORAGE_KEY = 'zentro_customer_orders';
const API_URL = 'http://localhost:3001/api/orders';

export function OrderProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const userEmail = user?.email?.trim().toLowerCase() || '';

  // Load saved orders from browser storage
  const [orders, setOrders] = useState<PlacedOrder[]>(() => {
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEY);
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch {
      return [];
    }
  });

  // Save orders in browser storage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(orders)
    );
  }, [orders]);

  // Fetch orders from backend database for the logged-in customer only
  const refreshOrders = useCallback(async () => {
    if (!userEmail) {
      setOrders([]);
      return;
    }

    try {
      const url = `${API_URL}?email=${encodeURIComponent(userEmail)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Unable to fetch orders');
      }

      const backendOrders: PlacedOrder[] = await response.json();

      setOrders(previousOrders => {
        // Only keep orders that belong to this customer
        const relevantPrevious = previousOrders.filter(o => 
          !o.customerEmail || o.customerEmail.toLowerCase() === userEmail
        );

        const backendIds = new Set(
          backendOrders.map(order => order.orderId)
        );

        const localOnlyOrders = relevantPrevious.filter(
          order => !backendIds.has(order.orderId)
        );

        return [
          ...backendOrders,
          ...localOnlyOrders
        ];
      });

    } catch (error) {
      console.error('Order loading error:', error);
    }
  }, [userEmail]);

  // Load backend orders when the user changes or logs in
  useEffect(() => {
    refreshOrders();

    // Check for admin delivery updates every 10 seconds
    const interval = window.setInterval(() => {
      refreshOrders();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [refreshOrders]);

  // Add a new order
  const addOrder = useCallback((order: PlacedOrder) => {
    setOrders(previousOrders => {
      const exists = previousOrders.some(
        item => item.orderId === order.orderId
      );

      if (exists) {
        return previousOrders.map(item =>
          item.orderId === order.orderId ? order : item
        );
      }

      return [order, ...previousOrders];
    });
  }, []);

  // Update delivery status locally
  const updateOrderStatus = useCallback((
    orderId: string,
    status: DeliveryStatus
  ) => {
    setOrders(previousOrders =>
      previousOrders.map(order =>
        order.orderId === orderId
          ? { ...order, status }
          : order
      )
    );
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        refreshOrders,
        totalOrders: orders.length
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);

  if (!ctx) {
    throw new Error(
      'useOrders must be used within OrderProvider'
    );
  }

  return ctx;
}