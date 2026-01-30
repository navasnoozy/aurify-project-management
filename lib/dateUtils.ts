import { addDays, isSaturday, isSunday, isSameDay, parseISO, differenceInDays, isValid } from "date-fns";

// Indian Public Holidays for 2025 and 2026 (Major National Holidays)
// Source of truth for holiday calculations
export const INDIAN_HOLIDAYS = [
  // 2025
  "2025-01-26", // Republic Day
  "2025-03-14", // Holi
  "2025-03-31", // Eid-ul-Fitr (Tentative)
  "2025-04-14", // Ambedkar Jayanti / Baisakhi
  "2025-04-18", // Good Friday
  "2025-08-15", // Independence Day
  "2025-10-02", // Gandhi Jayanti
  "2025-10-02", // Dussehra (Same day in 2025?) - Check calendar, typically Oct.
  "2025-10-20", // Diwali
  "2025-12-25", // Christmas

  // 2026 (Projected)
  "2026-01-26", // Republic Day
  "2026-03-03", // Holi (Approx)
  "2026-03-20", // Eid-ul-Fitr (Approx)
  "2026-04-14", // Ambedkar Jayanti
  "2026-08-15", // Independence Day
  "2026-10-02", // Gandhi Jayanti
  "2026-10-20", // Dussehra (Approx)
  "2026-11-08", // Diwali (Approx)
  "2026-12-25", // Christmas
];

export interface DateOptions {
  excludeHolidays?: boolean;
  excludeSaturdays?: boolean;
}

/**
 * Adds 'working days' to a start date, skipping non-working days based on options.
 * @param startDate ISO Date string or Date object
 * @param days Number of working days to add
 * @param options Configuration for what days to exclude
 * @returns The resulting Date
 */
export const addWorkingDays = (startDate: string | Date, days: number, options: DateOptions = {}): Date => {
  const { excludeHolidays = true, excludeSaturdays = false } = options;
  let currentDate = typeof startDate === "string" ? parseISO(startDate) : startDate;

  // Early return if the date is invalid to prevent crashes
  if (!isValid(currentDate)) {
    return new Date(NaN); // Return an explicit Invalid Date
  }

  let daysAdded = 0;

  // If days is 0, return start date (or next working day? usually start date)
  if (days <= 0) return currentDate;

  while (daysAdded < days) {
    // Move to next day
    currentDate = addDays(currentDate, 1);

    // Check if this day is a working day
    let isWorkingDay = true;

    // 1. Sunday check (Always excluded as per requirements "automatically exclude sunday")
    if (isSunday(currentDate)) {
      isWorkingDay = false;
    }
    // 2. Saturday check
    else if (excludeSaturdays && isSaturday(currentDate)) {
      isWorkingDay = false;
    }
    // 3. Holiday check
    else if (excludeHolidays) {
      const isHoliday = INDIAN_HOLIDAYS.some((h) => isSameDay(parseISO(h), currentDate));
      if (isHoliday) {
        isWorkingDay = false;
      }
    }

    if (isWorkingDay) {
      daysAdded++;
    }
  }

  return currentDate;
};

/**
 * Calculates the number of working days between two dates.
 * @param startDate ISO Date string or Date object
 * @param endDate ISO Date string or Date object
 * @param options Configuration for what days to exclude
 * @returns Number of working days
 */
export const getWorkingDays = (startDate: string | Date, endDate: string | Date, options: DateOptions = {}): number => {
  const { excludeHolidays = true, excludeSaturdays = false } = options;
  let current = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;

  // Early return if either date is invalid
  if (!isValid(current) || !isValid(end)) {
    return 0;
  }

  let workingDays = 0;

  // If start > end, return 0 or negative? usually 0 for duration
  if (current > end) return 0;

  // We iterate from start + 1 day up to end date to count duration "steps"
  // OR do we include start date?
  // Standard duration rule: Jan 1 to Jan 2 is 1 day.
  // So we count days *after* start.

  while (current < end) {
    current = addDays(current, 1);

    let isWorkingDay = true;
    if (isSunday(current)) {
      isWorkingDay = false;
    } else if (excludeSaturdays && isSaturday(current)) {
      isWorkingDay = false;
    } else if (excludeHolidays) {
      if (INDIAN_HOLIDAYS.some((h) => isSameDay(parseISO(h), current))) {
        isWorkingDay = false;
      }
    }

    if (isWorkingDay) {
      workingDays++;
    }
  }

  return workingDays;
};
