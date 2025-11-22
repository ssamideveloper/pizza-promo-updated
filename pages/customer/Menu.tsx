
import React, { useState, useEffect, useRef } from 'react';
import { getMenu } from '../../services/storage';
import { useStore } from '../../context/StoreContext';
import { Pizza, Ingredient } from '../../types';
import { Plus, Heart, Search, Flame, Leaf, Star, Filter, X, Eye, Info, ChevronDown, ArrowUpDown, Pizza as PizzaIcon, Beef, Dices, Sparkles } from 'lucide-react';

const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 text-gray-900 font-bold px-1 rounded mx-0.5">{part}</span> 
        : part
      )}
    </span>
  );
};

// 3D Card Component
const TiltCard = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // Limit rotation
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        }
    };

    return (
        <div 
            ref={cardRef}
            className={`transition-transform duration-200 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
        </div>
    );
};

const Menu = () => {
  const [items, setItems] = useState<Pizza[]>([]);
  const [search, setSearch] = useState('');
  const { addToCart, favorites, toggleFav, currentUserPhone, canMakePizza, inventory } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  
  // Roulette State
  const [rouletteActive, setRouletteActive] = useState(false);
  const [rouletteHighlight, setRouletteHighlight] = useState<string | null>(null);

  useEffect(() => {
    setItems(getMenu());
  }, [inventory]);

  // Helper to get ingredient object from ID
  const getIngredient = (id: string): Ingredient | undefined => {
      return inventory.find(i => i.id === id);
  };

  const getCategoryStyles = (cat: string, type: 'badge' | 'button' = 'badge', isActive: boolean = false) => {
    switch(cat) {
        case 'meat': 
            return type === 'button' && isActive 
                ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100';
        case 'veggie': 
             return type === 'button' && isActive 
                ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                : 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100';
        case 'specialty': 
             return type === 'button' && isActive 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                : 'bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100';
        case 'classic': 
             return type === 'button' && isActive 
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200' 
                : 'bg-yellow-50 text-yellow-800 border border-yellow-100 hover:bg-yellow-100';
        case 'favorites':
             return type === 'button' && isActive
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200'
                : 'bg-pink-50 text-pink-700 border border-pink-100 hover:bg-pink-100';
        default: 
             return type === 'button' && isActive 
                ? 'bg-gray-900 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'meat': return <Beef size={14} />;
        case 'veggie': return <Leaf size={14} />;
        case 'specialty': return <Flame size={14} />;
        case 'classic': return <Star size={14} />;
        default: return <PizzaIcon size={14} />;
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: <Filter size={14} /> },
    { id: 'classic', label: 'Classics', icon: <Star size={14} /> },
    { id: 'meat', label: 'Meat', icon: <Beef size={14} /> },
    { id: 'veggie', label: 'Veggie', icon: <Leaf size={14} /> },
    { id: 'specialty', label: 'Specialty', icon: <Flame size={14} /> },
  ];

  if (currentUserPhone) {
      categories.push({ id: 'favorites', label: 'Favorites', icon: <Heart size={14} /> });
  }

  let filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory || (activeCategory === 'favorites' && favorites.includes(item.id));
    const term = search.toLowerCase();
    if (!term) return matchesCategory;
    const matchesName = item.name.toLowerCase().includes(term);
    const matchesDesc = item.description.toLowerCase().includes(term);
    const matchesIngredients = item.recipe 
        ? Object.keys(item.recipe).some(id => {
            const ing = getIngredient(id);
            return ing ? ing.name.toLowerCase().includes(term) : false;
        })
        : false;
    return matchesCategory && (matchesName || matchesDesc || matchesIngredients);
  });

  // Sorting Logic
  if (sortBy === 'price-asc') filteredItems.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filteredItems.sort((a, b) => b.price - a.price);
  if (sortBy === 'name-asc') filteredItems.sort((a, b) => a.name.localeCompare(b.name));

  const handleFavToggle = (e: React.MouseEvent, pizza: Pizza) => {
      e.stopPropagation();
      const isAdding = !favorites.includes(pizza.id);
      toggleFav(pizza.id);
      setToast({
          message: isAdding ? `${pizza.name} added to favorites` : `${pizza.name} removed from favorites`,
          type: isAdding ? 'success' : 'info'
      });
      setTimeout(() => setToast(null), 2500);
  };

  // Roulette Logic
  const handleRoulette = () => {
      if (filteredItems.length < 2) return;
      setRouletteActive(true);
      let spins = 0;
      const maxSpins = 25;
      const interval = setInterval(() => {
          const randomIdx = Math.floor(Math.random() * filteredItems.length);
          setRouletteHighlight(filteredItems[randomIdx].id);
          spins++;
          if (spins > maxSpins) {
              clearInterval(interval);
              setTimeout(() => {
                  setRouletteActive(false);
                  setSelectedPizza(filteredItems[randomIdx]); // Open modal for winner
                  setRouletteHighlight(null);
                  // Scroll to item
                  const el = document.getElementById(`pizza-${filteredItems[randomIdx].id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 500);
          }
      }, 100);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative font-sans">
        {/* Toast Notification */}
        {toast && (
            <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right duration-300 pointer-events-none">
                <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border backdrop-blur-md ${toast.type === 'success' ? 'bg-white/90 border-green-200 text-green-800' : 'bg-white/90 border-gray-200 text-gray-800'}`}>
                    {toast.type === 'success' ? <Heart className="fill-red-500 text-red-500" size={16} /> : <Info size={16} />}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            </div>
        )}

        {/* Slim Header */}
        <div className="bg-white border-b border-gray-100 py-8 md:py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2 relative z-10">THE MENU</h1>
            <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base relative z-10">Hand-tossed, stone-fired, and made with love.</p>
        </div>

        {/* Sticky Toolbar */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar flex-nowrap md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${getCategoryStyles(cat.id, 'button', activeCategory === cat.id)}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-grow md:flex-grow-0 group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-full focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-gray-300 text-sm transition outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"><X size={12} /></button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select 
                            className="appearance-none bg-gray-100 pl-4 pr-8 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition outline-none"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="default">Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                        </select>
                        <ArrowUpDown size={12} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>

        {/* Menu Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-[600px]">
            <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                 <span>{filteredItems.length} Items Found</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredItems.map(pizza => {
                    const inStock = canMakePizza(pizza);
                    const isSpicy = pizza.description.toLowerCase().includes('spicy') || pizza.name.toLowerCase().includes('diablo') || pizza.name.toLowerCase().includes('heat');
                    const isFav = favorites.includes(pizza.id);
                    const isHighlighted = rouletteHighlight === pizza.id;
                    
                    return (
                        <TiltCard 
                            key={pizza.id} 
                            onClick={() => setSelectedPizza(pizza)}
                            className={`group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 relative cursor-pointer ${isHighlighted ? 'ring-4 ring-secondary scale-105 shadow-2xl z-10' : ''}`}
                        >
                            <div id={`pizza-${pizza.id}`} className="absolute -top-20" /> {/* Anchor for scrolling */}
                            
                            {/* Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img 
                                    src={pizza.image} 
                                    alt={pizza.name} 
                                    className={`w-full h-full object-cover transition duration-700 transform group-hover:scale-110 ${!inStock ? 'grayscale opacity-70' : ''}`} 
                                />
                                
                                {/* Top Gradient for Text Visibility */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                                    {pizza.isPopular && (
                                        <span className="bg-secondary/90 backdrop-blur-md text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                            <Star size={10} fill="currentColor" /> Popular
                                        </span>
                                    )}
                                    {isSpicy && (
                                        <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                            <Flame size={10} fill="currentColor" /> Spicy
                                        </span>
                                    )}
                                </div>

                                {/* Fav Button */}
                                {currentUserPhone && (
                                    <button 
                                        onClick={(e) => handleFavToggle(e, pizza)}
                                        className="absolute top-3 right-3 z-20 bg-white/30 hover:bg-white p-2 rounded-full backdrop-blur-md transition-all duration-300 group-hover:scale-100 md:scale-0 group-hover:opacity-100"
                                    >
                                        <Heart size={18} className={isFav ? "fill-red-500 text-red-500" : "text-white hover:text-red-500"} />
                                    </button>
                                )}

                                {/* Sold Out Overlay */}
                                {!inStock && (
                                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                        <span className="text-red-600 font-black text-xl uppercase border-2 border-red-600 px-4 py-2 rounded rotate-12">Sold Out</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-grow flex flex-col relative z-20 bg-white">
                                {/* Category Badge */}
                                <div className={`inline-flex items-center gap-1.5 mb-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest w-fit ${getCategoryStyles(pizza.category)}`}>
                                    {getCategoryIcon(pizza.category)}
                                    <span>{pizza.category}</span>
                                </div>

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition leading-tight">
                                        <HighlightText text={pizza.name} highlight={search} />
                                    </h3>
                                    <span className="font-black text-lg text-gray-900">${Math.floor(pizza.price)}<span className="text-xs align-top">.{(pizza.price % 1).toFixed(2).substring(2)}</span></span>
                                </div>

                                <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
                                     <HighlightText text={pizza.description} highlight={search} />
                                </p>

                                <div className="mt-auto flex items-center gap-3">
                                    <button 
                                        disabled={!inStock}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(pizza);
                                            setToast({ message: `Added ${pizza.name} to cart`, type: 'success' });
                                            setTimeout(() => setToast(null), 2000);
                                        }}
                                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
                                            inStock 
                                            ? 'bg-gray-900 text-white hover:bg-primary' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {inStock ? <><Plus size={16} /> Add to Order</> : 'Unavailable'}
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPizza(pizza);
                                        }}
                                        className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition"
                                        title="View Ingredients"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                        </TiltCard>
                    );
                })}
            </div>
        </div>

        {/* CHEF'S ROULETTE BUTTON */}
        <button 
            onClick={handleRoulette}
            disabled={rouletteActive}
            className={`fixed bottom-8 right-8 z-50 bg-secondary text-gray-900 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 group ${rouletteActive ? 'animate-spin' : 'animate-bounce'}`}
            title="Chef's Roulette: Pick a random pizza!"
        >
            <Dices size={32} />
            <span className="absolute right-full mr-4 bg-black text-white px-3 py-1 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Feeling Lucky?
            </span>
        </button>

        {/* DETAILS MODAL */}
        {selectedPizza && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPizza(null)}>
                <div 
                    className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row overflow-hidden" 
                    onClick={e => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setSelectedPizza(null)} 
                        className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition"
                    >
                        <X size={24} />
                    </button>
                    
                    {/* Left: Image */}
                    <div className="md:w-1/2 relative h-64 md:h-auto">
                        <img src={selectedPizza.image} alt={selectedPizza.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                             <div>
                                 <div className="flex gap-2 mb-2">
                                     {selectedPizza.isPopular && <span className="bg-secondary text-black text-xs font-bold px-2 py-1 rounded uppercase">Popular</span>}
                                     <span className={`text-xs font-bold px-2 py-1 rounded uppercase flex items-center gap-1 w-fit ${getCategoryStyles(selectedPizza.category, 'badge', true).replace('bg-gray-900', 'bg-white/20 backdrop-blur border-none')}`}>
                                         {getCategoryIcon(selectedPizza.category)} {selectedPizza.category}
                                     </span>
                                 </div>
                                 <h2 className="text-4xl font-black text-white leading-none mb-2">{selectedPizza.name}</h2>
                                 <p className="text-white/80 font-medium text-lg">${selectedPizza.price}</p>
                             </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="md:w-1/2 p-8 bg-white flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-gray-900 font-bold text-lg mb-2 flex items-center gap-2">
                                <Info size={18} className="text-primary" /> Description
                            </h3>
                            <p className="text-gray-600 leading-relaxed">{selectedPizza.description}</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                                <Leaf size={18} className="text-green-600" /> Fresh Ingredients
                            </h3>
                            {/* Visual Ingredients Grid */}
                            {selectedPizza.recipe ? (
                                <div className="grid grid-cols-4 gap-4">
                                    {Object.entries(selectedPizza.recipe).map(([ingId, qty]) => {
                                        const ing = getIngredient(ingId);
                                        if (!ing) return null;
                                        return (
                                            <div key={ingId} className="group relative flex flex-col items-center text-center">
                                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-2 group-hover:border-primary transition duration-300 relative bg-gray-50">
                                                    {ing.image ? (
                                                        <img src={ing.image} alt={ing.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Leaf size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 leading-tight capitalize">{ing.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">x{qty}</span>
                                                
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 w-32 bg-gray-900 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 text-center shadow-lg">
                                                    <p className="font-bold mb-1">{ing.name}</p>
                                                    {ing.description || "Fresh ingredient sourced daily."}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Recipe details not available.</p>
                            )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100">
                             <button 
                                onClick={() => {
                                    if(canMakePizza(selectedPizza)) {
                                        addToCart(selectedPizza);
                                        setSelectedPizza(null);
                                        setToast({ message: "Added to cart!", type: 'success' });
                                        setTimeout(() => setToast(null), 2000);
                                    }
                                }}
                                disabled={!canMakePizza(selectedPizza)}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] ${
                                    canMakePizza(selectedPizza)
                                    ? 'bg-primary text-white hover:bg-orange-700 shadow-lg shadow-orange-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                             >
                                 {canMakePizza(selectedPizza) ? 'Add to Order' : 'Sold Out'}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Menu;
