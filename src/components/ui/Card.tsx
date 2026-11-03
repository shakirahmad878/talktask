import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radii } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isDark?: boolean;
  onPress?: () => void;
  accentColor?: string;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  isDark = false,
  onPress,
  accentColor,
  testID,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  const cardContent = (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.cardBorder,
        },
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.base,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.md,
  },
});
