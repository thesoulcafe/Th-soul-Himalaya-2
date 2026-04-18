import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  type: string;
  quantity: number;
  image?: string;
  details?: any;
  dateRange?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  lastAddedTime: number;
  pendingCartItem: Omit<CartItem, 'quantity'> | null;
  setPendingCartItem: (item: Omit<CartItem, 'quantity'> | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('soul-himalaya-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastAddedTime, setLastAddedTime] = useState(0);
  const [pendingCartItem, setPendingCartItem] = useState<Omit<CartItem, 'quantity'> | null>(null);

  // Auto-add pending item after login
  useEffect(() => {
    if (user && pendingCartItem) {
      addToCart(pendingCartItem);
      setPendingCartItem(null);
    }
  }, [user, pendingCartItem]);

  useEffect(() => {
    localStorage.setItem('soul-himalaya-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setLastAddedTime(Date.now());
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const totalPrice = cart.reduce((acc, item) => {
    const priceNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
    return acc + (priceNum * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice,
      lastAddedTime,
      pendingCartItem,
      setPendingCartItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
