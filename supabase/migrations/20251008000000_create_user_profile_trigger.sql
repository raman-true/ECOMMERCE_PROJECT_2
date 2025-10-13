/*
  # Create automatic user profile creation trigger

  1. New Function
    - `handle_new_user()` - Automatically creates a user_profiles entry when a user is created
    - Extracts first_name, last_name, and role from auth.users metadata
    - Handles both email confirmation enabled/disabled scenarios

  2. New Trigger
    - Fires AFTER INSERT on auth.users table
    - Automatically creates corresponding user_profiles entry
    - Uses metadata from signup process to populate profile fields

  3. Important Notes
    - This ensures user_profiles entry exists after email confirmation
    - Works whether email confirmation is enabled or disabled
    - Eliminates need for manual profile creation in frontend code
*/

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
