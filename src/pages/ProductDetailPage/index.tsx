import React, { useState, useEffect } from 'react'; // Added useEffect
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useSupabase';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { PricingBreakdown } from '../../components/product/PricingBreakdown';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || '');
  const { addToCart, addToWishlist, removeFromWishlist, state: { user }, wishlistItems } = useApp();
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const foundWishlistItem = wishlistItems.find(item => item.product_id === product?.id);

  // Update document title and meta description
  useEffect(() => {
    if (product) {
      document.title = `${product.name} - BuildMart`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', product.description.substring(0, 160));
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = product.description.substring(0, 160);
        document.head.appendChild(newMeta);
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex-grow container mx-auto px-4 py-8 text-center text-brown-600">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow container mx-auto px-4 py-8 text-center text-red-500">
        Error loading product or product not found: {error}
      </div>
    );
  }

  const handleAddToCart = async () => {
    console.log('handleAddToCart called');
    await addToCart(product.id, quantity, selectedVariant);
    setQuantity(1);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please log in to add items to your wishlist.');
      return;
    }
    if (foundWishlistItem) {
      await removeFromWishlist(foundWishlistItem.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  // Calculate effective price considering variants and discounts
  const basePrice = selectedVariant
    ? product.product_variants?.find(v => v.id === selectedVariant)?.price || product.price
    : product.price;

  let effectivePrice = basePrice;
  if (product.discountType === 'percentage' && product.discountValue !== undefined && product.discountValue !== null) {
    effectivePrice = basePrice * (1 - product.discountValue / 100);
  } else if (product.discountType === 'flat_amount' && product.discountValue !== undefined && product.discountValue !== null) {
    effectivePrice = basePrice - product.discountValue;
  }
  effectivePrice = Math.max(0, effectivePrice); // Ensure price doesn't go below zero

  const currentStock = selectedVariant
    ? product.product_variants?.find(v => v.id === selectedVariant)?.stock || product.stock
    : product.stock;

  return (
    <div className="min-h-screen bg-brown-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image Gallery */}
          <div className="flex flex-col items-center">
            <img
              src={product.images[0] || 'https://placehold.co/600x400?text=Product'}
              alt={product.name}
              className="w-full max-w-lg h-auto rounded-lg shadow-md object-cover"
            />
            {product.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img || 'https://placehold.co/80?text=Thumb'}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-brown-500 transition-colors"
                  />
                ))}
              </div>
            )}
          </div>
          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brown-900 mb-3">
              {product.name}
            </h1>
            <p className="text-brown-600 text-lg mb-4">{product.description}</p>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-brown-500 fill-current'
                        : 'text-brown-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-brown-600 ml-2">
                ({product.review_count} reviews)
              </span>
            </div>
            <div className="flex items-baseline space-x-3 mb-6">
              {product.discountType && product.discountValue !== undefined && product.discountValue !== null ? (
                <>
                  <span className="text-4xl font-bold text-red-600">
                    ${effectivePrice.toFixed(2)}
                  </span>
                  <span className="text-brown-500 line-through text-xl">
                    ${basePrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-brown-900">
                  ${basePrice.toFixed(2)}
                </span>
              )}
              {product.original_price && product.original_price > basePrice && (
                <span className="text-brown-500 line-through text-xl">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>
            {/* Variants */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-brown-900 mb-2">Select Variant:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.product_variants.map(variant => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? 'primary' : 'outline'}
                      onClick={() => setSelectedVariant(variant.id)}
                      size="sm"
                    >
                      {variant.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity and Stock */}
            <div className="flex items-center mb-6 space-x-4">
              <h3 className="text-lg font-semibold text-brown-900">Quantity:</h3>
              <div className="flex items-center border border-brown-300 rounded-lg">
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  -
                </Button>
                <span className="px-4 text-lg font-medium text-brown-900">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(1)} disabled={quantity >= currentStock}>
                  +
                </Button>
              </div>
              <span className="text-sm text-brown-600">
                Stock: {currentStock} {currentStock <= 5 && currentStock > 0 && <span className="text-orange-500">(Low Stock!)</span>}
                {currentStock === 0 && <span className="text-red-500">(Out of Stock)</span>}
              </span>
            </div>
            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={currentStock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToWishlist}
                className={foundWishlistItem ? 'bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600' : ''}
              >
                <Heart className={`w-5 h-5 ${foundWishlistItem ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {/* Pricing Breakdown */}
            <div className="mb-6">
              <PricingBreakdown
                productPrice={effectivePrice}
                isTaxable={product.is_taxable || false}
                isShippingExempt={product.is_shipping_exempt || false}
                quantity={quantity}
              />
            </div>
            
            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-brown-900 mb-2">Specifications:</h3>
                <ul className="list-disc list-inside text-brown-700 space-y-1">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Brand and Category */}
            <div className="text-sm text-brown-700">
              <p>
                <span className="font-semibold">Brand:</span> {product.brand}
              </p>
              <p>
                <span className="font-semibold">Category:</span> {product.categories?.name}
              </p>
              <p>
                <span className="font-semibold">Department:</span> {product.departments?.name}
              </p>
              {product.seller && (
                <p>
                  <span className="font-semibold">Sold by:</span>{' '}
                  <Link to={`/shop?seller=${product.seller.id}`} className="text-brown-600 hover:underline">
                    {product.seller.first_name} {product.seller.last_name}
                  </Link>
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-brown-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-brown-600">
                  <div className="flex items-center">
                    <span className="font-medium">Taxable:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      product.is_taxable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_taxable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Free Shipping:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      product.is_shipping_exempt ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_shipping_exempt ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
