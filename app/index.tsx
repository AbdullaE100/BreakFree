import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';

export default function Index() {
  const { session, isLoading } = useAuth();
  
  // While checking authentication state, show loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D56F0" />
      </View>
    );
  }
  
  // Redirect to home instead of profile
  return session ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(onboarding)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
}); 