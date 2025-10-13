import React from 'react';
import { useProducts } from '../../hooks/useSupabase';
import { Product } from '../../types';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { useSearchParams, Link } from 'react-router-dom';

interface ProductListingProps {
  itemsPerPage: number;
}

export function ProductListing({ itemsPerPage }: ProductListingProps) {
  const [searchParams] = useSearchParams();
  const { addToCart } = useApp(); // Changed to directly get addToCart from useApp()

  const categorySlug = searchParams.get('category') || undefined;
  const searchQuery = searchParams.get('search') || undefined;
  const minPrice = Number(searchParams.get('minPrice')) || undefined;
  const maxPrice = Number(searchParams.get('maxPrice')) || undefined;
  const brands = searchParams.getAll('brand');
  const currentPage = Number(searchParams.get('page')) || 1;
  const offset = (currentPage - 1) * itemsPerPage;

  // Create stable options object to prevent unnecessary re-renders
  const productOptions = React.useMemo(() => ({
    categorySlug: categorySlug,
    searchQuery: searchQuery,
    minPrice: minPrice,
    maxPrice: maxPrice,
    brand: brands.length > 0 ? brands[0] : undefined,
    limit: itemsPerPage,
    offset: offset,
  }), [categorySlug, searchQuery, minPrice, maxPrice, brands, itemsPerPage, offset]);
  const { products, loading, error } = useProducts(productOptions);

  // Removed the local addToCart function, now using the one from useApp()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[...Array(itemsPerPage)].map((_, i) => (
            <div key={i} className="bg-brown-100 h-96 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading products: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-brown-600">
        No products found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-brown-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
        >
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

          <div className="p-4">
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
            
            <p className="text-brown-600 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between mb-4">
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
              onClick={() => addToCart(product.id, 1)} // Directly calling addToCart from useApp()
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
