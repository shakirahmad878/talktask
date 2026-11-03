import { getDatabase } from './database';
import { Reminder, ReminderLinkedType, ReminderStatus } from '../../types';

export class RemindersRepository {
  static getAll(): Reminder[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>('SELECT * FROM reminders ORDER BY scheduled_at ASC');
    return rows.map(this.mapRowToReminder);
  }

  static getUpcoming(limit = 10): Reminder[] {
    const db = getDatabase();
    const nowIso = new Date().toISOString();
    const rows = db.getAllSync<any>(
      `SELECT * FROM reminders 
       WHERE status = 'scheduled' AND scheduled_at >= ? 
       ORDER BY scheduled_at ASC LIMIT ?`,
      [nowIso, limit]
    );
    return rows.map(this.mapRowToReminder);
  }

  static getById(id: string): Reminder | null {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT * FROM reminders WHERE id = ?', [id]);
    return row ? this.mapRowToReminder(row) : null;
  }

  static create(data: {
    id?: string;
    linked_type?: ReminderLinkedType;
    linked_id?: string | null;
    title: string;
    scheduled_at: string;
    notification_id?: string | null;
    status?: ReminderStatus;
  }): Reminder {
    const db = getDatabase();
    const id = data.id || `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO reminders (
        id, linked_type, linked_id, title, scheduled_at, notification_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.linked_type || 'standalone',
        data.linked_id || null,
        data.title.trim(),
        data.scheduled_at,
        data.notification_id || null,
        data.status || 'scheduled',
        now,
      ]
    );

    return {
      id,
      linked_type: data.linked_type || 'standalone',
      linked_id: data.linked_id || null,
      title: data.title.trim(),
      scheduled_at: data.scheduled_at,
      notification_id: data.notification_id || null,
      status: data.status || 'scheduled',
      created_at: now,
    };
  }

  static updateNotificationId(id: string, notificationId: string): void {
    const db = getDatabase();
    db.runSync('UPDATE reminders SET notification_id = ? WHERE id = ?', [notificationId, id]);
  }

  static setStatus(id: string, status: ReminderStatus): void {
    const db = getDatabase();
    db.runSync('UPDATE reminders SET status = ? WHERE id = ?', [status, id]);
  }

  static cancel(id: string): boolean {
    const db = getDatabase();
    const res = db.runSync("UPDATE reminders SET status = 'cancelled' WHERE id = ?", [id]);
    return res.changes > 0;
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const res = db.runSync('DELETE FROM reminders WHERE id = ?', [id]);
    return res.changes > 0;
  }

  private static mapRowToReminder(row: any): Reminder {
    return {
      id: row.id,
      linked_type: row.linked_type,
      linked_id: row.linked_id,
      title: row.title,
      scheduled_at: row.scheduled_at,
      notification_id: row.notification_id,
      status: row.status,
      created_at: row.created_at,
    };
  }
}
