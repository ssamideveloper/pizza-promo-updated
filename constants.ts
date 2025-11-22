
import { Pizza, Promotion, FlashSale, Ingredient, DeliveryZone } from './types';

export const ADMIN_PASSWORD = "admin"; // Simplified for demo

export const INITIAL_INVENTORY: Ingredient[] = [
  { 
    id: 'dough', 
    name: 'Pizza Dough', 
    quantity: 50, 
    unit: 'balls', 
    threshold: 10,
    image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?q=80&w=200&auto=format&fit=crop',
    description: 'Hand-kneaded daily using imported 00 flour.'
  },
  { 
    id: 'cheese', 
    name: 'Mozzarella Cheese', 
    quantity: 100, 
    unit: 'cups', 
    threshold: 20,
    image: 'https://images.unsplash.com/photo-1586955118280-37a2f128d028?q=80&w=200&auto=format&fit=crop',
    description: 'Freshly shredded, high-moisture mozzarella.'
  },
  { 
    id: 'sauce', 
    name: 'Tomato Sauce', 
    quantity: 80, 
    unit: 'ladles', 
    threshold: 15,
    image: 'https://images.unsplash.com/photo-1604544222019-c487a23c8505?q=80&w=200&auto=format&fit=crop',
    description: 'Slow-simmered San Marzano tomatoes with herbs.'
  },
  { 
    id: 'pepp', 
    name: 'Pepperoni', 
    quantity: 40, 
    unit: 'servings', 
    threshold: 10,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=200&auto=format&fit=crop',
    description: 'Crispy, spicy, cup-and-char pepperoni.'
  },
  { 
    id: 'ham', 
    name: 'Ham', 
    quantity: 30, 
    unit: 'servings', 
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1524182576066-1bb96d3609d5?q=80&w=200&auto=format&fit=crop',
    description: 'Premium sliced roast ham.'
  },
  { 
    id: 'bacon', 
    name: 'Bacon', 
    quantity: 30, 
    unit: 'servings', 
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?q=80&w=200&auto=format&fit=crop',
    description: 'Applewood smoked bacon strips.'
  },
  { 
    id: 'veg', 
    name: 'Mixed Veggies', 
    quantity: 40, 
    unit: 'cups', 
    threshold: 10,
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fb714?q=80&w=200&auto=format&fit=crop',
    description: 'Bell peppers, onions, and olives.'
  },
  { 
    id: 'chicken', 
    name: 'Grilled Chicken', 
    quantity: 20, 
    unit: 'servings', 
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=200&auto=format&fit=crop',
    description: 'Marinated and grilled chicken breast.'
  },
  { 
    id: 'pineapple', 
    name: 'Pineapple', 
    quantity: 20, 
    unit: 'cups', 
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1589820296156-2454abb8a800?q=80&w=200&auto=format&fit=crop',
    description: 'Fresh golden pineapple chunks.'
  },
  { 
    id: 'basil', 
    name: 'Fresh Basil', 
    quantity: 20, 
    unit: 'bunches', 
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1618322512545-95683952c451?q=80&w=200&auto=format&fit=crop',
    description: 'Sweet aromatic basil leaves.'
  },
  { 
    id: 'truffle', 
    name: 'Truffle Oil', 
    quantity: 10, 
    unit: 'bottles', 
    threshold: 2,
    image: 'https://images.unsplash.com/photo-1608500218849-625347837d97?q=80&w=200&auto=format&fit=crop',
    description: 'Imported white truffle infused oil.'
  },
];

export const INITIAL_ZONES: DeliveryZone[] = [
  { id: 'z1', name: 'Downtown (Radius < 5km)', fee: 2.99, estimatedTime: '30-45 min' },
  { id: 'z2', name: 'Suburbs (Radius 5-10km)', fee: 5.99, estimatedTime: '45-60 min' },
  { id: 'z3', name: 'Extended Zone (Radius 10-15km)', fee: 9.99, estimatedTime: '60-90 min' }
];

