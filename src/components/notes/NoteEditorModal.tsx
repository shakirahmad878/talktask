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
import { X, Check, Pin, Star } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Note, NoteCategory } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface NoteEditorModalProps {
  visible: boolean;
  noteToEdit?: Note | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    category: NoteCategory;
    is_pinned: boolean;
    is_favourite: boolean;
  }) => void;
  isDark?: boolean;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  noteToEdit,
  onClose,
  onSave,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setCategory(noteToEdit.category);
      setIsPinned(noteToEdit.is_pinned);
      setIsFavourite(noteToEdit.is_favourite);
    } else {
      setTitle('');
      setContent('');
      setCategory('general');
      setIsPinned(false);
      setIsFavourite(false);
    }
    setError('');
  }, [noteToEdit, visible]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      setError('Please enter a note title or content');
      return;
    }

    const noteTitle = title.trim() || content.trim().slice(0, 30);
    onSave({
      title: noteTitle,
      content: content.trim(),
      category,
      is_pinned: isPinned,
      is_favourite: isFavourite,
    });
    onClose();
  };

  const categories: NoteCategory[] = ['general', 'work', 'personal', 'ideas', 'shopping', 'meeting'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
              {noteToEdit ? 'Edit Note' : 'New Note'}
            </Text>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => setIsPinned(!isPinned)}
                style={[styles.actionIconBtn, { backgroundColor: isPinned ? theme.primaryLight : theme.surfaceSubtle }]}
              >
                <Pin size={18} color={isPinned ? theme.primary : theme.textSecondary} fill={isPinned ? theme.primary : 'transparent'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsFavourite(!isFavourite)}
                style={[styles.actionIconBtn, { backgroundColor: isFavourite ? theme.warningLight : theme.surfaceSubtle }]}
              >
                <Star size={18} color={isFavourite ? theme.warning : theme.textSecondary} fill={isFavourite ? theme.warning : 'transparent'} />
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scroll}>
            {/* Title */}
            <Input
              label="Title"
              placeholder="Note title"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (error) setError('');
              }}
              error={error}
              isDark={isDark}
            />

            {/* Category Selector */}
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              <View style={styles.catRow}>
                {categories.map((c) => {
                  const isSelected = category === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setCategory(c)}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSelected ? theme.primaryLight : theme.surfaceSubtle,
                          borderColor: isSelected ? theme.primary : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catText,
                          { color: isSelected ? theme.primary : theme.textSecondary },
                        ]}
                      >
                        {c.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Content Body */}
            <Input
              label="Content"
              placeholder="Write your note, thoughts, or meeting summary..."
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.contentInput}
              isDark={isDark}
            />

            <Button
              title={noteToEdit ? 'Save Note' : 'Create Note'}
              variant="primary"
              onPress={handleSave}
              icon={<Check size={18} color="#FFF" />}
              style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
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
    maxHeight: '88%',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  scroll: {
    maxHeight: 540,
  },
  fieldLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  catScroll: {
    marginBottom: Spacing.md,
  },
  catRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  catPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1.5,
  },
  catText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.bold,
  },
  contentInput: {
    height: 140,
  },
});
