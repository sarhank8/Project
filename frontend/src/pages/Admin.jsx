import React, { useState, useEffect } from 'react';
import { ShieldCheck, LayoutDashboard, Database, ClipboardList, Ticket, AlertTriangle, Plus, Trash2, Edit2, RotateCw } from 'lucide-react';
import api from '../services/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // PRODUCT CRUD FORM STATES
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: 0, stock: 10, category_id: '', image_url: '',
    top_notes: '', heart_notes: '', base_notes: '', is_signature: false
  });

  // COUPON FORM STATES
  const [couponForm, setCouponForm] = useState({ code: '', discount_percentage: 10, is_active: true, expiry_date: '' });

  // ORDER UPDATE STATES
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderUpdate, setOrderUpdate] = useState({ status: '', tracking_number: '' });

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const statsRes = await api.get('/admin/dashboard');
        setStats(statsRes.data);

        const prodRes = await api.get('/products');
        setProducts(prodRes.data);

        const catRes = await api.get('/products/categories');
        setCategories(catRes.data);

        const orderRes = await api.get('/admin/orders');
        setOrders(orderRes.data);

        const couponRes = await api.get('/admin/coupons');
        setCoupons(couponRes.data);
      } catch (err) {
        console.error("Error loading administrative data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [refreshTrigger]);

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        category_id: productForm.category_id ? Number(productForm.category_id) : null
      };

      if (editingProductId) {
        await api.put(`/admin/products/${editingProductId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      
      setShowProductForm(false);
      setEditingProductId(null);
      setProductForm({ name: '', description: '', price: 0, stock: 10, category_id: '', image_url: '', top_notes: '', heart_notes: '', base_notes: '', is_signature: false });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save product.");
    }
  };

  const handleEditProductClick = (prod) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      stock: prod.stock,
      category_id: prod.category_id || '',
      image_url: prod.image_url || '',
      top_notes: prod.top_notes || '',
      heart_notes: prod.heart_notes || '',
      base_notes: prod.base_notes || '',
      is_signature: prod.is_signature
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Order CRUD
  const handleOrderUpdateSubmit = async (e, orderId) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${orderId}`, {
        status: orderUpdate.status,
        tracking_number: orderUpdate.tracking_number || null
      });
      setUpdatingOrderId(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const startOrderUpdate = (order) => {
    setUpdatingOrderId(order.id);
    setOrderUpdate({ status: order.status, tracking_number: order.tracking_number || '' });
  };

  // Coupon CRUD
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        ...couponForm,
        discount_percentage: Number(couponForm.discount_percentage),
        expiry_date: couponForm.expiry_date || null
      });
      setCouponForm({ code: '', discount_percentage: 10, is_active: true, expiry_date: '' });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && refreshTrigger === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-text-light">
        <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-playfair text-xl tracking-wider">Acquiring Console Credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      
      {/* Page Title */}
      <div className="flex justify-between items-center border-b border-primary-gold/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-primary-gold">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-widest">Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-playfair font-bold text-text-light">Aab-e-Hayat Dashboard</h1>
        </div>
        <button
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="p-2.5 rounded-lg bg-bg-card hover:bg-white/5 border border-primary-gold/10 text-primary-gold transition-colors"
          title="Refresh Data"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-primary-gold/5 pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-primary-gold text-bg-deep font-bold'
              : 'text-text-muted hover:text-text-light hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'inventory'
              ? 'bg-primary-gold text-bg-deep font-bold'
              : 'text-text-muted hover:text-text-light hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-primary-gold text-bg-deep font-bold'
              : 'text-text-muted hover:text-text-light hover:bg-white/5'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'coupons'
              ? 'bg-primary-gold text-bg-deep font-bold'
              : 'text-text-muted hover:text-text-light hover:bg-white/5'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Coupons</span>
        </button>
      </div>

      {/* 4. CONTENT SECTIONS */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-10 animate-fadeIn">
          {/* STATS MATRIX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-xl shadow-md space-y-2">
              <span className="text-xxs text-text-muted uppercase tracking-widest font-semibold">Total Revenue</span>
              <p className="text-3xl font-bold text-primary-gold">${stats.total_revenue.toFixed(2)}</p>
            </div>
            <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-xl shadow-md space-y-2">
              <span className="text-xxs text-text-muted uppercase tracking-widest font-semibold">Total Orders</span>
              <p className="text-3xl font-bold text-text-light">{stats.total_orders}</p>
            </div>
            <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-xl shadow-md space-y-2">
              <span className="text-xxs text-text-muted uppercase tracking-widest font-semibold">Total Customers</span>
              <p className="text-3xl font-bold text-text-light">{stats.total_customers}</p>
            </div>
            <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-xl shadow-md space-y-2">
              <span className="text-xxs text-text-muted uppercase tracking-widest font-semibold">Fragrance Profiles</span>
              <p className="text-3xl font-bold text-text-light">{stats.total_products}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LOW INVENTORY SECTION */}
            <div className="bg-bg-card border border-primary-gold/15 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-lg font-playfair font-bold text-text-light flex items-center border-b border-primary-gold/10 pb-3">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary-gold" />
                <span>Low Inventory Stock (&lt; 5 units)</span>
              </h3>
              
              {stats.low_stock_products.length === 0 ? (
                <p className="text-xs text-text-muted italic">All fragrance inventory is sufficiently stocked.</p>
              ) : (
                <div className="space-y-4">
                  {stats.low_stock_products.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-sm bg-bg-deep/40 p-3 rounded-lg border border-red-500/10">
                      <div>
                        <p className="font-semibold text-text-light font-playfair">{p.name}</p>
                        <p className="text-xxs text-text-muted mt-0.5">Item Price: ${p.price}</p>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-500/10 text-red-400">
                        {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT TRANSACTIONS */}
            <div className="bg-bg-card border border-primary-gold/15 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <h3 className="text-lg font-playfair font-bold text-text-light flex items-center border-b border-primary-gold/10 pb-3">
                <ClipboardList className="w-5 h-5 mr-2 text-primary-gold" />
                <span>Recent Shop Transactions</span>
              </h3>
              
              {stats.recent_orders.length === 0 ? (
                <p className="text-xs text-text-muted italic">No purchases recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats.recent_orders.map((o) => (
                    <div key={o.id} className="flex justify-between items-center text-sm bg-bg-deep/40 p-3 rounded-lg border border-primary-gold/5">
                      <div>
                        <p className="font-semibold text-text-light">Order #{o.id}</p>
                        <p className="text-xxs text-text-muted mt-0.5">{o.customer_name} &bull; {new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-primary-gold">${o.total_amount.toFixed(2)}</p>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary-gold/10 text-primary-gold">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-playfair font-bold text-text-light">Products Directory</h3>
            <button
              onClick={() => {
                setEditingProductId(null);
                setProductForm({ name: '', description: '', price: 0, stock: 10, category_id: '', image_url: '', top_notes: '', heart_notes: '', base_notes: '', is_signature: false });
                setShowProductForm(!showProductForm);
              }}
              className="flex items-center space-x-1 bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-2.5 px-5 rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showProductForm ? 'Close Form' : 'Add Scent'}</span>
            </button>
          </div>

          {/* Product Creation/Editing Form */}
          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="bg-bg-card border border-primary-gold/20 p-6 sm:p-8 rounded-xl shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <h4 className="sm:col-span-2 text-sm font-bold uppercase tracking-wider text-primary-gold mb-2 border-b border-primary-gold/10 pb-2">
                {editingProductId ? 'Edit Fragrance Extract' : 'Publish New Fragrance Extract'}
              </h4>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Fragrance Name</label>
                <input
                  type="text" required
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Royal Oudh"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Category</label>
                <select
                  required
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                >
                  <option value="">Choose Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Base Price ($)</label>
                <input
                  type="number" step="0.01" required
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Stock Count</label>
                <input
                  type="number" required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Image URL</label>
                <input
                  type="text"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                  placeholder="https://images.unsplash.com..."
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Top Notes</label>
                <input
                  type="text"
                  value={productForm.top_notes}
                  onChange={(e) => setProductForm({...productForm, top_notes: e.target.value})}
                  placeholder="Damask Rose, Saffron"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Heart Notes</label>
                <input
                  type="text"
                  value={productForm.heart_notes}
                  onChange={(e) => setProductForm({...productForm, heart_notes: e.target.value})}
                  placeholder="Labdanum, Vanilla"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Base Notes</label>
                <input
                  type="text"
                  value={productForm.base_notes}
                  onChange={(e) => setProductForm({...productForm, base_notes: e.target.value})}
                  placeholder="Agarwood (Oud), Sandalwood"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_signature"
                  checked={productForm.is_signature}
                  onChange={(e) => setProductForm({...productForm, is_signature: e.target.checked})}
                  className="accent-primary-gold"
                />
                <label htmlFor="is_signature" className="text-xs uppercase font-bold text-text-muted cursor-pointer">
                  Mark as Signature Scent
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Product Description</label>
                <textarea
                  rows="3" required
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  placeholder="Describe olfactory notes, distilling details..."
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                ></textarea>
              </div>

              <div className="sm:col-span-2 flex gap-4 justify-end text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="text-text-muted hover:text-white px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-gold hover:bg-yellow-700 text-bg-deep px-6 py-2.5 rounded"
                >
                  Save Product
                </button>
              </div>
            </form>
          )}

          {/* Products List Table */}
          <div className="bg-bg-card border border-primary-gold/15 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 bg-bg-deep/40 text-xxs font-semibold uppercase tracking-wider text-primary-gold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Signature</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {products.map(p => (
                  <tr key={p.id} className="text-xs">
                    <td className="p-4 font-playfair font-bold text-text-light">{p.name}</td>
                    <td className="p-4 text-text-muted">${p.price.toFixed(2)}</td>
                    <td className="p-4 text-text-muted">{p.stock} units</td>
                    <td className="p-4">
                      {p.is_signature ? (
                        <span className="text-[9px] uppercase font-bold bg-primary-gold/15 text-primary-gold px-2 py-0.5 rounded">
                          Yes
                        </span>
                      ) : (
                        <span className="text-[9px] text-text-muted">No</span>
                      )}
                    </td>
                    <td className="p-4 flex space-x-3">
                      <button
                        onClick={() => handleEditProductClick(p)}
                        className="text-primary-gold hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-8 animate-fadeIn">
          <h3 className="text-xl font-playfair font-bold text-text-light">Store Orders</h3>

          <div className="bg-bg-card border border-primary-gold/15 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-primary-gold/10 bg-bg-deep/40 text-xxs font-semibold uppercase tracking-wider text-primary-gold">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tracking Code</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="p-4 font-bold text-text-light">#{o.id}</td>
                    <td className="p-4 text-text-muted">{o.address?.street ? `${o.address.street}, ${o.address.city}` : "Unknown Location"}</td>
                    <td className="p-4 font-semibold text-text-light">${o.total_amount.toFixed(2)}</td>
                    <td className="p-4">
                      {updatingOrderId === o.id ? (
                        <select
                          value={orderUpdate.status}
                          onChange={(e) => setOrderUpdate({ ...orderUpdate, status: e.target.value })}
                          className="bg-bg-deep border border-primary-gold/30 rounded p-1 text-xs text-text-light"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          o.status === 'Delivered' ? 'bg-green-500/15 text-green-400' :
                          o.status === 'Cancelled' ? 'bg-red-500/15 text-red-400' : 'bg-primary-gold/15 text-primary-gold'
                        }`}>
                          {o.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {updatingOrderId === o.id ? (
                        <input
                          type="text"
                          value={orderUpdate.tracking_number}
                          onChange={(e) => setOrderUpdate({ ...orderUpdate, tracking_number: e.target.value })}
                          placeholder="TRK-12345"
                          className="bg-bg-deep border border-primary-gold/30 rounded p-1 text-xs text-text-light w-32"
                        />
                      ) : (
                        <span className="font-mono text-text-muted">{o.tracking_number || '-'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {updatingOrderId === o.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleOrderUpdateSubmit(e, o.id)}
                            className="bg-primary-gold text-bg-deep font-bold px-2 py-1 rounded text-xxs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setUpdatingOrderId(null)}
                            className="text-text-muted hover:text-white px-2 py-1 text-xxs font-bold"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startOrderUpdate(o)}
                          className="text-primary-gold hover:text-white font-bold text-xs"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
          
          {/* Coupon creation panel */}
          <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-xl shadow-xl space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary-gold border-b border-primary-gold/10 pb-2">
              Create Coupon Code
            </h4>
            
            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Coupon Code</label>
                <input
                  type="text" required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="FESTIVE25"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Discount Percentage (%)</label>
                <input
                  type="number" min="1" max="100" required
                  value={couponForm.discount_percentage}
                  onChange={(e) => setCouponForm({ ...couponForm, discount_percentage: e.target.value })}
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Expiry Date (YYYY-MM-DD)</label>
                <input
                  type="text"
                  value={couponForm.expiry_date}
                  onChange={(e) => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                  placeholder="2026-12-31"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-2.5 rounded text-xs transition-colors"
              >
                Create Coupon
              </button>
            </form>
          </div>

          {/* Coupon list panel */}
          <div className="lg:col-span-2 bg-bg-card border border-primary-gold/15 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-primary-gold/10 bg-bg-deep/40 text-xxs font-semibold uppercase tracking-wider text-primary-gold">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td className="p-4 font-bold text-text-light font-mono">{c.code}</td>
                    <td className="p-4 text-text-muted">{c.discount_percentage}% OFF</td>
                    <td className="p-4">
                      {c.is_active ? (
                        <span className="text-[9px] uppercase font-bold bg-green-500/15 text-green-400 px-2 py-0.5 rounded">Active</span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-text-muted">{c.expiry_date || 'No Expiry'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default Admin;
