import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { SellerLayout } from '../components/layout/SellerLayout';
import { Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';

interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_email: string | null;
  notification_phone: string | null;
  notify_on_new_order: boolean;
  notify_on_order_status_change: boolean;
  notify_on_low_stock: boolean;
}

export function SellerNotificationPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: '',
    email_notifications: true,
    sms_notifications: false,
    notification_email: null,
    notification_phone: null,
    notify_on_new_order: true,
    notify_on_order_status_change: true,
    notify_on_low_stock: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setPreferences(data);
      } else {
        setPreferences(prev => ({ ...prev, user_id: user.id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: upsertError } = await supabase
        .from('notification_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notification preferences...</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          </div>
          <p className="text-gray-600">
            Manage how and when you receive notifications about your orders and products.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Notification preferences saved successfully!</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={preferences.email_notifications}
                  onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <label htmlFor="email_notifications" className="font-medium text-gray-900 cursor-pointer">
                    Enable email notifications
                  </label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>

              {preferences.email_notifications && (
                <div>
                  <label htmlFor="notification_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Email Address
                  </label>
                  <input
                    type="email"
                    id="notification_email"
                    value={preferences.notification_email || ''}
                    onChange={(e) => setPreferences({ ...preferences, notification_email: e.target.value })}
                    placeholder="Enter email or leave blank to use account email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to use your account email address
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">SMS Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sms_notifications"
                  checked={preferences.sms_notifications}
                  onChange={(e) => setPreferences({ ...preferences, sms_notifications: e.target.checked })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <label htmlFor="sms_notifications" className="font-medium text-gray-900 cursor-pointer">
                    Enable SMS notifications
                  </label>
                  <p className="text-sm text-gray-600">Receive notifications via text message</p>
                </div>
              </div>

              {preferences.sms_notifications && (
                <div>
                  <label htmlFor="notification_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number for SMS
                  </label>
                  <input
                    type="tel"
                    id="notification_phone"
                    value={preferences.notification_phone || ''}
                    onChange={(e) => setPreferences({ ...preferences, notification_phone: e.target.value })}
                    placeholder="+61 4XX XXX XXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +61 for Australia)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Types</h2>
            <p className="text-sm text-gray-600 mb-6">Choose which events trigger notifications</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="notify_on_new_order"
                  checked={preferences.notify_on_new_order}
                  onChange={(e) => setPreferences({ ...preferences, notify_on_new_order: e.target.checked })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <label htmlFor="notify_on_new_order" className="font-medium text-gray-900 cursor-pointer">
                    New Order Placed
                  </label>
                  <p className="text-sm text-gray-600">Get notified when a customer places an order containing your products</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="notify_on_order_status_change"
                  checked={preferences.notify_on_order_status_change}
                  onChange={(e) => setPreferences({ ...preferences, notify_on_order_status_change: e.target.checked })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <label htmlFor="notify_on_order_status_change" className="font-medium text-gray-900 cursor-pointer">
                    Order Status Changes
                  </label>
                  <p className="text-sm text-gray-600">Get notified when order status changes (shipped, delivered, etc.)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="notify_on_low_stock"
                  checked={preferences.notify_on_low_stock}
                  onChange={(e) => setPreferences({ ...preferences, notify_on_low_stock: e.target.checked })}
                  className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <label htmlFor="notify_on_low_stock" className="font-medium text-gray-900 cursor-pointer">
                    Low Stock Alerts
                  </label>
                  <p className="text-sm text-gray-600">Get notified when your product inventory is running low</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={fetchPreferences}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="min-w-[150px]"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>When a customer places an order with your products, notifications are automatically created</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Notifications are sent based on your preferences above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can change these settings anytime</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Check your notification history in the Seller Dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </SellerLayout>
  );
}
