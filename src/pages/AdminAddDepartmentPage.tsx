import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentForm } from '../components/admin/DepartmentForm';
import { useAdminCategoriesDepartments } from '../hooks/useSupabase';
import { Department } from '../types';

export function AdminAddDepartmentPage() {
  const navigate = useNavigate();
  const { addDepartment, loading, error } = useAdminCategoriesDepartments();

  const handleSubmit = async (departmentData: Omit<Department, 'id' | 'categories'>) => {
    const newDepartment = {
      slug: departmentData.slug,
      name: departmentData.name,
      description: departmentData.description || '',
      image: departmentData.image || '',
    };

    const result = await addDepartment(newDepartment);
    if (result) {
      navigate('/admin/categories');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Department</h2>
      <DepartmentForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
