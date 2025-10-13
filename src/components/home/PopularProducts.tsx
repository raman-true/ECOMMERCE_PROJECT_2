// src/components/home/PopularProducts.tsx
import React, { useState } from 'react'; // Import useState
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'; // Import Chevron icons
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { useProducts } from '../../hooks/useSupabase';
import { Link } from 'react-router-dom';

export function PopularProducts() {
  const { addToCart } = useApp();
  const { products, loading, error } = useProducts({ limit: 10 }); // Fetch more products to fill carousel

  const [currentSlide, setCurrentSlide] = useState(0);
  // Define productsPerPage responsively using Tailwind's breakpoints
  // For simplicity in JS, we'll use a fixed number for desktop and let Tailwind handle card width
  const productsPerPageDesktop = 3;
  const productsPerPageTablet = 2;
  const productsPerPageMobile = 1;

  // This logic will determine the number of visible items based on screen size
  // For the carousel's transform, we'll use a percentage based on the largest view (desktop)
  // and let the individual card widths handle responsiveness.
  // The totalSlides calculation needs to consider the actual number of products.
  const totalSlides = Math.ceil(products.length / productsPerPageDesktop); // Calculate based on desktop view

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async (product: any) => {
    await addToCart(product.id, 1);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center text-brown-600">
          <div className="animate-pulse">
            <div className="h-8 bg-brown-200 rounded w-64 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(productsPerPageDesktop)].map((_, i) => ( // Show placeholders for visible products
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading popular products: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4">
            Popular Products
          </h2>
          <p className="text-lg text-brown-600 max-w-2xl mx-auto">
            Best-selling items trusted by professionals and DIY enthusiasts
          </p>
        </div>

        <div className="relative"> {/* Added relative positioning for absolute arrows */}
          <div className="overflow-hidden"> {/* Hide overflow for sliding effect */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              // Adjust transform based on productsPerPageDesktop for consistent sliding unit
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  // Use flex-shrink-0 and responsive widths for individual cards
                  // This makes each card take up 100% of the carousel's width on mobile,
                  // 50% on md, and 33.33% on lg, effectively showing 1, 2, or 3 items per "slide"
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-4"
                >
                  <div className="bg-white border border-brown-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col"> {/* Added h-full and flex-col */}
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="relative">
                        <img
                          src={product.images[0] || 'https://placehold.co/400x300?text=Product'}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.original_price && (
                          <div className="absolute top-2 left-2 bg-brown-500 text-white px-2 py-1 rounded text-sm font-medium">
                            SALE
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-6 flex-grow flex flex-col"> {/* Added flex-grow and flex-col */}
                      <div className="flex items-center mb-2">
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
                        <span className="text-sm text-brown-600 ml-2">
                          ({product.review_count})
                        </span>
                      </div>

                      <Link to={`/products/${product.slug}`}>
                        <h3 className="text-lg font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-brown-600 text-sm mb-4 line-clamp-2 flex-grow"> {/* Added flex-grow */}
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4 mt-auto"> {/* Added mt-auto */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-brown-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.original_price && (
                            <span className="text-brown-500 line-through text-sm">
                              ${product.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-brown-600">
                          Stock: {product.stock}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-brown-900 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all z-10 ml-4"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-brown-900 bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all z-10 mr-4"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-brown-500'
                    : 'bg-brown-300 hover:bg-brown-400'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-3 bg-brown-900 text-white font-medium rounded-lg hover:bg-brown-700 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}