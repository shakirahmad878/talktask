import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic, CheckSquare, Bell, ListChecks } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { useRecordingStore } from '../../store/useRecordingStore';

interface QuickActionsRowProps {
  onNewTaskPress: () => void;
  onNewNotePress: () => void;
  isDark?: boolean;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onNewTaskPress,
  onNewNotePress,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const { openModal } = useRecordingStore();

  const actions = [
    {
      label: 'Voice Note',
      icon: <Mic size={22} color={theme.primary} />,
      bg: theme.primaryLight,
      onPress: () => openModal(),
    },
    {
      label: 'New Task',
      icon: <CheckSquare size={22} color={theme.accent} />,
      bg: theme.accentLight,
      onPress: onNewTaskPress,
    },
    {
      label: 'Reminder',
      icon: <Bell size={22} color={theme.warning} />,
      bg: theme.warningLight,
      onPress: () => openModal(),
    },
    {
      label: 'Checklist',
      icon: <ListChecks size={22} color={theme.secondary} />,
      bg: theme.secondaryLight,
      onPress: onNewNotePress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>QUICK ACTIONS</Text>
      <View style={styles.row}>
        {actions.map((act, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={act.onPress}
            style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: act.bg }]}>
              {act.icon}
            </View>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{act.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
});
