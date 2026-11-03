/**
 * In-memory Mock SQLite implementation for testing repository SQL queries,
 * transactions, constraints, and migration verification.
 */
export class MockSQLiteDatabase {
  private tables: Record<string, any[]> = {
    schema_migrations: [],
    notes: [],
    tasks: [],
    checklists: [],
    checklist_items: [],
    reminders: [],
    transcriptions: [],
  };

  execSync(sql: string): void {
    // Basic execution parser
  }

  withTransactionSync<T>(action: () => T): T {
    return action();
  }

  runSync(sql: string, params: any[] = []): { changes: number; lastInsertRowId: number } {
    const trimmed = sql.trim();

    // 1. INSERT INTO notes
    if (trimmed.startsWith('INSERT INTO notes') || trimmed.startsWith('INSERT OR REPLACE INTO notes')) {
      const note = {
        id: params[0],
        title: params[1],
        content: params[2],
        source_type: params[3],
        language: params[4],
        category: params[5],
        is_pinned: params[6],
        is_favourite: params[7],
        created_at: params[8],
        updated_at: params[9],
      };
      this.tables.notes = this.tables.notes.filter((n) => n.id !== note.id);
      this.tables.notes.push(note);
      return { changes: 1, lastInsertRowId: 1 };
    }

    // 2. UPDATE notes
    if (trimmed.startsWith('UPDATE notes SET')) {
      const id = params[params.length - 1];
      const note = this.tables.notes.find((n) => n.id === id);
      if (note) {
        if (trimmed.includes('title = ?')) {
          const idx = trimmed.split('?').findIndex((s) => s.includes('title ='));
          note.title = params[idx];
        }
        if (trimmed.includes('content = ?')) {
          const idx = trimmed.split('?').findIndex((s) => s.includes('content ='));
          note.content = params[idx];
        }
        if (trimmed.includes('is_pinned = ?')) {
          const idx = trimmed.split('?').findIndex((s) => s.includes('is_pinned ='));
          note.is_pinned = params[idx];
        }
        if (trimmed.includes('is_favourite = ?')) {
          const idx = trimmed.split('?').findIndex((s) => s.includes('is_favourite ='));
          note.is_favourite = params[idx];
        }
        note.updated_at = new Date().toISOString();
        return { changes: 1, lastInsertRowId: 1 };
      }
      return { changes: 0, lastInsertRowId: 0 };
    }

    // 3. DELETE FROM notes
    if (trimmed.startsWith('DELETE FROM notes WHERE id = ?')) {
      const before = this.tables.notes.length;
      this.tables.notes = this.tables.notes.filter((n) => n.id !== params[0]);
      return { changes: before - this.tables.notes.length, lastInsertRowId: 0 };
    }

    // 4. INSERT INTO tasks
    if (trimmed.startsWith('INSERT INTO tasks') || trimmed.startsWith('INSERT OR REPLACE INTO tasks')) {
      const task = {
        id: params[0],
        title: params[1],
        description: params[2],
        status: params[3],
        priority: params[4],
        due_at: params[5],
        created_at: params[6],
        updated_at: params[7],
      };
      this.tables.tasks = this.tables.tasks.filter((t) => t.id !== task.id);
      this.tables.tasks.push(task);
      return { changes: 1, lastInsertRowId: 1 };
    }

    // 5. UPDATE tasks
    if (trimmed.startsWith('UPDATE tasks SET')) {
      const id = params[params.length - 1];
      const task = this.tables.tasks.find((t) => t.id === id);
      if (task) {
        if (trimmed.includes('status = ?')) {
          const idx = trimmed.split('?').findIndex((s) => s.includes('status ='));
          task.status = params[idx];
        }
        if (trimmed.includes('title = ?')) {
          const idx = trimmed.split('?').findIndex((s) => s.includes('title ='));
          task.title = params[idx];
        }
        task.updated_at = new Date().toISOString();
        return { changes: 1, lastInsertRowId: 1 };
      }
      return { changes: 0, lastInsertRowId: 0 };
    }

    // 6. DELETE FROM tasks
    if (trimmed.startsWith('DELETE FROM tasks WHERE id = ?')) {
      const before = this.tables.tasks.length;
      this.tables.tasks = this.tables.tasks.filter((t) => t.id !== params[0]);
      return { changes: before - this.tables.tasks.length, lastInsertRowId: 0 };
    }

    // 7. Checklists & Items
    if (trimmed.startsWith('INSERT INTO checklists')) {
      this.tables.checklists.push({
        id: params[0],
        title: params[1],
        created_at: params[2],
        updated_at: params[3],
      });
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (trimmed.startsWith('INSERT INTO checklist_items')) {
      this.tables.checklist_items.push({
        id: params[0],
        checklist_id: params[1],
        text: params[2],
        is_completed: params[3],
        sort_order: params[4],
      });
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (trimmed.startsWith('UPDATE checklist_items SET is_completed = ?')) {
      const item = this.tables.checklist_items.find((i) => i.id === params[1]);
      if (item) {
        item.is_completed = params[0];
        return { changes: 1, lastInsertRowId: 1 };
      }
    }

    if (trimmed.startsWith('DELETE FROM checklist_items WHERE checklist_id = ?')) {
      this.tables.checklist_items = this.tables.checklist_items.filter((i) => i.checklist_id !== params[0]);
      return { changes: 1, lastInsertRowId: 0 };
    }

    if (trimmed.startsWith('DELETE FROM checklists WHERE id = ?')) {
      this.tables.checklists = this.tables.checklists.filter((c) => c.id !== params[0]);
      return { changes: 1, lastInsertRowId: 0 };
    }

    // 8. Reminders
    if (trimmed.startsWith('INSERT INTO reminders')) {
      this.tables.reminders.push({
        id: params[0],
        linked_type: params[1],
        linked_id: params[2],
        title: params[3],
        scheduled_at: params[4],
        notification_id: params[5],
        status: params[6],
        created_at: params[7],
      });
      return { changes: 1, lastInsertRowId: 1 };
    }

    if (trimmed.includes("UPDATE reminders SET status = 'cancelled' WHERE id = ?")) {
      const rem = this.tables.reminders.find((r) => r.id === params[0]);
      if (rem) {
        rem.status = 'cancelled';
        return { changes: 1, lastInsertRowId: 1 };
      }
    }

    if (trimmed.startsWith('UPDATE reminders SET status = ?')) {
      const rem = this.tables.reminders.find((r) => r.id === params[1]);
      if (rem) {
        rem.status = params[0];
        return { changes: 1, lastInsertRowId: 1 };
      }
    }

    // Default clear tables
    if (trimmed.startsWith('DELETE FROM')) {
      const tbl = trimmed.split(' ')[2];
      if (this.tables[tbl]) this.tables[tbl] = [];
      return { changes: 1, lastInsertRowId: 0 };
    }

    return { changes: 1, lastInsertRowId: 1 };
  }

  getAllSync<T>(sql: string, params: any[] = []): T[] {
    const trimmed = sql.trim();

    if (trimmed.includes('FROM notes')) {
      let list = [...this.tables.notes];
      if (trimmed.includes('is_favourite = 1')) {
        list = list.filter((n) => n.is_favourite === 1);
      }
      if (trimmed.includes('category = ?')) {
        list = list.filter((n) => n.category === params[0]);
      }
      if (trimmed.includes('title LIKE ? OR content LIKE ?')) {
        const query = params[0].replace(/%/g, '').toLowerCase();
        list = list.filter(
          (n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)
        );
      }
      // Sort pinned first, then updated_at desc
      list.sort((a, b) => b.is_pinned - a.is_pinned || b.updated_at.localeCompare(a.updated_at));
      return list as any;
    }

    if (trimmed.includes('FROM tasks')) {
      let list = [...this.tables.tasks];
      if (trimmed.includes('status = ?')) {
        list = list.filter((t) => t.status === params[0]);
      }
      if (trimmed.includes('title LIKE ?')) {
        const query = params[0].replace(/%/g, '').toLowerCase();
        list = list.filter(
          (t) => t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query))
        );
      }
      return list as any;
    }

    if (trimmed.includes('FROM checklists')) {
      return [...this.tables.checklists] as any;
    }

    if (trimmed.includes('FROM checklist_items WHERE checklist_id = ?')) {
      return this.tables.checklist_items.filter((i) => i.checklist_id === params[0]) as any;
    }

    if (trimmed.includes('FROM reminders')) {
      return [...this.tables.reminders] as any;
    }

    return [];
  }

