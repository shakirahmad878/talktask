import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { initDatabase } from '../src/services/db/database';
import { NotificationManager } from '../src/services/notifications/NotificationManager';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { useNotesStore } from '../src/store/useNotesStore';
import { useTasksStore } from '../src/store/useTasksStore';
import { VoiceRecordingModal } from '../src/components/voice/VoiceRecordingModal';
import { OnboardingModal } from '../src/components/onboarding/OnboardingModal';
import { Colors } from '../src/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [dbReady, setDbReady] = useState(false);

  const { theme, hasCompletedOnboarding, isLoaded, loadSettings, setOnboardingCompleted } =
    useSettingsStore();
  const loadNotes = useNotesStore((s) => s.loadNotes);
  const loadTasks = useTasksStore((s) => s.loadTasks);
  const loadChecklists = useTasksStore((s) => s.loadChecklists);

  const systemColorScheme = useColorScheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  // Initialize DB and Settings
  useEffect(() => {
    async function setupApp() {
      try {
        initDatabase();
        await loadSettings();
        loadNotes();
        loadTasks();
        loadChecklists();
        await NotificationManager.resyncUpcomingReminders();
        setDbReady(true);
      } catch (err) {
        console.error('App setup error:', err);
        setDbReady(true);
      }
    }
    setupApp();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && dbReady && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady, isLoaded]);

  if (!fontsLoaded || !dbReady || !isLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {/* Global Voice Modal */}
      <VoiceRecordingModal isDark={isDark} />

      {/* Onboarding Guide */}
      <OnboardingModal
        visible={!hasCompletedOnboarding}
        onComplete={() => setOnboardingCompleted()}
        isDark={isDark}
      />
    </>
  );
}
