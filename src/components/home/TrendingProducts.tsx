import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useProducts } from '../../hooks/useSupabase'; // Import useProducts hook
import { Link } from 'react-router-dom'; // Import Link for navigation

export function TrendingProducts() {
  const { addToCart } = useApp(); // Get addToCart directly
  const { products, loading, error } = useProducts({ limit: 4 }); // Limit to 4 products and add stable options

  const handleAddToCart = async (product: any) => { // Make it async
    await addToCart(product.id, 1); // Call addToCart directly
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-brown-600">
          <div className="animate-pulse">
            <div className="h-8 bg-brown-200 rounded w-64 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-brown-100 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading trending products: {error}
        </div>
      </section>
    );
  }

  // Filter products to simulate "trending products under $100" - but limit is already applied
  const trendingProducts = products.filter(product => product.price < 100);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-8">
          <div className="w-1 h-8 bg-brown-900 mr-4"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-brown-900">
            Trending products under $100
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <Link to={`/products/${product.slug}`} className="block"> {/* Wrap image and title with Link */}
                <div className="relative">
                  <img
                    src={product.images[0] || 'https://placehold.co/400x300?text=Product'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only" />
                      <div className="w-4 h-4 border border-brown-300 rounded bg-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-transparent"></div>
                      </div>
                      <span className="ml-2 text-sm text-brown-700">Compare</span>
                    </label>
                  </div>

                  <button className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                    <Heart className="w-4 h-4 text-brown-700 hover:text-red-500" />
                  </button>
                </div>
              </Link> {/* Close Link here */}

              <div className="p-4">
                <div className="mb-2">
                  <span className="text-sm font-bold text-brown-900 uppercase tracking-wide">
                    {product.brand}
                  </span>
                </div>

                <Link to={`/products/${product.slug}`}> {/* Wrap title with Link */}
                  <h3 className="text-sm font-medium text-brown-900 mb-3 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </Link> {/* Close Link here */}

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-brown-500 fill-current'
                            : 'text-brown-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-brown-700 ml-2">
                    ({product.review_count}) {/* Use review_count from Supabase */}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-brown-900">
                    ${product.price.toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product)} // Call the new handleAddToCart
                    className="bg-brown-900 hover:bg-brown-700 text-brown-100 p-3 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
