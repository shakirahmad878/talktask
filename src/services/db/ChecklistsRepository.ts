import { getDatabase } from './database';
import { Checklist, ChecklistItem } from '../../types';

export class ChecklistsRepository {
  static getAll(): Checklist[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>('SELECT * FROM checklists ORDER BY updated_at DESC');
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      created_at: r.created_at,
      updated_at: r.updated_at,
      items: this.getItems(r.id),
    }));
  }

  static getById(id: string): Checklist | null {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT * FROM checklists WHERE id = ?', [id]);
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      updated_at: row.updated_at,
      items: this.getItems(id),
    };
  }

  static getItems(checklistId: string): ChecklistItem[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>(
      'SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY sort_order ASC, id ASC',
      [checklistId]
    );
    return rows.map((r) => ({
      id: r.id,
      checklist_id: r.checklist_id,
      text: r.text,
      is_completed: r.is_completed === 1,
      sort_order: r.sort_order,
    }));
  }

  static create(title: string, itemTexts: string[] = []): Checklist {
    const db = getDatabase();
    const id = `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    db.withTransactionSync(() => {
      db.runSync(
        'INSERT INTO checklists (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [id, title.trim(), now, now]
      );

      itemTexts.forEach((text, index) => {
        if (!text.trim()) return;
        const itemId = `chki_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`;
        db.runSync(
          `INSERT INTO checklist_items (id, checklist_id, text, is_completed, sort_order) 
           VALUES (?, ?, ?, 0, ?)`,
          [itemId, id, text.trim(), index]
        );
      });
    });

    return this.getById(id)!;
  }

  static addItem(checklistId: string, text: string): ChecklistItem {
    const db = getDatabase();
    const itemId = `chki_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const maxOrderRow = db.getFirstSync<{ max_order: number }>(
      'SELECT MAX(sort_order) as max_order FROM checklist_items WHERE checklist_id = ?',
      [checklistId]
    );
    const sortOrder = (maxOrderRow?.max_order ?? -1) + 1;
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO checklist_items (id, checklist_id, text, is_completed, sort_order) 
       VALUES (?, ?, ?, 0, ?)`,
      [itemId, checklistId, text.trim(), sortOrder]
    );

    db.runSync('UPDATE checklists SET updated_at = ? WHERE id = ?', [now, checklistId]);

    return {
      id: itemId,
      checklist_id: checklistId,
      text: text.trim(),
      is_completed: false,
      sort_order: sortOrder,
    };
  }

  static toggleItem(itemId: string): boolean {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT is_completed, checklist_id FROM checklist_items WHERE id = ?', [itemId]);
    if (!row) return false;

    const newCompleted = row.is_completed === 1 ? 0 : 1;
    const now = new Date().toISOString();

    db.runSync('UPDATE checklist_items SET is_completed = ? WHERE id = ?', [newCompleted, itemId]);
    db.runSync('UPDATE checklists SET updated_at = ? WHERE id = ?', [now, row.checklist_id]);

    return newCompleted === 1;
  }

  static deleteItem(itemId: string): boolean {
    const db = getDatabase();
    const row = db.getFirstSync<any>('SELECT checklist_id FROM checklist_items WHERE id = ?', [itemId]);
    if (!row) return false;

    db.runSync('DELETE FROM checklist_items WHERE id = ?', [itemId]);
    db.runSync('UPDATE checklists SET updated_at = ? WHERE id = ?', [new Date().toISOString(), row.checklist_id]);
    return true;
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    db.runSync('DELETE FROM checklist_items WHERE checklist_id = ?', [id]);
    const res = db.runSync('DELETE FROM checklists WHERE id = ?', [id]);
    return res.changes > 0;
  }

  static count(): number {
    const db = getDatabase();
    const res = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM checklists');
    return res?.count || 0;
  }
}
