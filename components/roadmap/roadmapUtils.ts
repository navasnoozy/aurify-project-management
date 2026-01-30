import { IconType } from "react-icons";
import { addDays, parseISO, format } from "date-fns";
import { addWorkingDays } from "@/lib/dateUtils";

export type TaskStatus = "Not Started" | "Planning & Research" | "Implementing" | "On Hold" | "Completed";

export const TASK_STATUSES: TaskStatus[] = ["Not Started", "Planning & Research", "Implementing", "On Hold", "Completed"];

export interface Deliverable {
  id: string;
  text: string;
  status: TaskStatus; // Each deliverable has its own status
  startDate: string; // ISO date format
  durationDays: number; // Duration in days
  excludeHolidays?: boolean;
  excludeSaturdays?: boolean;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  iconName: string; // The specific icon name
  icon: IconType;
  deliverables: Deliverable[];
}

// Utility function to compute card duration from deliverables
import { computeCardDuration } from "./types";
export { computeCardDuration };

// Compute the latest end date across all roadmap items
export const computeProjectEndDate = (items: RoadmapItem[]): string | null => {
  if (!items || items.length === 0) return null;

  let maxDate: Date | null = null;

  for (const item of items) {
    const cardDuration = computeCardDuration(item.deliverables);
    if (cardDuration) {
      const endDate = parseISO(cardDuration.endDate);
      if (!maxDate || endDate > maxDate) {
        maxDate = endDate;
      }
    }
  }

  return maxDate ? format(maxDate, "MMMM d, yyyy") : null;
};

// Utility to find next available start date after all existing deliverables
export const getNextAvailableDate = (deliverables: Deliverable[]): string => {
  if (deliverables.length === 0) {
    return format(new Date(), "yyyy-MM-dd");
  }

  let maxEnd: Date | null = null;
  for (const d of deliverables) {
    const start = parseISO(d.startDate);
    const end = addWorkingDays(start, d.durationDays, {
      excludeHolidays: d.excludeHolidays ?? true,
      excludeSaturdays: d.excludeSaturdays ?? false,
    });
    if (!maxEnd || end > maxEnd) maxEnd = end;
  }

  if (!maxEnd) return format(new Date(), "yyyy-MM-dd");

  // maxEnd is the EXCLUSIVE end (first day not used by any deliverable)
  // We return it directly because it's already the next available start date
  // But we need to ensure it's a working day (skip weekends/holidays)
  const ensureWorkingDay = (date: Date): Date => {
    let current = date;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const dayOfWeek = current.getDay();
      // Sunday = 0, Saturday = 6
      if (dayOfWeek === 0) {
        // Sunday -> skip to Monday
        current = addDays(current, 1);
        continue;
      }
      // Check holidays
      const dateStr = format(current, "yyyy-MM-dd");
      const isHoliday = ["2025-01-26", "2025-03-14", "2025-08-15", "2025-10-02", "2025-12-25", "2026-01-26", "2026-08-15", "2026-10-02", "2026-12-25"].includes(dateStr);
      if (isHoliday) {
        current = addDays(current, 1);
        continue;
      }
      break;
    }
    return current;
  };

  const nextStart = ensureWorkingDay(maxEnd);
  return format(nextStart, "yyyy-MM-dd");
};

// Check if a date range overlaps with existing deliverables
export const isDateRangeOccupied = (
  deliverables: Deliverable[],
  startDate: string,
  durationDays: number,
  excludeId?: string,
  options?: { excludeHolidays?: boolean; excludeSaturdays?: boolean },
): boolean => {
  const newStart = parseISO(startDate);
  const newEnd = addWorkingDays(newStart, durationDays, {
    excludeHolidays: options?.excludeHolidays ?? true,
    excludeSaturdays: options?.excludeSaturdays ?? false,
  });

  for (const d of deliverables) {
    if (excludeId && d.id === excludeId) continue;

    const existingStart = parseISO(d.startDate);
    const existingEnd = addWorkingDays(existingStart, d.durationDays, {
      excludeHolidays: d.excludeHolidays ?? true,
      excludeSaturdays: d.excludeSaturdays ?? false,
    });

    if (newStart < existingEnd && newEnd > existingStart) {
      return true;
    }
  }

  return false;
};

// Calculate status counts for progress display
export const getStatusCounts = (deliverables: Deliverable[]): Record<TaskStatus, number> => {
  const counts: Record<TaskStatus, number> = {
    "Not Started": 0,
    "Planning & Research": 0,
    Implementing: 0,
    "On Hold": 0,
    Completed: 0,
  };

  for (const d of deliverables) {
    counts[d.status]++;
  }

  return counts;
};

// Export types and utilities only
