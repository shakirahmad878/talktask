import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Card } from '../ui/Card';

interface ProductivitySummaryProps {
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalNotes: number;
  isDark?: boolean;
}

export const ProductivitySummaryCard: React.FC<ProductivitySummaryProps> = ({
  completedTasks,
  pendingTasks,
  overdueTasks,
  totalNotes,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <Card isDark={isDark} style={styles.card}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>TODAY'S PRODUCTIVITY</Text>
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
            <Clock size={18} color={theme.primary} />
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{pendingTasks}</Text>
          <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Pending</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: theme.successLight }]}>
            <CheckCircle2 size={18} color={theme.success} />
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{completedTasks}</Text>
          <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Done</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: overdueTasks > 0 ? theme.dangerLight : theme.surfaceSubtle }]}>
            <AlertCircle size={18} color={overdueTasks > 0 ? theme.danger : theme.textTertiary} />
          </View>
          <Text style={[styles.metricValue, { color: overdueTasks > 0 ? theme.danger : theme.textPrimary }]}>
            {overdueTasks}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Overdue</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={[styles.iconBox, { backgroundColor: theme.secondaryLight }]}>
            <FileText size={18} color={theme.secondary} />
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{totalNotes}</Text>
          <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Notes</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.sizes.subtitle,
    fontWeight: Typography.weights.bold,
  },
  metricLabel: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
  },
});
