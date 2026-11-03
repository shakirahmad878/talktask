import { getDatabase } from './database';
import { UniversalSearchResult, Note, Task, Checklist } from '../../types';

export class SearchRepository {
  static searchAll(query: string): UniversalSearchResult[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const db = getDatabase();
    const cleanPattern = `%${trimmed}%`;
    const results: UniversalSearchResult[] = [];

    // 1. Search Notes
    const noteRows = db.getAllSync<any>(
      `SELECT * FROM notes 
       WHERE title LIKE ? OR content LIKE ? 
       ORDER BY is_pinned DESC, updated_at DESC LIMIT 20`,
      [cleanPattern, cleanPattern]
    );

    noteRows.forEach((row) => {
      const isTitleMatch = row.title.toLowerCase().includes(trimmed.toLowerCase());
      results.push({
        id: row.id,
        type: 'note',
        title: row.title,
        subtitle: row.content.slice(0, 80) + (row.content.length > 80 ? '...' : ''),
        matchedField: isTitleMatch ? 'title' : 'content',
        date: row.updated_at,
        data: {
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
        } as Note,
      });
    });

    // 2. Search Tasks
    const taskRows = db.getAllSync<any>(
      `SELECT * FROM tasks 
       WHERE title LIKE ? OR (description IS NOT NULL AND description LIKE ?) 
       ORDER BY due_at ASC, updated_at DESC LIMIT 20`,
      [cleanPattern, cleanPattern]
    );

    taskRows.forEach((row) => {
      const isTitleMatch = row.title.toLowerCase().includes(trimmed.toLowerCase());
      results.push({
        id: row.id,
        type: 'task',
        title: row.title,
        subtitle: row.description
          ? row.description.slice(0, 80)
          : `Status: ${row.status} • Priority: ${row.priority}`,
        matchedField: isTitleMatch ? 'title' : 'description',
        date: row.updated_at,
        data: {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          priority: row.priority,
          due_at: row.due_at,
          created_at: row.created_at,
          updated_at: row.updated_at,
        } as Task,
      });
    });

    // 3. Search Checklists
    const checklistRows = db.getAllSync<any>(
      `SELECT DISTINCT c.* FROM checklists c
       LEFT JOIN checklist_items ci ON ci.checklist_id = c.id
       WHERE c.title LIKE ? OR ci.text LIKE ?
       ORDER BY c.updated_at DESC LIMIT 20`,
      [cleanPattern, cleanPattern]
    );

    checklistRows.forEach((row) => {
      const items = db.getAllSync<any>(
        'SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY sort_order ASC',
        [row.id]
      );
      results.push({
        id: row.id,
        type: 'checklist',
        title: row.title,
        subtitle: `${items.length} items (${items.filter((i: any) => i.is_completed === 1).length} completed)`,
        matchedField: 'checklist',
        date: row.updated_at,
        data: {
          id: row.id,
          title: row.title,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: items.map((i: any) => ({
            id: i.id,
            checklist_id: i.checklist_id,
            text: i.text,
            is_completed: i.is_completed === 1,
            sort_order: i.sort_order,
          })),
        } as Checklist,
      });
    });

    return results;
  }
}
