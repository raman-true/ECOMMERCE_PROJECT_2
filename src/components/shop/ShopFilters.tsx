// src/components/shop/ShopFilters.tsx
import React, { useState, useEffect } from 'react';
import { useDepartments, useProducts, useAdminUsers } from '../../hooks/useSupabase'; // Import useAdminUsers
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

export function ShopFilters() {
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { products: allProducts, loading: productsLoading, error: productsError } = useProducts({ limit: 1000 });
  const { fetchAllUserProfiles, loading: usersLoading, error: usersError } = useAdminUsers(); // Fetch all users to get sellers

  const [searchParams, setSearchParams] = useSearchParams();

  const [minPrice, setMinPrice] = useState<number>(
    Number(searchParams.get('minPrice')) || 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get('maxPrice')) || 1000
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.getAll('brand')
  );
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(
    searchParams.get('seller') || undefined
  ); // NEW: State for selected seller

  const [sellers, setSellers] = useState<any[]>([]); // NEW: State to store seller profiles

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    department: true,
    category: true,
    price: true,
    brand: true,
    seller: true, // NEW: Seller section
  });

  const uniqueBrands = Array.from(new Set(allProducts.map(p => p.brand))).filter(Boolean) as string[];

  useEffect(() => {
    setMinPrice(Number(searchParams.get('minPrice')) || 0);
    setMaxPrice(Number(searchParams.get('maxPrice')) || 1000);
    setSelectedBrands(searchParams.getAll('brand'));
    setSelectedSellerId(searchParams.get('seller') || undefined); // NEW
  }, [searchParams]);

  // NEW: Fetch sellers on component mount
  useEffect(() => {
    const getSellers = async () => {
      const allUsers = await fetchAllUserProfiles();
      if (allUsers) {
        setSellers(allUsers.filter(user => user.role === 'seller'));
      }
    };
    getSellers();
  }, [fetchAllUserProfiles]);


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (e.target.id === 'minPrice') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const handleBrandChange = (brand: string, isChecked: boolean) => {
    setSelectedBrands(prev => {
      if (isChecked) {
        return [...prev, brand];
      } else {
        return prev.filter(b => b !== brand);
      }
    });
  };

  const handleSellerChange = (sellerId: string) => { // NEW
    setSelectedSellerId(sellerId === selectedSellerId ? undefined : sellerId);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
    setMinPrice(0);
    setMaxPrice(1000);
    setSelectedBrands([]);
    setSelectedSellerId(undefined); // NEW
  };

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('page');

    if (minPrice > 0) {
      newSearchParams.set('minPrice', minPrice.toString());
    } else {
      newSearchParams.delete('minPrice');
    }

    if (maxPrice < 1000) {
      newSearchParams.set('maxPrice', maxPrice.toString());
    } else {
      newSearchParams.delete('maxPrice');
    }

    newSearchParams.delete('brand');
    selectedBrands.forEach(brand => newSearchParams.append('brand', brand));

    // NEW: Apply seller filter
    if (selectedSellerId) {
      newSearchParams.set('seller', selectedSellerId);
    } else {
      newSearchParams.delete('seller');
    }

    setSearchParams(newSearchParams);
  };

  const hasActiveFilters = minPrice > 0 || maxPrice < 1000 || selectedBrands.length > 0 || searchParams.get('category') || searchParams.get('department') || searchParams.get('seller'); // Updated

  return (
    <div className="bg-white rounded-xl shadow-lg border border-brown-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brown-900 to-brown-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Filters</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center text-brown-200 hover:text-white text-sm transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Department Filter */}
        <div className="border-b border-brown-100 pb-6">
          <button
            onClick={() => toggleSection('department')}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-lg font-semibold text-brown-900 group-hover:text-brown-700 transition-colors">
              Department
            </h3>
            {expandedSections.department ? (
              <ChevronUp className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            )}
          </button>
          
          {expandedSections.department && (
            <div className="space-y-2">
              {departmentsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-brown-100 rounded"></div>
                  ))}
                </div>
              ) : departmentsError ? (
                <p className="text-red-500 text-sm">Error loading departments</p>
              ) : (
                <>
                  <div className="mb-3">
                    <Link
                      to="/shop"
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        !searchParams.get('department') && !searchParams.get('category')
                          ? 'bg-brown-900 text-white shadow-md'
                          : 'text-brown-700 hover:bg-brown-50 hover:text-brown-900'
                      }`}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams.toString());
                        newSearchParams.delete('department');
                        newSearchParams.delete('category');
                        newSearchParams.delete('page');
                        setSearchParams(newSearchParams);
                      }}
                    >
                      All Departments
                    </Link>
                  </div>
                  {departments.map((department) => (
                    <Link
                      key={department.id}
                      to={`/shop?department=${department.slug}`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        searchParams.get('department') === department.slug
                          ? 'bg-brown-100 text-brown-900 font-medium border-l-4 border-brown-500'
                          : 'text-brown-600 hover:bg-brown-50 hover:text-brown-800'
                      }`}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams.toString());
                        newSearchParams.set('department', department.slug);
                        newSearchParams.delete('category');
                        newSearchParams.delete('page');
                        setSearchParams(newSearchParams);
                      }}
                    >
                      {department.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="border-b border-brown-100 pb-6">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-lg font-semibold text-brown-900 group-hover:text-brown-700 transition-colors">
              Category
            </h3>
            {expandedSections.category ? (
              <ChevronUp className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            )}
          </button>
          
          {expandedSections.category && (
            <div className="space-y-2">
              {departmentsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-brown-100 rounded"></div>
                  ))}
                </div>
              ) : departmentsError ? (
                <p className="text-red-500 text-sm">Error loading categories</p>
              ) : (
                <>
                  <div className="mb-3">
                    <Link
                      to="/shop"
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        !searchParams.get('category') && !searchParams.get('department')
                          ? 'bg-brown-900 text-white shadow-md'
                          : 'text-brown-700 hover:bg-brown-50 hover:text-brown-900'
                      }`}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams.toString());
                        newSearchParams.delete('category');
                        newSearchParams.delete('department');
                        newSearchParams.delete('page');
                        setSearchParams(newSearchParams);
                      }}
                    >
                      All Categories
                    </Link>
                  </div>
                  {departments.map((department) => (
                    <div key={department.id} className="space-y-1">
                      {department.categories && department.categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/shop?category=${category.slug}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            searchParams.get('category') === category.slug
                              ? 'bg-brown-100 text-brown-900 font-medium border-l-4 border-brown-500'
                              : 'text-brown-600 hover:bg-brown-50 hover:text-brown-800'
                          }`}
                          onClick={() => {
                            const newSearchParams = new URLSearchParams(searchParams.toString());
                            newSearchParams.set('category', category.slug);
                            newSearchParams.delete('department');
                            newSearchParams.delete('page');
                            setSearchParams(newSearchParams);
                          }}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="border-b border-brown-100 pb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-lg font-semibold text-brown-900 group-hover:text-brown-700 transition-colors">
              Price Range
            </h3>
            {expandedSections.price ? (
              <ChevronUp className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            )}
          </button>
          
          {expandedSections.price && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-brown-600 mb-1">Min</label>
                  <input
                    type="number"
                    id="minPrice"
                    value={minPrice}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-brown-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="text-brown-400 mt-6">-</div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-brown-600 mb-1">Max</label>
                  <input
                    type="number"
                    id="maxPrice"
                    value={maxPrice}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-brown-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>
              </div>
              
              <div className="relative h-6">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={minPrice}
                  onChange={handlePriceChange}
                  id="minPriceSlider"
                  className="absolute w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb slider-track z-10"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={maxPrice}
                  onChange={handlePriceChange}
                  id="maxPriceSlider"
                  className="absolute w-full h-2 rounded-lg appearance-none cursor-pointer slider-thumb slider-track z-20"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-brown-600 mt-6">
                <span className="bg-brown-50 px-2 py-1 rounded font-medium">${minPrice}</span>
                <span className="bg-brown-50 px-2 py-1 rounded font-medium">${maxPrice}+</span>
              </div>
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="border-b border-brown-100 pb-6"> {/* Added border-b */}
          <button
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-lg font-semibold text-brown-900 group-hover:text-brown-700 transition-colors">
              Brand
            </h3>
            {expandedSections.brand ? (
              <ChevronUp className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            )}
          </button>
          
          {expandedSections.brand && (
            <div className="space-y-3">
              {productsLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 bg-brown-100 rounded"></div>
                  ))}
                </div>
              ) : productsError ? (
                <p className="text-red-500 text-sm">Error loading brands</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uniqueBrands.map((brand) => (
                    <label key={brand} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-brown-600 bg-brown-50 border-brown-300 rounded focus:ring-brown-500 focus:ring-2"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => handleBrandChange(brand, e.target.checked)}
                      />
                      <span className="ml-3 text-sm text-brown-700 group-hover:text-brown-900 transition-colors">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* NEW: Seller Filter */}
        <div className="pb-6">
          <button
            onClick={() => toggleSection('seller')}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-lg font-semibold text-brown-900 group-hover:text-brown-700 transition-colors">
              Seller
            </h3>
            {expandedSections.seller ? (
              <ChevronUp className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-brown-600 group-hover:text-brown-800 transition-colors" />
            )}
          </button>
          
          {expandedSections.seller && (
            <div className="space-y-3">
              {usersLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-6 bg-brown-100 rounded"></div>
                  ))}
                </div>
              ) : usersError ? (
                <p className="text-red-500 text-sm">Error loading sellers</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {sellers.map((seller) => (
                    <label key={seller.id} className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="sellerFilter" // Use radio buttons for single selection
                        className="w-4 h-4 text-brown-600 bg-brown-50 border-brown-300 rounded-full focus:ring-brown-500 focus:ring-2"
                        checked={selectedSellerId === seller.id}
                        onChange={() => handleSellerChange(seller.id)}
                      />
                      <span className="ml-3 text-sm text-brown-700 group-hover:text-brown-900 transition-colors">
                        {seller.first_name} {seller.last_name}
                      </span>
                    </label>
                  ))}
                  {sellers.length > 0 && (
                    <label className="flex items-center group cursor-pointer">
                      <input
                        type="radio"
                        name="sellerFilter"
                        className="w-4 h-4 text-brown-600 bg-brown-50 border-brown-300 rounded-full focus:ring-brown-500 focus:ring-2"
                        checked={!selectedSellerId}
                        onChange={() => handleSellerChange(undefined)}
                      />
                      <span className="ml-3 text-sm text-brown-700 group-hover:text-brown-900 transition-colors">
                        All Sellers
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <button
          onClick={applyFilters}
          className="w-full bg-gradient-to-r from-brown-900 to-brown-700 hover:from-brown-800 hover:to-brown-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
