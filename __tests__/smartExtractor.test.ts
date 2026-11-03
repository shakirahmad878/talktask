import { SmartExtractor } from '../src/services/nlp/SmartExtractor';

describe('SmartExtractor NLP & Rule Engine', () => {
  it('identifies reminder to pay electricity bill on Friday', () => {
    const speech = 'Remind me to pay my electricity bill on Friday';
    const result = SmartExtractor.extract(speech, 'en');

    expect(result.type).toBe('reminder');
    expect(result.title.toLowerCase()).toContain('pay');
    expect(result.title.toLowerCase()).toContain('bill');
    expect(result.dueAt).not.toBeNull();

    const scheduled = new Date(result.dueAt!);
    expect(scheduled.getDay()).toBe(5); // 5 = Friday
  });

  it('identifies multi-item shopping checklist for tomorrow', () => {
    const speech = 'Buy milk, eggs, bread and vegetables tomorrow';
    const result = SmartExtractor.extract(speech, 'en');

    expect(result.type).toBe('checklist');
    expect(result.checklistItems).toBeDefined();
    expect(result.checklistItems!.length).toBe(4);
    expect(result.checklistItems).toEqual(
      expect.arrayContaining(['Milk', 'Eggs', 'Bread', 'Vegetables'])
    );
    expect(result.dueAt).not.toBeNull();
  });

  it('identifies meeting with specific time: Call Rahul tomorrow at 5 PM', () => {
    const speech = 'Call Rahul tomorrow at 5 PM';
    const result = SmartExtractor.extract(speech, 'en');

    expect(result.type).toBe('task');
    expect(result.title).toContain('Rahul');
    expect(result.dueAt).not.toBeNull();

    const scheduled = new Date(result.dueAt!);
    expect(scheduled.getHours()).toBe(17); // 5 PM = 17:00
  });

  it('supports Hindi speech for shopping list with "कल खरीदनी हैं"', () => {
    const speech = 'दूध, अंडा, ब्रेड और सब्जियां कल खरीदनी हैं';
    const result = SmartExtractor.extract(speech, 'hi');

    expect(result.type).toBe('checklist');
    expect(result.checklistItems).toBeDefined();
    expect(result.checklistItems!.length).toBeGreaterThanOrEqual(3);
    expect(result.language).toBe('hi');
  });

  it('supports Hinglish speech: Kal 5 baje Rahul ko call karna hai', () => {
    const speech = 'Kal 5 baje Rahul ko call karna hai';
    const result = SmartExtractor.extract(speech, 'hinglish');

    expect(result.type).toBe('task');
    expect(result.dueAt).not.toBeNull();
    const scheduled = new Date(result.dueAt!);
    expect(scheduled.getHours()).toBe(17); // 5 baje = 17:00
  });

  it('marks ambiguous dates like "next Friday" for user confirmation', () => {
    const speech = 'Schedule team review next Friday';
    const result = SmartExtractor.extract(speech, 'en');

    expect(result.isAmbiguous).toBe(true);
    expect(result.ambiguityReason).toContain('next Friday');
  });

  it('detects high priority for urgent tasks', () => {
    const speech = 'Urgent: Submit tax filings today';
    const result = SmartExtractor.extract(speech, 'en');

    expect(result.type).toBe('task');
    expect(result.priority).toBe('urgent');
  });

  it('falls back cleanly to categorized Note for non-task thoughts', () => {
    const speech = 'Note: A great idea for a solar powered micro-irrigation system';
    const result = SmartExtractor.extract(speech, 'en');

    expect(result.type).toBe('note');
    expect(result.category).toBe('ideas');
    expect(result.description).toContain('solar powered');
  });
});
