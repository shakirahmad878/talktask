import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { Search, X, FileText, CheckSquare, ListTodo, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radii } from '../../theme';
import { UniversalSearchResult } from '../../types';
import { SearchRepository } from '../../services/db/SearchRepository';
import { Input } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectResult: (result: UniversalSearchResult) => void;
  isDark?: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectResult,
  isDark = false,
}) => {
  const theme = isDark ? Colors.dark : Colors.light;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UniversalSearchResult[]>([]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const found = SearchRepository.searchAll(text);
    setResults(found);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare size={20} color={theme.accent} />;
      case 'checklist':
        return <ListTodo size={20} color={theme.secondary} />;
      case 'note':
      default:
        return <FileText size={20} color={theme.primary} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Search Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.cardBorder }]}>
          <View style={styles.searchInputWrapper}>
            <Search size={20} color={theme.textTertiary} style={styles.searchIcon} />
            <Input
              placeholder="Search notes, tasks, checklists..."
              value={query}
              onChangeText={handleSearch}
              autoFocus
              isDark={isDark}
              containerStyle={styles.inputContainer}
              rightIcon={query ? <X size={18} color={theme.textTertiary} /> : undefined}
              onRightIconPress={() => handleSearch('')}
            />
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}_${item.id}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onSelectResult(item)}
              style={[
                styles.resultCard,
                { backgroundColor: theme.surface, borderColor: theme.cardBorder },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.surfaceSubtle }]}>
                {getIcon(item.type)}
              </View>

              <View style={styles.resultInfo}>
                <View style={styles.titleRow}>
                  <Text style={[styles.resultTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.typeBadge, { color: theme.textTertiary }]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>

              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.trim() ? (
              <EmptyState
                title="No Results Found"
                description={`No notes, tasks, or checklists matched "${query}".`}
                icon={<Search size={28} color={theme.textTertiary} />}
                isDark={isDark}
              />
            ) : (
              <View style={styles.emptyPrompt}>
                <Text style={[styles.emptyPromptText, { color: theme.textTertiary }]}>
                  Type keywords above to search all your saved items locally.
                </Text>
              </View>
            )
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  cancelText: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
  },
  listContent: {
    padding: Spacing.base,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  resultTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: Spacing.xs,
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  resultSubtitle: {
    fontSize: Typography.sizes.caption,
    lineHeight: 16,
  },
  emptyPrompt: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyPromptText: {
    fontSize: Typography.sizes.bodySm,
    textAlign: 'center',
  },
});
