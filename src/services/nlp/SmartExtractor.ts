import { ExtractedEntity, ExtractionType, TaskPriority, NoteCategory, LanguageCode } from '../../types';

export class SmartExtractor {
  /**
   * Main entry point to extract structured productivity items from spoken or typed input.
   */
  static extract(input: string, preferredLanguage: LanguageCode = 'en'): ExtractedEntity {
    const raw = input.trim();
    if (!raw) {
      return {
        type: 'note',
        title: 'Empty Note',
        originalTranscript: raw,
        confidence: 0,
        language: preferredLanguage,
      };
    }

    const lower = raw.toLowerCase();
    const dateResult = this.extractDateAndTime(lower);

    // 1. Detect Checklist intent (e.g. "Buy milk, eggs, bread and vegetables tomorrow")
    const checklistResult = this.detectChecklist(raw, lower, dateResult.dueAt);
    if (checklistResult) {
      return checklistResult;
    }

    // 2. Detect Meeting intent
    const meetingResult = this.detectMeeting(raw, lower, dateResult);
    if (meetingResult) {
      return meetingResult;
    }

    // 3. Detect Reminder intent (e.g. "Remind me to pay electricity bill on Friday")
    const reminderResult = this.detectReminder(raw, lower, dateResult);
    if (reminderResult) {
      return reminderResult;
    }

    // 4. Detect General Task intent (e.g. "Finish project report by tomorrow")
    const taskResult = this.detectTask(raw, lower, dateResult);
    if (taskResult) {
      return taskResult;
    }

    // 5. Default: Note / Idea
    return this.detectNote(raw, lower, preferredLanguage);
  }

  /**
   * Detects shopping/checklist items.
   */
  private static detectChecklist(raw: string, lower: string, dueAt: string | null): ExtractedEntity | null {
    const buyTriggers = [
      'buy ', 'purchase ', 'get ', 'shopping list', 'grocery', 'checklist',
      'khareedna hai', 'kharidna hai', 'le aana', 'lana hai', 'khareedo', 'mangwana hai'
    ];

    const hasTrigger = buyTriggers.some((t) => lower.includes(t));
    const hasMultipleItems = lower.includes(',') || lower.includes(' and ') || lower.includes(' aur ');

    if (!hasTrigger && !hasMultipleItems) {
      return null;
    }

    // Extract item list
    let itemSection = raw;

    // Strip out common date/time tails like "tomorrow", "kal", "on friday"
    const cleaned = raw.replace(/\b(tomorrow|today|yesterday|kal|parson|on [a-z]+|at \d+(:?\d+)?\s*(am|pm)?|sham ko|subah|baje)\b/gi, '').trim();

    // Remove trigger prefix
    let content = cleaned;
    for (const t of buyTriggers) {
      const idx = content.toLowerCase().indexOf(t);
      if (idx !== -1) {
        content = content.slice(idx + t.length);
        break;
      }
    }

    // Split by commas, 'and', 'aur', '&'
    const rawItems = content
      .split(/,|\band\b|\baur\b|&|\n/gi)
      .map((item) => item.replace(/^(to\s+|buy\s+|get\s+|some\s+)/i, '').trim())
      .filter((item) => item.length > 0 && !/^(tomorrow|kal|today)$/i.test(item));

    if (rawItems.length >= 2 || (hasTrigger && rawItems.length >= 1)) {
      let title = 'Shopping List';
      if (lower.includes('grocery')) title = 'Grocery List';
      else if (lower.includes('todo') || lower.includes('task list')) title = 'To-Do Checklist';
      else if (rawItems.length > 0) title = `Checklist (${rawItems.slice(0, 2).join(', ')})`;

      return {
        type: 'checklist',
        title,
        checklistItems: rawItems.map(capFirst),
        dueAt,
        confidence: 0.9,
        category: 'shopping',
        originalTranscript: raw,
        language: detectLanguage(raw),
      };
    }

    return null;
  }

  /**
   * Detects meetings and calls.
   */
  private static detectMeeting(
    raw: string,
    lower: string,
    dateResult: { dueAt: string | null; isAmbiguous?: boolean; ambiguityReason?: string }
  ): ExtractedEntity | null {
    const meetingTriggers = ['meeting with', 'call with', 'call ', 'sync with', 'zoom with', 'interview with', 'meeting on'];
    const hindiMeetingTriggers = ['se meeting', 'ko call karna', 'se baat karni', 'interview ki taiyari'];

    const hasTrigger =
      meetingTriggers.some((t) => lower.includes(t)) ||
      hindiMeetingTriggers.some((t) => lower.includes(t));

    if (!hasTrigger) return null;

    let title = raw;
    // Clean title
    title = title.replace(/^(remind me to|remember to|yaad dilana|schedule a|set a)\s+/i, '');

    return {
      type: 'task',
      title: capFirst(title),
      dueAt: dateResult.dueAt,
      priority: 'high',
      category: 'meeting',
      confidence: 0.88,
      isAmbiguous: dateResult.isAmbiguous,
      ambiguityReason: dateResult.ambiguityReason,
      originalTranscript: raw,
      language: detectLanguage(raw),
    };
  }

