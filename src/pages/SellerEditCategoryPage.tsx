// src/pages/SellerEditCategoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CategoryForm } from '../components/admin/CategoryForm'; // Re-use existing form
import { useSellerCategories } from '../hooks/useSupabase'; // Use new seller hook
import { Category } from '../types';
import { useApp } from '../contexts/AppContext'; // To get current user's ID

export function SellerEditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { fetchCategoryById, updateCategory, loading, error } = useSellerCategories(userId);
  const [initialData, setInitialData] = useState<Category | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getCategory = async () => {
      if (!id || !userId) return;
      const data = await fetchCategoryById(id);
      if (data) {
        setInitialData(data as Category);
      } else {
        setFetchError('Category not found or failed to load.');
      }
    };
    getCategory();
  }, [id, fetchCategoryById, userId]);

  const handleSubmit = async (categoryData: Omit<Category, 'id' | 'productCount'> & { department_id: string | null }) => {
    if (!id || !userId) return;

    const updatedCategory = {
      slug: categoryData.slug,
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      department_id: categoryData.department_id,
    };

    const result = await updateCategory(id, updatedCategory);
    if (result) {
      navigate('/seller/categories');
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading category data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">Category not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit Category</h2>
      {initialData && (
        <CategoryForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}
