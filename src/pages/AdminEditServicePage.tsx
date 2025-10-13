import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServiceForm } from '../components/admin/ServiceForm';
import { useAdminServices } from '../hooks/useSupabase';
import { Service } from '../types';

export function AdminEditServicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchServiceById, updateService, loading, error } = useAdminServices();
  const [initialData, setInitialData] = useState<Service | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getService = async () => {
      if (id) {
        const data = await fetchServiceById(id);
        if (data) {
          setInitialData(data as Service);
        } else {
          setFetchError('Service not found or failed to load.');
        }
      }
    };
    getService();
  }, [id, fetchServiceById]);

  const handleSubmit = async (serviceData: Omit<Service, 'id'>) => {
    if (!id) return;

    const updatedService = {
      slug: serviceData.slug,
      name: serviceData.name,
      description: serviceData.description || '',
      image: serviceData.image || '',
      price: serviceData.price,
      duration: serviceData.duration || '',
      category: serviceData.category || '',
    };

    const result = await updateService(id, updatedService);
    if (result) {
      navigate('/admin/services');
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading service data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">Service not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit Service</h2>
      {initialData && (
        <ServiceForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}
