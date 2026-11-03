import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { TaskPriority, NoteCategory } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'priority' | 'category' | 'status' | 'custom';
  priority?: TaskPriority;
  category?: NoteCategory;
  color?: string;
  bgColor?: string;
  isDark?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'custom',
  priority,
  category,
  color,
  bgColor,
  isDark = false,
  style,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  let resolvedColor = theme.textSecondary;
  let resolvedBg = theme.surfaceSubtle;

  if (variant === 'priority' && priority) {
    switch (priority) {
      case 'urgent':
        resolvedColor = theme.danger;
        resolvedBg = theme.dangerLight;
        break;
      case 'high':
        resolvedColor = theme.warning;
        resolvedBg = theme.warningLight;
        break;
      case 'low':
        resolvedColor = theme.success;
        resolvedBg = theme.successLight;
        break;
      case 'medium':
      default:
        resolvedColor = theme.primary;
        resolvedBg = theme.primaryLight;
        break;
    }
  } else if (variant === 'category' && category) {
    switch (category) {
      case 'work':
        resolvedColor = theme.primary;
        resolvedBg = theme.primaryLight;
        break;
      case 'personal':
        resolvedColor = theme.secondary;
        resolvedBg = theme.secondaryLight;
        break;
      case 'shopping':
        resolvedColor = theme.accent;
        resolvedBg = theme.accentLight;
        break;
      case 'ideas':
        resolvedColor = theme.warning;
        resolvedBg = theme.warningLight;
        break;
      case 'meeting':
        resolvedColor = theme.danger;
        resolvedBg = theme.dangerLight;
        break;
      default:
        resolvedColor = theme.textSecondary;
        resolvedBg = theme.surfaceSubtle;
        break;
    }
  } else if (color && bgColor) {
    resolvedColor = color;
    resolvedBg = bgColor;
  }

  return (
    <View style={[styles.badge, { backgroundColor: resolvedBg }, style]}>
      <Text style={[styles.label, { color: resolvedColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
  },
});
