
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Pizza, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Navbar = () => {
  const { cart, currentUserPhone, logoutUser } = useStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path ? 'text-secondary font-bold' : 'text-white hover:text-orange-200';

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Pizza className="h-8 w-8 text-secondary" />
              <span className="font-bold text-2xl text-white tracking-wide">Primo Pizza</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/menu" className={isActive('/menu')}>Menu</Link>
            <Link to="/deals" className={isActive('/deals')}>Deals</Link>
            <Link to="/rewards" className={isActive('/rewards')}>Rewards</Link>
            {/* Only show Track Order if logged in */}
            {currentUserPhone && (
              <Link to="/track" className={isActive('/track')}>Track Order</Link>
            )}
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-orange-600">
               {currentUserPhone ? (
                 <div className="flex items-center gap-2 text-orange-100">
                    <User size={16} />
                    <span className="text-sm">{currentUserPhone}</span>
                    <button onClick={logoutUser} title="Logout" className="hover:text-white transition"><LogOut size={16} /></button>
                 </div>
               ) : (
                 <Link to="/track" className="text-xs text-orange-100 uppercase tracking-wider font-semibold hover:text-white transition">Login</Link>
               )}

              <Link to="/cart" className="relative p-2 text-white hover:text-secondary transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-red-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile button */}
          <div className="flex items-center md:hidden gap-4">
             <Link to="/cart" className="relative p-2 text-white">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-red-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
             </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
              {mobileOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-red-800 border-t border-red-700 shadow-inner">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <Link to="/" className="block px-3 py-3 text-white hover:bg-red-700 rounded-lg font-medium text-lg" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/menu" className="block px-3 py-3 text-white hover:bg-red-700 rounded-lg font-medium text-lg" onClick={() => setMobileOpen(false)}>Menu</Link>
            <Link to="/deals" className="block px-3 py-3 text-white hover:bg-red-700 rounded-lg font-medium text-lg" onClick={() => setMobileOpen(false)}>Deals</Link>
            <Link to="/rewards" className="block px-3 py-3 text-white hover:bg-red-700 rounded-lg font-medium text-lg" onClick={() => setMobileOpen(false)}>Rewards</Link>
            
            <div className="border-t border-red-700 my-4 pt-4">
            {currentUserPhone ? (
              <>
                <Link to="/track" className="block px-3 py-3 text-white hover:bg-red-700 rounded-lg font-medium text-lg mb-2" onClick={() => setMobileOpen(false)}>Track Order</Link>
                
                <div className="flex items-center justify-between bg-red-900/30 px-4 py-4 rounded-lg mt-4">
                    <div className="flex items-center gap-3 text-orange-100">
                        <div className="bg-orange-500/20 p-2 rounded-full">
                            <User size={20} />
                        </div>
                        <span className="font-mono font-bold">{currentUserPhone}</span>
                    </div>
                    <button 
                        onClick={() => { logoutUser(); setMobileOpen(false); }} 
                        className="flex items-center gap-2 bg-red-900 text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-black transition shadow-sm"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
              </>
            ) : (
               <Link 
                to="/track" 
                className="block w-full text-center px-3 py-4 bg-secondary text-red-900 font-bold text-lg rounded-lg hover:bg-yellow-300 transition shadow-md uppercase tracking-wide mt-4" 
                onClick={() => setMobileOpen(false)}
               >
                   Login / Sign Up
               </Link>
            )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer = () => (
  <footer className="bg-stone-900 text-stone-400 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Primo Pizza</h3>
        <p>Fresh ingredients. Traditional recipes. Served with a smile since 1995.</p>
        <div className="mt-4">
          <Link to="/admin" className="text-stone-600 hover:text-stone-400 text-sm">Admin Access</Link>
        </div>
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Hours</h3>
        <p>Mon-Sun: 11:00 AM - 10:00 PM</p>
        <p className="mt-2 text-secondary font-bold">CASH ONLY DELIVERY</p>
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
        <p>123 Pizza Lane</p>
        <p>Flavor Town, FT 90210</p>
        <p>(555) 123-4567</p>
      </div>
    </div>
  </footer>
);

export const PageLayout = ({ children }: React.PropsWithChildren<{}>) => (
  <div className="min-h-screen flex flex-col font-sans">
    <Navbar />
    <main className="flex-grow bg-background">
      {children}
    </main>
    <Footer />
  </div>
);
