import { create } from 'zustand';
import { Note, NoteCategory } from '../types';
import { NotesRepository } from '../services/db/NotesRepository';

interface NotesState {
  notes: Note[];
  selectedCategory: NoteCategory | 'all';
  searchQuery: string;
  isLoading: boolean;
  loadNotes: () => void;
  setCategory: (category: NoteCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  createNote: (data: {
    title: string;
    content: string;
    category?: NoteCategory;
    source_type?: 'voice' | 'manual';
    is_pinned?: boolean;
    is_favourite?: boolean;
  }) => Note;
  updateNote: (
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      category: NoteCategory;
      is_pinned: boolean;
      is_favourite: boolean;
    }>
  ) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavourite: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedCategory: 'all',
  searchQuery: '',
  isLoading: false,

  loadNotes: () => {
    set({ isLoading: true });
    try {
      const { selectedCategory, searchQuery } = get();
      let notes: Note[];
      if (searchQuery.trim()) {
        notes = NotesRepository.search(searchQuery);
      } else {
        notes = NotesRepository.getAll({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
        });
      }
      set({ notes, isLoading: false });
    } catch (e) {
      console.warn('Error loading notes:', e);
      set({ isLoading: false });
    }
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().loadNotes();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().loadNotes();
  },

  createNote: (data) => {
    const note = NotesRepository.create(data);
    get().loadNotes();
    return note;
  },

  updateNote: (id, updates) => {
    NotesRepository.update(id, updates);
    get().loadNotes();
  },

  deleteNote: (id) => {
    NotesRepository.delete(id);
    get().loadNotes();
  },

  togglePin: (id) => {
    NotesRepository.togglePin(id);
    get().loadNotes();
  },

  toggleFavourite: (id) => {
    NotesRepository.toggleFavourite(id);
    get().loadNotes();
  },
}));
