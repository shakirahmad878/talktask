import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Calendar, Flag, Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Task, TaskPriority } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TaskModalProps {
  visible: boolean;
  taskToEdit?: Task | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string | null;
    priority: TaskPriority;
    due_at?: string | null;
  }) => void;
  isDark?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  taskToEdit,
  onClose,
  onSave,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDateType, setDueDateType] = useState<'none' | 'today' | 'tomorrow' | 'next_week'>('none');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      if (taskToEdit.due_at) {
        setDueDateType('today');
      } else {
        setDueDateType('none');
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDateType('none');
    }
    setError('');
  }, [taskToEdit, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    let calculatedDueAt: string | null = null;
    const now = new Date();

    if (dueDateType === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
      calculatedDueAt = today.toISOString();
    } else if (dueDateType === 'tomorrow') {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0, 0);
      calculatedDueAt = tomorrow.toISOString();
    } else if (dueDateType === 'next_week') {
      const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0, 0);
      calculatedDueAt = nextWeek.toISOString();
    }

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_at: calculatedDueAt,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              {taskToEdit ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {/* Title */}
            <Input
              label="Title"
              placeholder="What needs to be done?"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (error) setError('');
              }}
              error={error}
              isDark={isDark}
            />

            {/* Description */}
            <Input
              label="Description (Optional)"
              placeholder="Add details, notes or sub-steps"
              value={description}
              onChangeText={setDescription}
              multiline
              isDark={isDark}
            />

            {/* Priority Selector */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>PRIORITY</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityBtn,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : theme.surfaceSubtle,
                        borderColor: isSelected ? theme.primary : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: isSelected ? theme.primary : theme.textSecondary },
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Due Date Shortcut Selector */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              DUE DATE
            </Text>
            <View style={styles.dateRow}>
              {[
                { label: 'None', type: 'none' },
                { label: 'Today 6 PM', type: 'today' },
                { label: 'Tomorrow 10 AM', type: 'tomorrow' },
                { label: 'Next Week', type: 'next_week' },
              ].map((d) => {
                const isSelected = dueDateType === d.type;
                return (
                  <TouchableOpacity
                    key={d.type}
                    onPress={() => setDueDateType(d.type as any)}
                    style={[
                      styles.dateBtn,
                      {
                        backgroundColor: isSelected ? theme.accentLight : theme.surfaceSubtle,
                        borderColor: isSelected ? theme.accent : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateBtnText,
                        { color: isSelected ? theme.accent : theme.textSecondary },
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Save Button */}
            <Button
              title={taskToEdit ? 'Save Changes' : 'Create Task'}
              variant="primary"
              onPress={handleSave}
              icon={<Check size={18} color="#FFF" />}
              style={{ marginTop: Spacing.xl, marginBottom: Spacing.xl }}
              isDark={isDark}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  scroll: {
    maxHeight: 520,
  },
  fieldLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dateBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1.5,
  },
  dateBtnText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
  },
});
