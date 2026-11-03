import * as SQLite from 'expo-sqlite';
import { Note, Task, Checklist, ChecklistItem, Reminder, TranscriptionRecord, UniversalSearchResult } from '../../types';

export const DATABASE_NAME = 'talktask.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DATABASE_NAME);
    dbInstance.execSync('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

// For unit testing with mock DB or custom instance
export function setDatabaseInstance(db: any) {
  dbInstance = db;
}

export function initDatabase(): void {
  const db = getDatabase();

  // Create migrations tracker
  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const currentVersionRow = db.getFirstSync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_migrations'
  );
  const currentVersion = currentVersionRow?.version || 0;

  if (currentVersion < 1) {
    runMigrationV1(db);
  }
}

function runMigrationV1(db: SQLite.SQLiteDatabase): void {
  db.withTransactionSync(() => {
    // 1. Notes
    db.execSync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_type TEXT DEFAULT 'voice',
        language TEXT DEFAULT 'en',
        category TEXT DEFAULT 'general',
        is_pinned INTEGER DEFAULT 0,
        is_favourite INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned DESC, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
    `);

    // 2. Tasks
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
    `);

    // 3. Checklists & Items
    db.execSync(`
      CREATE TABLE IF NOT EXISTS checklists (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        checklist_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_checklist_items_cid ON checklist_items(checklist_id, sort_order ASC);
    `);

    // 4. Reminders
    db.execSync(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        linked_type TEXT DEFAULT 'standalone',
        linked_id TEXT,
        title TEXT NOT NULL,
        scheduled_at TEXT NOT NULL,
        notification_id TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_reminders_sched ON reminders(scheduled_at, status);
    `);

    // 5. Transcriptions Log
    db.execSync(`
      CREATE TABLE IF NOT EXISTS transcriptions (
        id TEXT PRIMARY KEY,
        source_type TEXT DEFAULT 'voice_recording',
        transcript TEXT NOT NULL,
        language TEXT NOT NULL,
        provider TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_transcriptions_created ON transcriptions(created_at DESC);
    `);

    db.runSync(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
      [1, new Date().toISOString()]
    );
  });
}
