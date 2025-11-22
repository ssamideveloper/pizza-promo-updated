
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Pizza, Promotion, Ingredient, DeliveryZone } from '../types';
import { getPromos, initializeStorage, getLoyaltyByPhone, getFavorites, toggleFavorite, getInventory, getDeliveryZones } from '../services/storage';

interface StoreContextType {
  // Cart State
  cart: CartItem[];
  addToCart: (pizza: Pizza) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  discount: number;
  applyPromo: (code: string) => boolean;
  activePromo: Promotion | null;
  
  // User/Tracking State
  currentUserPhone: string | null;
  loginUser: (phone: string) => void;
  logoutUser: () => void;
  userPoints: number;
  favorites: string[];
  toggleFav: (pizzaId: string) => void;
  
  // Admin State
  isAdmin: boolean;
  setAdmin: (status: boolean) => void;

  // Inventory
  inventory: Ingredient[];
  refreshInventory: () => void;
  canMakePizza: (pizza: Pizza) => boolean;

  // Delivery
  deliveryZones: DeliveryZone[];
  refreshZones: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // Init
  useEffect(() => {
    initializeStorage();
    refreshInventory();
    refreshZones();
  }, []);

  // Delivery Zones
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  
  const refreshZones = () => {
    setDeliveryZones(getDeliveryZones());
  };

  // Inventory
  const [inventory, setInventory] = useState<Ingredient[]>([]);

  const refreshInventory = () => {
    setInventory(getInventory());
  };

  const canMakePizza = (pizza: Pizza): boolean => {
    if (!pizza.recipe) return true;
    return Object.entries(pizza.recipe).every(([ingId, requiredQty]) => {
        const ingredient = inventory.find(i => i.id === ingId);
        return ingredient && ingredient.quantity >= requiredQty;
    });
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activePromo, setActivePromo] = useState<Promotion | null>(null);

  const addToCart = (pizza: Pizza) => {
    if (!canMakePizza(pizza)) {
        alert("Sorry, this item is currently out of stock.");
        return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === pizza.id);
      if (existing) {
        // Check if we have stock for one more
        // Note: This is a simple check, ideally we check total required for all items in cart
        return prev.map(item => item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...pizza, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setActivePromo(null);
    refreshInventory(); // Refresh in case order was placed
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const discount = activePromo 
    ? (activePromo.type === 'percent' 
        ? (cartTotal * (activePromo.value / 100)) 
        : activePromo.value)
    : 0;

  const applyPromo = (code: string): boolean => {
    const promos = getPromos();
    const found = promos.find(p => p.code === code && p.active);
    if (found) {
      setActivePromo(found);
      return true;
    }
    return false;
  };

  // User
  const [currentUserPhone, setCurrentUserPhone] = useState<string | null>(localStorage.getItem('primo_user_phone'));
  const [userPoints, setUserPoints] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); // Session based only

  const refreshUserData = (phone: string) => {
    const acc = getLoyaltyByPhone(phone);
    setUserPoints(acc ? acc.points : 0);
    setFavorites(getFavorites(phone));
  };

  const loginUser = (phone: string) => {
    setCurrentUserPhone(phone);
    localStorage.setItem('primo_user_phone', phone);
    refreshUserData(phone);
  };

  const logoutUser = () => {
    setCurrentUserPhone(null);
    localStorage.removeItem('primo_user_phone');
    setUserPoints(0);
    setFavorites([]);
  };

  const toggleFav = (pizzaId: string) => {
    if (!currentUserPhone) return; // Simple guard
    const newFavs = toggleFavorite(currentUserPhone, pizzaId);
    setFavorites(newFavs);
  };

  // On mount check if user logged in
  useEffect(() => {
    if (currentUserPhone) {
      refreshUserData(currentUserPhone);
    }
  }, [currentUserPhone]);

  const setAdmin = (val: boolean) => setIsAdmin(val);

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
      discount, applyPromo, activePromo,
      currentUserPhone, loginUser, logoutUser, userPoints, favorites, toggleFav,
      isAdmin, setAdmin,
      inventory, refreshInventory, canMakePizza,
      deliveryZones, refreshZones
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
