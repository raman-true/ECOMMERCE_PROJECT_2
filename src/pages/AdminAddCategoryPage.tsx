import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryForm } from '../components/admin/CategoryForm';
import { useAdminCategoriesDepartments } from '../hooks/useSupabase';
import { Category } from '../types';

export function AdminAddCategoryPage() {
  const navigate = useNavigate();
  const { addCategory, loading, error } = useAdminCategoriesDepartments();

  const handleSubmit = async (categoryData: Omit<Category, 'id' | 'productCount'> & { department_id: string | null }) => {
    const newCategory = {
      slug: categoryData.slug,
      name: categoryData.name,
      description: categoryData.description || '',
      image: categoryData.image || '',
      department_id: categoryData.department_id,
      product_count: 0, // Default value
    };

    const result = await addCategory(newCategory);
    if (result) {
      navigate('/admin/categories');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Category</h2>
      <CategoryForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
