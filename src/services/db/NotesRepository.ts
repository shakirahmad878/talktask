import { getDatabase } from './database';
import { Note, NoteCategory, LanguageCode } from '../../types';
import { NoteValidationSchema } from '../validation/schemas';

export class NotesRepository {
  static getAll(options?: {
    category?: NoteCategory | 'all';
    onlyFavourites?: boolean;
    limit?: number;
    offset?: number;
  }): Note[] {
    const db = getDatabase();
    let query = 'SELECT * FROM notes WHERE 1=1';
    const params: any[] = [];

    if (options?.category && options.category !== 'all') {
      query += ' AND category = ?';
      params.push(options.category);
    }

    if (options?.onlyFavourites) {
      query += ' AND is_favourite = 1';
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = db.getAllSync<any>(query, params);
    return rows.map(this.mapRowToNote);
  }

  static getById(id: string): Note | null {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT * FROM notes WHERE id = ?', [id]);
    return row ? this.mapRowToNote(row) : null;
  }

  static create(data: {
    id?: string;
    title: string;
    content: string;
    source_type?: 'voice' | 'manual';
    language?: LanguageCode;
    category?: NoteCategory;
    is_pinned?: boolean;
    is_favourite?: boolean;
  }): Note {
    const validated = NoteValidationSchema.parse(data);
    const db = getDatabase();
    const id = validated.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO notes (
        id, title, content, source_type, language, category, is_pinned, is_favourite, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        validated.title.trim(),
        validated.content.trim(),
        validated.source_type,
        validated.language,
        validated.category,
        validated.is_pinned ? 1 : 0,
        validated.is_favourite ? 1 : 0,
        now,
        now,
      ]
    );

    return {
      id,
      title: data.title.trim(),
      content: data.content.trim(),
      source_type: data.source_type || 'voice',
      language: data.language || 'en',
      category: data.category || 'general',
      is_pinned: !!data.is_pinned,
      is_favourite: !!data.is_favourite,
      created_at: now,
      updated_at: now,
    };
  }

  static update(
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      category: NoteCategory;
      is_pinned: boolean;
      is_favourite: boolean;
    }>
  ): Note | null {
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
    if (updates.content !== undefined) {
      setClauses.push('content = ?');
      params.push(updates.content.trim());
    }
    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      params.push(updates.category);
    }
    if (updates.is_pinned !== undefined) {
      setClauses.push('is_pinned = ?');
      params.push(updates.is_pinned ? 1 : 0);
    }
    if (updates.is_favourite !== undefined) {
      setClauses.push('is_favourite = ?');
      params.push(updates.is_favourite ? 1 : 0);
    }

    params.push(id);
    db.runSync(`UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`, params);

    return this.getById(id);
  }

  static togglePin(id: string): boolean {
    const note = this.getById(id);
    if (!note) return false;
    const newPinned = !note.is_pinned;
    this.update(id, { is_pinned: newPinned });
    return newPinned;
  }

  static toggleFavourite(id: string): boolean {
    const note = this.getById(id);
    if (!note) return false;
    const newFav = !note.is_favourite;
    this.update(id, { is_favourite: newFav });
    return newFav;
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const res = db.runSync('DELETE FROM notes WHERE id = ?', [id]);
    return res.changes > 0;
  }

  static search(queryStr: string): Note[] {
    const db = getDatabase();
    const clean = `%${queryStr.trim()}%`;
    const rows = db.getAllSync<any>(
      `SELECT * FROM notes 
       WHERE title LIKE ? OR content LIKE ? 
       ORDER BY is_pinned DESC, updated_at DESC`,
      [clean, clean]
    );
    return rows.map(this.mapRowToNote);
  }

  static getRecent(limit = 5): Note[] {
    return this.getAll({ limit });
  }

  static count(): number {
    const db = getDatabase();
    const res = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM notes');
    return res?.count || 0;
  }

  private static mapRowToNote(row: any): Note {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      source_type: row.source_type,
      language: row.language,
      category: row.category,
      is_pinned: row.is_pinned === 1,
      is_favourite: row.is_favourite === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
