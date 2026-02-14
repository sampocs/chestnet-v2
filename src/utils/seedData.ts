import { getWeekStart, shiftWeek, getWeekDates } from './dates';
import type { AppData } from '../types';

/**
 * Toggle this to seed the app with dummy data on load.
 * Set to false to use real persisted data.
 */
export const USE_SEED_DATA = true;

function uuid(): string {
  return 'seed-' + Math.random().toString(36).substring(2, 10);
}

export function generateSeedData(): AppData {
  const now = new Date();
  const thisWeekStart = getWeekStart(now);

  // Current week + 5 past weeks
  const weekStarts = [
    thisWeekStart,
    shiftWeek(thisWeekStart, -1),
    shiftWeek(thisWeekStart, -2),
    shiftWeek(thisWeekStart, -3),
    shiftWeek(thisWeekStart, -4),
    shiftWeek(thisWeekStart, -5),
  ];

  const purchasePool = [
    { name: 'Groceries', min: 35, max: 120 },
    { name: 'Amazon', min: 12, max: 85 },
    { name: 'Coffee', min: 5, max: 8 },
    { name: 'Dinner out', min: 25, max: 75 },
    { name: 'Uber', min: 10, max: 35 },
    { name: 'Drinks', min: 15, max: 60 },
    { name: 'Gas', min: 30, max: 55 },
    { name: 'Haircut', min: 25, max: 40 },
    { name: 'Target', min: 20, max: 90 },
    { name: 'Lunch', min: 12, max: 22 },
    { name: 'Gym smoothie', min: 8, max: 14 },
    { name: 'Parking', min: 5, max: 15 },
    { name: 'Movie tickets', min: 15, max: 30 },
    { name: 'Golf', min: 30, max: 65 },
    { name: 'Dog food', min: 25, max: 45 },
    { name: 'Pharmacy', min: 8, max: 30 },
    { name: 'Dry cleaning', min: 15, max: 35 },
    { name: 'Spotify', min: 11, max: 11 },
  ];

  function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const weeks: AppData['weeks'] = {};

  weekStarts.forEach((weekStart, weekIndex) => {
    const dates = getWeekDates(weekStart);
    const isCurrentWeek = weekIndex === 0;

    // Current week: fewer purchases (week in progress)
    // Past weeks: more purchases (full weeks)
    const numPurchases = isCurrentWeek ? randInt(3, 6) : randInt(6, 12);
    const budget = weekIndex <= 1 ? 400 : weekIndex <= 3 ? 350 : 300;

    const purchases = [];
    const usedItems = new Set<string>();

    for (let i = 0; i < numPurchases; i++) {
      let item = pickRandom(purchasePool);
      // Avoid too many duplicates within a week
      let attempts = 0;
      while (usedItems.has(item.name) && attempts < 5) {
        item = pickRandom(purchasePool);
        attempts++;
      }
      usedItems.add(item.name);

      // For current week, only use days up to today
      const availableDates = isCurrentWeek
        ? dates.filter((d) => d <= new Date().toISOString().split('T')[0])
        : dates;
      const date =
        availableDates.length > 0 ? pickRandom(availableDates) : dates[0];

      purchases.push({
        id: uuid(),
        name: item.name,
        amount: randInt(item.min, item.max),
        date,
      });
    }

    // Sort by date
    purchases.sort((a, b) => a.date.localeCompare(b.date));

    weeks[weekStart] = {
      startDate: weekStart,
      budget,
      purchases,
    };
  });

  return {
    weeks,
    defaultBudget: 400,
  };
}
