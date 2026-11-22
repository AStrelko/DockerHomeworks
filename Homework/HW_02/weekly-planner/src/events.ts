export type EventKind = 'planned' | 'annual';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  kind: EventKind;
  completed: boolean;
  completedYears: number[];
};

const storageKey = 'weekly-planner-events-v1';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

// Перевіряємо дані localStorage: користувач міг змінити їх поза застосунком.
export function loadEvents(): CalendarEvent[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is CalendarEvent =>
      item !== null && typeof item === 'object' &&
      typeof item.id === 'string' && typeof item.title === 'string' &&
      typeof item.date === 'string' && datePattern.test(item.date) &&
      typeof item.time === 'string' && timePattern.test(item.time) &&
      (item.kind === 'planned' || item.kind === 'annual') &&
      typeof item.completed === 'boolean' && Array.isArray(item.completedYears) &&
      item.completedYears.every((year: unknown) => Number.isInteger(year)),
    );
  } catch {
    return [];
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  localStorage.setItem(storageKey, JSON.stringify(events));
}

// Щорічна дата збігається за місяцем і числом; 29 лютого є лише у високосні роки.
export function occursOn(event: CalendarEvent, selectedDate: string): boolean {
  return event.kind === 'annual'
    ? event.date.slice(5) === selectedDate.slice(5)
    : event.date === selectedDate;
}

export function eventsOn(events: CalendarEvent[], selectedDate: string): CalendarEvent[] {
  return events.filter(event => occursOn(event, selectedDate))
    .sort((a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title, 'uk'));
}

// Виконання річниці зберігається окремо для кожного року.
export function isCompleted(event: CalendarEvent, selectedDate: string): boolean {
  return event.kind === 'annual'
    ? event.completedYears.includes(Number(selectedDate.slice(0, 4)))
    : event.completed;
}
