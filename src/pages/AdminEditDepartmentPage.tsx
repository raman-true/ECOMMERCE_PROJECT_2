import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DepartmentForm } from '../components/admin/DepartmentForm';
import { useAdminCategoriesDepartments } from '../hooks/useSupabase';
import { Department } from '../types';

export function AdminEditDepartmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDepartmentById, updateDepartment, loading, error } = useAdminCategoriesDepartments();
  const [initialData, setInitialData] = useState<Department | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getDepartment = async () => {
      if (id) {
        const data = await fetchDepartmentById(id);
        if (data) {
          setInitialData(data as Department);
        } else {
          setFetchError('Department not found or failed to load.');
        }
      }
    };
    getDepartment();
  }, [id, fetchDepartmentById]);

  const handleSubmit = async (departmentData: Omit<Department, 'id' | 'categories'>) => {
    if (!id) return;

    const updatedDepartment = {
      slug: departmentData.slug,
      name: departmentData.name,
      description: departmentData.description || '',
      image: departmentData.image || '',
    };

    const result = await updateDepartment(id, updatedDepartment);
    if (result) {
      navigate('/admin/categories');
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading department data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">Department not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit Department</h2>
      {initialData && (
        <DepartmentForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}
