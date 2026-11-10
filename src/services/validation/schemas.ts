import { z } from 'zod';

export const NoteValidationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title cannot be empty').max(300, 'Title too long'),
  content: z.string().max(100000, 'Content too long'),
  source_type: z.enum(['voice', 'manual']).default('voice'),
  language: z.enum(['en', 'hi', 'hinglish']).default('en'),
  category: z.enum(['general', 'work', 'personal', 'ideas']).default('general'),
  is_pinned: z.boolean().default(false),
  is_favourite: z.boolean().default(false),
});

export const TaskValidationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Task title cannot be empty').max(300, 'Title too long'),
  description: z.string().nullable().optional(),
  status: z.enum(['pending', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_at: z.string().nullable().optional(),
});

export const ChecklistValidationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Checklist title cannot be empty').max(300),
  items: z.array(z.string().min(1)).default([]),
});

export const ReminderValidationSchema = z.object({
  id: z.string().optional(),
  linked_type: z.enum(['task', 'note', 'standalone']).default('standalone'),
  linked_id: z.string().nullable().optional(),
  title: z.string().min(1, 'Reminder title cannot be empty').max(300),
  scheduled_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid scheduled_at date ISO string',
  }),
  notification_id: z.string().nullable().optional(),
  status: z.enum(['scheduled', 'fired', 'cancelled']).default('scheduled'),
});

export const ExtractedEntityValidationSchema = z.object({
  type: z.enum(['task', 'reminder', 'checklist', 'note', 'meeting']),
  title: z.string().min(1),
  details: z.string().optional(),
  date: z.string().nullable().optional(),
  time: z.string().nullable().optional(),
  items: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
});

export type ValidatedNote = z.infer<typeof NoteValidationSchema>;
export type ValidatedTask = z.infer<typeof TaskValidationSchema>;
export type ValidatedChecklist = z.infer<typeof ChecklistValidationSchema>;
export type ValidatedReminder = z.infer<typeof ReminderValidationSchema>;
export type ValidatedExtractedEntity = z.infer<typeof ExtractedEntityValidationSchema>;
