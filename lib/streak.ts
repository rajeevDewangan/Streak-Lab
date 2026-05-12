import { todayKey, toLocalDateKey } from "./utils";
import type { StreakInfo } from "./types";

// Sundays are "off days": missing a Sunday never breaks the streak, and
// Sundays are not counted toward streak length or consistency.

function isSundayKey(key: string): boolean {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() === 0;
}

function prevRequiredDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  do {
    date.setDate(date.getDate() - 1);
  } while (date.getDay() === 0);
  return toLocalDateKey(date);
}

/**
 * Compute streak info from a set of local-date strings (YYYY-MM-DD) on which
 * the user logged at least one entry. Today is a "grace" day: missing today
 * does not break the streak as long as the previous required day is present.
 * Sundays are skipped entirely — they neither extend nor break the streak.
 */
export function computeStreak(dateKeys: Iterable<string>): StreakInfo {
  const days = new Set(dateKeys);
  const today = todayKey();
  const loggedToday = days.has(today);

  // current streak — walk back from today, skipping Sundays; today is a grace day.
  let current = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let isFirstDay = true;
  // hard cap to avoid runaway loops on weird clocks
  for (let safety = 0; safety < 4000; safety++) {
    if (cursor.getDay() === 0) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const key = toLocalDateKey(cursor);
    if (days.has(key)) {
      current++;
    } else if (isFirstDay) {
      // today's grace — missing today is OK if the previous required day is present.
    } else {
      break;
    }
    isFirstDay = false;
    cursor.setDate(cursor.getDate() - 1);
  }

  // longest streak — non-Sunday logged days, consecutive in required-day space.
  const required = [...days].filter((d) => !isSundayKey(d)).sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of required) {
    if (prev && prevRequiredDay(day) === prev) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = day;
  }

  // consistency % over the last 30 days, excluding Sundays from the denominator.
  let hits = 0;
  let denom = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0) continue;
    denom++;
    if (days.has(toLocalDateKey(d))) hits++;
  }
  const consistencyPct = denom > 0 ? Math.round((hits / denom) * 100) : 0;

  return {
    current,
    longest,
    totalDays: days.size,
    loggedToday,
    consistencyPct,
  };
}