  /**
   * Detects reminders explicitly requested by user.
   */
  private static detectReminder(
    raw: string,
    lower: string,
    dateResult: { dueAt: string | null; isAmbiguous?: boolean; ambiguityReason?: string }
  ): ExtractedEntity | null {
    const reminderTriggers = ['remind me to', 'remind me', 'remember to', 'don\'t forget to', 'yaad dilana', 'yaad rakhna'];
    const isMatch = reminderTriggers.some((t) => lower.includes(t));

    if (!isMatch) {
      return null;
    }

    let title = raw;
    for (const t of reminderTriggers) {
      const idx = title.toLowerCase().indexOf(t);
      if (idx !== -1) {
        title = title.slice(idx + t.length).trim();
        break;
      }
    }

    // Strip trailing date mentions from title for clean display
    title = title.replace(/\b(on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|tomorrow|today|kal|parson|at \d+(:?\d+)?\s*(am|pm)?)\b/gi, '').trim();

    return {
      type: 'reminder',
      title: capFirst(title || raw),
      dueAt: dateResult.dueAt,
      priority: detectPriority(lower),
      category: 'personal',
      confidence: 0.85,
      isAmbiguous: dateResult.isAmbiguous,
      ambiguityReason: dateResult.ambiguityReason,
      originalTranscript: raw,
      language: detectLanguage(raw),
    };
  }

  /**
   * Detects general action items & tasks.
   */
  private static detectTask(
    raw: string,
    lower: string,
    dateResult: { dueAt: string | null; isAmbiguous?: boolean; ambiguityReason?: string }
  ): ExtractedEntity | null {
    const actionVerbs = [
      'pay ', 'submit ', 'send ', 'email ', 'clean ', 'prepare ', 'finish ', 'complete ',
      'review ', 'fix ', 'karna hai', 'bhejna hai', 'dena hai', 'jama karna hai'
    ];

    const hasAction = actionVerbs.some((v) => lower.includes(v));
    if (!hasAction && !dateResult.dueAt) {
      return null;
    }

    return {
      type: 'task',
      title: capFirst(raw),
      dueAt: dateResult.dueAt,
      priority: detectPriority(lower),
      category: 'work',
      confidence: 0.8,
      isAmbiguous: dateResult.isAmbiguous,
      ambiguityReason: dateResult.ambiguityReason,
      originalTranscript: raw,
      language: detectLanguage(raw),
    };
  }

  /**
   * Fallback note detector.
   */
  private static detectNote(raw: string, lower: string, preferredLang: LanguageCode): ExtractedEntity {
    let title = raw;
    let content = raw;

    const notePrefixes = ['note:', 'note that', 'idea:', 'thought:', 'yaad rakhna ki', 'likh lo', 'likho'];
    for (const p of notePrefixes) {
      if (lower.startsWith(p)) {
        content = raw.slice(p.length).trim();
        break;
      }
    }

    // Pick first sentence or first 6 words as title
    const firstSentence = content.split(/[.\n]/)[0].trim();
    const words = firstSentence.split(' ');
    title = words.length > 7 ? words.slice(0, 7).join(' ') + '...' : firstSentence;

    let category: NoteCategory = 'general';
    if (lower.includes('idea') || lower.includes('vichar')) category = 'ideas';
    else if (lower.includes('work') || lower.includes('office') || lower.includes('client')) category = 'work';
    else if (lower.includes('personal') || lower.includes('ghar')) category = 'personal';

    return {
      type: 'note',
      title: capFirst(title || 'Quick Voice Note'),
      description: content,
      category,
      confidence: 0.75,
      originalTranscript: raw,
      language: detectLanguage(raw) || preferredLang,
    };
  }

