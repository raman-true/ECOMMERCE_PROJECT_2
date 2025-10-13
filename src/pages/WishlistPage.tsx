import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function WishlistPage() {
  const { wishlistItems, wishlistLoading, wishlistError, removeFromWishlist, addToCart } = useApp();

  if (wishlistLoading) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading wishlist...
        </div>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading wishlist: {wishlistError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-md">
            <Heart className="w-24 h-24 text-brown-300 mb-6" />
            <p className="text-2xl font-medium text-brown-900 mb-3">Your wishlist is empty</p>
            <p className="text-brown-600 mb-6">Save your favorite products here for later!</p>
            <Link to="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <Link to={`/products/${item.products.slug}`} className="block relative">
                  <img
                    src={item.products.images[0] || 'https://placehold.co/400x300?text=Product'}
                    alt={item.products.name}
                    className="w-full h-48 object-cover"
                  />
                  {item.products.original_price && (
                    <div className="absolute top-2 left-2 bg-brown-500 text-white px-2 py-1 rounded text-sm font-medium">
                      SALE
                    </div>
                  )}
                </Link>
                <div className="p-4 flex-grow flex flex-col">
                  <Link to={`/products/${item.products.slug}`}>
                    <h2 className="text-xl font-semibold text-brown-900 mb-2 hover:text-brown-700 transition-colors">
                      {item.products.name}
                    </h2>
                  </Link>
                  <p className="text-brown-600 text-sm mb-3 line-clamp-2 flex-grow">
                    {item.products.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-brown-900">
                      ${item.products.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-brown-600">
                      Stock: {item.products.stock}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      className="flex-1"
                      onClick={() => addToCart(item.product_id, 1)}
                      disabled={item.products.stock === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
