import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anonymous key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our database schema
export type UserProfile = {
  id: string;
  created_at: string;
  email: string;
  name: string;
  avatar_url?: string;
  goal_days: number;
  motivation_statement?: string;
  notifications_enabled: boolean;
  start_date: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  best_streak: number;
  total_clean_days: number;
  last_check_in: string;
  relapse_count: number;
};

export type Urge = {
  id: string;
  user_id: string;
  intensity: number;
  location: string;
  trigger: string;
  notes?: string;
  overcome: boolean;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  content: string;
  triggers: string[];
  had_urge: boolean;
  created_at: string;
  updated_at: string;
  entry_type: 'daily' | 'cbt' | 'gratitude' | 'milestone' | 'relapse_prevention' | 'custom';
  emotions: string[];
  thoughts: string[];
  behaviors: string[];
  coping_strategies: string[];
  gratitude_items: string[];
  lessons_learned: string;
  goals: string[];
  physical_symptoms: string[];
  recovery_wins: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  achieved: boolean;
  achieved_at?: string;
  progress?: number;
  total?: number;
  type: 'streak' | 'urge' | 'journal' | 'custom';
};

// Helper functions for Supabase interactions

// User Profile functions
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as UserProfile;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Streak functions
export async function getStreak(userId: string): Promise<Streak | null> {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching streak:', error);
    return null;
  }
  
  return data as Streak;
}

export async function updateStreak(userId: string, updates: Partial<Streak>) {
  const { error } = await supabase
    .from('streaks')
    .update(updates)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

// Urge functions
export async function getTodaysUrges(userId: string): Promise<Urge[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('urges')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching urges:', error);
    return [];
  }
  
  return data as Urge[];
}

export async function createUrge(userId: string, urgeData: Omit<Urge, 'id' | 'user_id' | 'created_at'>) {
  const { error } = await supabase
    .from('urges')
    .insert({
      user_id: userId,
      ...urgeData,
    });
  
  if (error) {
    console.error('Error creating urge:', error);
    throw error;
  }
}

// Achievement functions
export async function getAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  
  return data as Achievement[];
}

// Journal functions
export async function getJournalEntry(userId: string, date: string): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching journal entry:', error);
    return null;
  }
  
  return data as JournalEntry;
}

export async function createOrUpdateJournalEntry(
  userId: string, 
  date: string, 
  entryData: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'date' | 'created_at' | 'updated_at'>>
) {
  // Check if an entry already exists for this date
  const existingEntry = await getJournalEntry(userId, date);
  
  if (existingEntry) {
    // Update existing entry
    const { error } = await supabase
      .from('journal_entries')
      .update({
        ...entryData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingEntry.id);
    
    if (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  } else {
    // Create new entry
    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        date,
        ...entryData,
      });
    
    if (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  }
} 