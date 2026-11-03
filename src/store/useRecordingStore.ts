import { create } from 'zustand';
import { ExtractedEntity, LanguageCode } from '../types';
import { AudioRecorder, globalAudioRecorder } from '../services/audio/AudioRecorder';
import { TranscriptionService } from '../services/transcription/TranscriptionService';
import { SmartExtractor } from '../services/nlp/SmartExtractor';
import { NotesRepository } from '../services/db/NotesRepository';
import { TasksRepository } from '../services/db/TasksRepository';
import { ChecklistsRepository } from '../services/db/ChecklistsRepository';
import { RemindersRepository } from '../services/db/RemindersRepository';
import { NotificationManager } from '../services/notifications/NotificationManager';
import { AdMobManager } from '../services/ads/AdMobManager';
import { useNotesStore } from './useNotesStore';
import { useTasksStore } from './useTasksStore';

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'transcribing' | 'review' | 'saving' | 'error';

interface RecordingState {
  status: RecordingStatus;
  isModalVisible: boolean;
  durationMs: number;
  meteringLevel: number;
  audioUri: string | null;
  transcript: string;
  extractedEntity: ExtractedEntity | null;
  errorMessage: string | null;
  selectedLanguage: LanguageCode;
  isSaving: boolean; // Idempotency protection

  openModal: (lang?: LanguageCode) => void;
  closeModal: () => void;
  setLanguage: (lang: LanguageCode) => void;
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopAndProcess: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  updateTranscript: (text: string) => void;
  updateExtractedEntity: (updates: Partial<ExtractedEntity>) => void;
  confirmAndSave: () => Promise<{ success: boolean; type: string; id: string }>;
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  status: 'idle',
  isModalVisible: false,
  durationMs: 0,
  meteringLevel: 0,
  audioUri: null,
  transcript: '',
  extractedEntity: null,
  errorMessage: null,
  selectedLanguage: 'en',
  isSaving: false,

  openModal: (lang) => {
    set({
      isModalVisible: true,
      status: 'idle',
      durationMs: 0,
      meteringLevel: 0,
      audioUri: null,
      transcript: '',
      extractedEntity: null,
      errorMessage: null,
      isSaving: false,
      selectedLanguage: lang || get().selectedLanguage || 'en',
    });
  },

  closeModal: () => {
    const { status } = get();
    if (status === 'recording' || status === 'paused') {
      globalAudioRecorder.cancel();
    }
    set({
      isModalVisible: false,
      status: 'idle',
      durationMs: 0,
      meteringLevel: 0,
      audioUri: null,
      transcript: '',
      extractedEntity: null,
      errorMessage: null,
      isSaving: false,
    });
  },

  setLanguage: (lang) => {
    set({ selectedLanguage: lang });
  },

  startRecording: async () => {
    try {
      set({ status: 'recording', durationMs: 0, errorMessage: null });
      await globalAudioRecorder.startRecording((s) => {
        set({
          durationMs: s.durationMs,
          meteringLevel: s.meteringLevel,
        });
      });
    } catch (err: any) {
      console.warn('Start recording error:', err);
      set({
        status: 'error',
        errorMessage: err.message || 'Microphone access denied or audio recorder unavailable.',
      });
    }
  },

  pauseRecording: async () => {
    await globalAudioRecorder.pause();
    set({ status: 'paused' });
  },

  resumeRecording: async () => {
    await globalAudioRecorder.resume();
    set({ status: 'recording' });
  },

  stopAndProcess: async () => {
    try {
      set({ status: 'transcribing' });
      const uri = await globalAudioRecorder.stop();
      set({ audioUri: uri });

      const { selectedLanguage } = get();
      const result = await TranscriptionService.transcribeAudio(uri || '', selectedLanguage);

      // Run smart extraction engine
      const entity = SmartExtractor.extract(result.transcript, selectedLanguage);

      set({
        transcript: result.transcript,
        extractedEntity: entity,
        status: 'review',
      });
    } catch (err: any) {
      console.error('Transcription error:', err);
      set({
        status: 'error',
        errorMessage: err.message || 'Speech processing failed. Please try again.',
      });
    }
  },

  cancelRecording: async () => {
    await globalAudioRecorder.cancel();
    set({
      status: 'idle',
      durationMs: 0,
      meteringLevel: 0,
      audioUri: null,
      transcript: '',
      extractedEntity: null,
    });
  },

  updateTranscript: (text: string) => {
    const { selectedLanguage } = get();
    const entity = SmartExtractor.extract(text, selectedLanguage);
    set({ transcript: text, extractedEntity: entity });
  },

  updateExtractedEntity: (updates) => {
    const current = get().extractedEntity;
    if (current) {
      set({ extractedEntity: { ...current, ...updates } });
    }
  },

  confirmAndSave: async () => {
    const { extractedEntity, isSaving, transcript, selectedLanguage } = get();

    // Idempotency lock to prevent duplicate records
    if (isSaving || !extractedEntity) {
      return { success: false, type: '', id: '' };
    }

    set({ isSaving: true });

    try {
      let createdId = '';
      const entityType = extractedEntity.type;

      if (entityType === 'checklist') {
        const items = extractedEntity.checklistItems || [extractedEntity.title];
        const chk = ChecklistsRepository.create(extractedEntity.title, items);
        createdId = chk.id;
        useTasksStore.getState().loadChecklists();
      } else if (entityType === 'task') {
        const task = TasksRepository.create({
          title: extractedEntity.title,
          description: transcript !== extractedEntity.title ? transcript : undefined,
          priority: extractedEntity.priority || 'medium',
          due_at: extractedEntity.dueAt,
        });
        createdId = task.id;

        // If it has a due date, also create a reminder
        if (extractedEntity.dueAt) {
          const rem = RemindersRepository.create({
            linked_type: 'task',
            linked_id: task.id,
            title: `Task Reminder: ${task.title}`,
            scheduled_at: extractedEntity.dueAt,
          });
          await NotificationManager.scheduleReminderNotification(rem);
        }

        useTasksStore.getState().loadTasks();
      } else if (entityType === 'reminder') {
        const schedTime = extractedEntity.dueAt || new Date(Date.now() + 3600000).toISOString();
        const rem = RemindersRepository.create({
          linked_type: 'standalone',
          title: extractedEntity.title,
          scheduled_at: schedTime,
        });
        createdId = rem.id;
        await NotificationManager.scheduleReminderNotification(rem);
        useTasksStore.getState().loadTasks();
      } else {
        // Note
        const note = NotesRepository.create({
          title: extractedEntity.title,
          content: extractedEntity.description || transcript,
          source_type: 'voice',
          language: selectedLanguage,
          category: extractedEntity.category || 'general',
        });
        createdId = note.id;
        useNotesStore.getState().loadNotes();
      }

      // Check ad trigger safely
      AdMobManager.recordCompletedWorkflow();

      set({ isSaving: false, isModalVisible: false, status: 'idle' });
      return { success: true, type: entityType, id: createdId };
    } catch (err) {
      console.error('Failed to confirm and save:', err);
      set({ isSaving: false });
      throw err;
    }
  },
}));
