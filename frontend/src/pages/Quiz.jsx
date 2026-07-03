import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, RotateCcw, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const QUESTIONS = [
  {
    id: 'profile',
    title: 'Which scent profile draws you in the most?',
    options: [
      { value: 'earthy', label: 'Earthy & Wet Earth', desc: 'Scent of petrichor, clay, and fresh rain showers' },
      { value: 'woody', label: 'Deep Woody & Resin', desc: 'Aged agarwood (oud), sandalwood, and rich incense' },
      { value: 'floral', label: 'Velvety Floral & Sweet', desc: 'Damask rose, white jasmine, and natural blooms' },
      { value: 'clean', label: 'Soft, Powdery & Clean', desc: 'Fresh aldehydes, warm musk, and close-to-skin notes' }
    ]
  },
  {
    id: 'style',
    title: 'How would you describe your fragrance style?',
    options: [
      { value: 'grounding', label: 'Grounding & Nostalgic', desc: 'You appreciate nature, simplicity, and natural soil' },
      { value: 'majestic', label: 'Majestic & Powerful', desc: 'You want a bold statement of status and mystery' },
      { value: 'romantic', label: 'Romantic & Velvety', desc: 'You prefer classic, elegant, and romantic traditions' },
      { value: 'subtle', label: 'Subtle & Sophisticated', desc: 'You like clean, understated, and gentle whispers' }
    ]
  },
  {
    id: 'occasion',
    title: 'What is the primary occasion for this scent?',
    options: [
      { value: 'daily', label: 'Daily Signature', desc: 'A daily scent for office, home, and casual wear' },
      { value: 'formal', label: 'Grand Evenings & Formals', desc: 'Weddings, corporate functions, or high-profile events' },
      { value: 'relaxation', label: 'Meditation & Spiritual Calm', desc: 'For self-reflection, yoga, or calming the mind' },
      { value: 'special', label: 'Elegant Date Nights', desc: 'Captivating, alluring, and intimate settings' }
    ]
  },
  {
    id: 'intensity',
    title: 'What is your preferred fragrance intensity?',
    options: [
      { value: 'subtle', label: 'Gentle & Close (Sits near the skin)', desc: 'Only noticed by those who embrace you' },
      { value: 'moderate', label: 'Moderate (Leaves a elegant trail)', desc: 'Noticed as you walk past someone' },
      { value: 'strong', label: 'Rich & Powerful (Fills a room)', desc: 'Unforgettable, highly concentrated presence' }
    ]
  }
];

const Quiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [products, setProducts] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products for quiz", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSelectOption = (questionId, optionValue) => {
    setAnswers({
      ...answers,
      [questionId]: optionValue
    });
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      calculateRecommendation();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setRecommendation(null);
  };

  const calculateRecommendation = () => {
    if (products.length === 0) return;
    
    // Find best match by checking key metrics:
    const profile = answers.profile;
    const style = answers.style;
    const occasion = answers.occasion;
    const intensity = answers.intensity;

    let matchedProduct = null;

    if (profile === 'earthy') {
      // Recommend Mitti Attar or Sandalwood Mysore Oud
      matchedProduct = products.find(p => p.name.toLowerCase().includes('mitti')) || products[0];
    } else if (profile === 'woody') {
      if (style === 'majestic' || intensity === 'strong') {
        // Royal Oudh or Royal Amber
        matchedProduct = products.find(p => p.name.toLowerCase().includes('malik')) || products.find(p => p.name.toLowerCase().includes('amber')) || products[0];
      } else {
        matchedProduct = products.find(p => p.name.toLowerCase().includes('reserve')) || products[0];
      }
    } else if (profile === 'floral') {
      if (occasion === 'special') {
        matchedProduct = products.find(p => p.name.toLowerCase().includes('gold')) || products[0];
      } else {
        matchedProduct = products.find(p => p.name.toLowerCase().includes('gulab')) || products[0];
      }
    } else {
      // Clean / musk
      matchedProduct = products.find(p => p.name.toLowerCase().includes('musk')) || products[0];
    }

    if (!matchedProduct && products.length > 0) {
      matchedProduct = products[0];
    }

    setRecommendation(matchedProduct);
    setStep(QUESTIONS.length); // Final step indicator
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-text-light">
        <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-playfair text-xl tracking-wider">Preparing Fragrance Advisor...</p>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[step];
  const progressPercent = ((step) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-10">
        <span className="text-xs text-primary-gold font-semibold uppercase tracking-widest">Aab-e-Hayat Fragrance Curator</span>
        <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light mt-2">
          Discover Your Olfactory Profile
        </h1>
        <p className="text-text-muted mt-3 max-w-2xl mx-auto text-sm sm:text-base">
          Answer a few questions regarding your preferences and style, and our curator will match you with your signature luxury extract.
        </p>
      </div>

      {step < QUESTIONS.length ? (
        /* QUIZ STEP CONTAINER */
        <div className="bg-bg-card border border-primary-gold/15 rounded-2xl p-6 sm:p-10 shadow-2xl">
          
          {/* Progress Bar */}
          <div className="w-full bg-bg-deep rounded-full h-1 mb-8 overflow-hidden">
            <div
              className="bg-primary-gold h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <span className="text-xs text-primary-gold font-bold tracking-wider uppercase block mb-2">
            Question {step + 1} of {QUESTIONS.length}
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-light mb-8">
            {currentQuestion.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelectOption(currentQuestion.id, option.value)}
                  className={`text-left p-6 rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? 'bg-primary-gold/10 border-primary-gold text-text-light'
                      : 'bg-bg-deep/60 border-primary-gold/10 hover:border-primary-gold/50 text-text-muted'
                  }`}
                >
                  <p className={`font-semibold text-base sm:text-lg ${isSelected ? 'text-primary-gold' : 'text-text-light'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                    {option.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-primary-gold/10">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center space-x-2 text-sm font-semibold transition-colors duration-200 ${
                step === 0 ? 'text-text-muted/30 cursor-not-allowed' : 'text-text-muted hover:text-primary-gold'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 ${
                answers[currentQuestion.id]
                  ? 'bg-primary-gold text-bg-deep hover:bg-yellow-700 shadow-lg transform hover:scale-105'
                  : 'bg-primary-gold/20 text-bg-deep/50 cursor-not-allowed'
              }`}
            >
              <span>{step === QUESTIONS.length - 1 ? 'Find Match' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* RESULTS SCREEN */
        recommendation && (
          <div className="bg-bg-card border border-primary-gold/30 rounded-2xl p-6 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center md:items-stretch gap-8 animate-fadeIn">
            
            {/* Image section */}
            <div className="w-full md:w-2/5 max-h-[350px] md:max-h-none rounded-xl overflow-hidden shadow-xl border border-primary-gold/10">
              <img
                src={recommendation.image_url}
                alt={recommendation.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Recommendation info */}
            <div className="w-full md:w-3/5 flex flex-col justify-between">
              
              <div>
                <span className="text-xs text-primary-gold font-bold uppercase tracking-widest bg-primary-gold/10 px-3 py-1 rounded">
                  Your Ideal Scent Match
                </span>
                
                <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-text-light mt-4 mb-2">
                  {recommendation.name}
                </h2>
                
                {/* Notes list */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {recommendation.top_notes && (
                    <span className="text-xxs text-text-muted border border-primary-gold/20 px-2 py-0.5 rounded">
                      Top: {recommendation.top_notes.split(',')[0]}
                    </span>
                  )}
                  {recommendation.heart_notes && (
                    <span className="text-xxs text-text-muted border border-primary-gold/20 px-2 py-0.5 rounded">
                      Heart: {recommendation.heart_notes.split(',')[0]}
                    </span>
                  )}
                  {recommendation.base_notes && (
                    <span className="text-xxs text-text-muted border border-primary-gold/20 px-2 py-0.5 rounded">
                      Base: {recommendation.base_notes.split(',')[0]}
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base text-text-muted leading-relaxed mb-6">
                  {recommendation.description}
                </p>

                <p className="text-2xl font-bold text-text-light mb-8">
                  ${recommendation.price.toFixed(2)} <span className="text-xs font-light text-text-muted">(Base 6ml size)</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-primary-gold/10">
                <button
                  onClick={() => addToCart(recommendation, 1, '6ml')}
                  className="flex-grow flex items-center justify-center space-x-2 bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-primary-gold/20 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add 6ml to Cart</span>
                </button>

                <button
                  onClick={() => navigate(`/products/${recommendation.id}`)}
                  className="flex-grow flex items-center justify-center bg-bg-deep/60 hover:bg-bg-deep border border-primary-gold/30 hover:border-primary-gold text-primary-gold py-3.5 px-6 rounded-lg font-bold transition-all duration-300"
                >
                  <span>View Full Details</span>
                </button>
              </div>

              {/* Restart button */}
              <button
                onClick={resetQuiz}
                className="mt-6 flex items-center justify-center space-x-1.5 text-xs text-text-muted hover:text-primary-gold transition-colors duration-200 self-center md:self-start focus:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Fragrance Quiz</span>
              </button>

            </div>

          </div>
        )
      )}
    </div>
  );
};

export default Quiz;
