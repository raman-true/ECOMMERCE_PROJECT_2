// src/pages/SellerEditDepartmentPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link
import { DepartmentForm } from '../components/admin/DepartmentForm'; // Re-use existing form
import { useSellerCategories } from '../hooks/useSupabase'; // Use new seller hook
import { Department } from '../types';
import { useApp } from '../contexts/AppContext'; // To get current user's ID
import { Button } from '../components/ui/Button';

export function SellerEditDepartmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { fetchDepartmentById, updateDepartment, loading, error } = useSellerCategories(userId);
  const [initialData, setInitialData] = useState<Department | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getDepartment = async () => {
      if (!id || !userId) return;
      const data = await fetchDepartmentById(id);
      if (data) {
        setInitialData(data as Department);
      } else {
        setFetchError('Department not found or failed to load.');
      }
    };
    getDepartment();
  }, [id, fetchDepartmentById, userId]);

  const handleSubmit = async (departmentData: Omit<Department, 'id' | 'categories'>) => {
    if (!id || !userId) return;

    const updatedDepartment = {
      slug: departmentData.slug,
      name: departmentData.name,
      description: departmentData.description || '',
      image: departmentData.image || '',
    };

    const result = await updateDepartment(id, updatedDepartment);
    if (result) {
      navigate('/seller/categories');
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-900">Edit Department</h2>
        <Link to="/seller/categories">
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
      {initialData && (
        <DepartmentForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}
