import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Check, Plus, Trash2, ListTodo } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Checklist } from '../../types';
import { Card } from '../ui/Card';

interface ChecklistCardProps {
  checklist: Checklist;
  onToggleItem: (itemId: string) => void;
  onAddItem: (checklistId: string, text: string) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteChecklist: (checklistId: string) => void;
  isDark?: boolean;
}

export const ChecklistCard: React.FC<ChecklistCardProps> = ({
  checklist,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onDeleteChecklist,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const items = checklist.items || [];
  const completedCount = items.filter((i) => i.is_completed).length;

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(checklist.id, newItemText.trim());
      setNewItemText('');
      setIsAdding(false);
    }
  };

  return (
    <Card isDark={isDark} style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ListTodo size={20} color={theme.accent} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>{checklist.title}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDeleteChecklist(checklist.id)}
          style={styles.deleteBtn}
          accessible
          accessibilityLabel="Delete checklist"
        >
          <Trash2 size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Progress pill */}
      <Text style={[styles.progressText, { color: theme.textTertiary }]}>
        {completedCount} of {items.length} items completed
      </Text>

      {/* Items list */}
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleItem(item.id)}
              style={[
                styles.itemCheckbox,
                {
                  backgroundColor: item.is_completed ? theme.accent : 'transparent',
                  borderColor: item.is_completed ? theme.accent : theme.textTertiary,
                },
              ]}
            >
              {item.is_completed && <Check size={12} color="#FFF" strokeWidth={3} />}
            </TouchableOpacity>

            <Text
              style={[
                styles.itemText,
                {
                  color: item.is_completed ? theme.textTertiary : theme.textPrimary,
                  textDecorationLine: item.is_completed ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>

            <TouchableOpacity
              onPress={() => onDeleteItem(item.id)}
              style={styles.itemDeleteBtn}
              accessible
              accessibilityLabel="Delete item"
            >
              <Trash2 size={14} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add new item input */}
      {isAdding ? (
        <View style={styles.inputRow}>
          <TextInput
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="Add an item..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary }]}
            onSubmitEditing={handleAddItem}
            autoFocus
          />
          <TouchableOpacity
            onPress={handleAddItem}
            style={[styles.addItemSubmit, { backgroundColor: theme.accent }]}
          >
            <Check size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          style={styles.addBtn}
          activeOpacity={0.7}
        >
          <Plus size={16} color={theme.accent} />
          <Text style={[styles.addBtnText, { color: theme.accent }]}>Add item</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.subtitle,
    fontWeight: Typography.weights.bold,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  progressText: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  itemsContainer: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  itemCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  itemText: {
    fontSize: Typography.sizes.body,
    flex: 1,
  },
  itemDeleteBtn: {
    padding: Spacing.xs,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  addBtnText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.bodySm,
  },
  addItemSubmit: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
