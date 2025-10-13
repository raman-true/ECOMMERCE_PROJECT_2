// src/pages/SellerSettingsPage.tsx
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useSellerSettings, useGlobalSettings } from '../hooks/useSupabase';
import { SellerSettingsForm } from '../components/seller/SellerSettingsForm';

export function SellerSettingsPage() {
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { settings, loading, error, upsertSettings } = useSellerSettings(userId);
  const { settings: globalSettings, loading: globalSettingsLoading, error: globalSettingsError } = useGlobalSettings();

  const handleSubmit = async (data: { tax_rate_override: number | null; shipping_rules: any }) => {
    try {
      const result = await upsertSettings({
        seller_id: userId!,
        tax_rate_override: data.tax_rate_override,
        shipping_rules: data.shipping_rules,
      });
      if (result) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (error: any) {
      console.error('Error saving seller settings:', error);
      alert(`Failed to save settings: ${error.message || 'Unknown error'}`);
    }
  };

  if (loading || globalSettingsLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (error || globalSettingsError) {
    return <div className="text-center py-8 text-red-500">Error: {error || globalSettingsError}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Seller Settings</h2>
      {globalSettings?.default_tax_rate !== null && (
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Global Default Tax Rate:</p>
          <p>A default tax rate of {(globalSettings?.default_tax_rate * 100)?.toFixed(2)}% is applied if you do not set your own.</p>
        </div>
      )}
      <SellerSettingsForm
        initialData={settings || { tax_rate_override: null, shipping_rules: {} }}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}