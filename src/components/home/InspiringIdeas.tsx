import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminDIYArticles } from '../../hooks/useSupabase';
import { DIYArticle } from '../../types'; // Assuming DIYArticle type is correctly defined

export function InspiringIdeas() {
  const { fetchAllDIYArticles, loading, error } = useAdminDIYArticles();
  const [articles, setArticles] = useState<DIYArticle[]>([]);

  useEffect(() => {
    const getArticles = async () => {
      const fetchedData = await fetchAllDIYArticles();
      if (fetchedData) {
        // Map fetched data from snake_case to camelCase as per DIYArticle interface
        const mappedArticles: DIYArticle[] = fetchedData.map(article => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt || '',
          content: article.content || '',
          featuredImage: article.featured_image || '', // Mapping featured_image to featuredImage
          author: article.author || '',
          publishedAt: article.published_at, // Mapping published_at to publishedAt
          category: article.category || '',
          tags: article.tags || [],
        }));
        setArticles(mappedArticles);
      }
    };
    getArticles();
  }, [fetchAllDIYArticles]); // Dependency array to re-run when fetchAllDIYArticles changes

  if (loading) {
    return (
      <section className="py-12 bg-brown-100">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading inspiring ideas...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-brown-100">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading inspiring ideas: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-brown-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-brown-900 mr-4"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-brown-900">
              Inspiring ideas to update your space
            </h2>
          </div>
          <Link to="/diy-advice" className="flex items-center px-4 py-2 border border-brown-300 rounded-lg hover:bg-brown-200 transition-colors">
            <span className="text-brown-900 font-medium">All D.I.Y. Advice categories</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/diy-advice/${article.slug}`} // Link to a specific DIY article page
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-brown-500 text-brown-900 text-xs font-medium px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-sm text-brown-700 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
