import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signUp, signIn, signOut, getCurrentUser } from '../lib/supabase';
import { toast } from 'react-toastify';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(({ user }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if email already exists by trying to sign in first
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-check'
      });
      
      // If no error on email (even with wrong password), email exists
      if (checkError && !checkError.message.includes('Invalid login credentials')) {
        // Email exists but different error
        if (checkError.message.includes('Email not confirmed')) {
          toast.error('An account already exists with this email address. Please check your email to confirm your account.');
          setLoading(false);
          return { success: false, error: 'Email already exists' };
        }
      }
      
      const { data, error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          toast.error('An account already exists with this email address. Please use a different one.');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password must be at least 6 characters long.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
        }
        setLoading(false);
        return { success: false, error };
      }

      if (data.user && !data.session) {
        toast.success('Account created successfully! You can now sign in.');
      } else {
        toast.success('Account created successfully!');
      }
      
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
      setLoading(false);
      return { success: false, error };
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before signing in.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else {
          toast.error(error.message || 'Failed to sign in. Please try again.');
        }
        setLoading(false);
        return { success: false, error };
      }

      toast.success('Welcome back!');
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      console.error('Signin error:', error);
      toast.error('Failed to sign in. Please try again.');
      setLoading(false);
      return { success: false, error };
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        toast.error(error.message || 'Failed to sign out');
      } else {
        toast.success('Logged out successfully');
      }
      
      setLoading(false);
      return { success: !error };
    } catch (error) {
      console.error('Signout error:', error);
      toast.error('Failed to sign out');
      setLoading(false);
      return { success: false };
    }
  };

  return {
    user,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}