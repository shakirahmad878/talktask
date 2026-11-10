import { getDatabase } from './database';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskValidationSchema } from '../validation/schemas';

export class TasksRepository {
  static getAll(options?: {
    status?: TaskStatus | 'all' | 'overdue';
    priority?: TaskPriority;
    limit?: number;
    offset?: number;
  }): Task[] {
    const db = getDatabase();
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];
    const nowIso = new Date().toISOString();

    if (options?.status === 'overdue') {
      query += " AND status = 'pending' AND due_at IS NOT NULL AND due_at < ?";
      params.push(nowIso);
    } else if (options?.status && options.status !== 'all') {
      query += ' AND status = ?';
      params.push(options.status);
    }

    if (options?.priority) {
      query += ' AND priority = ?';
      params.push(options.priority);
    }

    // Sort order: pending first, then by due_at asc (nulls last), then created_at desc
    query += ` ORDER BY 
      CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
      CASE WHEN due_at IS NULL THEN 1 ELSE 0 END,
      due_at ASC,
      created_at DESC`;

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = db.getAllSync<any>(query, params);
    return rows.map(this.mapRowToTask);
  }

  static getById(id: string): Task | null {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT * FROM tasks WHERE id = ?', [id]);
    return row ? this.mapRowToTask(row) : null;
  }

  static create(data: {
    id?: string;
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_at?: string | null;
  }): Task {
    const validated = TaskValidationSchema.parse(data);
    const db = getDatabase();
    const id = validated.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO tasks (
        id, title, description, status, priority, due_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.title.trim(),
        validated.description ? validated.description.trim() : null,
        validated.status,
        validated.priority,
        validated.due_at || null,
        now,
        now,
      ]
    );

    return {
      id,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      due_at: data.due_at || null,
      created_at: now,
      updated_at: now,
    };
  }

  static update(
    id: string,
    updates: Partial<{
      title: string;
      description: string | null;
      status: TaskStatus;
      priority: TaskPriority;
      due_at: string | null;
    }>
  ): Task | null {
    const db = getDatabase();
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const setClauses: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      params.push(updates.title.trim());
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      params.push(updates.description ? updates.description.trim() : null);
    }
    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      params.push(updates.status);
    }
    if (updates.priority !== undefined) {
      setClauses.push('priority = ?');
      params.push(updates.priority);
    }
    if (updates.due_at !== undefined) {
      setClauses.push('due_at = ?');
      params.push(updates.due_at);
    }

    params.push(id);
    db.runSync(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`, params);

    return this.getById(id);
  }

  static toggleStatus(id: string): TaskStatus | null {
    const task = this.getById(id);
    if (!task) return null;
    const newStatus: TaskStatus = task.status === 'pending' ? 'completed' : 'pending';
    this.update(id, { status: newStatus });
    return newStatus;
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const res = db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
    return res.changes > 0;
  }

  static getTodayTasks(): Task[] {
    const db = getDatabase();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

    const rows = db.getAllSync<any>(
      `SELECT * FROM tasks 
       WHERE due_at >= ? AND due_at <= ? 
       ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, due_at ASC`,
      [startOfDay, endOfDay]
    );
    return rows.map(this.mapRowToTask);
  }

  static getMetrics() {
    const db = getDatabase();
    const nowIso = new Date().toISOString();

    const totalRow = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM tasks');
    const pendingRow = db.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'");
    const completedRow = db.getFirstSync<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    const overdueRow = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM tasks WHERE status = 'pending' AND due_at IS NOT NULL AND due_at < ?",
      [nowIso]
    );

    return {
      total: totalRow?.count || 0,
      pending: pendingRow?.count || 0,
      completed: completedRow?.count || 0,
      overdue: overdueRow?.count || 0,
    };
  }

  private static mapRowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      due_at: row.due_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
