import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import type { SellerApplication } from '../types';

export function SellerApplicationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<SellerApplication | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'sole_trader' as 'sole_trader' | 'partnership' | 'company' | 'trust',
    abn: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
    description: '',
    bankAccountName: '',
    bankBsb: '',
    bankAccountNumber: '',
  });

  useEffect(() => {
    checkExistingApplication();
  }, []);

  const checkExistingApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('seller_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingApplication(data as SellerApplication);
      }
    } catch (error: any) {
      console.error('Error checking application:', error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit an application');
      }

      const { error: insertError } = await supabase
        .from('seller_applications')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          abn: formData.abn,
          business_address: {
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            postcode: formData.postcode,
            country: formData.country,
          },
          contact_person: formData.contactPerson,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail,
          website: formData.website || null,
          description: formData.description,
          bank_account_name: formData.bankAccountName,
          bank_bsb: formData.bankBsb,
          bank_account_number: formData.bankAccountNumber,
          status: 'pending',
        });

      if (insertError) throw insertError;

      await checkExistingApplication();
    } catch (error: any) {
      setError(error.message || 'An error occurred while submitting your application');
    } finally {
      setLoading(false);
    }
  };

  if (checkingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brown-900"></div>
          <p className="mt-4 text-brown-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-brown-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-brown-900 mb-6">Your Seller Application</h2>

            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                existingApplication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                existingApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {existingApplication.status === 'pending' && 'Pending Review'}
                {existingApplication.status === 'approved' && 'Approved'}
                {existingApplication.status === 'rejected' && 'Rejected'}
              </div>
            </div>

            {existingApplication.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <p className="text-blue-800">
                  Your application is currently under review. We'll notify you once an admin has reviewed your application.
                </p>
              </div>
            )}

            {existingApplication.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <p className="text-green-800 mb-4">
                  Congratulations! Your seller application has been approved. You can now access the seller dashboard.
                </p>
                <Link to="/seller">
                  <Button>Go to Seller Dashboard</Button>
                </Link>
              </div>
            )}

            {existingApplication.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-800 mb-2 font-semibold">
                  Your application was not approved.
                </p>
                {existingApplication.rejection_reason && (
                  <p className="text-red-700 mb-4">
                    Reason: {existingApplication.rejection_reason}
                  </p>
                )}
                <p className="text-red-700">
                  You can submit a new application by addressing the issues mentioned above.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-brown-900">Business Name</h3>
                <p className="text-brown-700">{existingApplication.business_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">Business Type</h3>
                <p className="text-brown-700">{existingApplication.business_type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">ABN</h3>
                <p className="text-brown-700">{existingApplication.abn}</p>
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">Contact Email</h3>
                <p className="text-brown-700">{existingApplication.contact_email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">Contact Phone</h3>
                <p className="text-brown-700">{existingApplication.contact_phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">Submitted At</h3>
                <p className="text-brown-700">
                  {new Date(existingApplication.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {existingApplication.status === 'rejected' && (
              <div className="mt-6">
                <Button
                  onClick={() => setExistingApplication(null)}
                  variant="outline"
                >
                  Submit New Application
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-brown-900 mb-2">Apply to Become a Seller</h2>
          <p className="text-brown-600 mb-6">
            Complete this application to sell your products on our platform. All applications are reviewed by our admin team.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-brown-900 mb-4">Business Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-brown-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-brown-700 mb-1">
                    Business Type *
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    required
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  >
                    <option value="sole_trader">Sole Trader</option>
                    <option value="partnership">Partnership</option>
                    <option value="company">Company</option>
                    <option value="trust">Trust</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="abn" className="block text-sm font-medium text-brown-700 mb-1">
                    Australian Business Number (ABN) *
                  </label>
                  <input
                    type="text"
                    id="abn"
                    name="abn"
                    required
                    value={formData.abn}
                    onChange={handleInputChange}
                    placeholder="12 345 678 901"
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-brown-700 mb-1">
                    Business Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your business and the types of products you plan to sell..."
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-brown-900 mb-4">Business Address</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address1" className="block text-sm font-medium text-brown-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="address1"
                    name="address1"
                    required
                    value={formData.address1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div>
                  <label htmlFor="address2" className="block text-sm font-medium text-brown-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-brown-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-brown-700 mb-1">
                      State *
                    </label>
                    <select
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    >
                      <option value="">Select State</option>
                      <option value="NSW">New South Wales</option>
                      <option value="VIC">Victoria</option>
                      <option value="QLD">Queensland</option>
                      <option value="SA">South Australia</option>
                      <option value="WA">Western Australia</option>
                      <option value="TAS">Tasmania</option>
                      <option value="NT">Northern Territory</option>
                      <option value="ACT">Australian Capital Territory</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-brown-700 mb-1">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    required
                    value={formData.postcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-brown-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-brown-700 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-brown-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-brown-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    required
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-brown-700 mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-brown-900 mb-4">Banking Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="bankAccountName" className="block text-sm font-medium text-brown-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    id="bankAccountName"
                    name="bankAccountName"
                    required
                    value={formData.bankAccountName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bankBsb" className="block text-sm font-medium text-brown-700 mb-1">
                      BSB *
                    </label>
                    <input
                      type="text"
                      id="bankBsb"
                      name="bankBsb"
                      required
                      value={formData.bankBsb}
                      onChange={handleInputChange}
                      placeholder="123-456"
                      className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-brown-700 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      required
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-brown-200 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </Button>
              <p className="mt-4 text-sm text-brown-600 text-center">
                By submitting this application, you agree to our terms and conditions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
