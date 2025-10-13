import React, { useEffect } from 'react'; // Added useEffect
import { useParams } from 'react-router-dom';
import { useServiceBySlug } from '../hooks/useSupabase';
import { DollarSign, Clock, Tag } from 'lucide-react';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { service, loading, error } = useServiceBySlug(slug || '');

  // Update document title and meta description
  useEffect(() => {
    if (service) {
      document.title = `${service.name} - Services - BuildMart`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', service.description.substring(0, 160));
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = 'description';
        newMeta.content = service.description.substring(0, 160);
        document.head.appendChild(newMeta);
      }
    }
  }, [service]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading service details...
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading service or service not found: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <img
            src={service.image || 'https://placehold.co/800x400?text=Service+Image'}
            alt={service.name}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
          <h1 className="text-4xl font-bold text-brown-900 mb-4">{service.name}</h1>
          <div className="flex items-center text-brown-600 text-sm mb-6 space-x-4">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>${service.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{service.duration || 'N/A'}</span>
            </div>
            {service.category && (
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                <span>{service.category}</span>
              </div>
            )}
          </div>
          <div className="prose prose-lg max-w-none text-brown-800">
            <p className="text-lg leading-relaxed">{service.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}