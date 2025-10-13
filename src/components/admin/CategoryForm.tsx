import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { Category } from '../../types';
import { useDepartments } from '../../hooks/useSupabase'; // Assuming this hook fetches all departments

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: Omit<Category, 'id' | 'productCount'> & { department_id: string | null }) => void;
  loading: boolean;
  error: string | null;
}

export function CategoryForm({ initialData, onSubmit, loading, error }: CategoryFormProps) {
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [departmentId, setDepartmentId] = useState(initialData?.department_id || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description);
      setImage(initialData.image);
      setDepartmentId(initialData.department_id || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      slug,
      description,
      image,
      department_id: departmentId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
        <ImageUpload
          value={image}
          onChange={setImage}
          bucket="images"
          folder="categories"
          maxSize={5}
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
        <select
          id="department"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
          required
        >
          <option value="">Select Department</option>
          {departmentsLoading ? (
            <option disabled>Loading departments...</option>
          ) : departmentsError ? (
            <option disabled>Error loading departments</option>
          ) : (
            departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))
          )}
        </select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : (initialData ? 'Update Category' : 'Add Category')}
      </Button>
    </form>
  );
}
