import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product, wishlistItemId) => {
    addToCart(product, 1, '6ml');
    removeFromWishlist(wishlistItemId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-playfair font-bold text-text-light">Your Wishlist is Empty</h2>
        <p className="text-sm text-text-muted max-w-sm mx-auto">
          You haven't saved any extracts yet. Browse our selection and click the heart icon on any fragrance to save it here.
        </p>
        <Link
          to="/products"
          className="inline-block bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3 px-8 rounded-lg transition-all duration-300"
        >
          Explore Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light mb-12">
        My Wishlist
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishlistItems.map((item) => {
          const product = item.product;
          
          // Calculate rating
          const avgRating = product.reviews && product.reviews.length > 0
            ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
            : null;

          return (
            <div key={item.id} className="bg-bg-card border border-primary-gold/10 rounded-xl overflow-hidden shadow-xl hover:border-primary-gold/30 transition-all duration-300 flex flex-col justify-between">
              
              <div className="relative pt-[100%] overflow-hidden bg-bg-deep">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Remove from wishlist */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-bg-deep/80 text-red-400 hover:text-red-500 hover:scale-110 transition-all"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                
                <div>
                  <Link to={`/products/${product.id}`} className="block">
                    <h3 className="font-playfair font-bold text-lg text-text-light hover:text-primary-gold truncate">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {avgRating && (
                    <div className="flex items-center space-x-1 mt-1 text-primary-gold">
                      <Star className="w-3 h-3 fill-primary-gold" />
                      <span className="text-xxs text-text-muted">{avgRating} ({product.reviews.length})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-primary-gold/5">
                  <span className="font-bold text-text-light">${product.price.toFixed(2)}</span>
                  
                  <button
                    onClick={() => handleMoveToCart(product, item.id)}
                    className="flex items-center space-x-1 px-3.5 py-2 rounded bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold text-xs transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
