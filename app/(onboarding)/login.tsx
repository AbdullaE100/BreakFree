import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn, isLoading, checkEmailVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Handle login submission
  const handleLogin = async () => {
    if (!validateInputs()) return;
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      // Auth context will handle the redirection if successful
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error is about email verification
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('not verified') || 
          error.message.includes('not confirmed')) {
        
        // Show option to resend verification email
        Alert.alert(
          'Email Not Verified',
          'Your email address has not been verified. Would you like to resend the verification email?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Resend',
              onPress: handleResendVerification
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle resending verification email
  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }
    
    setIsCheckingVerification(true);
    
    try {
      const result = await checkEmailVerification(email);
      Alert.alert('Verification Status', result.message);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check verification status');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Validate login inputs
  const validateInputs = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Navigate to signup screen
  const goToSignup = () => {
    router.push('/(onboarding)/signup');
  };

  // Navigate back
  const goBack = () => {
    router.back();
  };

  // Display loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D56F0" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <ArrowLeft size={24} color="#4B5563" />
          </Pressable>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </Pressable>
          </View>
          
          <View style={styles.forgotPasswordRow}>
            <Pressable 
              style={styles.verifyEmailButton}
              onPress={handleResendVerification}
              disabled={isCheckingVerification}
            >
              {isCheckingVerification ? (
                <ActivityIndicator size="small" color="#3D56F0" />
              ) : (
                <Text style={styles.verifyEmailText}>Resend Verification</Text>
              )}
            </Pressable>
            
            <Pressable 
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/(onboarding)/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          </View>
          
          <Pressable 
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={['#3D56F0', '#5B73FF']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={goToSignup}>
            <Text style={styles.signupText}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  verifyEmailButton: {
    padding: 4,
  },
  verifyEmailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  forgotPasswordButton: {
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3D56F0',
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 4,
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
  },
}); 