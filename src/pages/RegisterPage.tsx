// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'customer',
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!user) {
        throw new Error('Registration failed. Please try again.');
      }

      setRegisteredEmail(email);

      if (!session) {
        setEmailConfirmationRequired(true);
      } else {
        navigate('/account');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration');
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
        email: registeredEmail,
      });

      if (error) {
        throw error;
      }

      setResendMessage('Confirmation email sent successfully! Please check your inbox.');
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (emailConfirmationRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brown-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-brown-700 mb-2">
              A confirmation link has been sent to:
            </p>
            <p className="font-semibold text-brown-900 mb-4">
              {registeredEmail}
            </p>
            <p className="text-sm text-brown-600 mb-6">
              Please check your inbox and click the confirmation link to activate your account.
              Don't forget to check your spam or junk folder if you don't see it.
            </p>
            {resendMessage && (
              <div className={`mb-4 p-3 rounded-md text-sm ${
                resendMessage.includes('successfully')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {resendMessage}
              </div>
            )}
            <Button
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="w-full mb-4"
            >
              {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
            </Button>
            <Link
              to="/login"
              className="text-sm text-brown-600 hover:text-brown-500 underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold text-brown-900 mb-6 text-center">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-brown-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-brown-600 hover:text-brown-500"
            >
              sign in to your existing account
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
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="first-name" className="sr-only">
                First name
              </label>
              <input
                id="first-name"
                name="first-name"
                type="text"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">
                Last name
              </label>
              <input
                id="last-name"
                name="last-name"
                type="text"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
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
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
