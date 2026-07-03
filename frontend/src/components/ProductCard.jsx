import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist();

  const isFav = isInWishlist(product.id);
  const wishlistItemId = getWishlistItemId(product.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFromWishlist(wishlistItemId);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, '6ml');
  };

  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="group relative bg-bg-card border border-primary-gold/10 rounded-xl overflow-hidden shadow-2xl hover:border-primary-gold/40 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      
      {/* Product Image Container */}
      <Link to={`/products/${product.id}`} className="relative block pt-[100%] overflow-hidden bg-bg-deep">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Signature Tag */}
        {product.is_signature && (
          <span className="absolute top-4 left-4 bg-primary-gold text-bg-deep font-bold text-xxs tracking-widest uppercase px-3 py-1 rounded">
            Signature Scents
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-bg-deep/80 hover:bg-bg-deep border border-primary-gold/10 hover:border-primary-gold text-primary-gold hover:scale-110 transition-all duration-300 z-10 focus:outline-none"
        >
          <Heart className={`w-4.5 h-4.5 ${isFav ? 'fill-primary-gold' : ''}`} />
        </button>
      </Link>
      
      {/* Product Details */}
      <div className="p-6 flex-grow flex flex-col justify-between">
        
        <div>
          {/* Notes summary preview */}
          {product.top_notes && (
            <p className="text-[10px] text-primary-gold uppercase tracking-wider font-semibold mb-2 truncate">
              {product.top_notes}
            </p>
          )}
          
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="text-xl font-playfair font-bold text-text-light group-hover:text-primary-gold transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-sm text-text-muted mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-primary-gold/5 flex items-center justify-between">
          
          {/* Price & Rating */}
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-text-light">
              ${product.price.toFixed(2)}
            </span>
            {avgRating ? (
              <div className="flex items-center space-x-1 mt-1 text-primary-gold">
                <Star className="w-3.5 h-3.5 fill-primary-gold" />
                <span className="text-xs font-semibold text-text-muted">{avgRating} ({product.reviews.length})</span>
              </div>
            ) : (
              <span className="text-xxs text-text-muted mt-1">No reviews yet</span>
            )}
          </div>
          
          {/* Add To Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center p-3 rounded-lg bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold transition-colors duration-300"
            title="Add 6ml to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          
        </div>
        
      </div>
      
    </div>
  );
};

export default ProductCard;
