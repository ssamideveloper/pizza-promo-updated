
export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'meat' | 'veggie' | 'specialty' | 'classic';
  isPopular?: boolean;
  recipe?: Record<string, number>; // ingredientId -> quantity required
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number; // Low stock warning level
  image?: string;
  description?: string;
}

export interface CartItem extends Pizza {
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  discountApplied: number;
  deliveryFee: number;
  deliveryZone: string;
  status: 'Pending' | 'In Progress' | 'Delivered' | 'Cancelled';
  timestamp: string; // ISO string
  paymentMethod: 'CASH';
}

export interface Promotion {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  active: boolean;
  description: string;
}

export interface LoyaltyAccount {
  phone: string;
  points: number;
}

export interface FlashSale {
  title: string;
  endTime: string; // ISO
  discountCode: string;
  active: boolean;
}
