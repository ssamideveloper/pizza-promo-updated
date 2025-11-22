
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, Flame, Copy, Check, Pizza, ArrowRight } from 'lucide-react';
import { getPromos, getFlashSale } from '../../services/storage';

const Deals = () => {
  const promos = getPromos().filter(p => p.active);
  const flashSale = getFlashSale();
  const isFlashActive = flashSale.active && new Date(flashSale.endTime).getTime() > Date.now();
  
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // Static Combos for display
  const COMBOS = [
    {
      title: "Family Feast",
      description: "Perfect for the whole crew. Get massive value on our largest sizes.",
      price: "From $34.99",
      image: "https://images.unsplash.com/photo-1571997478779-2ad511629e3d?auto=format&fit=crop&q=80&w=800",
      badge: "Best Value"
    },
    {
      title: "Game Day Special",
      description: "3 Large Peperoni Pizzas. Maximum hype, minimum hunger.",
      price: "$45.00",
      image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=800",
      badge: "Fan Favorite"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Deals & <span className="text-primary">Promotions</span></h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">Save big on your favorite pizzas. Grab a code, fill your cart, and feast for less.</p>
      </div>

      {/* Flash Sale Section */}
      {isFlashActive && (
        <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <Flame size={400} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 px-4 py-1 rounded-full font-bold text-sm uppercase tracking-wider animate-pulse">
                <Clock size={16} /> Limited Time Offer
              </div>
              <h2 className="text-4xl md:text-6xl font-bold">{flashSale.title}</h2>
              <p className="text-xl text-orange-100">Ends: {new Date(flashSale.endTime).toLocaleString()}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center min-w-[280px]">
              <p className="text-sm uppercase font-semibold text-orange-200 mb-2">Use Promo Code</p>
              <div className="bg-white text-gray-900 font-mono text-2xl font-bold py-3 px-6 rounded-lg border-2 border-dashed border-gray-300 mb-4 tracking-wider">
                {flashSale.discountCode}
              </div>
              <Link to="/menu" className="block w-full bg-yellow-400 text-red-900 font-bold py-3 rounded-lg hover:bg-yellow-300 transition">
                Order Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Grid */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Tag className="text-primary h-8 w-8" />
          <h2 className="text-3xl font-bold text-gray-800">Active Coupons</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map(promo => (
            <div key={promo.id} className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary transition group relative">
              <div className="absolute -right-3 -top-3 bg-gray-100 text-gray-600 p-2 rounded-full shadow-sm group-hover:bg-primary group-hover:text-white transition">
                <Tag size={20} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{promo.description}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {promo.type === 'percent' ? `${promo.value}% OFF` : `$${promo.value} OFF`}
                </span>
              </div>
              
              <button 
                onClick={() => handleCopy(promo.code)}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 transition group"
              >
                <span className="font-mono font-bold text-gray-700 tracking-wider">{promo.code}</span>
                {copied === promo.code ? <Check className="text-green-500" size={18} /> : <Copy className="text-gray-400 group-hover:text-gray-600" size={18} />}
              </button>
              {copied === promo.code && (
                <p className="text-green-600 text-xs font-bold text-center mt-2 absolute bottom-2 left-0 right-0">Copied to clipboard!</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Combos Section */}
      <div>
         <div className="flex items-center gap-3 mb-8">
          <Pizza className="text-primary h-8 w-8" />
          <h2 className="text-3xl font-bold text-gray-800">Hot Combos</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {COMBOS.map((combo, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row group">
              <div className="md:w-1/2 relative overflow-hidden">
                <img src={combo.image} alt={combo.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute top-4 left-4 bg-secondary text-red-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {combo.badge}
                </div>
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{combo.title}</h3>
                <p className="text-gray-500 mb-4">{combo.description}</p>
                <div className="mt-auto">
                  <span className="block text-2xl font-bold text-primary mb-4">{combo.price}</span>
                  <Link to="/menu" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-primary transition">
                    Order Items <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Deals;
