// src/pages/AdminEditProductPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/admin/ProductForm';
import { useAdminProducts } from '../hooks/useSupabase';
import { Product } from '../types';

export function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProductById, updateProduct, loading, error } = useAdminProducts();
  const [initialData, setInitialData] = useState<Product | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        const data = await fetchProductById(id);
        if (data) {
          const mappedProduct: Product = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price || undefined,
            images: data.images || [],
            category: (data.category_id as any)?.name || 'N/A',
            department: (data.department_id as any)?.name || 'N/A',
            brand: data.brand || '',
            rating: data.rating || 0,
            reviewCount: data.review_count || 0,
            stock: data.stock || 0,
            specifications: data.specifications || {},
            category_id: data.category_id || null,
            department_id: data.department_id || null,
          };
          setInitialData(mappedProduct);
        } else {
          setFetchError('Product not found or failed to load.');
        }
      }
    };
    getProduct();
  }, [id, fetchProductById]);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'reviewCount' | 'rating'>) => {
    if (!id) return;

    const updatedProduct = {
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
      discount_type: productData.discountType || null,
      discount_value: productData.discountValue || null,
      is_taxable: productData.isTaxable,
      is_shipping_exempt: productData.isShippingExempt,
    };

    const result = await updateProduct(id, updatedProduct);
    if (result) {
      navigate('/admin/products');
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading product data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">Product not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit Product</h2>
      {initialData && (
        <ProductForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}