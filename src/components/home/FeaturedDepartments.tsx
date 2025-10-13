import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useDepartments } from '../../hooks/useSupabase'; // Import useDepartments hook
import { Link } from 'react-router-dom'; // Import Link for navigation

export function FeaturedDepartments() {
  const { departments, loading, error } = useDepartments(); // Fetch departments from Supabase

  if (loading) {
    return (
      <section className="py-16 bg-brown-300">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading departments...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-brown-300">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading departments: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-brown-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4">
            Shop by Department
          </h2>
          <p className="text-lg text-brown-900 max-w-2xl mx-auto">
            Find everything you need for your next project, organized by category for easy browsing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((department) => (
            <Link
              key={department.id}
              to={`/shop?department=${department.slug}`} // Link to shop page with department slug
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={department.image}
                  alt={department.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-brown-900 bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-brown-900 mb-2">
                  {department.name}
                </h3>
                <p className="text-brown-600 mb-4">
                  {department.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brown-500">
                    {/* Access categories from the joined data */}
                    {department.categories ? department.categories.length : 0} categories
                  </span>
                  <div className="flex items-center text-brown-900 group-hover:text-brown-700 transition-colors">
                    <span className="text-sm font-medium mr-1">Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop" // Link to general shop page
            className="inline-flex items-center px-8 py-3 bg-brown-900 text-white font-medium rounded-lg hover:bg-brown-700 transition-colors duration-200"
          >
            View All Departments
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
