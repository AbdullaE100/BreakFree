import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface UserGoals {
  duration: number;
  savings: number;
  motivation: string;
}

interface StoreState {
  addiction: string;
  goals: UserGoals | null;
  setAddiction: (addiction: string) => void;
  setGoals: (goals: UserGoals) => void;
}

// Create a web-compatible storage implementation
const webStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    localStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    localStorage.removeItem(name);
  },
};

// Use SecureStore on native platforms, localStorage on web
const storage = Platform.OS === 'web' ? webStorage : {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      addiction: '',
      goals: null,
      setAddiction: (addiction) => set({ addiction }),
      setGoals: (goals) => set({ goals }),
    }),
    {
      name: 'recovery-store',
      storage: createJSONStorage(() => storage),
    }
  )
);