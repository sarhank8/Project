import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(160); // Max range default
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || '');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    // Sync URL search params
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    const sort = searchParams.get('sort_by') || '';
    
    setSelectedCategory(cat);
    setSearch(q);
    setSortBy(sort);
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories
    const fetchCats = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    // Fetch products based on filters
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category_slug = selectedCategory;
        if (search) params.search = search;
        if (sortBy) params.sort_by = sortBy;
        params.max_price = priceRange;

        const res = await api.get('/products', { params });
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading filtered products", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFilteredProducts();
    }, 300); // 300ms debounce for search/price changes

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, search, priceRange, sortBy]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    updateURLParams('category', slug);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    updateURLParams('search', e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    updateURLParams('sort_by', e.target.value);
  };

  const updateURLParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPriceRange(160);
    setSortBy('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      
      {/* Page Title */}
      <div className="text-center mb-16 space-y-2">
        <span className="text-xs text-primary-gold uppercase tracking-widest font-semibold">The Complete Olfactory Catalog</span>
        <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-text-light">
          Our Fragrance Collection
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto">
          Filter by notes, category, or price to find your signature perfume.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* FILTERS COLUMN (DESKTOP) */}
        <aside className="hidden lg:block w-64 space-y-8 flex-shrink-0">
          
          {/* Search Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-primary-gold uppercase tracking-wider">Search Catalog</h4>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search notes, names..."
                className="w-full bg-bg-card border border-primary-gold/15 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-light focus:outline-none focus:border-primary-gold transition-colors"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-primary-gold uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-all duration-200 ${
                  selectedCategory === ''
                    ? 'bg-primary-gold/10 text-primary-gold font-semibold'
                    : 'text-text-muted hover:text-text-light'
                }`}
              >
                All Fragrances
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-all duration-200 ${
                    selectedCategory === cat.slug
                      ? 'bg-primary-gold/10 text-primary-gold font-semibold'
                      : 'text-text-muted hover:text-text-light'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-primary-gold uppercase tracking-wider">Max Price</h4>
              <span className="text-sm font-semibold text-text-light">${priceRange}</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-primary-gold"
            />
            <div className="flex justify-between text-xxs text-text-muted">
              <span>$30</span>
              <span>$200</span>
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-red-500/30 hover:border-red-500 text-red-400 text-sm font-bold transition-all duration-300"
          >
            <X className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>

        </aside>

        {/* PRODUCTS LIST GRID SECTION */}
        <div className="flex-grow space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-bg-card/40 border border-primary-gold/5 p-4 rounded-xl">
            
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="lg:hidden w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary-gold/10 hover:bg-primary-gold/20 text-primary-gold py-2.5 px-5 rounded-lg border border-primary-gold/20 text-sm font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <span className="text-sm text-text-muted hidden sm:inline">
              Showing {products.length} elegant fragrances
            </span>

            {/* Sorting Select */}
            <div className="relative w-full sm:w-64 flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-text-muted flex-shrink-0" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full bg-bg-card border border-primary-gold/15 rounded-lg p-2.5 text-sm text-text-light focus:outline-none focus:border-primary-gold"
              >
                <option value="">Sort by: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Grid Layout */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-bg-card/40 border border-primary-gold/5 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-bg-card border border-primary-gold/10 rounded-xl p-12 text-center space-y-4">
              <p className="text-xl font-bold text-text-light">No Fragrances Found</p>
              <p className="text-sm text-text-muted">Try adjusting your filters or searching for something else.</p>
              <button
                onClick={clearFilters}
                className="bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-2.5 px-6 rounded-lg text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-80 bg-bg-card border-l border-primary-gold/20 p-6 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-8">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-primary-gold/10 pb-4">
                <h3 className="text-lg font-playfair font-bold text-primary-gold">Catalogue Filters</h3>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-1 rounded-full text-text-muted hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary-gold uppercase tracking-wider">Search Catalog</h4>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search notes, names..."
                    className="w-full bg-bg-deep border border-primary-gold/15 rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-light focus:outline-none"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-primary-gold uppercase tracking-wider">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`text-xs py-2 px-3.5 rounded-full border transition-all duration-200 ${
                      selectedCategory === ''
                        ? 'bg-primary-gold border-primary-gold text-bg-deep font-bold'
                        : 'border-primary-gold/15 text-text-muted'
                    }`}
                  >
                    All Scents
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`text-xs py-2 px-3.5 rounded-full border transition-all duration-200 ${
                        selectedCategory === cat.slug
                          ? 'bg-primary-gold border-primary-gold text-bg-deep font-bold'
                          : 'border-primary-gold/15 text-text-muted'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-primary-gold uppercase tracking-wider">Max Price</h4>
                  <span className="text-sm font-semibold text-text-light">${priceRange}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="5"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary-gold"
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="border-t border-primary-gold/10 pt-6 space-y-3">
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="w-full bg-primary-gold hover:bg-yellow-700 text-bg-deep font-bold py-3 rounded-lg text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  clearFilters();
                  setShowFiltersMobile(false);
                }}
                className="w-full border border-red-500/30 hover:border-red-500 text-red-400 py-3 rounded-lg text-sm font-semibold"
              >
                Reset & Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
