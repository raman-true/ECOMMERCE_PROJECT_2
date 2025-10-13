import React, { useEffect, useState } from 'react';
import { useAdminDIYArticles } from '../hooks/useSupabase';
import { DIYArticle } from '../types';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react'; // Import icons for display

export function DIYAdvicePage() {
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
  }, [fetchAllDIYArticles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading DIY articles...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading DIY articles: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">DIY Advice & Articles</h1>
        
        {articles.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg text-brown-700">No DIY articles available at the moment.</p>
            <p className="text-brown-600 mt-4">Content coming soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/diy-advice/${article.slug}`} // Link to a hypothetical DIY article detail page
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.featuredImage || 'https://placehold.co/400x300?text=Article+Image'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-brown-500 text-brown-900 text-xs font-medium px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-brown-700 text-sm mb-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-brown-600 flex items-center">
                      <User className="w-4 h-4 mr-1" /> {article.author}
                    </span>
                    <span className="text-sm text-brown-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" /> {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
