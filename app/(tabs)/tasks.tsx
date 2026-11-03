import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { Plus, CheckSquare, ListTodo, CheckCircle2 } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../src/theme';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useTasksStore } from '../../src/store/useTasksStore';
import { TaskItemCard } from '../../src/components/tasks/TaskItemCard';
import { ChecklistCard } from '../../src/components/tasks/ChecklistCard';
import { TaskModal } from '../../src/components/tasks/TaskModal';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Task, TaskStatus } from '../../src/types';

export default function TasksScreen() {
  const { theme } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const palette = isDark ? Colors.dark : Colors.light;

  const {
    tasks,
    checklists,
    activeTab,
    statusFilter,
    metrics,
    setActiveTab,
    setStatusFilter,
    toggleTaskStatus,
    deleteTask,
    createTask,
    updateTask,
    addItemToChecklist,
    toggleChecklistItem,
    deleteChecklistItem,
    deleteChecklist,
    createChecklist,
  } = useTasksStore();

  const [activeTaskToEdit, setActiveTaskToEdit] = useState<Task | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  const filters: (TaskStatus | 'all' | 'overdue')[] = ['all', 'pending', 'completed', 'overdue'];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: palette.surface, borderBottomColor: palette.surfaceBorder }]}>
        <View>
          <Text style={[styles.title, { color: palette.textPrimary }]}>Action Items</Text>
          <Text style={[styles.subtitle, { color: palette.textTertiary }]}>
            {metrics.pending} pending • {metrics.completed} completed
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (activeTab === 'tasks') {
              setActiveTaskToEdit(null);
              setIsTaskModalVisible(true);
            } else {
              createChecklist('New Checklist', ['First item']);
            }
          }}
          style={[styles.addBtn, { backgroundColor: palette.accent }]}
          accessible
          accessibilityLabel="Add new item"
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Switch: Tasks vs Checklists */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentTrack, { backgroundColor: palette.surfaceSubtle }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('tasks')}
            style={[
              styles.segmentBtn,
              activeTab === 'tasks' ? [styles.segmentActive, { backgroundColor: palette.surface }] : undefined,
            ]}
          >
            <CheckSquare size={16} color={activeTab === 'tasks' ? palette.primary : palette.textTertiary} />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'tasks' ? palette.textPrimary : palette.textTertiary },
              ]}
            >
              Tasks ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('checklists')}
            style={[
              styles.segmentBtn,
              activeTab === 'checklists' ? [styles.segmentActive, { backgroundColor: palette.surface }] : undefined,
            ]}
          >
            <ListTodo size={16} color={activeTab === 'checklists' ? palette.accent : palette.textTertiary} />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'checklists' ? palette.textPrimary : palette.textTertiary },
              ]}
            >
              Checklists ({checklists.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs for Tasks */}
      {activeTab === 'tasks' && (
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((f) => {
              const isSelected = statusFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setStatusFilter(f)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? palette.primary : palette.surface,
                      borderColor: isSelected ? palette.primary : palette.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#FFF' : palette.textSecondary },
                    ]}
                  >
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Content Area */}
      {activeTab === 'tasks' ? (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskItemCard
              task={item}
              onToggle={toggleTaskStatus}
              onDelete={deleteTask}
              onPress={(t) => {
                setActiveTaskToEdit(t);
                setIsTaskModalVisible(true);
              }}
              isDark={isDark}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Tasks Here"
              description={
                statusFilter === 'overdue'
                  ? 'Great job! You have no overdue tasks.'
                  : 'Add a new task manually or speak into TalkTask.'
              }
              icon={<CheckCircle2 size={32} color={palette.textTertiary} />}
              actionTitle="Add New Task"
              onActionPress={() => {
                setActiveTaskToEdit(null);
                setIsTaskModalVisible(true);
              }}
              isDark={isDark}
            />
          }
        />
      ) : (
        <FlatList
          data={checklists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ChecklistCard
              checklist={item}
              onToggleItem={toggleChecklistItem}
              onAddItem={addItemToChecklist}
              onDeleteItem={deleteChecklistItem}
              onDeleteChecklist={deleteChecklist}
              isDark={isDark}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No Checklists Yet"
              description="Speak a list like 'Buy milk, eggs, bread and vegetables' or tap below."
              icon={<ListTodo size={32} color={palette.textTertiary} />}
              actionTitle="Create Checklist"
              onActionPress={() => createChecklist('Shopping List', ['Milk', 'Eggs', 'Bread'])}
              isDark={isDark}
            />
          }
        />
      )}

      {/* Task Creation / Edit Modal */}
      <TaskModal
        visible={isTaskModalVisible}
        taskToEdit={activeTaskToEdit}
        onClose={() => {
          setIsTaskModalVisible(false);
          setActiveTaskToEdit(null);
        }}
        onSave={(data) => {
          if (activeTaskToEdit) {
            updateTask(activeTaskToEdit.id, data);
          } else {
            createTask(data);
          }
        }}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.bodySm,
  },
  segmentContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: Radii.lg,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: Typography.sizes.bodySm,
    fontWeight: Typography.weights.semibold,
  },
  filterRow: {
    paddingVertical: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
});
