// Дати зберігаємо як YYYY-MM-DD, щоб не залежати від часового поясу UTC.
export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthDays(view: Date): Array<Date | null> {
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const result: Array<Date | null> = Array(firstWeekday).fill(null);
  for (let day = 1; day <= count; day++) result.push(new Date(year, month, day));
  while (result.length % 7 !== 0) result.push(null);
  return result;
}

export function shiftMonth(view: Date, offset: number): Date {
  return new Date(view.getFullYear(), view.getMonth() + offset, 1);
}

export function formatDate(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('uk-UA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(year, month - 1, day));
}
