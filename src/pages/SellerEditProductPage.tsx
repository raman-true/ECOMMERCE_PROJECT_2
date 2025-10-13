// src/pages/SellerEditProductPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/admin/ProductForm'; // Re-use existing form
import { useSellerProductsWithAdmin } from '../hooks/useSupabase'; // Use new seller hook with admin products
import { Product } from '../types';
import { useApp } from '../contexts/AppContext'; // To get current user's ID

export function SellerEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { fetchProductById, updateProduct, loading, error, isAdminProduct } = useSellerProductsWithAdmin(userId);
  const [initialData, setInitialData] = useState<Product | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getProduct = async () => {
      if (!id || !userId) return;
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
          seller_id: data.seller_id, // Include seller_id for permission checks
        };
        
        // Check if user can edit this product
        if (isAdminProduct(data)) {
          setFetchError('You cannot edit admin products. You can only view them.');
          return;
        }
        
        setInitialData(mappedProduct);
      } else {
        setFetchError('Product not found or failed to load.');
      }
    };
    getProduct();
  }, [id, fetchProductById, userId, isAdminProduct]);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'reviewCount' | 'rating'>) => {
    if (!id || !userId) return;

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
      navigate('/seller/products');
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