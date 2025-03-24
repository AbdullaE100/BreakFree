import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle reset password request
  const handleResetPassword = async () => {
    if (!validateEmail()) return;
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      // On mobile, we'll show success message rather than actually redirecting
      setIsSuccess(true);
    } catch (error: any) {
      // More descriptive error message for mobile users
      const errorMessage = error.message || 'Failed to send reset email.';
      console.error('Password reset error:', errorMessage);
      Alert.alert(
        'Password Reset Failed', 
        `${errorMessage}\n\nPlease check your network connection and try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate email
  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email');
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

  // Navigate back
  const goBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.content}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#4B5563" />
        </Pressable>
        
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {isSuccess
            ? 'We have sent password reset instructions to your email'
            : 'Enter your email and we\'ll send you instructions to reset your password'}
        </Text>
        
        {!isSuccess ? (
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
            
            <Pressable 
              style={styles.resetButton}
              onPress={handleResetPassword}
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
                <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Check your email for instructions on how to reset your password. If you don't see it in your inbox, check your spam folder.
            </Text>
            
            <Pressable 
              style={styles.backToLoginButton}
              onPress={() => router.push('/(onboarding)/login')}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
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
    marginBottom: 24,
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
  resetButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  successContainer: {
    marginTop: 16,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 32,
  },
  backToLoginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  backToLoginText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3D56F0',
  },
}); 