export const INITIAL_MENU: Pizza[] = [
  // Classics
  {
    id: '1',
    name: 'Classic Pepperoni',
    description: 'The all-time favorite with crispy pepperoni cups and extra mozzarella.',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
    category: 'classic',
    isPopular: true,
    recipe: { dough: 1, sauce: 1, cheese: 1.5, pepp: 2 }
  },
  {
    id: '2',
    name: 'Margherita di Napoli',
    description: 'San Marzano tomato sauce, fresh mozzarella di bufala, basil, and olive oil.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, sauce: 1, cheese: 1.5, basil: 1 }
  },
  {
    id: '3',
    name: 'The Godfather',
    description: 'A meat lover\'s dream with pepperoni, Italian sausage, spicy salami, and bacon.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1620374645498-af6af6f333bb?q=80&w=800&auto=format&fit=crop',
    category: 'meat',
    isPopular: true,
    recipe: { dough: 1, sauce: 1, cheese: 1, pepp: 1, ham: 1, bacon: 1 }
  },
  {
    id: '4',
    name: 'Garden State',
    description: 'Loaded with bell peppers, red onions, mushrooms, black olives, and cherry tomatoes.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1571407970349-bc16ff8543de?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, sauce: 1, cheese: 1, veg: 2 }
  },
  {
    id: '5',
    name: 'Texas BBQ Chicken',
    description: 'Smoky BBQ sauce base, grilled chicken breast, red onions, and cilantro.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
    category: 'specialty',
    recipe: { dough: 1, sauce: 1, cheese: 1, chicken: 2 }
  },
  {
    id: '6',
    name: 'Aloha Paradise',
    description: 'Roasted ham, fresh golden pineapple, and extra cheese.',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=800&auto=format&fit=crop',
    category: 'classic',
    recipe: { dough: 1, sauce: 1, cheese: 1, ham: 1, pineapple: 1 }
  },
  // New Additions
  {
    id: '7',
    name: 'Truffle Mushroom',
    description: 'White base, roasted wild mushrooms, truffle oil, thyme, and parmesan.',
    price: 21.99,
    image: 'https://images.unsplash.com/photo-1514483127413-f72f273478c8?q=80&w=800&auto=format&fit=crop', 
    category: 'veggie',
    isPopular: true,
    recipe: { dough: 1, cheese: 2, truffle: 1 }
  },
  {
    id: '8',
    name: 'Spicy Diablo',
    description: 'Spicy tomato sauce, chorizo, jalapeños, red chili flakes, and hot honey drizzle.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop',
    category: 'meat',
    recipe: { dough: 1, sauce: 1, cheese: 1, pepp: 1 }
  },
  {
    id: '9',
    name: 'Four Cheese Harmony',
    description: 'Mozzarella, gorgonzola, parmesan, and goat cheese on a garlic oil base.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89e7344?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, cheese: 3 }
  },
  {
    id: '10',
    name: 'Buffalo Soldier',
    description: 'Spicy buffalo sauce, crispy chicken, celery, and blue cheese drizzle.',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?q=80&w=800&auto=format&fit=crop',
    category: 'specialty',
    recipe: { dough: 1, cheese: 1, chicken: 2 }
  },
  {
    id: '11',
    name: 'Pesto Genovese',
    description: 'Basil pesto base, sun-dried tomatoes, pine nuts, and burrata cheese.',
    price: 19.50,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, cheese: 1, basil: 2 }
  },
  {
    id: '12',
    name: 'Meatball Madness',
    description: 'Homemade beef meatballs, ricotta dollops, and marinara sauce.',
    price: 17.50,
    image: 'https://images.unsplash.com/photo-1617343251257-b5b7095e5955?q=80&w=800&auto=format&fit=crop',
    category: 'meat',
    recipe: { dough: 1, sauce: 1, cheese: 1 }
  },
  {
    id: '13',
    name: 'Greek Odyssey',
    description: 'Feta cheese, kalamata olives, spinach, red onion, and oregano.',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, sauce: 1, cheese: 1, veg: 1 }
  },
  {
    id: '14',
    name: 'Carbonara',
    description: 'Creamy white sauce, pancetta, egg yolk swirl, and cracked black pepper.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?q=80&w=800&auto=format&fit=crop',
    category: 'specialty',
    recipe: { dough: 1, cheese: 1, bacon: 2 }
  },
  {
    id: '15',
    name: 'Prosciutto Arugula',
    description: 'Finished post-bake with fresh arugula, prosciutto di parma, and balsamic glaze.',
    price: 20.99,
    image: 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?q=80&w=800&auto=format&fit=crop',
    category: 'meat',
    isPopular: true,
    recipe: { dough: 1, sauce: 1, cheese: 1, ham: 1 }
  },
  {
    id: '16',
    name: 'Vegan Delight',
    description: 'Vegan cheese, artichokes, spinach, garlic, and roasted red peppers.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, sauce: 1, veg: 2 }
  },
  {
    id: '17',
    name: 'Capricciosa',
    description: 'Artichoke hearts, mushrooms, ham, olives, and tomato sauce.',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?q=80&w=800&auto=format&fit=crop',
    category: 'classic',
    recipe: { dough: 1, sauce: 1, cheese: 1, ham: 1, veg: 1 }
  },
  {
    id: '18',
    name: 'Seafood Supreme',
    description: 'Shrimp, calamari, garlic, parsley, and lemon zest.',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop', 
    category: 'specialty',
    recipe: { dough: 1, cheese: 1 }
  },
  // Fresh Additions
  {
    id: '19',
    name: 'Double Bacon Cheeseburger',
    description: 'Savory ground beef, crispy bacon, cheddar cheese blend, and special burger sauce swirl.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1542282811-943ef1a977c3?q=80&w=800&auto=format&fit=crop',
    category: 'meat',
    isPopular: true,
    recipe: { dough: 1, sauce: 1, cheese: 1, bacon: 2 }
  },
  {
    id: '20',
    name: 'Mediterranean Bliss',
    description: 'Hummus base, kalamata olives, feta, sliced cucumber, and roasted red peppers.',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=800&auto=format&fit=crop',
    category: 'veggie',
    recipe: { dough: 1, cheese: 1, veg: 2 }
  },
  {
    id: '21',
    name: 'Sweet Heat BBQ',
    description: 'Spicy BBQ sauce, grilled chicken, fresh pineapple chunks, and jalapeño slices.',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    category: 'specialty',
    isPopular: true,
    recipe: { dough: 1, sauce: 1, cheese: 1, chicken: 1, pineapple: 1 }
  },
  {
    id: '22',
    name: 'Tuscan Six Cheese',
    description: 'A rich blend of Mozzarella, Provolone, Parmesan, Romano, Asiago, and Fontina.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    category: 'classic',
    recipe: { dough: 1, cheese: 3 }
  },
  {
    id: '23',
    name: 'Philly Cheese Steak',
    description: 'Thinly sliced steak, caramelized onions, bell peppers, and creamy provolone cheese.',
    price: 20.99,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=800&auto=format&fit=crop',
    category: 'meat',
    recipe: { dough: 1, sauce: 1, cheese: 1, veg: 1 }
  }
];

export const INITIAL_PROMOS: Promotion[] = [
  { id: 'p1', code: 'WELCOME10', type: 'percent', value: 10, active: true, description: '10% off your first order' },
  { id: 'p2', code: 'LUNCH5', type: 'fixed', value: 5, active: true, description: '$5 off lunch special' }
];

export const INITIAL_FLASH_SALE: FlashSale = {
  title: "2-Hour Pizza Party!",
  endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
  discountCode: "PARTY20",
  active: true
};
