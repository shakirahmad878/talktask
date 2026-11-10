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
import { GlobalErrorBoundary } from '../src/components/common/GlobalErrorBoundary';
import { Colors } from '../src/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

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
        try {
          initDatabase();
        } catch (dbErr) {
          console.error('Database init error:', dbErr);
        }
        try {
          await loadSettings();
        } catch (setErr) {
          console.warn('Settings load error:', setErr);
        }
        try {
          loadNotes();
          loadTasks();
          loadChecklists();
        } catch (storeErr) {
          console.warn('Store load error:', storeErr);
        }
        try {
          await NotificationManager.resyncUpcomingReminders();
        } catch (notifErr) {
          console.warn('Reminders resync error:', notifErr);
        }
      } catch (err) {
        console.error('App setup error:', err);
      } finally {
        setDbReady(true);
      }
    }
    setupApp();

    // Safety timeout: ensure app unblocks even under extreme slow-boot or storage delay
    const fallbackTimer = setTimeout(() => {
      setDbReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 4000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (fontError) {
      console.warn('Font loading error (using fallback):', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady && isLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, dbReady, isLoaded]);

  if ((!fontsLoaded && !fontError) || !dbReady || !isLoaded) {
    return null;
  }

  return (
    <GlobalErrorBoundary>
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
    </GlobalErrorBoundary>
  );
}
