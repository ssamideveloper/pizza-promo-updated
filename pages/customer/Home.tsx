
import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Star, Flame, ChevronDown, Utensils, Award, ChefHat, MapPin, Instagram, ChevronLeft, ChevronRight, Sparkles, Pizza as PizzaIcon, Leaf } from 'lucide-react';
import { getFlashSale, getMenu } from '../../services/storage';
import { useStore } from '../../context/StoreContext';

// Animation Wrapper Component
const AnimatedSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
        ref={ref} 
        className={`transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        } ${className}`}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  
  const flashSale = getFlashSale();
  const timeLeft = new Date(flashSale.endTime).getTime() - Date.now();
  const isActiveSale = flashSale.active && timeLeft > 0;
  
  const menu = getMenu();
  const popularPizzas = menu.filter(p => p.isPopular);
  const newArrivals = menu.slice(-5);
  const featuredPizza = menu.find(p => p.name.includes("Truffle")) || menu[0];

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRefNew = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
        const { current } = ref;
        const scrollAmount = 400;
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  const handleQuickOrder = (pizza: any) => {
    addToCart(pizza);
    navigate('/cart');
  };

  // Hero Slideshow
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=2000&auto=format&fit=crop', // Med Bliss
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2000&auto=format&fit=crop'  // Margherita
  ];

  useEffect(() => {
    const timer = setInterval(() => {
        setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white font-sans overflow-x-hidden relative">
      <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes float-reverse {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(20px) rotate(-10deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .animate-float-delayed { animation: float 7s ease-in-out 1s infinite; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; opacity: 0; transform: translateY(20px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
      
      {/* 1. CINEMATIC HERO SLIDER */}
      <div className="relative h-screen w-full overflow-hidden">
        {heroImages.map((img, index) => (
            <div 
                key={index}
                className={`absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${index === heroIndex ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url('${img}')` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
            </div>
        ))}

        {/* Floating Background Icons in Hero */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
             <PizzaIcon className="absolute top-1/4 left-[10%] text-orange-500 w-16 h-16 animate-float-slow opacity-60" />
             <PizzaIcon className="absolute bottom-1/3 right-[15%] text-yellow-500 w-24 h-24 animate-float opacity-40" />
             <Leaf className="absolute top-1/3 right-[20%] text-green-500 w-12 h-12 animate-float-reverse opacity-50" />
             <div className="absolute top-20 right-20 w-40 h-40 bg-orange-600/30 rounded-full blur-[80px] animate-pulse"></div>
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 space-y-8">
          <div className="animate-fade-in-up flex items-center gap-2 px-4 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-orange-100 text-sm font-bold tracking-widest uppercase shadow-lg">
            <Star size={12} className="text-secondary" fill="currentColor" /> Est. 1995
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none drop-shadow-2xl animate-fade-in-up delay-100 max-w-6xl">
            TASTE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 relative">
                TRADITION
                {/* Decoration */}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl font-light animate-fade-in-up delay-200 leading-relaxed">
            Hand-kneaded dough. Imported Italian flour. <br/>Wood-fired to crispy perfection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-8 animate-fade-in-up delay-300">
            <Link 
              to="/menu" 
              className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-700 transition-all duration-300 shadow-[0_0_30px_rgba(194,65,12,0.4)] hover:shadow-[0_0_40px_rgba(194,65,12,0.6)] hover:scale-105 flex items-center justify-center gap-3 text-lg group"
            >
              Order Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/menu" 
              className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2 text-lg hover:scale-105"
            >
              View Menu
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce text-white/70">
          <ChevronDown size={32} />
        </div>
      </div>

      {/* 2. FEATURED PIZZA OF THE WEEK */}
      <AnimatedSection className="py-24 bg-stone-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
         
         {/* Floating Pizza Background */}
         <PizzaIcon className="absolute top-10 right-10 text-white/5 w-32 h-32 animate-float-delayed rotate-12" />
         <Leaf className="absolute bottom-20 left-20 text-green-500/10 w-24 h-24 animate-float-reverse" />

         <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                
                {/* Image Side */}
                <div className="w-full lg:w-1/2 relative group perspective-1000">
                    <div className="relative aspect-square rounded-full border-2 border-white/10 p-8 transform transition-transform duration-700 group-hover:rotate-3">
                        <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_30s_linear_infinite]"></div>
                        <img 
                            src={featuredPizza.image} 
                            alt={featuredPizza.name} 
                            className="w-full h-full object-cover rounded-full shadow-2xl group-hover:scale-105 transition duration-700"
                        />
                        
                        <div className="absolute bottom-10 right-0 bg-white text-gray-900 p-6 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition duration-300 hover:scale-110">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price</p>
                            <p className="text-4xl font-black text-primary">${featuredPizza.price}</p>
                        </div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-secondary text-gray-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-glow">
                            <Award size={16} /> Pizza of the Week
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black leading-tight mb-4">{featuredPizza.name}</h2>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            {featuredPizza.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        {featuredPizza.recipe && Object.keys(featuredPizza.recipe).map((ing, i) => (
                             <span key={i} className="px-4 py-2 border border-white/20 bg-white/5 rounded-lg text-sm text-gray-300 capitalize hover:bg-white/10 transition cursor-default hover:border-primary">
                                {ing === 'pepp' ? 'Pepperoni' : ing === 'veg' ? 'Vegetables' : ing}
                             </span>
                        ))}
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button 
                            onClick={() => handleQuickOrder(featuredPizza)}
                            className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-[0_0_20px_rgba(194,65,12,0.5)] flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                        >
                            Order This Now <ArrowRight size={20} />
                        </button>
                        <Link to="/menu" className="px-10 py-4 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2">
                            See All Pizzas
                        </Link>
                    </div>
                </div>
            </div>
         </div>
      </AnimatedSection>

      {/* 3. TRENDING CAROUSEL */}
      <AnimatedSection className="py-24 bg-gray-50 overflow-hidden relative">
        <div className="absolute left-0 top-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Trending Now</h2>
                    <p className="text-gray-500">Our most popular slices this week.</p>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={() => scroll(scrollRef, 'left')} className="p-4 rounded-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-100 shadow-sm transition hover:scale-110">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => scroll(scrollRef, 'right')} className="p-4 rounded-full bg-black text-white hover:bg-gray-800 shadow-sm transition hover:scale-110">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
            >
                {popularPizzas.map((pizza) => (
                    <div 
                        key={pizza.id} 
                        className="snap-center min-w-[85vw] md:min-w-[400px] bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group relative border border-gray-100 flex flex-col hover:-translate-y-2"
                    >
                        <div className="h-64 overflow-hidden relative">
                            <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-black/10 transition"></div>
                            <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                            <span className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                                <Flame size={12} className="text-orange-500" fill="currentColor" /> Hot
                            </span>
                        </div>
                        
                        <div className="p-8 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition">{pizza.name}</h3>
                                <span className="text-xl font-black text-gray-900">${Math.floor(pizza.price)}</span>
                            </div>
                            <p className="text-gray-500 line-clamp-2 mb-8 leading-relaxed flex-grow">{pizza.description}</p>
                            
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-auto">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{pizza.category}</span>
                                <button 
                                  onClick={() => handleQuickOrder(pizza)}
                                  className="bg-gray-100 text-gray-900 p-3 rounded-full hover:bg-primary hover:text-white transition transform hover:rotate-45 shadow-sm hover:shadow-lg"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </AnimatedSection>

      {/* 4. NEW ARRIVALS CAROUSEL */}
      <AnimatedSection className="py-24 bg-white overflow-hidden relative">
         {/* Decoration */}
         <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[20rem] font-black text-gray-50 opacity-50 select-none pointer-events-none animate-pulse">FRESH</div>
         <Leaf className="absolute top-20 left-20 text-green-500/10 w-32 h-32 animate-float" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest mb-2">
                        <Sparkles size={16} /> New On The Menu
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900">Fresh Creations</h2>
                </div>
                
                <div className="flex gap-3">
                    <button onClick={() => scroll(scrollRefNew, 'left')} className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll(scrollRefNew, 'right')} className="p-3 rounded-full bg-primary text-white hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRefNew}
                className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth no-scrollbar"
            >
                {newArrivals.map((pizza) => (
                    <div 
                        key={pizza.id} 
                        className="snap-start min-w-[300px] md:min-w-[350px] bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:-translate-y-1"
                        onClick={() => navigate('/menu')}
                    >
                        <div className="h-48 overflow-hidden rounded-t-2xl relative">
                            <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm">New</div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition">{pizza.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{pizza.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">${pizza.price}</span>
                                <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition">Order <ArrowRight size={14} /></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </AnimatedSection>

      {/* 5. BENTO BOX FEATURES */}
      <div className="max-w-7xl mx-auto px-4 py-24 bg-gray-50">
         <AnimatedSection className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">The Primo Promise</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900">Excellence in Every Slice</h3>
         </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 md:h-[600px]">
            {/* Large Left Block */}
            <AnimatedSection className="md:col-span-2 md:row-span-2 rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-lg h-96 md:h-auto">
                <img src="https://images.unsplash.com/photo-1542834369-f10ebf06d3e0?q=80&w=1000&auto=format&fit=crop" alt="Chef" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end">
                    <div className="bg-white/20 backdrop-blur-md w-fit p-3 rounded-xl mb-4 text-white"><ChefHat size={32} /></div>
                    <h4 className="text-white text-3xl font-bold mb-2">Master Craftsmanship</h4>
                    <p className="text-gray-200 text-lg">Our dough is fermented for 48 hours to ensure the perfect light, airy crust with a satisfying crunch.</p>
                </div>
            </AnimatedSection>

            {/* Top Right Blocks */}
            <AnimatedSection delay={200} className="md:col-span-2 bg-orange-50 rounded-[2.5rem] p-10 flex flex-col justify-center items-start hover:bg-orange-100 transition shadow-sm relative overflow-hidden group min-h-[250px]">
                 <div className="absolute right-0 top-0 w-48 h-full bg-[url('https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=500')] bg-cover opacity-10 group-hover:opacity-20 transition"></div>
                 <div className="bg-white p-4 rounded-full text-primary mb-4 shadow-sm relative z-10 transform group-hover:scale-110 transition"><Clock size={28} /></div>
                 <h4 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">Lightning Fast Delivery</h4>
                 <p className="text-gray-600 relative z-10">Hot and fresh at your door in under 45 minutes, guaranteed. Track your driver in real-time.</p>
            </AnimatedSection>

            {/* Bottom Right Split */}
            <AnimatedSection delay={300} className="bg-gray-900 rounded-[2.5rem] p-10 flex flex-col justify-center items-start text-white hover:bg-gray-800 transition shadow-sm min-h-[250px]">
                 <div className="bg-white/20 p-3 rounded-full text-white mb-4"><Utensils size={24} /></div>
                 <h4 className="text-xl font-bold mb-2">Fresh Ingredients</h4>
                 <p className="text-gray-400 text-sm">Locally sourced produce, daily.</p>
            </AnimatedSection>
             <AnimatedSection delay={400} className="bg-secondary rounded-[2.5rem] p-10 flex flex-col justify-center items-start hover:bg-yellow-300 transition shadow-sm min-h-[250px]">
                 <div className="bg-black/10 p-3 rounded-full text-gray-900 mb-4"><Award size={24} /></div>
                 <h4 className="text-xl font-bold text-gray-900 mb-2">#1 Voted Pizza</h4>
                 <p className="text-gray-800 text-sm">City Food Awards 2024 Winner.</p>
            </AnimatedSection>
        </div>
      </div>

      {/* 6. CULINARY GALLERY */}
      <AnimatedSection className="bg-stone-900 py-24 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
              <PizzaIcon className="absolute top-10 right-10 text-white/5 w-20 h-20 animate-float" />
              <Leaf className="absolute bottom-10 left-10 text-white/5 w-16 h-16 animate-float-reverse" />
          </div>

          <div className="max-w-7xl mx-auto px-4 mb-12 flex justify-between items-end relative z-10">
              <div>
                  <h2 className="text-primary font-bold uppercase tracking-widest mb-2">Visual Feast</h2>
                  <h3 className="text-4xl font-bold">Our Atmosphere</h3>
              </div>
              <div className="hidden md:flex gap-4">
                  <span className="flex items-center gap-2 text-gray-400 text-sm"><Instagram size={16} /> @primopizza</span>
                  <span className="flex items-center gap-2 text-gray-400 text-sm"><MapPin size={16} /> Flavor Town, USA</span>
              </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96 md:h-[600px] px-4 md:px-0 relative z-10">
              <div className="col-span-2 row-span-2 overflow-hidden rounded-3xl relative group">
                  <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Restaurant Interior" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <p className="text-white font-bold text-lg tracking-widest uppercase border-b-2 border-white pb-1">Dining Room</p>
                  </div>
              </div>
              <div className="overflow-hidden rounded-3xl relative group">
                  <img src="https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=500" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Pizza Detail" />
              </div>
              <div className="overflow-hidden rounded-3xl relative group">
                  <img src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=500" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Spicy Pizza" />
              </div>
              <div className="col-span-2 overflow-hidden rounded-3xl relative group">
                   <img src="https://images.unsplash.com/photo-1576458088443-04a19bb13da6?q=80&w=800" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" alt="Oven" />
                   <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <p className="text-white font-bold text-lg tracking-widest uppercase border-b-2 border-white pb-1">Wood Fired Oven</p>
                  </div>
              </div>
          </div>
      </AnimatedSection>

      {/* 7. FLASH SALE */}
      {isActiveSale && (
        <AnimatedSection className="bg-white py-12 relative overflow-hidden">
           <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-1 shadow-2xl transform rotate-1 hover:rotate-0 transition duration-500 hover:scale-[1.01]">
                 <div className="bg-gray-900 rounded-[1.4rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="bg-red-500/20 p-4 rounded-full text-red-500 animate-pulse">
                            <Flame size={40} />
                        </div>
                        <div>
                            <p className="text-red-500 font-bold uppercase tracking-wider mb-1">Flash Sale Active</p>
                            <h3 className="text-3xl md:text-4xl font-bold text-white">{flashSale.title}</h3>
                            <p className="text-gray-400 mt-2 flex items-center gap-2"><Clock size={16} /> Ends in {Math.floor(timeLeft / 1000 / 60)} mins</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-gray-400 text-sm uppercase font-bold">Use Code At Checkout</span>
                        <div className="bg-white/10 border border-white/20 px-6 py-2 rounded-lg text-2xl font-mono font-bold text-white tracking-widest select-all cursor-pointer hover:bg-white/20 transition">
                            {flashSale.discountCode}
                        </div>
                        <Link to="/menu" className="mt-2 text-primary font-bold hover:underline flex items-center gap-1">
                            Order Now <ArrowRight size={16} />
                        </Link>
                    </div>
                 </div>
              </div>
           </div>
        </AnimatedSection>
      )}

      {/* 8. NEWSLETTER */}
      <div className="max-w-5xl mx-auto px-4 py-24">
         <AnimatedSection className="bg-black rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1579751626657-72bc17010498?q=80&w=2000')] bg-cover bg-center blur-sm scale-110"></div>
             
             {/* Floating Pizza slice inside newsletter */}
             <PizzaIcon className="absolute -top-10 -left-10 text-orange-500/20 w-40 h-40 animate-float-delayed" />

             <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <Award className="h-16 w-16 mx-auto text-secondary animate-bounce" />
                <h2 className="text-4xl md:text-5xl font-bold">Join the Inner Circle</h2>
                <p className="text-gray-400 text-lg">Unlock secret menu items, priority delivery, and exclusive tasting events.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <input type="email" placeholder="Enter your email address" className="flex-grow px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-secondary focus:bg-black/50 transition" />
                   <button className="bg-secondary text-black font-bold px-10 py-4 rounded-full hover:bg-white transition shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                       Subscribe
                   </button>
                </div>
                <p className="text-xs text-gray-500">No spam. Just ham. And cheese.</p>
             </div>
         </AnimatedSection>
      </div>

    </div>
  );
};

export default Home;
