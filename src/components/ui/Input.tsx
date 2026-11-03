import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isDark?: boolean;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isDark = false,
  containerStyle,
  rightIcon,
  onRightIconPress,
  style,
  ...rest
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.surfaceSubtle,
            borderColor: error ? theme.danger : theme.surfaceBorder,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={theme.textTertiary}
          style={[
            styles.input,
            { color: theme.textPrimary },
            rest.multiline ? styles.multiline : undefined,
            style,
          ]}
          {...rest}
        />
        {rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: Typography.sizes.body,
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  error: {
    fontSize: Typography.sizes.caption,
    marginTop: Spacing.xs,
  },
});
