
import { Order, Pizza, Promotion, LoyaltyAccount, FlashSale, CartItem, Ingredient, DeliveryZone, Customer } from '../types';
import { INITIAL_MENU, INITIAL_PROMOS, INITIAL_FLASH_SALE, INITIAL_INVENTORY, INITIAL_ZONES } from '../constants';

const KEYS = {
  ORDERS: 'primo_orders',
  MENU: 'primo_menu',
  PROMOS: 'primo_promos',
  LOYALTY: 'primo_loyalty',
  FAVORITES: 'primo_favorites', // Map of phone -> pizza IDs
  FLASH_SALE: 'primo_flash_sale',
  INVENTORY: 'primo_inventory',
  ZONES: 'primo_zones'
};

// Initialize Data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.MENU)) {
    localStorage.setItem(KEYS.MENU, JSON.stringify(INITIAL_MENU));
  }
  if (!localStorage.getItem(KEYS.PROMOS)) {
    localStorage.setItem(KEYS.PROMOS, JSON.stringify(INITIAL_PROMOS));
  }
  if (!localStorage.getItem(KEYS.FLASH_SALE)) {
    localStorage.setItem(KEYS.FLASH_SALE, JSON.stringify(INITIAL_FLASH_SALE));
  }
  if (!localStorage.getItem(KEYS.LOYALTY)) {
    localStorage.setItem(KEYS.LOYALTY, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.INVENTORY)) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
  }
  if (!localStorage.getItem(KEYS.ZONES)) {
    localStorage.setItem(KEYS.ZONES, JSON.stringify(INITIAL_ZONES));
  }
};

// Orders
export const getOrders = (): Order[] => {
  const data = localStorage.getItem(KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

export const saveOrder = (order: Order) => {
  const orders = getOrders();
  orders.unshift(order); // Add to top
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

  // Update Loyalty Points (1 point per dollar, rounded down)
  if (order.customer.phone) {
    addLoyaltyPoints(order.customer.phone, Math.floor(order.total));
  }

  // Deduct Inventory
  deductInventory(order.items);
};

export const updateOrderStatus = (orderId: string, status: Order['status']) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].status = status;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }
};

export const updateOrderCustomer = (orderId: string, customer: Customer) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    orders[index].customer = customer;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }
};

// Menu
export const getMenu = (): Pizza[] => {
  const data = localStorage.getItem(KEYS.MENU);
  return data ? JSON.parse(data) : INITIAL_MENU;
};

// Promos
export const getPromos = (): Promotion[] => {
  const data = localStorage.getItem(KEYS.PROMOS);
  return data ? JSON.parse(data) : [];
};

export const savePromo = (promo: Promotion) => {
  const list = getPromos();
  list.push(promo);
  localStorage.setItem(KEYS.PROMOS, JSON.stringify(list));
};

export const deletePromo = (id: string) => {
  const list = getPromos().filter(p => p.id !== id);
  localStorage.setItem(KEYS.PROMOS, JSON.stringify(list));
};

// Loyalty
export const getLoyaltyAccounts = (): LoyaltyAccount[] => {
  const data = localStorage.getItem(KEYS.LOYALTY);
  return data ? JSON.parse(data) : [];
};

export const getLoyaltyByPhone = (phone: string): LoyaltyAccount | undefined => {
  return getLoyaltyAccounts().find(a => a.phone === phone);
};

export const addLoyaltyPoints = (phone: string, points: number) => {
  const accounts = getLoyaltyAccounts();
  const index = accounts.findIndex(a => a.phone === phone);
  if (index !== -1) {
    accounts[index].points += points;
  } else {
    accounts.push({ phone, points });
  }
  localStorage.setItem(KEYS.LOYALTY, JSON.stringify(accounts));
};

export const redeemLoyaltyPoints = (phone: string, pointsCost: number): boolean => {
  const accounts = getLoyaltyAccounts();
  const index = accounts.findIndex(a => a.phone === phone);
  if (index !== -1 && accounts[index].points >= pointsCost) {
    accounts[index].points -= pointsCost;
    localStorage.setItem(KEYS.LOYALTY, JSON.stringify(accounts));
    return true;
  }
  return false;
};

// Favorites
export const getFavorites = (phone: string): string[] => {
  const allFavs = JSON.parse(localStorage.getItem(KEYS.FAVORITES) || '{}');
  return allFavs[phone] || [];
};

export const toggleFavorite = (phone: string, pizzaId: string) => {
  const allFavs = JSON.parse(localStorage.getItem(KEYS.FAVORITES) || '{}');
  const userFavs: string[] = allFavs[phone] || [];
  
  if (userFavs.includes(pizzaId)) {
    allFavs[phone] = userFavs.filter(id => id !== pizzaId);
  } else {
    allFavs[phone] = [...userFavs, pizzaId];
  }
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(allFavs));
  return allFavs[phone];
};

// Flash Sale
export const getFlashSale = (): FlashSale => {
  const data = localStorage.getItem(KEYS.FLASH_SALE);
  return data ? JSON.parse(data) : INITIAL_FLASH_SALE;
};

export const saveFlashSale = (sale: FlashSale) => {
  localStorage.setItem(KEYS.FLASH_SALE, JSON.stringify(sale));
};

// Inventory
export const getInventory = (): Ingredient[] => {
  const data = localStorage.getItem(KEYS.INVENTORY);
  return data ? JSON.parse(data) : INITIAL_INVENTORY;
};

export const saveInventory = (inventory: Ingredient[]) => {
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
};

export const deductInventory = (items: CartItem[]) => {
  const inventory = getInventory();
  
  items.forEach(item => {
    if (item.recipe) {
      Object.entries(item.recipe).forEach(([ingId, qtyRequiredPerPizza]) => {
        const ingIndex = inventory.findIndex(i => i.id === ingId);
        if (ingIndex !== -1) {
          const totalRequired = qtyRequiredPerPizza * item.quantity;
          inventory[ingIndex].quantity = Math.max(0, inventory[ingIndex].quantity - totalRequired);
        }
      });
    }
  });
  
  saveInventory(inventory);
};

// Delivery Zones
export const getDeliveryZones = (): DeliveryZone[] => {
  const data = localStorage.getItem(KEYS.ZONES);
  return data ? JSON.parse(data) : INITIAL_ZONES;
};

export const saveDeliveryZone = (zone: DeliveryZone) => {
  const zones = getDeliveryZones();
  const index = zones.findIndex(z => z.id === zone.id);
  if (index !== -1) {
    zones[index] = zone;
  } else {
    zones.push(zone);
  }
  localStorage.setItem(KEYS.ZONES, JSON.stringify(zones));
};

export const deleteDeliveryZone = (id: string) => {
  const zones = getDeliveryZones().filter(z => z.id !== id);
  localStorage.setItem(KEYS.ZONES, JSON.stringify(zones));
};
