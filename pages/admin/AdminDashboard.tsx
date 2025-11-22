
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ADMIN_PASSWORD } from '../../constants';
import { getOrders, updateOrderStatus, updateOrderCustomer, getPromos, savePromo, deletePromo, getInventory, saveInventory, getDeliveryZones, saveDeliveryZone, deleteDeliveryZone, getFlashSale, saveFlashSale } from '../../services/storage';
import { Order, Promotion, Ingredient, DeliveryZone, FlashSale, Customer } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, Users, Tag, Plus, Trash2, AlertTriangle, Save, ClipboardList, MapPin, Zap, Pencil, X, Search, Edit2, Ban } from 'lucide-react';

const AdminDashboard = () => {
  const { isAdmin, setAdmin, refreshZones } = useStore();
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'overview' | 'orders' | 'promos' | 'inventory' | 'zones' | 'flash'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSale>(getFlashSale());

  // Order Search State
  const [orderSearch, setOrderSearch] = useState('');

  // Customer Edit State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [customerEditForm, setCustomerEditForm] = useState<Customer>({ name: '', phone: '', address: '' });

  // Zone Edit State
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneFormData, setZoneFormData] = useState({ name: '', fee: '', time: '' });

  // Refresh data loop
  useEffect(() => {
    if (!isAdmin) return;
    const loadData = () => {
        setOrders(getOrders());
        setPromos(getPromos());
        setInventory(getInventory());
        setZones(getDeliveryZones());
        setFlashSale(getFlashSale());
    };
    loadData();
    const interval = setInterval(loadData, 5000); // Auto refresh
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAdmin(true);
    else alert("Incorrect Password");
  };

  // --- Order Handlers ---
  const filteredOrders = orders.filter(o => 
    o.customer.phone.includes(orderSearch) || o.id.includes(orderSearch)
  );

  const handleEditCustomer = (order: Order) => {
      setEditingOrder(order);
      setCustomerEditForm({ ...order.customer });
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingOrder) {
          updateOrderCustomer(editingOrder.id, customerEditForm);
          setOrders(getOrders()); // Immediate refresh
          setEditingOrder(null);
      }
  };

  const handleCancelOrder = (id: string) => {
      if (confirm("Are you sure you want to CANCEL this order?")) {
          updateOrderStatus(id, 'Cancelled');
          setOrders(getOrders());
      }
  };

  // --- Inventory Handler ---
  const handleUpdateStock = (id: string, newQty: number) => {
      const updated = inventory.map(item => item.id === id ? { ...item, quantity: newQty } : item);
      setInventory(updated);
      saveInventory(updated);
  };

  // --- Zone Handlers ---
  const handleAddOrUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    const newZone: DeliveryZone = {
        id: editingZoneId || Date.now().toString(),
        name: zoneFormData.name,
        fee: Number(zoneFormData.fee),
        estimatedTime: zoneFormData.time
    };
    saveDeliveryZone(newZone);
    setZones(getDeliveryZones());
    refreshZones(); // update context
    
    // Reset
    setZoneFormData({ name: '', fee: '', time: '' });
    setEditingZoneId(null);
  };

  const handleEditZone = (zone: DeliveryZone) => {
      setEditingZoneId(zone.id);
      setZoneFormData({
          name: zone.name,
          fee: zone.fee.toString(),
          time: zone.estimatedTime
      });
  };

  const handleCancelEdit = () => {
      setEditingZoneId(null);
      setZoneFormData({ name: '', fee: '', time: '' });
  };

  const handleDeleteZone = (id: string) => {
      if (confirm("Are you sure you want to delete this zone?")) {
        deleteDeliveryZone(id);
        setZones(getDeliveryZones());
        refreshZones();
        if (editingZoneId === id) handleCancelEdit();
      }
  };

  // --- Flash Sale Handler ---
  const handleUpdateFlashSale = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const updatedFlashSale: FlashSale = {
        title: formData.get('title') as string,
        discountCode: formData.get('code') as string,
        endTime: new Date(formData.get('endTime') as string).toISOString(),
        active: formData.get('active') === 'on'
    };
    
    saveFlashSale(updatedFlashSale);
    setFlashSale(updatedFlashSale);
    alert("Flash Sale Updated!");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Access</h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full p-3 border rounded mb-4"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full bg-gray-900 text-white py-3 rounded font-bold hover:bg-black transition">Login</button>
        </form>
      </div>
    );
  }

  // --- Analytics ---
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  
  // Group orders by date (last 7 entries effectively for demo, or group by day)
  const chartData = orders.slice(0, 20).reverse().map(o => ({
      name: o.id.slice(-4),
      amount: o.total
  }));

  // --- Promo Handlers ---
  const handleAddPromo = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const newPromo: Promotion = {
          id: Date.now().toString(),
          code: formData.get('code') as string,
          type: formData.get('type') as 'percent' | 'fixed',
          value: Number(formData.get('value')),
          description: formData.get('desc') as string,
          active: true
      };
      savePromo(newPromo);
      setPromos(getPromos());
      form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="bg-gray-900 text-white w-full md:w-64 flex-shrink-0">
        <div className="p-6 font-bold text-xl tracking-wider border-b border-gray-800">ADMIN</div>
        <nav className="p-4 space-y-2">
            <button onClick={() => setTab('overview')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${tab === 'overview' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
                <Users size={20} /> Dashboard
            </button>
            <button onClick={() => setTab('orders')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${tab === 'orders' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
                <Package size={20} /> Orders ({pendingCount})
            </button>
            <button onClick={() => setTab('inventory')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${tab === 'inventory' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
                <ClipboardList size={20} /> Inventory
            </button>
            <button onClick={() => setTab('zones')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${tab === 'zones' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
                <MapPin size={20} /> Delivery Zones
            </button>
            <button onClick={() => setTab('promos')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${tab === 'promos' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
                <Tag size={20} /> Promotions
            </button>
            <button onClick={() => setTab('flash')} className={`w-full text-left p-3 rounded flex items-center gap-3 ${tab === 'flash' ? 'bg-primary' : 'hover:bg-gray-800'}`}>
                <Zap size={20} /> Flash Sales
            </button>
            <button onClick={() => setAdmin(false)} className="w-full text-left p-3 rounded flex items-center gap-3 text-gray-400 hover:text-white mt-8">
                 Logout
            </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-grow p-8 overflow-y-auto h-screen relative">
        
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Revenue</h3>
                            <DollarSign className="text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Total Orders</h3>
                            <Package className="text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-gray-500 text-sm font-bold uppercase">Pending</h3>
                            <Users className="text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="font-bold text-gray-700 mb-6">Recent Sales Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#c2410c" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                     <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
                     <div className="relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                             type="text" 
                             placeholder="Search phone..." 
                             className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                             value={orderSearch}
                             onChange={(e) => setOrderSearch(e.target.value)}
                         />
                     </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Zone</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono text-sm">{order.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <div className="font-bold">{order.customer.name}</div>
                                                <div className="text-xs text-gray-500">{order.customer.phone}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-[150px]" title={order.customer.address}>{order.customer.address}</div>
                                            </div>
                                            <button onClick={() => handleEditCustomer(order)} className="text-gray-400 hover:text-blue-600 p-1">
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                    </td>
                                    <td className="p-4 font-bold">${order.total.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-gray-600">{order.deliveryZone || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100'
                                        }`}>{order.status}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <select 
                                                value={order.status} 
                                                onChange={(e) => {
                                                    updateOrderStatus(order.id, e.target.value as any);
                                                    setOrders(getOrders());
                                                }}
                                                className="border rounded p-1 text-sm bg-white w-28"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                            {order.status !== 'Cancelled' && (
                                                <button 
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                                                    title="Cancel Order"
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* INVENTORY TAB */}
        {tab === 'inventory' && (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase">
                            <tr>
                                <th className="p-4">Ingredient</th>
                                <th className="p-4">Unit</th>
                                <th className="p-4">Stock Level</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventory.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{item.name}</td>
                                    <td className="p-4 text-gray-500 text-sm">{item.unit}</td>
                                    <td className="p-4 font-bold">{item.quantity}</td>
                                    <td className="p-4">
                                        {item.quantity < item.threshold ? (
                                            <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
                                                <AlertTriangle size={16} /> LOW STOCK
                                            </span>
                                        ) : (
                                            <span className="text-green-600 font-bold text-sm">OK</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="border rounded p-1 w-20" 
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateStock(item.id, Number(e.target.value))}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ZONES TAB */}
        {tab === 'zones' && (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Delivery Zones</h1>
                
                {/* Create/Edit Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">{editingZoneId ? 'Edit Zone' : 'Add New Zone'}</h3>
                    <form onSubmit={handleAddOrUpdateZone} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Zone Name / Description</label>
                            <input 
                                name="name" 
                                required 
                                type="text" 
                                className="border rounded p-2 w-full" 
                                placeholder="e.g. Downtown" 
                                value={zoneFormData.name}
                                onChange={(e) => setZoneFormData({...zoneFormData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Delivery Fee ($)</label>
                            <input 
                                name="fee" 
                                required 
                                type="number" 
                                step="0.01" 
                                className="border rounded p-2 w-24" 
                                placeholder="5.00" 
                                value={zoneFormData.fee}
                                onChange={(e) => setZoneFormData({...zoneFormData, fee: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Est. Time</label>
                            <input 
                                name="time" 
                                required 
                                type="text" 
                                className="border rounded p-2 w-32" 
                                placeholder="30-45 min" 
                                value={zoneFormData.time}
                                onChange={(e) => setZoneFormData({...zoneFormData, time: e.target.value})}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button type="submit" className={`${editingZoneId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded font-bold flex items-center gap-2`}>
                                {editingZoneId ? <Save size={16} /> : <Plus size={16} />} 
                                {editingZoneId ? 'Update Zone' : 'Add Zone'}
                            </button>
                            {editingZoneId && (
                                <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded font-bold hover:bg-gray-600 flex items-center gap-2">
                                    <X size={16} /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="grid gap-4 md:grid-cols-2">
                    {zones.map(zone => (
                        <div key={zone.id} className={`bg-white p-4 rounded-lg border flex justify-between items-center ${editingZoneId === zone.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                            <div>
                                <h4 className="font-bold text-lg">{zone.name}</h4>
                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                    <span>Fee: <strong>${zone.fee.toFixed(2)}</strong></span>
                                    <span>Time: <strong>{zone.estimatedTime}</strong></span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleEditZone(zone)}
                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded"
                                    title="Edit"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteZone(zone.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* PROMOS TAB */}
        {tab === 'promos' && (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Promotions & Discounts</h1>
                
                {/* Create Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Create New Promotion</h3>
                    <form onSubmit={handleAddPromo} className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Code</label>
                            <input name="code" required type="text" className="border rounded p-2 uppercase" placeholder="SUMMER25" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                            <select name="type" className="border rounded p-2 bg-white">
                                <option value="percent">Percent (%)</option>
                                <option value="fixed">Fixed ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Value</label>
                            <input name="value" required type="number" className="border rounded p-2 w-24" placeholder="10" />
                        </div>
                        <div className="flex-grow">
                             <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                             <input name="desc" required type="text" className="border rounded p-2 w-full" placeholder="Summer Sale" />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 flex items-center gap-2">
                            <Plus size={16} /> Add
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="grid gap-4 md:grid-cols-2">
                    {promos.map(promo => (
                        <div key={promo.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-lg">{promo.code}</h4>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded uppercase">{promo.type}</span>
                                </div>
                                <p className="text-gray-600">{promo.description}</p>
                                <p className="text-sm font-bold text-primary mt-1">
                                    -{promo.type === 'percent' ? `${promo.value}%` : `$${promo.value}`}
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    deletePromo(promo.id);
                                    setPromos(getPromos());
                                }}
                                className="text-red-500 hover:bg-red-50 p-2 rounded"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* FLASH SALE TAB */}
        {tab === 'flash' && (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Flash Sale Management</h1>
                
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
                    <h3 className="font-bold text-xl mb-6 text-gray-700 border-b pb-2">Configure Sale</h3>
                    <form onSubmit={handleUpdateFlashSale} className="space-y-6">
                        
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Sale Title</label>
                            <input 
                                name="title" 
                                type="text" 
                                defaultValue={flashSale.title} 
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. Midnight Pizza Party!" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Code</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        name="code" 
                                        type="text" 
                                        defaultValue={flashSale.discountCode} 
                                        required
                                        className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase font-mono"
                                        placeholder="FLASH50" 
                                    />
                                </div>
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">End Date & Time</label>
                                <input 
                                    name="endTime" 
                                    type="datetime-local" 
                                    // Simple hack to show local time in input from ISO string
                                    defaultValue={new Date(new Date(flashSale.endTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)}
                                    required
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <input 
                                id="active"
                                name="active" 
                                type="checkbox" 
                                defaultChecked={flashSale.active} 
                                className="w-5 h-5 text-primary rounded focus:ring-primary" 
                            />
                            <label htmlFor="active" className="font-bold text-gray-700 select-none cursor-pointer">
                                Sale Active (Show on Homepage)
                            </label>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-800 transition flex items-center gap-2">
                                <Save size={20} /> Save Configuration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* CUSTOMER EDIT MODAL */}
        {editingOrder && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Edit Customer Info</h3>
                        <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSaveCustomer} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Customer Name</label>
                            <input 
                                type="text" 
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                                value={customerEditForm.name}
                                onChange={e => setCustomerEditForm({...customerEditForm, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                            <input 
                                type="tel" 
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                                value={customerEditForm.phone}
                                onChange={e => setCustomerEditForm({...customerEditForm, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                            <textarea 
                                required
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none h-24"
                                value={customerEditForm.address}
                                onChange={e => setCustomerEditForm({...customerEditForm, address: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button type="button" onClick={() => setEditingOrder(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-bold hover:bg-gray-200 transition">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded font-bold hover:bg-orange-800 transition">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
