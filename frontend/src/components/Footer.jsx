import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-bg-deep border-t border-primary-gold/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-playfair font-bold text-primary-gold tracking-widest">
              Aab-e-Hayat
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Timeless luxury fragrances and traditional attars distilled from pure natural ingredients. Experience the Water of Life.
            </p>
          </div>
          
          {/* Collections */}
          <div>
            <h4 className="text-xs font-semibold text-primary-gold uppercase tracking-wider mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link to="/products?category=oud" className="hover:text-primary-gold transition-colors duration-200">
                  Oud Collection
                </Link>
              </li>
              <li>
                <Link to="/products?category=rose" className="hover:text-primary-gold transition-colors duration-200">
                  Rose & Jasmine
                </Link>
              </li>
              <li>
                <Link to="/products?category=sandalwood" className="hover:text-primary-gold transition-colors duration-200">
                  Mysore Sandalwood
                </Link>
              </li>
              <li>
                <Link to="/products?category=mitti" className="hover:text-primary-gold transition-colors duration-200">
                  Monsoon Mitti Attar
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Information */}
          <div>
            <h4 className="text-xs font-semibold text-primary-gold uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link to="/quiz" className="hover:text-primary-gold transition-colors duration-200">
                  Fragrance Advisor Quiz
                </Link>
              </li>
              <li>
                <span className="cursor-not-allowed">
                  Shipping & Returns
                </span>
              </li>
              <li>
                <span className="cursor-not-allowed">
                  FAQ
                </span>
              </li>
              <li>
                <span className="cursor-not-allowed">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>
          
          {/* Address */}
          <div>
            <h4 className="text-xs font-semibold text-primary-gold uppercase tracking-wider mb-4">
              House of Aab-e-Hayat
            </h4>
            <p className="text-sm text-text-muted leading-relaxed">
              123 Perfume Lane, Fragrance District<br />
              Colaba, Mumbai, MH - 400001<br />
              India
            </p>
          </div>
          
        </div>
        
        {/* Border / Copyright */}
        <div className="border-t border-primary-gold/5 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted space-y-4 sm:space-y-0">
          <p>
            &copy; {new Date().getFullYear()} Aab-e-Hayat. All rights reserved. The Water of Life.
          </p>
          <div className="flex space-x-6">
            <span>Crafted with Passion & Tradition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
