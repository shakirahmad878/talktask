import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin, Star, Trash2 } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { Note } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onDelete: (id: string) => void;
  isDark?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onPress,
  onTogglePin,
  onToggleFavourite,
  onDelete,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;

  const formattedDate = new Date(note.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card isDark={isDark} onPress={() => onPress(note)} style={styles.card}>
      {/* Header: Title + Pin & Star & Delete */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {note.title}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => onTogglePin(note.id)}
            style={styles.iconBtn}
            accessible
            accessibilityLabel={note.is_pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin
              size={16}
              color={note.is_pinned ? theme.primary : theme.textTertiary}
              fill={note.is_pinned ? theme.primary : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onToggleFavourite(note.id)}
            style={styles.iconBtn}
            accessible
            accessibilityLabel={note.is_favourite ? 'Unfavourite note' : 'Favourite note'}
          >
            <Star
              size={16}
              color={note.is_favourite ? theme.warning : theme.textTertiary}
              fill={note.is_favourite ? theme.warning : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(note.id)}
            style={styles.iconBtn}
            accessible
            accessibilityLabel="Delete note"
          >
            <Trash2 size={16} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Preview */}
      <Text style={[styles.content, { color: theme.textSecondary }]} numberOfLines={3}>
        {note.content}
      </Text>

      {/* Footer: Category + Date */}
      <View style={styles.footer}>
        <Badge
          label={note.category}
          variant="category"
          category={note.category}
          isDark={isDark}
        />
        <Text style={[styles.dateText, { color: theme.textTertiary }]}>{formattedDate}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.subtitle,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    padding: 6,
  },
  content: {
    fontSize: Typography.sizes.bodySm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: Typography.sizes.caption,
  },
});
