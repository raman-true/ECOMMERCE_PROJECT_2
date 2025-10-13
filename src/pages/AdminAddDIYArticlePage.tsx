import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DIYArticleForm } from '../components/admin/DIYArticleForm';
import { useAdminDIYArticles } from '../hooks/useSupabase';
import { DIYArticle } from '../types';

export function AdminAddDIYArticlePage() {
  const navigate = useNavigate();
  const { addDIYArticle, loading, error } = useAdminDIYArticles();

  const handleSubmit = async (articleData: Omit<DIYArticle, 'id'>) => {
    const newArticle = {
      slug: articleData.slug,
      title: articleData.title,
      excerpt: articleData.excerpt || '',
      content: articleData.content || '',
      featured_image: articleData.featuredImage || '',
      author: articleData.author || '',
      published_at: articleData.publishedAt || new Date().toISOString(),
      category: articleData.category || '',
      tags: articleData.tags || [],
    };

    const result = await addDIYArticle(newArticle);
    if (result) {
      navigate('/admin/articles');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New DIY Article</h2>
      <DIYArticleForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
