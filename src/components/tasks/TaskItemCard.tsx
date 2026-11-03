import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Calendar, Trash2, Clock } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Task } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface TaskItemCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (task: Task) => void;
  isDark?: boolean;
}

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  task,
  onToggle,
  onDelete,
  onPress,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const isCompleted = task.status === 'completed';

  const isOverdue =
    !isCompleted && task.due_at && new Date(task.due_at).getTime() < Date.now();

  const formattedDate = task.due_at
    ? new Date(task.due_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Card isDark={isDark} onPress={onPress ? () => onPress(task) : undefined} style={styles.card}>
      <View style={styles.row}>
        {/* Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggle(task.id)}
          style={[
            styles.checkbox,
            {
              backgroundColor: isCompleted ? theme.success : 'transparent',
              borderColor: isCompleted ? theme.success : theme.textTertiary,
            },
          ]}
          accessible
          accessibilityLabel={isCompleted ? 'Mark task pending' : 'Mark task completed'}
        >
          {isCompleted && <Check size={14} color="#FFF" strokeWidth={3} />}
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: isCompleted ? theme.textTertiary : theme.textPrimary,
                textDecorationLine: isCompleted ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}

          {/* Badges: Priority + Due Date */}
          <View style={styles.metaRow}>
            <Badge label={task.priority} variant="priority" priority={task.priority} isDark={isDark} />

            {formattedDate ? (
              <View
                style={[
                  styles.datePill,
                  { backgroundColor: isOverdue ? theme.dangerLight : theme.surfaceSubtle },
                ]}
              >
                <Clock size={12} color={isOverdue ? theme.danger : theme.textSecondary} />
                <Text
                  style={[
                    styles.dateText,
                    { color: isOverdue ? theme.danger : theme.textSecondary },
                  ]}
                >
                  {formattedDate} {isOverdue ? '(Overdue)' : ''}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Delete Action */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => onDelete(task.id)}
          style={styles.deleteBtn}
          accessible
          accessibilityLabel="Delete task"
        >
          <Trash2 size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    lineHeight: 22,
  },
  description: {
    fontSize: Typography.sizes.bodySm,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  dateText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
  },
  deleteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
