
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Trash2, Minus, Plus, ShoppingBag, XCircle } from 'lucide-react';
import { saveOrder } from '../../services/storage';
import { Order } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { generateOrderId } from '../../utils';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, discount, applyPromo, activePromo, currentUserPhone, refreshInventory, deliveryZones } = useStore();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  // Checkout Form
  const [form, setForm] = useState({
    name: '',
    phone: currentUserPhone || '',
    address: '',
    zoneId: ''
  });

  const navigate = useNavigate();

  const handleApplyPromo = () => {
    setError('');
    const success = applyPromo(promoCode);
    if (!success) setError('Invalid or expired code.');
    else setPromoCode('');
  };

  const handleClearCart = () => {
      if (window.confirm("Are you sure you want to remove all items from your cart? This action cannot be undone.")) {
          clearCart();
      }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.zoneId) {
        setError("Please fill in all fields and select a delivery zone.");
        return;
    }

    const selectedZone = deliveryZones.find(z => z.id === form.zoneId);
    const deliveryFee = selectedZone ? selectedZone.fee : 0;
    const finalTotal = Math.max(0, cartTotal - discount) + deliveryFee;
    
    const newOrder: Order = {
      id: generateOrderId(),
      customer: { ...form },
      items: [...cart],
      total: finalTotal,
      discountApplied: discount,
      deliveryFee: deliveryFee,
      deliveryZone: selectedZone ? selectedZone.name : 'Unknown',
      status: 'Pending',
      timestamp: new Date().toISOString(),
      paymentMethod: 'CASH'
    };

    saveOrder(newOrder);
    setLastOrder(newOrder); // Save for success display
    refreshInventory(); // Sync local state with deducted inventory
    setStep('success');
    clearCart();
  };

  // Dynamic calculation for render
  const selectedZone = deliveryZones.find(z => z.id === form.zoneId);
  const deliveryFee = selectedZone ? selectedZone.fee : 0;
  const finalTotal = Math.max(0, cartTotal - discount) + deliveryFee;

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any pizzas yet.</p>
        <Link to="/menu" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-orange-800 transition">
          Browse Menu
        </Link>
      </div>
    );
  }

  if (step === 'success' && lastOrder) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Placed!</h2>
        <p className="text-gray-600 mb-6">
            Thank you, {lastOrder.customer.name}. Your order has been received.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Order ID:</span>
                <span className="font-mono font-bold text-gray-800">{lastOrder.id}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Subtotal (items):</span>
                <span>${(lastOrder.total - lastOrder.deliveryFee + lastOrder.discountApplied).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Delivery ({lastOrder.deliveryZone}):</span>
                <span>+${lastOrder.deliveryFee.toFixed(2)}</span>
            </div>
            {lastOrder.discountApplied > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                    <span>Discount:</span>
                    <span>-${lastOrder.discountApplied.toFixed(2)}</span>
                </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-gray-900">
                <span>Total Cash Required:</span>
                <span>${lastOrder.total.toFixed(2)}</span>
            </div>
        </div>
        <div className="flex flex-col gap-3">
             <Link to="/track" className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
                Track Your Order
            </Link>
            <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{step === 'cart' ? 'Your Cart' : 'Checkout'}</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Col: Items or Form */}
        <div className="flex-grow">
          {step === 'cart' ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-700">{cart.length} Items</h3>
                  <button 
                    onClick={handleClearCart} 
                    className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                      <XCircle size={14} /> Clear Cart
                  </button>
              </div>
              {cart.map(item => (
                <div key={item.id} className="p-4 border-b border-gray-100 flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-full hover:bg-gray-100"><Minus size={16} /></button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-full hover:bg-gray-100"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckout} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For tracking)</label>
                    <input required type="tel" className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none" 
                        value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Zone</label>
                    <select 
                        required 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none bg-white"
                        value={form.zoneId}
                        onChange={e => setForm({...form, zoneId: e.target.value})}
                    >
                        <option value="">Select your neighborhood...</option>
                        {deliveryZones.map(zone => (
                            <option key={zone.id} value={zone.id}>
                                {zone.name} (+${zone.fee.toFixed(2)}) - {zone.estimatedTime}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                    <textarea required className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none h-24" 
                        value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <h4 className="font-bold text-yellow-800 mb-1">Payment Method</h4>
                    <p className="text-sm text-yellow-700">We currently accept <strong>CASH ON DELIVERY</strong> only.</p>
                </div>
            </form>
          )}
        </div>

        {/* Right Col: Summary */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {selectedZone && (
                  <div className="flex justify-between text-blue-600">
                    <span>Delivery Fee</span>
                    <span>+${selectedZone.fee.toFixed(2)}</span>
                  </div>
              )}
              {activePromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({activePromo.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
              )}
            </div>
            
            {step === 'cart' && (
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Promo Code" 
                            className="flex-grow border rounded p-2 text-sm uppercase"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        />
                        <button onClick={handleApplyPromo} className="bg-gray-800 text-white px-3 rounded text-sm font-medium">Apply</button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            )}

            <div className="flex justify-between font-bold text-xl text-gray-900 mb-6">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>

            {step === 'cart' ? (
                <button 
                    onClick={() => setStep('checkout')} 
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-800 transition"
                >
                    Proceed to Checkout
                </button>
            ) : (
                <div className="space-y-3">
                    <button 
                        type="submit"
                        form="checkout-form"
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-800 transition"
                    >
                        Place Order (${finalTotal.toFixed(2)})
                    </button>
                    <button 
                        onClick={() => setStep('cart')}
                        className="w-full text-gray-500 hover:text-gray-800 text-sm"
                    >
                        Back to Cart
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