  getFirstSync<T>(sql: string, params: any[] = []): T | null {
    const trimmed = sql.trim();

    if (trimmed.startsWith('SELECT * FROM notes WHERE id = ?')) {
      return (this.tables.notes.find((n) => n.id === params[0]) || null) as any;
    }

    if (trimmed.startsWith('SELECT * FROM tasks WHERE id = ?')) {
      return (this.tables.tasks.find((t) => t.id === params[0]) || null) as any;
    }

    if (trimmed.startsWith('SELECT * FROM checklists WHERE id = ?')) {
      return (this.tables.checklists.find((c) => c.id === params[0]) || null) as any;
    }

    if (trimmed.startsWith('SELECT * FROM checklist_items WHERE id = ?')) {
      return (this.tables.checklist_items.find((i) => i.id === params[0]) || null) as any;
    }

    if (trimmed.startsWith('SELECT is_completed, checklist_id FROM checklist_items WHERE id = ?')) {
      return (this.tables.checklist_items.find((i) => i.id === params[0]) || null) as any;
    }

    if (trimmed.startsWith('SELECT * FROM reminders WHERE id = ?')) {
      return (this.tables.reminders.find((r) => r.id === params[0]) || null) as any;
    }

    if (trimmed.includes('SELECT COUNT(*) as count FROM tasks')) {
      return { count: this.tables.tasks.length } as any;
    }

    if (trimmed.includes('SELECT COUNT(*) as count FROM notes')) {
      return { count: this.tables.notes.length } as any;
    }

    if (trimmed.includes('SELECT MAX(version)')) {
      return { version: 1 } as any;
    }

    return null;
  }
}
