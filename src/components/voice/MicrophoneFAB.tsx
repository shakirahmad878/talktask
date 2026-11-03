import React from 'react';
import { TouchableOpacity, StyleSheet, View, AccessibilityRole } from 'react-native';
import { Mic } from 'lucide-react-native';
import { Colors, Spacing, Radii } from '../../theme';
import { useRecordingStore } from '../../store/useRecordingStore';

interface MicrophoneFABProps {
  isDark?: boolean;
}

export const MicrophoneFAB: React.FC<MicrophoneFABProps> = ({ isDark = false }) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const { openModal } = useRecordingStore();

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => openModal()}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Speak to organize"
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Mic size={32} color="#FFFFFF" strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
