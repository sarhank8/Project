import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, Heart, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-deep/80 backdrop-blur-md border-b border-primary-gold/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl font-playfair font-bold tracking-widest text-primary-gold">
              Aab-e-Hayat
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-10 items-center">
            <Link to="/" className="text-sm font-semibold tracking-wide text-text-muted hover:text-primary-gold transition-colors duration-300">
              Home
            </Link>
            <Link to="/products" className="text-sm font-semibold tracking-wide text-text-muted hover:text-primary-gold transition-colors duration-300">
              Collection
            </Link>
            <Link to="/quiz" className="text-sm font-semibold tracking-wide text-primary-gold hover:text-white transition-colors duration-300 px-3 py-1 border border-primary-gold/30 rounded-full bg-primary-gold/5">
              Fragrance Quiz
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 text-text-muted hover:text-primary-gold transition-colors duration-300">
              <Heart className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary-gold text-bg-deep font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-2 text-text-muted hover:text-primary-gold transition-colors duration-300">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-gold text-bg-deep font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-text-muted hover:text-primary-gold focus:outline-none transition-colors duration-300 py-1"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.full_name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-bg-card border border-primary-gold/20 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-primary-gold/10">
                      <p className="text-xs text-text-muted">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-text-light">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-text-muted hover:text-primary-gold hover:bg-white/5 transition-colors duration-200"
                    >
                      My Profile & Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-primary-gold hover:bg-primary-gold/10 font-medium transition-colors duration-200"
                      >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary-gold/10 border border-primary-gold/30 hover:bg-primary-gold text-primary-gold hover:text-bg-deep font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-text-muted hover:text-primary-gold">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-gold text-bg-deep font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-primary-gold hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-card/95 border-t border-primary-gold/20 backdrop-blur-lg animate-fadeIn">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-text-muted hover:text-primary-gold hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-text-muted hover:text-primary-gold hover:bg-white/5"
            >
              Collection
            </Link>
            <Link
              to="/quiz"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-primary-gold hover:bg-primary-gold/10"
            >
              Fragrance Quiz
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-text-muted hover:text-primary-gold hover:bg-white/5"
            >
              Wishlist ({wishlistItems.length})
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-text-muted hover:text-primary-gold hover:bg-white/5"
                >
                  My Profile & Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-primary-gold hover:bg-primary-gold/10 font-bold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3 rounded-lg transition-colors duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
