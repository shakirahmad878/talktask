import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isDark?: boolean;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  isDark = false,
  accessibilityLabel,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.secondaryLight, borderColor: theme.secondary, borderWidth: 1 };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: theme.surfaceBorder, borderWidth: 1.5 };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'danger':
        return { backgroundColor: theme.danger };
      case 'accent':
        return { backgroundColor: theme.accent };
      case 'primary':
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.textTertiary;
    switch (variant) {
      case 'secondary':
        return theme.secondary;
      case 'outline':
        return theme.textPrimary;
      case 'ghost':
        return theme.primary;
      case 'danger':
      case 'accent':
      case 'primary':
      default:
        return theme.textInverse;
    }
  };

  const getHeight = (): number => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 54;
      case 'md':
      default:
        return 48; // Accessible min touch target
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.base,
        { height: getHeight() },
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: size === 'sm' ? 14 : size === 'lg' ? 17 : 15 },
              icon ? { marginLeft: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    borderRadius: Radii.md,
  },
  text: {
    fontWeight: Typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