  /**
   * Comprehensive Date & Time Extractor supporting English, Hindi, and Hinglish.
   */
  public static extractDateAndTime(text: string): {
    dueAt: string | null;
    isAmbiguous?: boolean;
    ambiguityReason?: string;
  } {
    const now = new Date();
    let target = new Date(now.getTime());
    let dateFound = false;
    let timeFound = false;
    let isAmbiguous = false;
    let ambiguityReason: string | undefined;

    // 1. Relative Days (English & Hindi)
    if (/\b(today|aaj)\b/i.test(text)) {
      dateFound = true;
    } else if (/\b(day after tomorrow|parson|parso)\b/i.test(text)) {
      target.setDate(target.getDate() + 2);
      dateFound = true;
    } else if (/\b(tomorrow|kal)\b/i.test(text)) {
      target.setDate(target.getDate() + 1);
      dateFound = true;
    }

    // 2. Days of week mapping (English + Hindi)
    const dayMap: Record<string, number> = {
      sunday: 0, raviwar: 0, itwar: 0,
      monday: 1, somwar: 1, somvaar: 1,
      tuesday: 2, mangalwar: 2, mangalvaar: 2,
      wednesday: 3, budhwar: 3, budhvaar: 3,
      thursday: 4, guruwar: 4, guruvaar: 4, brihaspativar: 4, veerwar: 4,
      friday: 5, shukrawar: 5, shukravaar: 5, jumma: 5,
      saturday: 6, shaniwar: 6, shanivaar: 6,
    };

    for (const [dayName, dayIndex] of Object.entries(dayMap)) {
      const regex = new RegExp(`\\b(on |next |agle )?${dayName}\\b`, 'i');
      if (regex.test(text)) {
        const currentDay = now.getDay();
        let daysUntil = (dayIndex - currentDay + 7) % 7;
        const isNext = /\b(next|agle)\b/i.test(text);

        if (daysUntil === 0) {
          daysUntil = isNext ? 7 : 7; // assume next week's day
        } else if (isNext) {
          daysUntil += 7;
          isAmbiguous = true;
          ambiguityReason = `Please confirm the exact date for "next ${capFirst(dayName)}".`;
        }

        target.setDate(target.getDate() + daysUntil);
        dateFound = true;
        break;
      }
    }

    // 3. Time extraction
    // Match "at 5 pm", "5:30 am", "5 pm", "10 am"
    const standardTimeMatch = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (standardTimeMatch) {
      let hours = parseInt(standardTimeMatch[1], 10);
      const minutes = standardTimeMatch[2] ? parseInt(standardTimeMatch[2], 10) : 0;
      const meridiem = standardTimeMatch[3].toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      target.setHours(hours, minutes, 0, 0);
      timeFound = true;
    }

    // Match Hindi time phrases: "sham 5 baje", "subah 8 baje", "dopahar 2 baje", "raat 9 baje", "5 baje"
    const hindiTimeMatch = text.match(/\b(subah|dopahar|sham|shaam|raat)?\s*(\d{1,2})(?::(\d{2}))?\s*baje\b/i);
    if (hindiTimeMatch && !timeFound) {
      const period = (hindiTimeMatch[1] || '').toLowerCase();
      let hours = parseInt(hindiTimeMatch[2], 10);
      const minutes = hindiTimeMatch[3] ? parseInt(hindiTimeMatch[3], 10) : 0;

      if ((period === 'sham' || period === 'shaam' || period === 'dopahar') && hours < 12) {
        hours += 12;
      } else if (period === 'raat' && hours < 12 && hours >= 7) {
        hours += 12;
      } else if (!period && hours >= 1 && hours <= 6) {
        // default 1-6 baje to afternoon/evening unless specified
        hours += 12;
      }

      target.setHours(hours, minutes, 0, 0);
      timeFound = true;
    }

    // If date was found but no time specified, default to 9:00 AM next morning / on that day
    if (dateFound && !timeFound) {
      target.setHours(9, 0, 0, 0);
    } else if (!dateFound && timeFound) {
      // Time given with no date (e.g. "at 5 PM") -> if time is earlier today, schedule for tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      dateFound = true;
    }

    if (!dateFound && !timeFound) {
      return { dueAt: null };
    }

    return {
      dueAt: target.toISOString(),
      isAmbiguous,
      ambiguityReason,
    };
  }
}

function capFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function detectPriority(text: string): TaskPriority {
  if (/\b(urgent|asap|turant|zaroori|emergency|high priority)\b/i.test(text)) {
    return 'urgent';
  }
  if (/\b(important|khas|prioritize|must)\b/i.test(text)) {
    return 'high';
  }
  if (/\b(low priority|whenever|kabhi bhi|fursat)\b/i.test(text)) {
    return 'low';
  }
  return 'medium';
}

function detectLanguage(text: string): LanguageCode {
  // Check Devanagari Unicode block \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  // Check common Hinglish markers
  if (/\b(karna|hai|aur|kal|parson|sham|baje|khareedna|lana|yaad|bhejo|bolo|aap)\b/i.test(text)) {
    return 'hinglish';
  }
  return 'en';
}
