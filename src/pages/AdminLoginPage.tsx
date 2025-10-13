import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Attempting to sign in with:', email); // Log 1

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign-in error:', signInError.message); // Log 2
      setError(signInError.message);
      setLoading(false);
      return;
    }

    console.log('Sign-in successful. Fetching user session...'); // Log 3
    // After successful login, check user role
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Failed to retrieve user information after login:', userError); // Log 4
      setError('Failed to retrieve user information after login.');
      setLoading(false);
      return;
    }

    console.log('User session retrieved. User ID:', user.id); // Log 5
    console.log('Fetching user profile for role check...'); // Log 6

    // Fetch the user's role from user_profiles using the standard supabase client
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle(); // Use maybeSingle to handle cases where profile might not exist

    if (profileError || !profile || profile.role !== 'admin') {
      console.error('Profile fetch error or not an admin:', profileError || 'User is not admin');
      // If not an admin, log them out and show error
      await supabase.auth.signOut();
      setError('Access Denied: You do not have administrator privileges.');
      setLoading(false);
      return;
    }

    console.log('User is admin. Navigating to /admin'); // Log 8
    navigate('/admin'); // Redirect to admin dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-brown-900 mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-brown-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-brown-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
