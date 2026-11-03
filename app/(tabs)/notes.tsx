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
import { Plus, Search, FileText, Star } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../src/theme';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useNotesStore } from '../../src/store/useNotesStore';
import { NoteCard } from '../../src/components/notes/NoteCard';
import { NoteEditorModal } from '../../src/components/notes/NoteEditorModal';
import { SearchModal } from '../../src/components/search/SearchModal';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Input } from '../../src/components/ui/Input';
import { Note, NoteCategory } from '../../src/types';

export default function NotesScreen() {
  const { theme } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const palette = isDark ? Colors.dark : Colors.light;

  const {
    notes,
    selectedCategory,
    setCategory,
    searchQuery,
    setSearchQuery,
    togglePin,
    toggleFavourite,
    deleteNote,
    createNote,
    updateNote,
  } = useNotesStore();

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const categories: (NoteCategory | 'all')[] = [
    'all',
    'work',
    'personal',
    'ideas',
    'shopping',
    'meeting',
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: palette.surface, borderBottomColor: palette.surfaceBorder }]}>
        <View>
          <Text style={[styles.title, { color: palette.textPrimary }]}>Voice Notes</Text>
          <Text style={[styles.subtitle, { color: palette.textTertiary }]}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved offline
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setActiveNote(null);
            setIsEditorVisible(true);
          }}
          style={[styles.addBtn, { backgroundColor: palette.primary }]}
          accessible
          accessibilityLabel="Create new note"
        >
          <Plus size={20} color="#FFF" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Instant Search Bar */}
      <View style={styles.searchBarWrapper}>
        <Input
          placeholder="Filter notes instantly..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          isDark={isDark}
          containerStyle={styles.searchInput}
          rightIcon={<Search size={18} color={palette.textTertiary} />}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((c) => {
            const isSelected = selectedCategory === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.catPill,
                  {
                    backgroundColor: isSelected ? palette.primary : palette.surface,
                    borderColor: isSelected ? palette.primary : palette.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catPillText,
                    { color: isSelected ? '#FFF' : palette.textSecondary },
                  ]}
                >
                  {c.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={(n) => {
              setActiveNote(n);
              setIsEditorVisible(true);
            }}
            onTogglePin={togglePin}
            onToggleFavourite={toggleFavourite}
            onDelete={deleteNote}
            isDark={isDark}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Notes Found"
            description={
              searchQuery
                ? `No notes match "${searchQuery}".`
                : 'Tap "New" or use the microphone on Home to record your thoughts.'
            }
            icon={<FileText size={32} color={palette.textTertiary} />}
            actionTitle="Create First Note"
            onActionPress={() => {
              setActiveNote(null);
              setIsEditorVisible(true);
            }}
            isDark={isDark}
          />
        }
      />

      {/* Note Editor Modal */}
      <NoteEditorModal
        visible={isEditorVisible}
        noteToEdit={activeNote}
        onClose={() => {
          setIsEditorVisible(false);
          setActiveNote(null);
        }}
        onSave={(data) => {
          if (activeNote) {
            updateNote(activeNote.id, data);
          } else {
            createNote(data);
          }
        }}
        isDark={isDark}
      />

      {/* Universal Search */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelectResult={(res) => {
          setIsSearchVisible(false);
          if (res.type === 'note') {
            setActiveNote(res.data as Note);
            setIsEditorVisible(true);
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
  searchBarWrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  categoriesSection: {
    paddingVertical: Spacing.sm,
  },
  catScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  catPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.huge,
  },
});
