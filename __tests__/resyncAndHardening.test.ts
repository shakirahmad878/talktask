jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notif-123'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: {
    MAX: 5,
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

import { NotificationManager } from '../src/services/notifications/NotificationManager';
import { RemindersRepository } from '../src/services/db/RemindersRepository';
import { setDatabaseInstance, initDatabase } from '../src/services/db/database';
import { MockSQLiteDatabase } from './mockDatabase';
import {
  NoteValidationSchema,
  TaskValidationSchema,
  ReminderValidationSchema,
  ChecklistValidationSchema,
} from '../src/services/validation/schemas';
import * as Notifications from 'expo-notifications';

describe('Hardening, Migrations & Reminder Resync Tests', () => {
  let mockDb: MockSQLiteDatabase;

  beforeEach(() => {
    mockDb = new MockSQLiteDatabase();
    setDatabaseInstance(mockDb);
    initDatabase();
    jest.clearAllMocks();
  });

  describe('Database Migrations', () => {
    it('verifies schema_migrations table tracks version 1', () => {
      const migrationRow = mockDb.getFirstSync<{ version: number }>(
        'SELECT MAX(version) as version FROM schema_migrations'
      );
      expect(migrationRow?.version).toBe(1);
    });

    it('does not crash when re-running initDatabase', () => {
      expect(() => initDatabase()).not.toThrow();
    });
  });

  describe('Reminder Resync & Permissions', () => {
    it('silently skips scheduling if notification permission is not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      await NotificationManager.resyncUpcomingReminders();

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('reschedules upcoming active reminders on boot when permission is granted', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour ahead
      RemindersRepository.create({
        title: 'Meeting with Architect',
        scheduled_at: futureDate,
      });

      await NotificationManager.resyncUpcomingReminders();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'TalkTask Reminder',
            body: 'Meeting with Architect',
          }),
        })
      );
    });

    it('marks past reminders as fired during boot resync', async () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      const rem = RemindersRepository.create({
        title: 'Past Task Reminder',
        scheduled_at: pastDate,
      });

      await NotificationManager.resyncUpcomingReminders();

      const updated = RemindersRepository.getById(rem.id);
      expect(updated?.status).toBe('fired');
    });
  });

  describe('Zod Runtime Schema Validation', () => {
    it('rejects note with empty title', () => {
      expect(() => {
        NoteValidationSchema.parse({
          title: '',
          content: 'Hello',
        });
      }).toThrow();
    });

    it('accepts valid note and applies default category and language', () => {
      const parsed = NoteValidationSchema.parse({
        title: 'Valid Idea',
        content: 'Building a micro-irrigation system',
      });

      expect(parsed.category).toBe('general');
      expect(parsed.language).toBe('en');
      expect(parsed.source_type).toBe('voice');
    });

    it('rejects reminder with invalid date format', () => {
      expect(() => {
        ReminderValidationSchema.parse({
          title: 'Doctor Appointment',
          scheduled_at: 'not-a-valid-date',
        });
      }).toThrow();
    });

    it('validates checklist title and item array', () => {
      const checklist = ChecklistValidationSchema.parse({
        title: 'Groceries',
        items: ['Rice', 'Milk', 'Bread'],
      });

      expect(checklist.items.length).toBe(3);
    });
  });
});
