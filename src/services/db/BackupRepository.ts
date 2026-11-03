import { getDatabase } from './database';
import { NotesRepository } from './NotesRepository';
import { TasksRepository } from './TasksRepository';
import { ChecklistsRepository } from './ChecklistsRepository';
import { RemindersRepository } from './RemindersRepository';

export interface FullBackupPayload {
  version: number;
  exportedAt: string;
  appName: string;
  data: {
    notes: any[];
    tasks: any[];
    checklists: any[];
    reminders: any[];
  };
}

export class BackupRepository {
  static exportAll(): FullBackupPayload {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      appName: 'TalkTask',
      data: {
        notes: NotesRepository.getAll(),
        tasks: TasksRepository.getAll(),
        checklists: ChecklistsRepository.getAll(),
        reminders: RemindersRepository.getAll(),
      },
    };
  }

  static restoreFromBackup(payload: FullBackupPayload): { success: boolean; restoredCount: number } {
    if (!payload || !payload.data) {
      throw new Error('Invalid backup format');
    }

    const db = getDatabase();
    let count = 0;

    db.withTransactionSync(() => {
      // 1. Notes
      if (Array.isArray(payload.data.notes)) {
        for (const n of payload.data.notes) {
          db.runSync(
            `INSERT OR REPLACE INTO notes (
              id, title, content, source_type, language, category, is_pinned, is_favourite, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              n.id,
              n.title,
              n.content,
              n.source_type || 'voice',
              n.language || 'en',
              n.category || 'general',
              n.is_pinned ? 1 : 0,
              n.is_favourite ? 1 : 0,
              n.created_at || new Date().toISOString(),
              n.updated_at || new Date().toISOString(),
            ]
          );
          count++;
        }
      }

      // 2. Tasks
      if (Array.isArray(payload.data.tasks)) {
        for (const t of payload.data.tasks) {
          db.runSync(
            `INSERT OR REPLACE INTO tasks (
              id, title, description, status, priority, due_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              t.id,
              t.title,
              t.description || null,
              t.status || 'pending',
              t.priority || 'medium',
              t.due_at || null,
              t.created_at || new Date().toISOString(),
              t.updated_at || new Date().toISOString(),
            ]
          );
          count++;
        }
      }

      // 3. Checklists
      if (Array.isArray(payload.data.checklists)) {
        for (const c of payload.data.checklists) {
          db.runSync(
            'INSERT OR REPLACE INTO checklists (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
            [c.id, c.title, c.created_at || new Date().toISOString(), c.updated_at || new Date().toISOString()]
          );
          if (Array.isArray(c.items)) {
            for (const item of c.items) {
              db.runSync(
                `INSERT OR REPLACE INTO checklist_items (id, checklist_id, text, is_completed, sort_order)
                 VALUES (?, ?, ?, ?, ?)`,
                [item.id, c.id, item.text, item.is_completed ? 1 : 0, item.sort_order || 0]
              );
            }
          }
          count++;
        }
      }

      // 4. Reminders
      if (Array.isArray(payload.data.reminders)) {
        for (const r of payload.data.reminders) {
          db.runSync(
            `INSERT OR REPLACE INTO reminders (
              id, linked_type, linked_id, title, scheduled_at, notification_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              r.id,
              r.linked_type || 'standalone',
              r.linked_id || null,
              r.title,
              r.scheduled_at,
              r.notification_id || null,
              r.status || 'scheduled',
              r.created_at || new Date().toISOString(),
            ]
          );
          count++;
        }
      }
    });

    return { success: true, restoredCount: count };
  }

  static deleteAllUserData(): void {
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM notes');
      db.runSync('DELETE FROM checklist_items');
      db.runSync('DELETE FROM checklists');
      db.runSync('DELETE FROM tasks');
      db.runSync('DELETE FROM reminders');
      db.runSync('DELETE FROM transcriptions');
    });
  }
}
