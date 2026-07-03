import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, getItemPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    setActiveCoupon(null);
    setValidatingCoupon(true);

    if (!isAuthenticated) {
      setCouponError("Please sign in to apply coupon codes.");
      setValidatingCoupon(false);
      return;
    }

    try {
      const res = await api.get(`/coupons/validate/${couponCode}`);
      setActiveCoupon(res.data);
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.detail || "Invalid coupon code.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponError('');
  };

  // Calculations
  const shippingFee = subtotal > 100 ? 0 : (cartItems.length > 0 ? 10 : 0);
  const discountAmount = activeCoupon ? subtotal * (activeCoupon.discount_percentage / 100) : 0;
  const total = subtotal - discountAmount + shippingFee;

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      // Pass coupon details to checkout state
      navigate('/checkout', {
        state: {
          couponCode: activeCoupon?.code || null,
          discountPercent: activeCoupon?.discount_percentage || 0
        }
      });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-playfair font-bold text-text-light">Your Shopping Bag is Empty</h2>
        <p className="text-sm text-text-muted max-w-sm mx-auto">
          You haven't selected any extracts yet. Explore our premium attars and oud reserves to start your journey.
        </p>
        <Link
          to="/products"
          className="inline-block bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3 px-8 rounded-lg transition-all duration-300"
        >
          View Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light mb-12">
        Shopping Bag
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* LEFT COLUMN: ITEMS LIST */}
        <div className="flex-grow space-y-6">
          <div className="bg-bg-card border border-primary-gold/15 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 bg-bg-deep/40 text-xxs font-semibold uppercase tracking-wider text-primary-gold">
                  <th className="p-6">Product</th>
                  <th className="p-6 hidden sm:table-cell">Size</th>
                  <th className="p-6">Quantity</th>
                  <th className="p-6 text-right">Price</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {cartItems.map((item) => {
                  const sizePrice = getItemPrice(item.product.price, item.size);
                  return (
                    <tr key={item.id} className="text-sm">
                      {/* Product image/title */}
                      <td className="p-6 flex items-center space-x-4">
                        <div className="w-16 h-16 bg-bg-deep rounded-lg overflow-hidden flex-shrink-0 border border-primary-gold/5">
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link to={`/products/${item.product_id}`} className="font-playfair font-bold text-text-light hover:text-primary-gold transition-colors duration-200">
                            {item.product.name}
                          </Link>
                          <span className="block text-xxs text-text-muted mt-1 uppercase tracking-wider sm:hidden">
                            Size: {item.size}
                          </span>
                        </div>
                      </td>
                      
                      {/* Size */}
                      <td className="p-6 hidden sm:table-cell font-semibold text-text-muted">
                        {item.size}
                      </td>
                      
                      {/* Quantity selector */}
                      <td className="p-6">
                        <div className="flex items-center border border-primary-gold/15 rounded bg-bg-deep w-24">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-primary-gold hover:text-white"
                          >
                            -
                          </button>
                          <span className="flex-grow text-center text-xs font-bold text-text-light">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-primary-gold hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      
                      {/* Subtotal price */}
                      <td className="p-6 text-right font-bold text-text-light">
                        ${(sizePrice * item.quantity).toFixed(2)}
                      </td>
                      
                      {/* Delete button */}
                      <td className="p-6 text-right">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <Link to="/products" className="text-sm font-semibold text-primary-gold hover:text-white transition-colors">
              &larr; Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-sm font-semibold text-red-400 hover:text-red-500 transition-colors"
            >
              Clear Bag
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SUMMARY & COUPON */}
        <div className="w-full lg:w-96 space-y-6 flex-shrink-0">
          
          {/* Coupon Code Section */}
          <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-xl shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-primary-gold uppercase tracking-wider">Coupon Code</h4>
            
            {activeCoupon ? (
              <div className="flex items-center justify-between bg-primary-gold/10 border border-primary-gold/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-primary-gold">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-bold">{activeCoupon.code} ({activeCoupon.discount_percentage}% OFF)</span>
                </div>
                <button onClick={removeCoupon} className="text-text-muted hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="WELCOME10, LUXURY20..."
                  className="flex-grow bg-bg-deep border border-primary-gold/15 rounded-lg px-3 py-2 text-xs text-text-light focus:outline-none focus:border-primary-gold"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold px-4 py-2 rounded-lg text-xs"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}
            
            {couponError && <p className="text-xxs font-semibold text-red-400">{couponError}</p>}
          </div>

          {/* Cart Summary */}
          <div className="bg-bg-card border border-primary-gold/25 p-6 rounded-xl shadow-xl space-y-6">
            <h4 className="text-sm font-bold text-primary-gold uppercase tracking-wider border-b border-primary-gold/10 pb-2">
              Summary
            </h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {activeCoupon && (
                <div className="flex justify-between text-primary-gold">
                  <span>Discount ({activeCoupon.discount_percentage}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              
              <div className="border-t border-primary-gold/10 pt-4 flex justify-between font-bold text-lg text-text-light">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center space-x-2 bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
