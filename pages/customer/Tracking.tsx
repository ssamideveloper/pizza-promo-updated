
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { getOrders } from '../../services/storage';
import { Order, Pizza } from '../../types';
import { Link } from 'react-router-dom';
import { Search, RotateCcw, Check, Utensils, Truck, Clock, LogOut, Phone, ShieldCheck, ArrowLeft, Send } from 'lucide-react';

const Tracking = () => {
  const { loginUser, currentUserPhone, addToCart, logoutUser } = useStore();
  
  // Login State
  const [loginStep, setLoginStep] = useState<'phone' | 'verify'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState(''); // The real code
  const [inputCode, setInputCode] = useState(''); // User typed code
  const [error, setError] = useState('');

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Load orders if user is already logged in
  useEffect(() => {
    if (currentUserPhone) {
        setLoading(true);
        fetchOrders(currentUserPhone);
        
        // Auto refresh status for active orders
        const interval = setInterval(() => fetchOrders(currentUserPhone), 5000);
        setLoading(false);
        return () => clearInterval(interval);
    } else {
        setOrders([]);
        setLoginStep('phone');
        setInputCode('');
        setError('');
    }
  }, [currentUserPhone]);

  const fetchOrders = (phone: string) => {
    const allOrders = getOrders();
    const userOrders = allOrders.filter(o => o.customer.phone === phone);
    // Sort by date descending
    userOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setOrders(userOrders);
  };

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length < 3) {
        setError("Please enter a valid phone number.");
        return;
    }
    
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setError('');
    setLoginStep('verify');
    
    // Simulate SMS
    setTimeout(() => {
        alert(`PRIMO PIZZA SECURITY\n\nYour verification code is: ${code}`);
    }, 500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode === verificationCode) {
        loginUser(phoneInput);
    } else {
        setError("Invalid code. Please try again.");
    }
  };

  const handleReorder = (order: Order) => {
     order.items.forEach(item => {
         const baseItem: Pizza = {
             id: item.id,
             name: item.name,
             price: item.price,
             description: item.description,
             image: item.image,
             category: item.category,
             recipe: item.recipe
         };
         addToCart(baseItem);
     });
     alert("Items added to cart!");
  };

  const OrderTimeline = ({ status }: { status: Order['status'] }) => {
      if (status === 'Cancelled') return <div className="text-red-600 font-bold bg-red-50 p-3 rounded text-center">Order Cancelled</div>;

      const steps = [
          { id: 'Pending', label: 'Received', icon: <Clock size={18} /> },
          { id: 'In Progress', label: 'Preparing', icon: <Utensils size={18} /> },
          { id: 'Delivered', label: 'Delivered', icon: <Truck size={18} /> }
      ];

      const currentIdx = steps.findIndex(s => s.id === status);

      return (
          <div className="flex items-center justify-between w-full my-6 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
              <div className={`absolute top-1/2 left-0 h-1 bg-green-500 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}></div>
              
              {steps.map((step, idx) => {
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  
                  return (
                      <div key={step.id} className="flex flex-col items-center bg-white px-2 z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                              {isCompleted ? <Check size={20} /> : step.icon}
                          </div>
                          <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                  )
              })}
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {!currentUserPhone ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
            <div className="text-center mb-8 relative z-10">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {loginStep === 'phone' ? <Phone className="text-primary h-8 w-8" /> : <ShieldCheck className="text-primary h-8 w-8" />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{loginStep === 'phone' ? 'Track Order' : 'Verify Identity'}</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    {loginStep === 'phone' 
                        ? 'Enter your phone number to access your order history.' 
                        : `We sent a verification code to ${phoneInput}.`
                    }
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6 font-medium animate-pulse">
                    {error}
                </div>
            )}

            {loginStep === 'phone' ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                        <div className="relative">
                            <input 
                                type="tel" 
                                placeholder="e.g. 555-0199" 
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition font-mono text-lg"
                                value={phoneInput}
                                onChange={e => setPhoneInput(e.target.value)}
                                autoFocus
                            />
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-800 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
                        Send Code <Send size={16} />
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">We'll send you a 6-digit code to verify it's you.</p>
                </form>
            ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Verification Code</label>
                        <input 
                            type="text" 
                            placeholder="000000" 
                            maxLength={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition font-mono text-center text-2xl tracking-[0.5em]"
                            value={inputCode}
                            onChange={e => setInputCode(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200">
                        Verify & Login <ShieldCheck size={16} />
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={() => {
                            setLoginStep('phone');
                            setError('');
                            setInputCode('');
                        }}
                        className="w-full text-gray-500 py-2 text-sm font-bold hover:text-gray-800 flex items-center justify-center gap-1"
                    >
                        <ArrowLeft size={14} /> Change Number
                    </button>
                </form>
            )}
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-yellow-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          </div>
      ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Hello, <span className="text-primary">{currentUserPhone}</span></h2>
                    <p className="text-gray-500 text-sm">You are securely logged in</p>
                </div>
                <button 
                    onClick={logoutUser} 
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition text-sm font-bold"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            {loading ? (
                 <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your tasty history...</p>
                 </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't placed any orders with this number yet.</p>
                    <Link to="/menu" className="inline-block bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-orange-800 transition">
                        Start Ordering
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Your Orders</h3>
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition hover:shadow-lg">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900">Order #{order.id}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>{order.status}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span>{new Date(order.timestamp).toLocaleString()}</span>
                                            <span>•</span>
                                            <span>{order.items.length} Items</span>
                                        </div>
                                        {order.deliveryZone && (
                                            <div className="text-xs text-blue-600 mt-2 font-medium flex items-center gap-1">
                                                <Truck size={12} /> {order.deliveryZone}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-2xl text-gray-900">${order.total.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400 uppercase font-bold">Cash on Delivery</p>
                                        </div>
                                        <button 
                                            onClick={() => handleReorder(order)}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition font-bold text-sm"
                                            title="Add all items from this order to cart"
                                        >
                                            <RotateCcw size={16} /> Reorder
                                        </button>
                                    </div>
                                </div>

                                {/* Visual Timeline */}
                                <OrderTimeline status={order.status} />
                                
                                <div className="bg-gray-50 p-4 rounded-lg mt-6 border border-gray-100">
                                    <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Order Summary</h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-700 font-medium">
                                                    <span className="text-gray-400 mr-2">{item.quantity}x</span>
                                                    {item.name}
                                                </span>
                                                <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                        
                                        {order.deliveryFee > 0 && (
                                            <li className="flex justify-between text-sm text-blue-600 pt-2 border-t border-dashed border-gray-300 mt-2">
                                                <span>Delivery Fee</span>
                                                <span>+${order.deliveryFee.toFixed(2)}</span>
                                            </li>
                                        )}
                                        
                                        {order.discountApplied > 0 && (
                                            <li className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span>-${order.discountApplied.toFixed(2)}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </>
      )}
    </div>
  );
};

export default Tracking;
