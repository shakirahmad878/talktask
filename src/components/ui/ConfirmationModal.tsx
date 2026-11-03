import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Button } from './Button';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDark?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        style={styles.backdrop}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.dialog, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <View style={styles.buttonRow}>
            <Button
              title={cancelText}
              variant="outline"
              size="sm"
              onPress={onCancel}
              style={styles.btn}
              isDark={isDark}
            />
            <Button
              title={confirmText}
              variant={isDestructive ? 'danger' : 'primary'}
              size="sm"
              onPress={onConfirm}
              style={styles.btn}
              isDark={isDark}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.sizes.body,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  btn: {
    minWidth: 90,
  },
});
