import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, User, LogOut, CheckCircle2, Truck, Calendar, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  
  // Create address inside profile
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    street: '', city: '', state: '', postal_code: '', country: 'India', is_default: false
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const ordersRes = await api.get('/orders');
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoadingOrders(false);
      }

      try {
        const addrRes = await api.get('/addresses');
        setAddresses(addrRes.data);
      } catch (err) {
        console.error("Error fetching addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddr);
      setAddresses([...addresses, res.data]);
      setShowAddrForm(false);
      setNewAddr({ street: '', city: '', state: '', postal_code: '', country: 'India', is_default: false });
    } catch (err) {
      console.error("Error creating address", err);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting address", err);
    }
  };

  // Helper to determine status bar percentage
  const getStatusProgress = (status) => {
    if (status === 'Pending') return 33;
    if (status === 'Shipped') return 66;
    if (status === 'Delivered') return 100;
    return 0; // Cancelled
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      
      {/* 1. HEADER / USER SUMMARY */}
      <div className="bg-bg-card border border-primary-gold/15 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center font-bold text-2xl">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-text-light">{user?.full_name}</h1>
            <p className="text-sm text-text-muted">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 font-bold py-2.5 px-6 rounded-lg text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* 2. LEFT SECTION: ADDRESSES & SETTINGS */}
        <div className="space-y-8 w-full">
          
          {/* Address Book */}
          <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-primary-gold/10 pb-3">
              <h3 className="text-lg font-playfair font-bold text-text-light flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-gold" />
                <span>Address Book</span>
              </h3>
              <button
                onClick={() => setShowAddrForm(!showAddrForm)}
                className="text-xs font-bold text-primary-gold hover:text-white"
              >
                {showAddrForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showAddrForm && (
              <form onSubmit={handleCreateAddress} className="bg-bg-deep/40 p-4 rounded-xl border border-primary-gold/10 space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                    placeholder="Street Address"
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                    placeholder="City"
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({...newAddr, state: e.target.value})}
                    placeholder="State"
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newAddr.postal_code}
                    onChange={(e) => setNewAddr({...newAddr, postal_code: e.target.value})}
                    placeholder="Postal Code"
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newAddr.country}
                    onChange={(e) => setNewAddr({...newAddr, country: e.target.value})}
                    placeholder="Country"
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-2 rounded text-xs"
                >
                  Save Address
                </button>
              </form>
            )}

            {loadingAddresses ? (
              <div className="h-20 animate-pulse bg-bg-deep/40 rounded-xl"></div>
            ) : addresses.length === 0 ? (
              <p className="text-xs text-text-muted italic">No addresses saved. Add one to speed up checkout.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-bg-deep/40 border border-primary-gold/5 p-4 rounded-xl relative">
                    <p className="text-sm font-semibold text-text-light">{addr.street}</p>
                    <p className="text-xs text-text-muted mt-1">{addr.city}, {addr.state} - {addr.postal_code}</p>
                    <p className="text-xxs text-text-muted mt-1 uppercase tracking-widest">{addr.country}</p>
                    {addr.is_default && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-primary-gold bg-primary-gold/10 px-2 py-0.5 rounded">
                        Default Shipping
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute top-4 right-4 text-xs text-red-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* 3. RIGHT SECTION: ORDER HISTORY LIST */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-playfair font-bold text-text-light flex items-center border-b border-primary-gold/10 pb-3">
            <Package className="w-5 h-5 mr-2 text-primary-gold" />
            <span>My Orders ({orders.length})</span>
          </h3>

          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-bg-card rounded-2xl h-44 animate-pulse"></div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-bg-card border border-primary-gold/10 rounded-2xl p-12 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-primary-gold mx-auto" />
              <p className="font-bold text-text-light">No Orders Found</p>
              <p className="text-xs text-text-muted">You have not placed any orders yet.</p>
              <Link to="/products" className="inline-block bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-2.5 px-6 rounded-lg text-xs">
                Browse Scents
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => {
                const progress = getStatusProgress(order.status);
                return (
                  <div key={order.id} className="bg-bg-card border border-primary-gold/15 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                    
                    {/* Header: ID, date, status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-primary-gold/10 pb-4 gap-4">
                      <div>
                        <span className="text-xxs text-primary-gold uppercase tracking-widest font-bold">Order Placement</span>
                        <h4 className="text-lg font-playfair font-bold text-text-light mt-1">Order #{order.id}</h4>
                        <div className="flex items-center text-xxs text-text-muted mt-0.5">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <span className="text-xxs text-text-muted uppercase tracking-widest block">Total Cost</span>
                        <span className="text-xl font-bold text-text-light">${order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Expandable products preview */}
                    <div className="space-y-3">
                      <p className="text-xxs text-primary-gold uppercase tracking-wider font-semibold">Curation Items</p>
                      <div className="grid grid-cols-1 gap-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-text-light font-playfair">{item.product_name}</span>
                              <span className="text-text-muted text-xxs">({item.size})</span>
                            </div>
                            <span className="text-text-muted">Qty: {item.quantity} &bull; ${item.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tracking Status Timeline */}
                    {order.status !== 'Cancelled' ? (
                      <div className="pt-4 border-t border-primary-gold/5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xxs text-text-muted uppercase tracking-wider flex items-center">
                            <Truck className="w-3.5 h-3.5 mr-1 text-primary-gold" />
                            <span>Tracking: <strong className="font-mono text-text-light font-medium ml-1">{order.tracking_number}</strong></span>
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            order.status === 'Delivered'
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-primary-gold/15 text-primary-gold'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        
                        {/* Progress Bar Visual */}
                        <div className="relative">
                          <div className="w-full bg-bg-deep rounded-full h-1">
                            <div
                              className="bg-primary-gold h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          
                          {/* Timeline Nodes */}
                          <div className="flex justify-between text-[10px] text-text-muted mt-2">
                            <span className={order.status === 'Pending' || order.status === 'Shipped' || order.status === 'Delivered' ? 'text-primary-gold font-semibold' : ''}>Curation</span>
                            <span className={order.status === 'Shipped' || order.status === 'Delivered' ? 'text-primary-gold font-semibold' : ''}>In Transit</span>
                            <span className={order.status === 'Delivered' ? 'text-green-400 font-semibold' : ''}>Delivered</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-primary-gold/5 flex items-center space-x-2 text-red-400 text-xs font-semibold uppercase">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Order Cancelled</span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;
