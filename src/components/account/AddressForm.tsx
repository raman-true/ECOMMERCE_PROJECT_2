import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAddresses } from '../../hooks/useSupabase';
import { Button } from '../ui/Button';

interface AddressFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
  const { state } = useApp();
  const { addAddress, updateAddress } = useAddresses(state.user?.id || null);

  const [formData, setFormData] = useState({
    type: 'shipping' as 'billing' | 'shipping',
    first_name: '',
    last_name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'shipping',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        company: initialData.company || '',
        address1: initialData.address1 || '',
        address2: initialData.address2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postcode: initialData.postcode || '',
        country: initialData.country || 'Australia',
        phone: initialData.phone || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        await updateAddress(initialData.id, formData);
      } else {
        await addAddress(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const australianStates = [
    'Australian Capital Territory',
    'New South Wales',
    'Northern Territory',
    'Queensland',
    'South Australia',
    'Tasmania',
    'Victoria',
    'Western Australia',
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Address Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
          >
            <option value="shipping">Shipping Address</option>
            <option value="billing">Billing Address</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Company (Optional)
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              State *
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              required
            >
              <option value="">Select State</option>
              {australianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              Postcode *
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Country *
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            required
          >
            <option value="Australia">Australia</option>
            <option value="New Zealand">New Zealand</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Phone (Optional)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Address' : 'Save Address')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}