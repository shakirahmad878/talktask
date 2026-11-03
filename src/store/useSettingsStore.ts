import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode } from '../types';
import { AdMobManager } from '../services/ads/AdMobManager';

const STORAGE_KEY = '@talktask_settings';

interface SettingsState {
  language: LanguageCode;
  theme: 'system' | 'light' | 'dark';
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  isProUser: boolean;
  isLoaded: boolean;

  loadSettings: () => Promise<void>;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  setTheme: (theme: 'system' | 'light' | 'dark') => Promise<void>;
  setOnboardingCompleted: () => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setProUser: (isPro: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  theme: 'system',
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
  isProUser: false,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        AdMobManager.setProStatus(!!parsed.isProUser);
        set({
          language: parsed.language || 'en',
          theme: parsed.theme || 'system',
          hasCompletedOnboarding: !!parsed.hasCompletedOnboarding,
          notificationsEnabled: parsed.notificationsEnabled ?? true,
          isProUser: !!parsed.isProUser,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
      set({ isLoaded: true });
    }
  },

  setLanguage: async (lang) => {
    set({ language: lang });
    await saveState(get());
  },

  setTheme: async (theme) => {
    set({ theme });
    await saveState(get());
  },

  setOnboardingCompleted: async () => {
    set({ hasCompletedOnboarding: true });
    await saveState(get());
  },

  setNotificationsEnabled: async (enabled) => {
    set({ notificationsEnabled: enabled });
    await saveState(get());
  },

  setProUser: async (isPro) => {
    set({ isProUser: isPro });
    AdMobManager.setProStatus(isPro);
    await saveState(get());
  },
}));

async function saveState(state: SettingsState) {
  try {
    const payload = {
      language: state.language,
      theme: state.theme,
      hasCompletedOnboarding: state.hasCompletedOnboarding,
      notificationsEnabled: state.notificationsEnabled,
      isProUser: state.isProUser,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}
