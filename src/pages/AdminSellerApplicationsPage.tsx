import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import type { SellerApplication } from '../types';

export function AdminSellerApplicationsPage() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('seller_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setApplications(data as SellerApplication[] || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setActionLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_seller_application', {
        application_id: applicationId,
        admin_id: user.id,
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to approve application');
      }

      await loadApplications();
      setSelectedApplication(null);
    } catch (error: any) {
      setError(error.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reject_seller_application', {
        application_id: selectedApplication.id,
        admin_id: user.id,
        reason: rejectionReason,
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to reject application');
      }

      await loadApplications();
      setSelectedApplication(null);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (error: any) {
      setError(error.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (application: SellerApplication) => {
    setSelectedApplication(application);
    setShowRejectModal(true);
    setRejectionReason('');
    setError(null);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedApplication(null);
    setRejectionReason('');
    setError(null);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brown-900">Seller Applications</h1>
        <p className="mt-2 text-brown-600">Review and manage seller registration applications</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'approved' ? 'primary' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Approved
        </Button>
        <Button
          variant={filter === 'rejected' ? 'primary' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brown-900"></div>
          <p className="mt-4 text-brown-700">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-brown-50 rounded-lg">
          <p className="text-brown-600">No applications found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-brown-50 rounded-lg shadow-md p-6 border border-brown-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-brown-900">
                    {application.business_name}
                  </h3>
                  <p className="text-brown-600 text-sm">
                    Applied {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    application.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : application.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-brown-600">Business Type</p>
                  <p className="font-medium text-brown-900">
                    {application.business_type.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-brown-600">ABN</p>
                  <p className="font-medium text-brown-900">{application.abn}</p>
                </div>
                <div>
                  <p className="text-sm text-brown-600">Contact Person</p>
                  <p className="font-medium text-brown-900">{application.contact_person}</p>
                </div>
                <div>
                  <p className="text-sm text-brown-600">Contact Email</p>
                  <p className="font-medium text-brown-900">{application.contact_email}</p>
                </div>
                <div>
                  <p className="text-sm text-brown-600">Contact Phone</p>
                  <p className="font-medium text-brown-900">{application.contact_phone}</p>
                </div>
                {application.website && (
                  <div>
                    <p className="text-sm text-brown-600">Website</p>
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brown-600 hover:text-brown-800 underline"
                    >
                      {application.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm text-brown-600 mb-1">Business Description</p>
                <p className="text-brown-900">{application.description}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-brown-600 mb-1">Business Address</p>
                <p className="text-brown-900">
                  {application.business_address.address1}
                  {application.business_address.address2 && `, ${application.business_address.address2}`}
                  <br />
                  {application.business_address.city}, {application.business_address.state}{' '}
                  {application.business_address.postcode}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-brown-600 mb-1">Banking Information</p>
                <p className="text-brown-900">
                  Account Name: {application.bank_account_name}
                  <br />
                  BSB: {application.bank_bsb} | Account: {application.bank_account_number}
                </p>
              </div>

              {application.status === 'rejected' && application.rejection_reason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800 font-semibold mb-1">Rejection Reason:</p>
                  <p className="text-red-700">{application.rejection_reason}</p>
                </div>
              )}

              {application.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => handleApprove(application.id)}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openRejectModal(application)}
                    disabled={actionLoading}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-brown-900 mb-4">Reject Application</h3>
            <p className="text-brown-600 mb-4">
              Please provide a reason for rejecting this application. This will be visible to the applicant.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500 mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
              <Button
                variant="outline"
                onClick={closeRejectModal}
                disabled={actionLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
