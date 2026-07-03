import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ChevronRight, CheckCircle, Package, ArrowLeft, Plus } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, subtotal, clearCart, getItemPrice } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Coupon state passed from Cart Page
  const couponCode = location.state?.couponCode || null;
  const discountPercent = location.state?.discountPercent || 0;

  // Checkout States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Address, 2: Payment
  const [completedOrder, setCompletedOrder] = useState(null);

  // New Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', postal_code: '', country: 'India', is_default: false
  });

  // Credit Card Simulation State
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  useEffect(() => {
    if (cartItems.length === 0 && !completedOrder) {
      navigate('/cart');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        setAddresses(res.data);
        const defaultAddr = res.data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (res.data.length > 0) {
          setSelectedAddressId(res.data[0].id);
        }
      } catch (err) {
        console.error("Error loading addresses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [cartItems, navigate]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      setAddresses([...addresses, res.data]);
      setSelectedAddressId(res.data.id);
      setShowAddressForm(false);
      setNewAddress({ street: '', city: '', state: '', postal_code: '', country: 'India', is_default: false });
    } catch (err) {
      console.error("Error creating address", err);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) return;

    setSubmittingOrder(true);
    try {
      const res = await api.post('/orders', {
        address_id: selectedAddressId,
        coupon_code: couponCode
      });
      setCompletedOrder(res.data);
      clearCart(); // Local cart reset
    } catch (err) {
      console.error("Error creating order", err);
      alert(err.response?.data?.detail || "Checkout failed. Please verify details.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Billing math
  const shippingFee = subtotal > 100 ? 0 : 10;
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount + shippingFee;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-text-light">
        <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-playfair text-xl tracking-wider">Securing Checkout Portal...</p>
      </div>
    );
  }

  /* ORDER SUCCESS SCREEN */
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-10 animate-fadeIn">
        <div className="bg-bg-card border border-primary-gold/30 rounded-2xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-primary-gold/15 text-primary-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>
          
          <span className="text-xs text-primary-gold uppercase tracking-widest font-bold">Transaction Secured</span>
          <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light">Order Placed Successfully!</h1>
          
          <p className="text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
            Thank you for choosing Aab-e-Hayat. Your order has been registered and is undergoing curation. Below are your shipping and tracking codes.
          </p>

          <div className="bg-bg-deep/60 border border-primary-gold/10 p-6 rounded-xl text-left space-y-3 max-w-md mx-auto text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Order ID:</span>
              <span className="font-bold text-text-light">#{completedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Paid:</span>
              <span className="font-bold text-primary-gold">${completedOrder.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Tracking Code:</span>
              <span className="font-mono text-xs font-bold text-text-light">{completedOrder.tracking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Status:</span>
              <span className="font-bold uppercase tracking-wider text-xs px-2.5 py-0.5 rounded bg-primary-gold/15 text-primary-gold">{completedOrder.status}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              to="/profile"
              className="bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3.5 px-8 rounded-lg text-sm transition-all duration-300"
            >
              Track Order History
            </Link>
            <Link
              to="/products"
              className="bg-bg-deep hover:bg-white/5 border border-primary-gold/25 hover:border-primary-gold text-primary-gold font-bold py-3.5 px-8 rounded-lg text-sm transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light mb-12">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* LEFT COLUMN: STEPS */}
        <div className="flex-grow space-y-8 w-full">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          <div className={`bg-bg-card border rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 ${
            checkoutStep === 1 ? 'border-primary-gold/30' : 'border-primary-gold/10 opacity-70'
          }`}>
            <div className="flex items-center space-x-3 mb-6 border-b border-primary-gold/10 pb-4">
              <div className="w-8 h-8 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="text-lg font-playfair font-bold text-text-light flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-gold" />
                <span>Shipping Address</span>
              </h3>
            </div>

            {checkoutStep === 1 ? (
              <div className="space-y-6">
                
                {/* Address selection cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`text-left p-5 rounded-xl border text-sm transition-all duration-300 relative ${
                        selectedAddressId === addr.id
                          ? 'bg-primary-gold/5 border-primary-gold text-text-light'
                          : 'bg-bg-deep/60 border-primary-gold/10 hover:border-primary-gold/50 text-text-muted'
                      }`}
                    >
                      <p className="font-semibold text-text-light">
                        {addr.street}
                      </p>
                      <p className="text-xs mt-1 text-text-muted">
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="text-xxs text-text-muted mt-2 uppercase tracking-widest">{addr.country}</p>
                      {addr.is_default && (
                        <span className="absolute top-3 right-3 text-xxs text-primary-gold font-bold bg-primary-gold/10 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                  
                  {/* Add New Address Card */}
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="p-5 rounded-xl border border-dashed border-primary-gold/25 hover:border-primary-gold text-primary-gold flex flex-col justify-center items-center text-sm space-y-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-bold">Add New Address</span>
                  </button>
                </div>

                {/* Create Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-bg-deep/50 border border-primary-gold/15 rounded-xl p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-gold mb-2">New Address Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                          placeholder="123 Scent Lane"
                          className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          placeholder="Mumbai"
                          className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          placeholder="Maharashtra"
                          className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={newAddress.postal_code}
                          onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                          placeholder="400001"
                          className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Country</label>
                        <input
                          type="text"
                          required
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                          className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2 text-xs text-text-light focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2 justify-end text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-text-muted hover:text-white px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary-gold hover:bg-yellow-700 text-bg-deep px-5 py-2 rounded"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                )}

                {/* Continue button */}
                <div className="flex justify-end pt-4 border-t border-primary-gold/10">
                  <button
                    disabled={!selectedAddressId}
                    onClick={() => setCheckoutStep(2)}
                    className="flex items-center space-x-2 bg-primary-gold hover:bg-yellow-700 disabled:bg-primary-gold/30 text-bg-deep font-bold py-3 px-8 rounded-lg text-xs"
                  >
                    <span>Continue to Payment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              // Step summary view when completed
              selectedAddressId && (
                <div className="flex justify-between items-center text-sm">
                  <div>
                    {addresses.find(a => a.id === selectedAddressId) && (
                      <p className="text-text-muted font-medium">
                        {addresses.find(a => a.id === selectedAddressId).street},{' '}
                        {addresses.find(a => a.id === selectedAddressId).city}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="text-primary-gold hover:text-white font-bold text-xs"
                  >
                    Change Address
                  </button>
                </div>
              )
            )}
          </div>

          {/* STEP 2: PAYMENT METHOD & CREDIT CARD FLOW */}
          <div className={`bg-bg-card border rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 ${
            checkoutStep === 2 ? 'border-primary-gold/30' : 'border-primary-gold/10 opacity-70'
          }`}>
            <div className="flex items-center space-x-3 mb-6 border-b border-primary-gold/10 pb-4">
              <div className="w-8 h-8 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="text-lg font-playfair font-bold text-text-light flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary-gold" />
                <span>Secure Card Payment</span>
              </h3>
            </div>

            {checkoutStep === 2 && (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={card.name}
                      onChange={(e) => setCard({...card, name: e.target.value})}
                      placeholder="Abdul Ahad Saiyed"
                      className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2.5 text-xs text-text-light focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      value={card.number}
                      onChange={(e) => setCard({...card, number: e.target.value})}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2.5 text-xs text-text-light focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength="5"
                      value={card.expiry}
                      onChange={(e) => setCard({...card, expiry: e.target.value})}
                      placeholder="MM/YY"
                      className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2.5 text-xs text-text-light focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength="3"
                      value={card.cvv}
                      onChange={(e) => setCard({...card, cvv: e.target.value})}
                      placeholder="•••"
                      className="w-full bg-bg-deep border border-primary-gold/15 rounded p-2.5 text-xs text-text-light focus:outline-none"
                    />
                  </div>
                </div>

                {/* Back / Checkout Buttons */}
                <div className="flex justify-between pt-6 border-t border-primary-gold/10">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="flex items-center space-x-1 text-xs font-semibold text-text-muted hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Address</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="bg-primary-gold hover:bg-yellow-700 disabled:bg-primary-gold/20 text-bg-deep font-bold py-3.5 px-8 rounded-lg text-xs"
                  >
                    {submittingOrder ? 'Processing...' : `Pay & Place Order ($${total.toFixed(2)})`}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY COLUMN */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-bg-card border border-primary-gold/20 p-6 rounded-2xl shadow-xl space-y-6">
          <h4 className="text-sm font-bold text-primary-gold uppercase tracking-wider border-b border-primary-gold/10 pb-2 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            <span>Bag Summary</span>
          </h4>

          {/* Simple lists */}
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 divide-y divide-primary-gold/5">
            {cartItems.map((item) => {
              const sizePrice = getItemPrice(item.product.price, item.size);
              return (
                <div key={item.id} className="flex justify-between items-start text-xs pt-3 first:pt-0">
                  <div>
                    <span className="font-bold text-text-light font-playfair">{item.product.name}</span>
                    <span className="block text-xxs text-text-muted mt-0.5">Size: {item.size} &bull; Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-text-light">${(sizePrice * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {/* Billing details */}
          <div className="border-t border-primary-gold/10 pt-4 space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {couponCode && (
              <div className="flex justify-between text-primary-gold font-semibold">
                <span>Coupon ({couponCode})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-text-muted">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>

            <div className="border-t border-primary-gold/10 pt-3 flex justify-between font-bold text-sm text-text-light">
              <span>Grand Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
