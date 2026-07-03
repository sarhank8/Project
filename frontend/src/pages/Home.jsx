import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Gem, Compass, Sparkles, Send } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [signatureProducts, setSignatureProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/products');
        const allProds = res.data;
        setFeaturedProducts(allProds.filter(p => !p.is_signature).slice(0, 3));
        setSignatureProducts(allProds.filter(p => p.is_signature).slice(0, 2));
      } catch (err) {
        console.error("Error loading home page products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    if (!enquiry.name || !enquiry.email || !enquiry.message) return;
    
    // Simulate successful submission
    setFormSubmitted(true);
    setEnquiry({ name: '', email: '', message: '' });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-bg-deep border-b border-primary-gold/15 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,173,103,0.08)_0,transparent_60%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-20">
          <p className="text-sm font-semibold text-primary-gold uppercase tracking-widest mb-4 animate-pulse">
            🌿 Traditional Artistry meets Modern Luxury
          </p>
          
          <h1 className="text-4xl sm:text-7xl font-playfair font-bold leading-tight text-text-light mb-8 max-w-4xl mx-auto">
            Discover <span className="text-primary-gold italic">Aab-e-Hayat</span>
            <span className="block text-2xl sm:text-4xl font-light text-text-muted mt-3 font-sans uppercase tracking-widest">
              The Water of Life
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience the timeless luxury of authentic, non-alcoholic attars and pure botanical extracts. Meticulously hydro-distilled from the world's finest natural ingredients.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-4 px-10 rounded-xl shadow-2xl shadow-primary-gold/20 transition-all duration-300 transform hover:scale-105 tracking-wide text-center"
            >
              Explore Collection
            </Link>
            <Link
              to="/quiz"
              className="w-full sm:w-auto bg-bg-card hover:bg-white/5 text-primary-gold font-bold py-4 px-10 rounded-xl border border-primary-gold/40 hover:border-primary-gold transition-all duration-300 transform hover:scale-105 tracking-wide text-center"
            >
              Find Your Fragrance
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-bg-card/40 border border-primary-gold/5 p-8 rounded-xl text-center space-y-4 hover:border-primary-gold/25 transition-all duration-300">
            <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold mx-auto">
              <Gem className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-light font-playfair tracking-wider">100% Pure Extracts</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Completely free of chemicals, alcohol, and synthetic carriers. Distilled pure, yielding long-lasting projection.
            </p>
          </div>

          <div className="bg-bg-card/40 border border-primary-gold/5 p-8 rounded-xl text-center space-y-4 hover:border-primary-gold/25 transition-all duration-300">
            <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-light font-playfair tracking-wider">Ancient Deg-Bhapka Method</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Hand-distilled in Kannauj using copper stills, capturing petrichor, Damascus rose, and creamy sandalwood organically.
            </p>
          </div>

          <div className="bg-bg-card/40 border border-primary-gold/5 p-8 rounded-xl text-center space-y-4 hover:border-primary-gold/25 transition-all duration-300">
            <div className="w-12 h-12 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-text-light font-playfair tracking-wider">Artisanal Presentation</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Housed in signature gold-trimmed crystal tola bottles, packed securely with velvet lining for a premium presentation.
            </p>
          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE QUIZ CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,173,103,0.15),transparent)] bg-bg-card border border-primary-gold/30 rounded-2xl p-8 sm:p-16 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-primary-gold">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-xs uppercase font-bold tracking-widest">Interactive Scent Advisor</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light leading-tight">
              Unsure which extract fits your style?
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Take our interactive fragrance quiz. Answer questions about your olfactory likes, wardrobe choice, and intensity preferences, and let our curator match you instantly.
            </p>
          </div>
          <button
            onClick={() => navigate('/quiz')}
            className="w-full md:w-auto whitespace-nowrap bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Start Fragrance Quiz &rarr;
          </button>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-2">
          <span className="text-xs text-primary-gold uppercase tracking-widest font-semibold">The Core Extracts</span>
          <h2 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light">
            Aab-e-Hayat Collection
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
            Explore our curated selection of classic, hydro-distilled attars.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-bg-card/40 border border-primary-gold/5 rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block text-primary-gold hover:text-white font-bold tracking-wide border-b border-primary-gold/30 hover:border-white pb-1 transition-all duration-300 text-sm"
          >
            View Full Catalogue ({featuredProducts.length + signatureProducts.length}+ Scents) &rarr;
          </Link>
        </div>
      </section>

      {/* 5. SIGNATURE SCENTS SHOWCASE (Luxury Feature) */}
      {signatureProducts.length > 0 && (
        <section className="bg-bg-card/30 border-t border-b border-primary-gold/15 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-2">
              <span className="text-xs text-primary-gold uppercase tracking-widest font-bold">The Royal Selection</span>
              <h2 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light">
                Our Signature Offerings
              </h2>
              <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
                Presented in hand-cut crystal bottles, crafted for the true fragrance connoisseur.
              </p>
            </div>

            <div className="space-y-12">
              {signatureProducts.map((prod, idx) => (
                <div
                  key={prod.id}
                  className={`flex flex-col lg:flex-row items-center gap-12 bg-bg-card border border-primary-gold/25 p-8 sm:p-12 rounded-2xl shadow-2xl ${
                    idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="w-full lg:w-1/2 max-h-[380px] overflow-hidden rounded-xl border border-primary-gold/15">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover transform hover:scale-103 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="w-full lg:w-1/2 space-y-6">
                    <span className="text-xs text-primary-gold uppercase tracking-widest font-bold px-3 py-1 bg-primary-gold/10 rounded">
                      Signature Release
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-playfair font-bold text-text-light">{prod.name}</h3>
                    
                    <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Olfactory profile display */}
                    <div className="grid grid-cols-3 gap-4 border-t border-b border-primary-gold/10 py-4">
                      <div>
                        <p className="text-[10px] text-primary-gold uppercase tracking-widest font-semibold">Top Notes</p>
                        <p className="text-xs text-text-light mt-1 truncate">{prod.top_notes || 'Saffron'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-primary-gold uppercase tracking-widest font-semibold">Heart Notes</p>
                        <p className="text-xs text-text-light mt-1 truncate">{prod.heart_notes || 'Ambergris'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-primary-gold uppercase tracking-widest font-semibold">Base Notes</p>
                        <p className="text-xs text-text-light mt-1 truncate">{prod.base_notes || 'Oud, Sandal'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-2xl font-bold text-text-light">${prod.price.toFixed(2)} <span className="text-xs font-light text-text-muted">(5ml Crystal Tola)</span></span>
                      <Link
                        to={`/products/${prod.id}`}
                        className="bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-103 shadow-lg"
                      >
                        Acquire Scent
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. ENQUIRY / CONTACT FORM */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="bg-bg-card border border-primary-gold/15 p-8 sm:p-12 rounded-2xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-playfair font-bold text-text-light">Enquire With Our Fragrance Curator</h2>
            <p className="text-sm text-text-muted">
              Connect with our master curator for custom blends, bespoke orders, or personalized recommendations.
            </p>
          </div>

          <form onSubmit={handleEnquirySubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={enquiry.name}
                  onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                  placeholder="Abdul Ahad"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg p-3 text-sm text-text-light focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={enquiry.email}
                  onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg p-3 text-sm text-text-light focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all duration-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Your Message / Request</label>
              <textarea
                rows="4"
                required
                value={enquiry.message}
                onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                placeholder="I am interested in bespoke sandalwood formulations..."
                className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg p-3 text-sm text-text-light focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold transition-all duration-300"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3.5 rounded-lg transition-colors duration-300 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Submit Enquiry</span>
            </button>

            {formSubmitted && (
              <p className="text-center text-sm font-semibold text-primary-gold animate-fadeIn">
                Your message has been received! Our fragrance curator will reach out to you within 24 hours.
              </p>
            )}
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
