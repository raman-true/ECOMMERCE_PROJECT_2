import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceForm } from '../components/admin/ServiceForm';
import { useAdminServices } from '../hooks/useSupabase';
import { Service } from '../types';

export function AdminAddServicePage() {
  const navigate = useNavigate();
  const { addService, loading, error } = useAdminServices();

  const handleSubmit = async (serviceData: Omit<Service, 'id'>) => {
    const newService = {
      slug: serviceData.slug,
      name: serviceData.name,
      description: serviceData.description || '',
      image: serviceData.image || '',
      price: serviceData.price,
      duration: serviceData.duration || '',
      category: serviceData.category || '',
    };

    const result = await addService(newService);
    if (result) {
      navigate('/admin/services');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Service</h2>
      <ServiceForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
