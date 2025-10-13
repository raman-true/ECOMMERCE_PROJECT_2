// src/pages/SellerAddCategoryPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryForm } from '../components/admin/CategoryForm'; // Re-use existing form
import { useSellerCategories } from '../hooks/useSupabase'; // Use new seller hook
import { Category } from '../types';
import { useApp } from '../contexts/AppContext'; // To get current user's ID

export function SellerAddCategoryPage() {
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { addCategory, loading, error } = useSellerCategories(userId);

  const handleSubmit = async (categoryData: Omit<Category, 'id' | 'productCount'> & { department_id: string | null }) => {
    const newCategory = {
      slug: categoryData.slug,
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      department_id: categoryData.department_id,
      product_count: 0, // Default value
      // seller_id will be automatically added by useSellerCategories hook
    };

    const result = await addCategory(newCategory);
    if (result) {
      navigate('/seller/categories');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Category</h2>
      <CategoryForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
