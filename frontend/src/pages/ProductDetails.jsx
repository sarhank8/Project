import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, getItemPrice } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistItemId } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('6ml');
  const [quantity, setQuantity] = useState(1);
  
  // Review Submission Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, reviewSuccess]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-text-light">
        <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-playfair text-xl tracking-wider">Unveiling Scent Profile...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-2xl font-bold text-text-light">Fragrance Profile Not Found</h2>
        <Link to="/products" className="bg-primary-gold text-bg-deep font-bold py-2.5 px-6 rounded-lg">
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);
  const wishlistItemId = getWishlistItemId(product.id);
  const displayedPrice = getItemPrice(product.price, selectedSize) * quantity;

  const handleWishlistToggle = () => {
    if (isFav) {
      removeFromWishlist(wishlistItemId);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);
    setSubmittingReview(true);

    try {
      await api.post(`/products/${product.id}/reviews`, {
        rating,
        comment,
        product_id: product.id
      });
      setReviewSuccess(true);
      setComment('');
    } catch (err) {
      setReviewError(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calculate average rating
  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      
      {/* 1. PRODUCT DETAILS ROW */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Column: Image and Olfactory Details */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div className="aspect-square bg-bg-card rounded-2xl overflow-hidden border border-primary-gold/15 shadow-2xl relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.is_signature && (
              <span className="absolute top-6 left-6 bg-primary-gold text-bg-deep font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded">
                Signature Extract
              </span>
            )}
          </div>

          {/* OLFACTORY PYRAMID VISUAL */}
          <div className="bg-bg-card border border-primary-gold/15 p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-sm font-bold text-primary-gold uppercase tracking-wider border-b border-primary-gold/10 pb-2">
              Olfactory Pyramid
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <span className="text-xs uppercase font-bold text-primary-gold w-24 pt-0.5 tracking-wider">Top Notes:</span>
                <p className="text-sm text-text-light">{product.top_notes || 'Saffron, Citrus'}</p>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-xs uppercase font-bold text-primary-gold w-24 pt-0.5 tracking-wider">Heart Notes:</span>
                <p className="text-sm text-text-light">{product.heart_notes || 'Jasmine, Patchouli'}</p>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-xs uppercase font-bold text-primary-gold w-24 pt-0.5 tracking-wider">Base Notes:</span>
                <p className="text-sm text-text-light">{product.base_notes || 'Oud, Sandalwood, Musk'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Descriptions and Checkout Settings */}
        <div className="w-full lg:w-1/2 space-y-8">
          
          <div>
            <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light mb-2">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center space-x-4">
              {avgRating ? (
                <div className="flex items-center space-x-1.5 text-primary-gold">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(avgRating)) ? 'fill-primary-gold' : 'text-text-muted/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-text-light">{avgRating}</span>
                  <span className="text-sm text-text-muted">({product.reviews.length} reviews)</span>
                </div>
              ) : (
                <span className="text-xs text-text-muted">No reviews yet</span>
              )}
            </div>
          </div>

          <p className="text-base text-text-muted leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-6 pt-6 border-t border-primary-gold/10">
            
            {/* Size Picker */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Select Bottle Size</span>
              <div className="flex gap-4">
                {['3ml', '6ml', '12ml'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-grow py-3 rounded-lg border text-sm font-bold transition-all duration-300 ${
                      selectedSize === size
                        ? 'bg-primary-gold border-primary-gold text-bg-deep'
                        : 'bg-bg-deep border-primary-gold/15 hover:border-primary-gold/60 text-text-light'
                    }`}
                  >
                    {size}
                    <span className="block text-xxs font-normal opacity-80">
                      {size === '3ml' ? 'Pocket extract' : size === '12ml' ? 'Royal standard' : 'Curator tola'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector and Price */}
            <div className="flex items-center justify-between gap-6">
              
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Quantity</span>
                <div className="flex items-center border border-primary-gold/15 rounded-lg bg-bg-deep">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-primary-gold hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-text-light">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-primary-gold hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Total Price</span>
                <span className="text-3xl font-bold text-text-light">${displayedPrice.toFixed(2)}</span>
              </div>

            </div>

            {/* Shopping CTA triggers */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-grow flex items-center justify-center space-x-2 bg-primary-gold hover:bg-yellow-700 disabled:bg-primary-gold/20 text-bg-deep font-bold py-4 rounded-xl shadow-lg hover:shadow-primary-gold/10 transition-all duration-300 transform hover:scale-[1.01]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Shopping Bag'}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isFav
                    ? 'bg-primary-gold/15 border-primary-gold text-primary-gold'
                    : 'bg-bg-deep border-primary-gold/15 hover:border-primary-gold text-primary-gold'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFav ? 'fill-primary-gold' : ''}`} />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 2. REVIEWS SECTION */}
      <div className="border-t border-primary-gold/15 pt-12 space-y-12">
        
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-playfair font-bold text-text-light">
            Customer Reflections ({product.reviews.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-text-muted text-sm italic">Be the first to leave a reflection on this luxury extract.</p>
            ) : (
              product.reviews.map((review) => (
                <div key={review.id} className="bg-bg-card border border-primary-gold/5 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-text-light">{review.user_name || "Anonymous User"}</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? 'fill-primary-gold text-primary-gold' : 'text-text-muted/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-xxs text-text-muted">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Review Panel */}
          <div className="bg-bg-card border border-primary-gold/15 p-6 sm:p-8 rounded-xl shadow-xl space-y-6 h-fit">
            <h4 className="text-lg font-playfair font-bold text-text-light">Leave a Reflection</h4>
            
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {/* Stars selector */}
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Rating</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-primary-gold hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= rating ? 'fill-primary-gold' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment area */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Comments</label>
                  <textarea
                    rows="3"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your olfactory experience..."
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg p-3 text-sm text-text-light focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all duration-300"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-2.5 rounded-lg text-sm transition-colors duration-300"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Reflection'}
                </button>

                {reviewError && <p className="text-xs font-semibold text-red-400">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs font-semibold text-primary-gold">Reflection posted successfully!</p>}

              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-text-muted leading-relaxed">
                  You must be signed in to post product reviews.
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-primary-gold/10 border border-primary-gold/30 hover:bg-primary-gold text-primary-gold hover:text-bg-deep font-bold py-2 px-6 rounded-lg text-sm transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            )}
            
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetails;
