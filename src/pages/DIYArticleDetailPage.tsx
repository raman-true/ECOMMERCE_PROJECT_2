import React, { useEffect } from 'react'; // Added useEffect
import { useParams } from 'react-router-dom';
import { useDIYArticleBySlug } from '../hooks/useSupabase';
import { Calendar, User } from 'lucide-react';

export function DIYArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { article, loading, error } = useDIYArticleBySlug(slug || '');

  // Update document title and meta description
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - DIY Advice - BuildMart`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.excerpt.substring(0, 160));
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = article.excerpt.substring(0, 160);
        document.head.appendChild(newMeta);
      }
    }
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading article...
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading article or article not found: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <img
            src={article.featured_image || 'https://placehold.co/800x400?text=Featured+Image'}
            alt={article.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
          <h1 className="text-4xl font-bold text-brown-900 mb-4">{article.title}</h1>
          <div className="flex items-center text-brown-600 text-sm mb-6 space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{article.author || 'Unknown Author'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(article.published_at).toLocaleDateString()}</span>
            </div>
            {article.category && (
              <span className="bg-brown-100 text-brown-700 px-2 py-1 rounded-full text-xs">
                {article.category}
              </span>
            )}
          </div>
          <div className="prose prose-lg max-w-none text-brown-800">
            <p className="text-lg leading-relaxed mb-4">{article.excerpt}</p>
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-brown-900 mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span key={index} className="bg-brown-300 text-brown-900 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}