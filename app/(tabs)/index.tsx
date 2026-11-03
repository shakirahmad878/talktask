import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';
import { Search, Sparkles, Bell, Calendar, ChevronRight, Mic } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../src/theme';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useNotesStore } from '../../src/store/useNotesStore';
import { useTasksStore } from '../../src/store/useTasksStore';
import { useRecordingStore } from '../../src/store/useRecordingStore';
import { MicrophoneFAB } from '../../src/components/voice/MicrophoneFAB';
import { ProductivitySummaryCard } from '../../src/components/dashboard/ProductivitySummaryCard';
import { QuickActionsRow } from '../../src/components/dashboard/QuickActionsRow';
import { TaskItemCard } from '../../src/components/tasks/TaskItemCard';
import { TaskModal } from '../../src/components/tasks/TaskModal';
import { NoteCard } from '../../src/components/notes/NoteCard';
import { NoteEditorModal } from '../../src/components/notes/NoteEditorModal';
import { SearchModal } from '../../src/components/search/SearchModal';
import { RemindersRepository } from '../../src/services/db/RemindersRepository';
import { Reminder, Note, Task } from '../../src/types';

export default function HomeScreen() {
  const { theme, language } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const palette = isDark ? Colors.dark : Colors.light;

  const { notes, togglePin, toggleFavourite, deleteNote } = useNotesStore();
  const { tasks, todayTasks, metrics, toggleTaskStatus, deleteTask, createTask } = useTasksStore();
  const { openModal } = useRecordingStore();

  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    try {
      const rems = RemindersRepository.getUpcoming(3);
      setUpcomingReminders(rems);
    } catch {}
  }, [tasks]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'hi') {
      if (hour < 12) return 'शुभ प्रभात';
      if (hour < 17) return 'शुभ दोपहर';
      return 'शुभ संध्या';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: palette.surface, borderBottomColor: palette.surfaceBorder }]}>
        <View>
          <Text style={[styles.dateText, { color: palette.textTertiary }]}>{formattedDate}</Text>
          <Text style={[styles.greetingText, { color: palette.textPrimary }]}>{getGreeting()} 👋</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsSearchVisible(true)}
          style={[styles.searchIconBtn, { backgroundColor: palette.surfaceSubtle }]}
          accessible
          accessibilityLabel="Open universal search"
        >
          <Search size={20} color={palette.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Prominent Voice Hero */}
        <View style={[styles.voiceHeroCard, { backgroundColor: palette.primaryLight, borderColor: palette.primary }]}>
          <View style={styles.voiceHeroContent}>
            <View style={styles.voiceHeroBadge}>
              <Sparkles size={14} color={palette.primary} />
              <Text style={[styles.voiceHeroBadgeText, { color: palette.primary }]}>VOICE FIRST</Text>
            </View>
            <Text style={[styles.voiceHeroTitle, { color: palette.textPrimary }]}>
              Speak once. Get things organised.
            </Text>
            <Text style={[styles.voiceHeroSubtitle, { color: palette.textSecondary }]}>
              Notes, tasks, reminders, or shopping lists.
            </Text>
          </View>
          <MicrophoneFAB isDark={isDark} />
        </View>

        {/* Quick Actions Row */}
        <QuickActionsRow
          onNewTaskPress={() => setIsTaskModalVisible(true)}
          onNewNotePress={() => {
            setActiveNote(null);
            setIsNoteModalVisible(true);
          }}
          isDark={isDark}
        />

        {/* Daily Productivity Summary */}
        <ProductivitySummaryCard
          completedTasks={metrics.completed}
          pendingTasks={metrics.pending}
          overdueTasks={metrics.overdue}
          totalNotes={notes.length}
          isDark={isDark}
        />

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>UPCOMING REMINDERS</Text>
            </View>
            {upcomingReminders.map((rem) => (
              <View
                key={rem.id}
                style={[styles.reminderCard, { backgroundColor: palette.surface, borderColor: palette.cardBorder }]}
              >
                <View style={[styles.reminderIconBox, { backgroundColor: palette.warningLight }]}>
                  <Bell size={18} color={palette.warning} />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={[styles.reminderTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                    {rem.title}
                  </Text>
                  <Text style={[styles.reminderDate, { color: palette.textSecondary }]}>
                    {new Date(rem.scheduled_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>TODAY'S TASKS</Text>
            <Text style={[styles.sectionCount, { color: palette.textTertiary }]}>
              {todayTasks.length} {todayTasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>

          {todayTasks.length > 0 ? (
            todayTasks.map((t) => (
              <TaskItemCard
                key={t.id}
                task={t}
                onToggle={toggleTaskStatus}
                onDelete={deleteTask}
                isDark={isDark}
              />
            ))
          ) : (
            <View style={[styles.emptyInlineCard, { backgroundColor: palette.surface, borderColor: palette.cardBorder }]}>
              <Text style={[styles.emptyInlineText, { color: palette.textTertiary }]}>
                No tasks scheduled for today. Tap the mic to add one!
              </Text>
            </View>
          )}
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textSecondary }]}>RECENT NOTES</Text>
            <Text style={[styles.sectionCount, { color: palette.textTertiary }]}>
              {notes.slice(0, 3).length} {notes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>

          {notes.slice(0, 3).map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={(n) => {
                setActiveNote(n);
                setIsNoteModalVisible(true);
              }}
              onTogglePin={togglePin}
              onToggleFavourite={toggleFavourite}
              onDelete={deleteNote}
              isDark={isDark}
            />
          ))}
        </View>
      </ScrollView>

      {/* Universal Search Modal */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelectResult={(res) => {
          setIsSearchVisible(false);
          if (res.type === 'note') {
            setActiveNote(res.data as Note);
            setIsNoteModalVisible(true);
          }
        }}
        isDark={isDark}
      />

      {/* Task Creation Modal */}
      <TaskModal
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
        onSave={(data) => createTask(data)}
        isDark={isDark}
      />

      {/* Note Creation / Editing Modal */}
      <NoteEditorModal
        visible={isNoteModalVisible}
        noteToEdit={activeNote}
        onClose={() => {
          setIsNoteModalVisible(false);
          setActiveNote(null);
        }}
        onSave={(data) => {
          if (activeNote) {
            useNotesStore.getState().updateNote(activeNote.id, data);
          } else {
            useNotesStore.getState().createNote(data);
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
  dateText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingText: {
    fontSize: Typography.sizes.h2,
    fontWeight: Typography.weights.bold,
  },
  searchIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
  voiceHeroCard: {
    borderRadius: Radii.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  voiceHeroContent: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  voiceHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  voiceHeroBadgeText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
  },
  voiceHeroTitle: {
    fontSize: Typography.sizes.subtitle,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  voiceHeroSubtitle: {
    fontSize: Typography.sizes.bodySm,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: Typography.sizes.caption,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  reminderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  reminderDate: {
    fontSize: Typography.sizes.caption,
    marginTop: 2,
  },
  emptyInlineCard: {
    padding: Spacing.base,
    borderRadius: Radii.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyInlineText: {
    fontSize: Typography.sizes.bodySm,
    textAlign: 'center',
  },
});
