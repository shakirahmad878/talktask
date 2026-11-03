import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Mic, CheckCircle, Bell, ArrowRight, Sparkles } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Button } from '../ui/Button';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
  isDark?: boolean;
}

const { width } = Dimensions.get('window');

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onComplete,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Speak Naturally',
      subtitle: 'Skip typing. Just tap the microphone and say your thoughts, tasks, shopping items, or reminders in English, Hindi, or Hinglish.',
      icon: <Mic size={48} color={theme.primary} />,
      bg: theme.primaryLight,
    },
    {
      title: 'Auto-Organise Magic',
      subtitle: 'TalkTask automatically classifies your speech into action items, checklists, reminders, or categorized notes with high accuracy.',
      icon: <CheckCircle size={48} color={theme.accent} />,
      bg: theme.accentLight,
    },
    {
      title: 'Never Miss a Beat',
      subtitle: 'Schedule local offline reminders with notifications. All your data stays safely stored on your device — fast, private, and offline-first.',
      icon: <Bell size={48} color={theme.warning} />,
      bg: theme.warningLight,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <Sparkles size={22} color={theme.primary} />
            <Text style={[styles.brandText, { color: theme.textPrimary }]}>TalkTask</Text>
          </View>
          {currentStep < steps.length - 1 && (
            <TouchableOpacity onPress={onComplete} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: theme.textTertiary }]}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center Illustration & Content */}
        <View style={styles.centerSection}>
          <View style={[styles.iconCircle, { backgroundColor: step.bg }]}>
            {step.icon}
          </View>

          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>{step.title}</Text>
          <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
            {step.subtitle}
          </Text>
        </View>

        {/* Footer: Step Indicators + Next/Get Started Button */}
        <View style={styles.footer}>
          <View style={styles.indicators}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentStep ? theme.primary : theme.surfaceBorder,
                    width: i === currentStep ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <Button
            title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            variant="primary"
            size="lg"
            onPress={handleNext}
            icon={currentStep < steps.length - 1 ? <ArrowRight size={20} color="#FFF" /> : undefined}
            isDark={isDark}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandText: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
  },
  skipBtn: {
    padding: Spacing.xs,
  },
  skipText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.medium,
  },
  centerSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  stepTitle: {
    fontSize: Typography.sizes.h1,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    gap: Spacing.xl,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    width: '100%',
  },
});
