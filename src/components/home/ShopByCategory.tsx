import React, { useMemo } from 'react';
import {
  Bath,
  Archive,
  Lightbulb,
  Sofa,
  Layers,
  Paintbrush,
  Wrench,
  Hammer,
  ChevronRight,
  Tag, // Added a generic icon for fallback
} from 'lucide-react';
import { useDepartments } from '../../hooks/useSupabase'; // Import the hook
import { Link } from 'react-router-dom'; // Import Link for navigation

// Map category slugs to Lucide icons
const categoryIconMap: { [key: string]: React.ElementType } = {
  'bathroom-plumbing': Bath,
  'storage-cleaning': Archive,
  'lighting-electrical': Lightbulb,
  'indoor-living': Sofa,
  'flooring': Layers,
  'paint-wallpaper': Paintbrush,
  'tools': Wrench,
  'building-hardware': Hammer,
  // Add more mappings as needed for other categories
};

export function ShopByCategory() {
  const { departments, loading, error } = useDepartments();

  // Flatten all categories from all departments into a single array
  const allCategories = useMemo(() => {
    if (!departments) return [];
    return departments.flatMap(department => department.categories || []);
  }, [departments]);

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading categories...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading categories: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-brown-900 mr-4"></div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-brown-900">
              Shop by category
            </h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm lg:text-base font-medium">View all categories</span>
          </Link>
        </div>

        {/* Mobile: 4-column grid */}
        <div className="grid grid-cols-4 gap-3 md:hidden">
          {allCategories.map((category) => {
            const Icon = categoryIconMap[category.slug] || Tag; // Use Tag as fallback
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-2 hover:shadow-lg transition-shadow">
                  <Icon className="w-6 h-6 text-brown-900" />
                </div>
                <p className="text-xs font-medium text-center text-brown-900">
                  {category.name}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Desktop: flex with equal distribution */}
        <div className="hidden md:flex md:justify-between md:items-start">
          {allCategories.map((category) => {
            const Icon = categoryIconMap[category.slug] || Tag; // Use Tag as fallback
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-3 hover:shadow-lg transition-shadow">
                  <Icon className="w-8 h-8 text-brown-900" />
                </div>
                <p className="text-sm font-medium text-center text-brown-900">
                  {category.name}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-6 text-center">
          <Link to="/shop" className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium">View all categories</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
