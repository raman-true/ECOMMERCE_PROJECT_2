import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DIYArticleForm } from '../components/admin/DIYArticleForm';
import { useAdminDIYArticles } from '../hooks/useSupabase';
import { DIYArticle } from '../types';

export function AdminEditDIYArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchDIYArticleById, updateDIYArticle, loading, error } = useAdminDIYArticles();
  const [initialData, setInitialData] = useState<DIYArticle | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getArticle = async () => {
      if (id) {
        const data = await fetchDIYArticleById(id);
        if (data) {
          const mappedArticle: DIYArticle = {
            id: data.id,
            slug: data.slug,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            featuredImage: data.featured_image || '',
            author: data.author || '',
            publishedAt: data.published_at,
            category: data.category || '',
            tags: data.tags || [],
          };
          setInitialData(mappedArticle);
        } else {
          setFetchError('DIY article not found or failed to load.');
        }
      }
    };
    getArticle();
  }, [id, fetchDIYArticleById]);

  const handleSubmit = async (articleData: Omit<DIYArticle, 'id'>) => {
    if (!id) return;

    const updatedArticle = {
      slug: articleData.slug,
      title: articleData.title,
      excerpt: articleData.excerpt || '',
      content: articleData.content || '',
      featured_image: articleData.featuredImage || '',
      author: articleData.author || '',
      published_at: articleData.publishedAt,
      category: articleData.category || '',
      tags: articleData.tags || [],
    };

    const result = await updateDIYArticle(id, updatedArticle);
    if (result) {
      navigate('/admin/articles');
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading article data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">DIY article not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit DIY Article</h2>
      {initialData && (
        <DIYArticleForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}
