# TalkTask — SQLite Database Architecture & Schema

TalkTask uses **Expo SQLite** (`openDatabaseSync` / `openDatabaseAsync`) with ACID-compliant transactions, foreign key enforcement, and a version-controlled migration tracker.

---

## 1. Schema Migration History

### Migration Version 1 (`schema_migrations`)

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
);
```

---

## 2. Table Specifications

### 2.1. `notes`
Stores voice-captured and manual notes, categorized, pinnable, and searchable.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`note_<timestamp>_<random>`) |
| `title` | TEXT | NOT NULL | Note headline or first sentence |
| `content` | TEXT | NOT NULL | Full note body / transcription text |
| `source_type` | TEXT | DEFAULT 'voice' | `'voice'` or `'manual'` |
| `language` | TEXT | DEFAULT 'en' | `'en'`, `'hi'`, or `'hinglish'` |
| `category` | TEXT | DEFAULT 'general' | `'general'`, `'work'`, `'personal'`, `'ideas'`, `'shopping'`, `'meeting'` |
| `is_pinned` | INTEGER | DEFAULT 0 | 1 if pinned to top of screen |
| `is_favourite` | INTEGER | DEFAULT 0 | 1 if starred as favourite |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |

**Indexes:**
- `idx_notes_created`: `notes(created_at DESC)`
- `idx_notes_pinned`: `notes(is_pinned DESC, updated_at DESC)`
- `idx_notes_category`: `notes(category)`

---

### 2.2. `tasks`
Stores actionable to-do items, priority levels, and due dates.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`task_<timestamp>_<random>`) |
| `title` | TEXT | NOT NULL | Action item title |
| `description` | TEXT | NULLABLE | Detailed description or transcript context |
| `status` | TEXT | DEFAULT 'pending' | `'pending'` or `'completed'` |
| `priority` | TEXT | DEFAULT 'medium' | `'low'`, `'medium'`, `'high'`, or `'urgent'` |
| `due_at` | TEXT | NULLABLE | Target ISO 8601 UTC timestamp |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |

**Indexes:**
- `idx_tasks_status`: `tasks(status)`
- `idx_tasks_due`: `tasks(due_at)`
- `idx_tasks_created`: `tasks(created_at DESC)`

---

### 2.3. `checklists` & `checklist_items`
Stores grouped checklists (e.g. shopping list, grocery list, meeting agenda) with toggleable checklist items.

#### `checklists`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`chk_<timestamp>_<random>`) |
| `title` | TEXT | NOT NULL | Checklist title (e.g. "Shopping List") |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |

#### `checklist_items`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`chki_<timestamp>_<random>`) |
| `checklist_id` | TEXT | NOT NULL | FK referencing `checklists(id)` ON DELETE CASCADE |
| `text` | TEXT | NOT NULL | Item name (e.g. "Milk", "Eggs", "Bread") |
| `is_completed` | INTEGER | DEFAULT 0 | 1 if checked off |
| `sort_order` | INTEGER | DEFAULT 0 | Ordering index for drag/drop |

**Indexes:**
- `idx_checklist_items_cid`: `checklist_items(checklist_id, sort_order ASC)`

---

### 2.4. `reminders`
Stores local notification schedules linked to tasks, notes, or standalone alarms.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`rem_<timestamp>_<random>`) |
| `linked_type` | TEXT | DEFAULT 'standalone' | `'task'`, `'note'`, or `'standalone'` |
| `linked_id` | TEXT | NULLABLE | ID of parent task or note |
| `title` | TEXT | NOT NULL | Notification body message |
| `scheduled_at` | TEXT | NOT NULL | Scheduled ISO 8601 UTC timestamp |
| `notification_id` | TEXT | NULLABLE | System notification ID from Expo |
| `status` | TEXT | DEFAULT 'scheduled' | `'scheduled'`, `'fired'`, or `'cancelled'` |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |

**Indexes:**
- `idx_reminders_sched`: `reminders(scheduled_at, status)`

---

### 2.5. `transcriptions`
Maintains an audit log of voice captures, languages, and transcription confidence for analytics.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique ID (`tx_<timestamp>_<random>`) |
| `source_type` | TEXT | DEFAULT 'voice_recording'| Audio source format |
| `transcript` | TEXT | NOT NULL | Raw transcribed text |
| `language` | TEXT | NOT NULL | Detected or chosen language |
| `provider` | TEXT | NOT NULL | Name of provider used |
| `created_at` | TEXT | NOT NULL | ISO 8601 UTC timestamp |

---

## 3. Data Integrity & Concurrency

1. **Foreign Key Enforcement**: `PRAGMA foreign_keys = ON;` is strictly executed upon every connection. Deleting a checklist automatically cascades and clears its child items.
2. **ACID Transactions**: Multi-statement inserts (like creating a checklist with 10 items, or restoring backups) are executed inside `db.withTransactionSync()`.
3. **Idempotency Protection**: UI buttons lock via `isSaving` state to prevent duplicate records from rapid taps.
