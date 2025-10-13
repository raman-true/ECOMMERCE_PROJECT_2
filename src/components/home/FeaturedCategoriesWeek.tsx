import React, { useMemo } from 'react';
import { Leaf, ChevronRight } from 'lucide-react';
import { useDepartments } from '../../hooks/useSupabase'; // Import the hook
import { Link } from 'react-router-dom'; // Import Link for navigation

export function FeaturedCategoriesWeek() {
  const { departments, loading, error } = useDepartments();

  // Flatten all categories from all departments into a single array
  const allCategories = useMemo(() => {
    if (!departments) return [];
    return departments.flatMap(department => department.categories || []);
  }, [departments]);

  // Select the first 4 categories to be "featured"
  const featuredCategories = allCategories.slice(0, 4);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading featured categories...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading featured categories: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-brown-900 mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-brown-900">
              Featured categories this week
            </h2>
          </div>
          <Link to="/shop" className="flex items-center px-4 py-2 border border-brown-300 rounded-lg hover:bg-brown-100 transition-colors">
            <span className="text-brown-900 font-medium">View all categories</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCategories.map((category) => {
            // Using a static Leaf icon as per the original design,
            // but you could extend categoryIconMap from ShopByCategory if needed.
            const Icon = Leaf; 
            return (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`} // Link to shop page with category slug
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image || 'https://placehold.co/400x300?text=No+Image'} // Fallback image
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-brown-900" />
                    <ChevronRight className="w-4 h-4 text-brown-500 group-hover:text-brown-900 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-brown-700 leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
