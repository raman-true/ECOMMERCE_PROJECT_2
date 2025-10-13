// src/pages/AdminAddProductPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/admin/ProductForm';
import { useAdminProducts } from '../hooks/useSupabase';
import { Product } from '../types';

export function AdminAddProductPage() {
  const navigate = useNavigate();
  const { addProduct, loading, error } = useAdminProducts();

  const handleSubmit = async (productData: Omit<Product, 'id' | 'reviewCount' | 'rating'>) => {
    const newProduct = {
      slug: productData.slug,
      name: productData.name,
      description: productData.description || '',
      price: productData.price,
      original_price: productData.originalPrice || null,
      images: productData.images || [],
      category_id: productData.category_id || null,
      department_id: productData.department_id || null,
      brand: productData.brand || '',
      stock: productData.stock || 0,
      specifications: productData.specifications || {},
      rating: 0,
      review_count: 0,
      discount_type: productData.discountType || null,
      discount_value: productData.discountValue || null,
      is_taxable: productData.isTaxable,
      is_shipping_exempt: productData.isShippingExempt,
    };

    const result = await addProduct(newProduct);
    if (result) {
      navigate('/admin/products');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Product</h2>
      <ProductForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}