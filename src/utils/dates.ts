function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return toDateString(d);
}

export function getWeekEnd(weekStart: string): string {
  const d = parseDate(weekStart);
  d.setDate(d.getDate() + 6);
  return toDateString(d);
}

export function shiftWeek(weekStart: string, weeks: number): string {
  const d = parseDate(weekStart);
  d.setDate(d.getDate() + weeks * 7);
  return toDateString(d);
}

export function formatShortDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatWeekRange(weekStart: string): string {
  const end = getWeekEnd(weekStart);
  return `${formatShortDate(weekStart)} \u2013 ${formatShortDate(end)}`;
}

export function getDayName(dateStr: string): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getWeekDates(weekStart: string): string[] {
  const dates: string[] = [];
  const d = parseDate(weekStart);
  for (let i = 0; i < 7; i++) {
    dates.push(toDateString(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function isCurrentOrFutureWeek(weekStart: string): boolean {
  const currentWeekStart = getWeekStart(new Date());
  return weekStart >= currentWeekStart;
}

export function getTodayString(): string {
  return toDateString(new Date());
}
