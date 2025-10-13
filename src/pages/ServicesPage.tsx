import React, { useEffect, useState } from 'react';
import { useAdminServices } from '../hooks/useSupabase';
import { Service } from '../types';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, Tag } from 'lucide-react'; // Import icons for display

export function ServicesPage() {
  const { fetchAllServices, loading, error } = useAdminServices();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const getServices = async () => {
      const data = await fetchAllServices();
      if (data) {
        setServices(data as Service[]);
      }
    };
    getServices();
  }, [fetchAllServices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-brown-600">
          Loading services...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brown-100 py-8">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading services: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">Our Services</h1>
        
        {services.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-lg text-brown-700">No services available at the moment.</p>
            <p className="text-brown-600 mt-4">Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`} // Link to a hypothetical service detail page
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image || 'https://placehold.co/400x300?text=Service+Image'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-brown-700 text-sm mb-3 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-brown-900 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />{service.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-brown-600 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />{service.duration}
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
