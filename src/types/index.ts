export type LanguageCode = 'en' | 'hi' | 'hinglish';

export type NoteCategory = 'general' | 'work' | 'personal' | 'ideas' | 'shopping' | 'meeting';

export interface Note {
  id: string;
  title: string;
  content: string;
  source_type: 'voice' | 'manual';
  language: LanguageCode;
  category: NoteCategory;
  is_pinned: boolean;
  is_favourite: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  is_completed: boolean;
  sort_order: number;
}

export type ReminderLinkedType = 'task' | 'note' | 'standalone';
export type ReminderStatus = 'scheduled' | 'fired' | 'cancelled';

export interface Reminder {
  id: string;
  linked_type: ReminderLinkedType;
  linked_id?: string | null;
  title: string;
  scheduled_at: string;
  notification_id?: string | null;
  status: ReminderStatus;
  created_at: string;
}

export interface TranscriptionRecord {
  id: string;
  source_type: string;
  transcript: string;
  language: LanguageCode;
  provider: string;
  created_at: string;
}

export type ExtractionType = 'task' | 'reminder' | 'checklist' | 'note';

export interface ExtractedEntity {
  type: ExtractionType;
  title: string;
  description?: string;
  dueAt?: string | null;
  priority?: TaskPriority;
  category?: NoteCategory;
  checklistItems?: string[];
  confidence: number;
  isAmbiguous?: boolean;
  ambiguityReason?: string;
  originalTranscript: string;
  language: LanguageCode;
}

export interface AppSettings {
  language: LanguageCode;
  theme: 'system' | 'light' | 'dark';
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  isProUser: boolean;
  adActionCounter: number;
}

export interface UniversalSearchResult {
  id: string;
  type: 'note' | 'task' | 'checklist';
  title: string;
  subtitle: string;
  matchedField: string;
  date: string;
  data: Note | Task | Checklist;
}
