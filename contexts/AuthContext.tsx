import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getProfile, UserProfile, getStreak, Streak } from '../lib/supabase';
import { router } from 'expo-router';

// Define the Auth context state and methods
type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  streak: Streak | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; emailConfirmationRequired: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshStreak: () => Promise<void>;
  checkEmailVerification: (email: string) => Promise<{ verified: boolean; emailSent: boolean; message: string }>;
};

// Create a context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  streak: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => ({ user: null, emailConfirmationRequired: false }),
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  refreshProfile: async () => {},
  refreshStreak: async () => {},
  checkEmailVerification: async () => ({ verified: false, emailSent: false, message: '' }),
});

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize the auth state
  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Set up a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        console.log('Session exists:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated:', session.user.email);
          await loadUserData(session.user.id);
          
          // Navigate to main app when signed in
          if (event === 'SIGNED_IN') {
            console.log('Navigating to main app after signin');
            router.replace('/(tabs)');
          }
        } else {
          console.log('No authenticated user');
          setProfile(null);
          setStreak(null);
          setIsLoading(false);
          
          // Navigate to onboarding when signed out
          if (event === 'SIGNED_OUT') {
            console.log('Navigating to onboarding after signout');
            router.replace('/(onboarding)');
          }
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile and streak data
  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    
    try {
      // Load user profile
      const userProfile = await getProfile(userId);
      setProfile(userProfile);
      
      // Load streak data
      const userStreak = await getStreak(userId);
      setStreak(userStreak);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const userProfile = await getProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Refresh streak data
  const refreshStreak = async () => {
    if (!user) return;
    
    try {
      const userStreak = await getStreak(user.id);
      setStreak(userStreak);
    } catch (error) {
      console.error('Error refreshing streak:', error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'exp://localhost:19000/login',
        }
      });
      
      if (error) {
        console.error('Signup error:', error.message);
        throw error;
      }
      
      console.log('Signup response data:', JSON.stringify(data));
      console.log('User created?', !!data.user);
      console.log('Session created?', !!data.session);
      
      // Check if email confirmation is required
      if (data.user && data.session === null) {
        console.log('Email confirmation required for:', email);
        // Email confirmation is required
        setIsLoading(false);
        return { user: data.user, emailConfirmationRequired: true };
      }
      
      if (data.user) {
        console.log('Creating profile for user:', data.user.id);
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          name,
          goal_days: 90, // Default goal
          notifications_enabled: true,
          start_date: new Date().toISOString(),
        });
        
        console.log('Creating streak for user:', data.user.id);
        // Initialize streak
        await supabase.from('streaks').insert({
          user_id: data.user.id,
          current_streak: 0,
          best_streak: 0,
          total_clean_days: 0,
          last_check_in: new Date().toISOString(),
          relapse_count: 0,
        });
      }
      
      setIsLoading(false);
      return { user: data.user, emailConfirmationRequired: false };
    } catch (error: any) {
      console.error('Error signing up:', error);
      console.error('Error details:', error.message);
      setIsLoading(false);
      throw error;
    }
  };

  // Send password reset email
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'exp://localhost:19000/reset-password',
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Update user's password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Check email verification status and resend verification if needed
  const checkEmailVerification = async (email: string) => {
    try {
      console.log('Checking verification status for:', email);
      
      // Get user by email - requires admin privileges, not possible with client
      // Instead we'll try to sign in and catch the error
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'this-is-intentionally-wrong-password',
      });
      
      console.log('Sign-in check result:', error?.message);
      
      if (error) {
        // Check if the error message indicates unverified email
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('not verified') || 
            error.message.includes('not confirmed')) {
          
          console.log('Email not verified, sending new verification email');
          
          // Resend verification email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
              emailRedirectTo: 'exp://localhost:19000/login',
            },
          });
          
          if (resendError) {
            console.error('Error resending verification:', resendError.message);
            throw resendError;
          }
          
          return { 
            verified: false, 
            emailSent: true, 
            message: 'Verification email has been resent. Please check your inbox and spam folder.' 
          };
        }
        
        // If the error is about incorrect password, the email is likely verified
        // but the password is wrong (as expected in our test)
        if (error.message.includes('Invalid login') || 
            error.message.includes('wrong password') || 
            error.message.includes('Invalid credentials')) {
          
          return { 
            verified: true, 
            emailSent: false, 
            message: 'Email appears to be verified. Please try logging in with the correct password.' 
          };
        }
        
        // Other unknown error
        return { 
          verified: false, 
          emailSent: false, 
          message: `Couldn't determine verification status: ${error.message}` 
        };
      }
      
      // If no error, somehow the login worked (shouldn't happen with wrong password)
      return { 
        verified: true, 
        emailSent: false, 
        message: 'Email is verified.' 
      };
    } catch (error: any) {
      console.error('Error checking verification:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    session,
    user,
    profile,
    streak,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    refreshStreak,
    checkEmailVerification,
  };

  // Provide context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 