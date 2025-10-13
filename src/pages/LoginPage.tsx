// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Attempt to sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        throw signInError;
      }

      // Fetch the authenticated user's information
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Failed to retrieve user information after login.');
      }

      // Fetch the user's role from user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle(); // Using maybeSingle() to handle cases where profile might not exist

      if (profileError || !profile) {
        throw new Error('Failed to retrieve user profile after login.');
      }

      // Block admin users from logging in through regular login
      if (profile.role === 'admin') {
        await supabase.auth.signOut();
        throw new Error('Admin users must login through the Admin Login page at /admin-login');
      }

      // Redirect based on user role
      if (profile.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/account'); // Default for 'customer' or other roles
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during login';
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm')) {
        setShowResendConfirmation(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      setResendMessage('Confirmation email sent successfully! Please check your inbox.');
      setShowResendConfirmation(false);
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold text-brown-900 mb-6 text-center">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-brown-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-brown-600 hover:text-brown-500"
            >
              create a new customer account
            </Link>
            <br />
            <Link
              to="/seller-register"
              className="font-medium text-brown-600 hover:text-brown-500"
            >
              Register as a Seller
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
            {showResendConfirmation && (
              <div className="mt-3">
                <p className="mb-2 text-sm">Please confirm your email address to login.</p>
                <Button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
                </Button>
              </div>
            )}
          </div>
        )}
        {resendMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            resendMessage.includes('successfully')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {resendMessage}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end mb-4">
            <Link
              to="/forgot-password"
              className="text-sm text-brown-600 hover:text-brown-800 underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
