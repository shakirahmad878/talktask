import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  useColorScheme,
  Platform,
} from 'react-native';
import {
  Globe,
  Moon,
  Bell,
  Shield,
  Download,
  Trash2,
  Info,
  Sparkles,
  ExternalLink,
  Crown,
  Heart,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../src/theme';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useNotesStore } from '../../src/store/useNotesStore';
import { useTasksStore } from '../../src/store/useTasksStore';
import { BackupRepository } from '../../src/services/db/BackupRepository';
import { ConfirmationModal } from '../../src/components/ui/ConfirmationModal';
import { Card } from '../../src/components/ui/Card';
import { LanguageCode } from '../../src/types';

export default function SettingsScreen() {
  const {
    theme,
    language,
    notificationsEnabled,
    isProUser,
    setLanguage,
    setTheme,
    setNotificationsEnabled,
    setProUser,
  } = useSettingsStore();

  const systemColorScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const palette = isDark ? Colors.dark : Colors.light;

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);

  const handleExportData = async () => {
    try {
      const backup = BackupRepository.exportAll();
      const jsonStr = JSON.stringify(backup, null, 2);

      await Share.share({
        title: 'TalkTask Backup Data',
        message: jsonStr,
      });
    } catch (e: any) {
      Alert.alert('Export Failed', e.message || 'Unable to export data.');
    }
  };

  const handleDeleteAll = () => {
    try {
      BackupRepository.deleteAllUserData();
      useNotesStore.getState().loadNotes();
      useTasksStore.getState().loadTasks();
      useTasksStore.getState().loadChecklists();
      setIsDeleteModalVisible(false);
      Alert.alert('Data Deleted', 'All local notes, tasks, checklists, and reminders were removed.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete data.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: palette.surface, borderBottomColor: palette.surfaceBorder }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pro Banner */}
        <Card
          isDark={isDark}
          style={[styles.proCard, { backgroundColor: isProUser ? palette.primaryLight : palette.surfaceSubtle }]}
        >
          <View style={styles.proRow}>
            <View style={[styles.proIconBox, { backgroundColor: palette.warning }]}>
              <Crown size={22} color="#FFF" />
            </View>
            <View style={styles.proTextCol}>
              <Text style={[styles.proTitle, { color: palette.textPrimary }]}>
                {isProUser ? 'TalkTask Pro Active' : 'Upgrade to Pro'}
              </Text>
              <Text style={[styles.proSubtitle, { color: palette.textSecondary }]}>
                {isProUser
                  ? 'Enjoy your 100% ad-free experience and future cloud AI perks.'
                  : 'Remove all ads and support independent open development.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setProUser(!isProUser)}
            style={[styles.proToggleBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={styles.proToggleText}>
              {isProUser ? 'Switch to Free Tier' : 'Try Pro Free'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Section: Language */}
        <Text style={[styles.sectionHeading, { color: palette.textSecondary }]}>LANGUAGE & LOCALISATION</Text>
        <Card isDark={isDark} style={styles.settingsGroup}>
          {[
            { code: 'en', label: 'English (India & Global)' },
            { code: 'hi', label: 'हिंदी (Hindi)' },
            { code: 'hinglish', label: 'Hinglish (Colloquial Hindi-English)' },
          ].map((item, idx) => {
            const isSelected = language === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                onPress={() => setLanguage(item.code as LanguageCode)}
                style={[
                  styles.settingRow,
                  idx !== 0 && { borderTopWidth: 1, borderTopColor: palette.surfaceBorder },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Globe size={20} color={isSelected ? palette.primary : palette.textTertiary} />
                  <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{item.label}</Text>
                </View>
                {isSelected && <View style={[styles.selectedDot, { backgroundColor: palette.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Section: Appearance */}
        <Text style={[styles.sectionHeading, { color: palette.textSecondary }]}>APPEARANCE</Text>
        <Card isDark={isDark} style={styles.settingsGroup}>
          {[
            { mode: 'system', label: 'System Default' },
            { mode: 'light', label: 'Light Theme' },
            { mode: 'dark', label: 'Dark Charcoal' },
          ].map((item, idx) => {
            const isSelected = theme === item.mode;
            return (
              <TouchableOpacity
                key={item.mode}
                onPress={() => setTheme(item.mode as any)}
                style={[
                  styles.settingRow,
                  idx !== 0 && { borderTopWidth: 1, borderTopColor: palette.surfaceBorder },
                ]}
              >
                <View style={styles.rowLeft}>
                  <Moon size={20} color={isSelected ? palette.primary : palette.textTertiary} />
                  <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>{item.label}</Text>
                </View>
                {isSelected && <View style={[styles.selectedDot, { backgroundColor: palette.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Section: Notifications */}
        <Text style={[styles.sectionHeading, { color: palette.textSecondary }]}>NOTIFICATIONS</Text>
        <Card isDark={isDark} style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Bell size={20} color={palette.textSecondary} />
              <View>
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Local Reminders</Text>
                <Text style={[styles.rowSublabel, { color: palette.textTertiary }]}>
                  Alarm notifications on this device
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={Platform.OS === 'android' ? palette.primary : undefined}
              trackColor={{ false: palette.surfaceBorder, true: palette.primaryLight }}
            />
          </View>
        </Card>

        {/* Section: Data & Backup */}
        <Text style={[styles.sectionHeading, { color: palette.textSecondary }]}>DATA & PRIVACY</Text>
        <Card isDark={isDark} style={styles.settingsGroup}>
          <TouchableOpacity
            onPress={handleExportData}
            style={styles.settingRow}
          >
            <View style={styles.rowLeft}>
              <Download size={20} color={palette.accent} />
              <View>
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Export All Data</Text>
                <Text style={[styles.rowSublabel, { color: palette.textTertiary }]}>
                  Save notes and tasks as local JSON
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={palette.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPrivacyModalVisible(true)}
            style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: palette.surfaceBorder }]}
          >
            <View style={styles.rowLeft}>
              <Shield size={20} color={palette.primary} />
              <View>
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>Privacy Policy</Text>
                <Text style={[styles.rowSublabel, { color: palette.textTertiary }]}>
                  100% offline-first, zero tracking
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={palette.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsDeleteModalVisible(true)}
            style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: palette.surfaceBorder }]}
          >
            <View style={styles.rowLeft}>
              <Trash2 size={20} color={palette.danger} />
              <View>
                <Text style={[styles.rowLabel, { color: palette.danger }]}>Delete All Data</Text>
                <Text style={[styles.rowSublabel, { color: palette.textTertiary }]}>
                  Permanently clear all SQLite records
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Section: About */}
        <Text style={[styles.sectionHeading, { color: palette.textSecondary }]}>ABOUT</Text>
        <Card isDark={isDark} style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Info size={20} color={palette.textSecondary} />
              <View>
                <Text style={[styles.rowLabel, { color: palette.textPrimary }]}>TalkTask Android</Text>
                <Text style={[styles.rowSublabel, { color: palette.textTertiary }]}>
                  Version 1.0.0 (Build 1) • India-First & Global-Ready
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={isDeleteModalVisible}
        title="Delete All Data?"
        message="This action will permanently erase all your saved notes, tasks, checklists, and reminders on this device. This cannot be undone."
        confirmText="Delete Everything"
        isDestructive
        onConfirm={handleDeleteAll}
        onCancel={() => setIsDeleteModalVisible(false)}
        isDark={isDark}
      />

      {/* Privacy Policy Modal */}
      <ConfirmationModal
        visible={isPrivacyModalVisible}
        title="Privacy & Offline Security"
        message={`TalkTask is built with a strict local-first architecture:\n\n• Your voice recordings and notes remain strictly on your device.\n• No audio is transmitted to third-party ad networks.\n• No personal identifying details are gathered.\n• You can export or delete your data at any time.`}
        confirmText="Got it"
        onConfirm={() => setIsPrivacyModalVisible(false)}
        onCancel={() => setIsPrivacyModalVisible(false)}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 28,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  proCard: {
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  proIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTextCol: {
    flex: 1,
  },
  proTitle: {
    fontSize: Typography.sizes.subtitle,
    fontWeight: Typography.weights.bold,
  },
  proSubtitle: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
    lineHeight: 16,
  },
  proToggleBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  proToggleText: {
    color: '#FFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.bodySm,
  },
  sectionHeading: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  settingsGroup: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  rowLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
  },
  rowSublabel: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
