import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('=== RESET PASSWORD PAGE LOADED - VERSION 2.0 ===');
    console.log('Full URL:', window.location.href);
    console.log('Hash:', location.hash);
    console.log('Search:', location.search);
    console.log('Pathname:', location.pathname);
    
    // Force alert to ensure we see this
    alert('Reset page loaded! Check console for details.');
    
    const validateResetToken = async () => {
      console.log('=== STARTING TOKEN VALIDATION ===');
      setValidatingToken(true);

      try {
        // Check for error parameters first
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const queryParams = new URLSearchParams(location.search);

        console.log('Hash params:', Object.fromEntries(hashParams));
        console.log('Query params:', Object.fromEntries(queryParams));

        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorParam) {
          console.log('ERROR FOUND:', errorParam, errorDescription);
          const decodedError = errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'Invalid or expired reset link';
          setError(decodedError);
          setValidatingToken(false);
          return;
        }

        // Get token and type from URL - handle both PKCE and implicit flows
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        const token = hashParams.get('token') || queryParams.get('token');
        const code = queryParams.get('code'); // PKCE flow uses 'code' parameter

        console.log('=== TOKEN EXTRACTION ===');
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('Type:', type);
        console.log('Generic Token:', token);
        console.log('Code (PKCE):', code);

        // Handle PKCE flow (code parameter)
        if (code) {
          console.log('=== PKCE FLOW DETECTED - Using exchangeCodeForSession ===');
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          console.log('Code exchange result:', { data, exchangeError });

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError('Failed to validate reset link. Please try again.');
            setValidatingToken(false);
            return;
          }

          if (!data.session) {
            console.log('NO SESSION CREATED FROM CODE');
            setError('Invalid or expired reset link. Please request a new password reset.');
            setValidatingToken(false);
            return;
          }

          console.log('=== SUCCESS - Session established via PKCE ===');
          setValidatingToken(false);
          return;
        }

        // Handle implicit flow (access_token in hash)
        if (!accessToken && !token) {
          console.log('NO TOKEN OR CODE FOUND - Setting error');
          setError('Invalid reset link. Please request a new password reset.');
          setValidatingToken(false);
          return;
        }

        // For implicit flow, check type
        if (type !== 'recovery') {
          console.log('WRONG TYPE:', type, '- Setting error');
          setError('Invalid reset link. Please request a new password reset.');
          setValidatingToken(false);
          return;
        }

        console.log('=== ATTEMPTING SESSION SETUP (Implicit Flow) ===');
        
        // Try to set session with available tokens
        const tokenToUse = accessToken || token;
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: tokenToUse,
          refresh_token: refreshToken || ''
        });

        console.log('Session setup result:', { data, sessionError });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to validate reset link. Please try again.');
          setValidatingToken(false);
          return;
        }

        if (!data.session) {
          console.log('NO SESSION CREATED');
          setError('Invalid or expired reset link. Please request a new password reset.');
          setValidatingToken(false);
          return;
        }

        console.log('=== SUCCESS - Session established ===');
        setValidatingToken(false);

      } catch (err) {
        console.error('=== CATCH ERROR ===', err);
        setError('An unexpected error occurred. Please try again.');
        setValidatingToken(false);
      }
    };

    validateResetToken();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setError('Your session has expired. Please request a new password reset link.');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      await supabase.auth.signOut();

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.message.includes('session')) {
        setError('Your session has expired. Please request a new password reset link.');
      } else {
        setError(error.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-brown-100 mb-4">
              <svg className="animate-spin h-6 w-6 text-brown-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Validating Reset Link</h2>
            <p className="text-brown-600">
              Please wait while we verify your password reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Reset Link Invalid</h2>
            <p className="text-red-600 mb-6">
              {error}
            </p>
            <Button onClick={() => navigate('/forgot-password')} className="w-full">
              Request New Reset Link
            </Button>
            <button
              onClick={() => navigate('/login')}
              className="mt-3 text-sm text-brown-600 hover:text-brown-800 underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Password Reset Successful!</h2>
            <p className="text-brown-700 mb-6">
              Your password has been successfully reset. You will be redirected to the login page in a moment.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-brown-900 mb-2 text-center">Reset Your Password</h2>
        <p className="text-brown-600 mb-6 text-center">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brown-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder="Enter new password"
              minLength={6}
              disabled={loading}
            />
            <p className="text-xs text-brown-600 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-brown-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              placeholder="Confirm new password"
              minLength={6}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-brown-600 hover:text-brown-800 underline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
