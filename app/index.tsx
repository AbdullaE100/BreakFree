import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { session, isLoading } = useAuth();
  
  // While checking authentication state, show nothing
  if (isLoading) {
    return null;
  }
  
  // If user is authenticated, redirect to the main app
  // Otherwise, redirect to onboarding
  return session ? <Redirect href="/(tabs)" /> : <Redirect href="/(onboarding)" />;
} 