import { setDatabaseInstance } from '../src/services/db/database';
import { NotesRepository } from '../src/services/db/NotesRepository';
import { TasksRepository } from '../src/services/db/TasksRepository';
import { ChecklistsRepository } from '../src/services/db/ChecklistsRepository';
import { RemindersRepository } from '../src/services/db/RemindersRepository';
import { SearchRepository } from '../src/services/db/SearchRepository';
import { BackupRepository } from '../src/services/db/BackupRepository';
import { MockSQLiteDatabase } from './mockDatabase';

describe('Local SQLite Database & Repositories', () => {
  let mockDb: MockSQLiteDatabase;

  beforeEach(() => {
    mockDb = new MockSQLiteDatabase();
    setDatabaseInstance(mockDb);
  });

  describe('NotesRepository', () => {
    it('creates, reads, updates, and deletes notes offline', () => {
      const created = NotesRepository.create({
        title: 'Voice Note 1',
        content: 'Remember to call the bank tomorrow morning',
        category: 'personal',
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe('Voice Note 1');

      // Read
      const fetched = NotesRepository.getById(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.title).toBe('Voice Note 1');

      // Update
      const updated = NotesRepository.update(created.id, {
        title: 'Voice Note 1 Updated',
      });
      expect(updated?.title).toBe('Voice Note 1 Updated');

      // Toggle Pin & Favourite
      const isPinned = NotesRepository.togglePin(created.id);
      expect(isPinned).toBe(true);

      const isFav = NotesRepository.toggleFavourite(created.id);
      expect(isFav).toBe(true);

      // Delete
      const deleted = NotesRepository.delete(created.id);
      expect(deleted).toBe(true);
      expect(NotesRepository.getById(created.id)).toBeNull();
    });

    it('searches notes offline by keywords', () => {
      NotesRepository.create({ title: 'Grocery Milk and Eggs', content: 'Buy fresh items' });
      NotesRepository.create({ title: 'Meeting notes', content: 'Discuss Q3 deliverables' });

      const results = NotesRepository.search('milk');
      expect(results.length).toBe(1);
      expect(results[0].title).toContain('Grocery');
    });
  });

  describe('TasksRepository', () => {
    it('creates and completes tasks', () => {
      const task = TasksRepository.create({
        title: 'File GST return',
        priority: 'urgent',
        due_at: new Date().toISOString(),
      });

      expect(task.id).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('urgent');

      // Toggle status to completed
      const newStatus = TasksRepository.toggleStatus(task.id);
      expect(newStatus).toBe('completed');

      const fetched = TasksRepository.getById(task.id);
      expect(fetched?.status).toBe('completed');

      // Delete task
      const deleted = TasksRepository.delete(task.id);
      expect(deleted).toBe(true);
      expect(TasksRepository.getById(task.id)).toBeNull();
    });
  });

  describe('ChecklistsRepository', () => {
    it('creates checklist with multiple items and toggles items', () => {
      const chk = ChecklistsRepository.create('Weekend Shopping', [
        'Rice',
        'Cooking Oil',
        'Spices',
      ]);

      expect(chk.id).toBeDefined();
      expect(chk.items?.length).toBe(3);

      const firstItem = chk.items![0];
      expect(firstItem.is_completed).toBe(false);

      // Toggle item
      const completed = ChecklistsRepository.toggleItem(firstItem.id);
      expect(completed).toBe(true);

      // Add item
      const added = ChecklistsRepository.addItem(chk.id, 'Fresh coriander');
      expect(added.text).toBe('Fresh coriander');

      // Delete checklist
      const deleted = ChecklistsRepository.delete(chk.id);
      expect(deleted).toBe(true);
    });
  });

  describe('RemindersRepository', () => {
    it('creates and cancels reminders', () => {
      const rem = RemindersRepository.create({
        title: 'Doctor appointment reminder',
        scheduled_at: new Date(Date.now() + 3600000).toISOString(),
      });

      expect(rem.id).toBeDefined();
      expect(rem.status).toBe('scheduled');

      // Cancel reminder
      const cancelled = RemindersRepository.cancel(rem.id);
      expect(cancelled).toBe(true);

      const fetched = RemindersRepository.getById(rem.id);
      expect(fetched?.status).toBe('cancelled');
    });
  });

  describe('Universal Search', () => {
    it('searches across notes and tasks simultaneously', () => {
      NotesRepository.create({ title: 'Interview prep', content: 'Review system design concepts' });
      TasksRepository.create({ title: 'Schedule mock interview', priority: 'high' });

      const matches = SearchRepository.searchAll('interview');
      expect(matches.length).toBe(2);
      expect(matches.some((m) => m.type === 'note')).toBe(true);
      expect(matches.some((m) => m.type === 'task')).toBe(true);
    });
  });

  describe('Backup & Restore Repository', () => {
    it('exports all records into valid JSON and restores cleanly', () => {
      NotesRepository.create({ title: 'Note To Export', content: 'Test Content' });
      TasksRepository.create({ title: 'Task To Export', priority: 'medium' });

      const backup = BackupRepository.exportAll();
      expect(backup.appName).toBe('TalkTask');
      expect(backup.data.notes.length).toBeGreaterThan(0);
      expect(backup.data.tasks.length).toBeGreaterThan(0);

      // Clear all
      BackupRepository.deleteAllUserData();
      expect(NotesRepository.getAll().length).toBe(0);
      expect(TasksRepository.getAll().length).toBe(0);

      // Restore from backup
      const result = BackupRepository.restoreFromBackup(backup);
      expect(result.success).toBe(true);
      expect(result.restoredCount).toBeGreaterThan(0);

      expect(NotesRepository.getAll().length).toBe(1);
      expect(TasksRepository.getAll().length).toBe(1);
    });
  });
});
