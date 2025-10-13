import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAdminCategoriesDepartments } from '../hooks/useSupabase';
import { Department, Category } from '../types';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

export function AdminCategoryDepartmentListPage() {
  const { loading, error, fetchAllDepartmentsWithCategories, deleteDepartment, deleteCategory } = useAdminCategoriesDepartments();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getDepartments = async () => {
      const data = await fetchAllDepartmentsWithCategories();
      if (data) {
        setDepartments(data as Department[]);
      }
    };
    getDepartments();
  }, [refresh, fetchAllDepartmentsWithCategories]);

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"? This will also delete all associated categories.`)) {
      const success = await deleteDepartment(id);
      if (success) {
        setRefresh(prev => !prev);
      } else {
        alert('Failed to delete department.');
      }
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      const success = await deleteCategory(id);
      if (success) {
        setRefresh(prev => !prev);
      } else {
        alert('Failed to delete category.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories and departments...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-900">Categories & Departments</h2>
        {/* Modified: Make buttons stack on mobile, horizontal on md+ */}
        <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
          <Link to="/admin/categories/new-department">
            <Button>
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Department
            </Button>
          </Link>
          <Link to="/admin/categories/new-category">
            <Button>
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Category
            </Button>
          </Link>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="text-center text-gray-600 py-10">No departments found.</div>
      ) : (
        <div className="space-y-8">
          {departments.map((department) => (
            <div key={department.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-brown-900">{department.name}</h3>
                {/* Modified: Make buttons stack on mobile, horizontal on md+ */}
                <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                  <Link to={`/admin/categories/departments/${department.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" /> Edit Department
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteDepartment(department.id, department.name)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete Department
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {department.categories && department.categories.length > 0 ? (
                  <>
                    {/* Desktop Table View for Categories */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slug
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product Count
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {department.categories.map((category) => (
                            <tr key={category.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {category.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {category.slug}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {category.product_count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/admin/categories/categories/${category.id}/edit`} className="text-brown-600 hover:text-brown-900 mr-3">
                                  <Edit className="w-5 h-5 inline" />
                                </Link>
                                <button onClick={() => handleDeleteCategory(category.id, category.name)} className="text-red-600 hover:text-red-900">
                                  <Trash2 className="w-5 h-5 inline" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View for Categories */}
                    <div className="md:hidden space-y-4 mt-4"> {/* Added mt-4 for spacing from department header */}
                      {department.categories.map((category) => (
                        <div key={category.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-2"> {/* Changed items-center to items-start */}
                            <h4 className="text-lg font-semibold text-brown-900 flex-1 min-w-0 break-words pr-2">{category.name}</h4> {/* Added flex-1, min-w-0, break-words, pr-2 */}
                            <span className="text-sm text-gray-500 flex-shrink-0">{category.slug}</span> {/* Added flex-shrink-0 */}
                          </div>
                          <div className="space-y-1 text-sm text-brown-700 mb-4">
                            <p>
                              Product Count: <span className="font-medium">{category.product_count}</span>
                            </p>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Link to={`/admin/categories/categories/${category.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.id, category.name)} className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 text-center py-4">No categories in this department.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
