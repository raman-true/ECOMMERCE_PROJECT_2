import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAddresses } from '../../hooks/useSupabase';
import { Button } from '../ui/Button';
import { Edit, Trash2, MapPin } from 'lucide-react';

interface AddressListProps {
  onEdit: (address: any) => void;
}

export function AddressList({ onEdit }: AddressListProps) {
  const { state } = useApp();
  const { addresses, loading, error, deleteAddress } = useAddresses(state.user?.id || null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
      } catch (err) {
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-brown-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-500">
          Error loading addresses: {error}
        </div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <MapPin className="w-16 h-16 text-brown-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-brown-900 mb-2">No addresses saved</h3>
          <p className="text-brown-600">Add your first address to get started with faster checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  address.type === 'billing' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {address.type === 'billing' ? 'Billing' : 'Shipping'}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-brown-900">
                  {address.first_name} {address.last_name}
                </p>
                {address.company && (
                  <p className="text-brown-600">{address.company}</p>
                )}
                <p className="text-brown-600">{address.address1}</p>
                {address.address2 && (
                  <p className="text-brown-600">{address.address2}</p>
                )}
                <p className="text-brown-600">
                  {address.city}, {address.state} {address.postcode}
                </p>
                <p className="text-brown-600">{address.country}</p>
                {address.phone && (
                  <p className="text-brown-600">Phone: {address.phone}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(address)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(address.id)}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}