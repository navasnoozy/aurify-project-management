import { IconType } from "react-icons";
import { LuDatabase, LuUsers, LuShare2, LuCalendar, LuTrendingUp as LuBarChart, LuRocket } from "react-icons/lu";
import { addDays, parseISO, differenceInDays } from "date-fns";

export type TaskStatus = "Not Started" | "Planning & Research" | "Implementing" | "On Hold" | "Completed";

export const TASK_STATUSES: TaskStatus[] = ["Not Started", "Planning & Research", "Implementing", "On Hold", "Completed"];

export interface Deliverable {
  id: string;
  text: string;
  status: TaskStatus; // Each deliverable has its own status
  startDate: string; // ISO date format
  durationDays: number; // Duration in days
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
export const computeCardDuration = (deliverables: Deliverable[]): { startDate: string; endDate: string; durationDays: number } | null => {
  if (deliverables.length === 0) return null;

  let minStart: Date | null = null;
  let maxEnd: Date | null = null;

  for (const d of deliverables) {
    const start = parseISO(d.startDate);
    const end = addDays(start, d.durationDays);

    if (!minStart || start < minStart) minStart = start;
    if (!maxEnd || end > maxEnd) maxEnd = end;
  }

  if (!minStart || !maxEnd) return null;

  return {
    startDate: minStart.toISOString().split("T")[0],
    endDate: maxEnd.toISOString().split("T")[0],
    durationDays: differenceInDays(maxEnd, minStart),
  };
};

// Utility to find next available start date after all existing deliverables
export const getNextAvailableDate = (deliverables: Deliverable[]): string => {
  if (deliverables.length === 0) {
    return new Date().toISOString().split("T")[0];
  }

  let maxEnd: Date | null = null;
  for (const d of deliverables) {
    const end = addDays(parseISO(d.startDate), d.durationDays);
    if (!maxEnd || end > maxEnd) maxEnd = end;
  }

  return maxEnd ? maxEnd.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
};

// Check if a date range overlaps with existing deliverables
export const isDateRangeOccupied = (deliverables: Deliverable[], startDate: string, durationDays: number, excludeId?: string): boolean => {
  const newStart = parseISO(startDate);
  const newEnd = addDays(newStart, durationDays);

  for (const d of deliverables) {
    if (excludeId && d.id === excludeId) continue;

    const existingStart = parseISO(d.startDate);
    const existingEnd = addDays(existingStart, d.durationDays);

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

export const ROADMAP_DATA: RoadmapItem[] = [
  {
    id: "1",
    title: "Foundation & Architecture",
    description: "Setting up the bedrock of the CRM: Database schemas, Authentication, and basic UI shell.",
    status: "Completed",
    iconName: "LuDatabase",
    icon: LuDatabase,
    deliverables: [
      { id: "1-1", text: "Database Schema Design", status: "Completed", startDate: "2025-01-15", durationDays: 15 },
      { id: "1-2", text: "Authentication System", status: "Completed", startDate: "2025-01-30", durationDays: 15 },
      { id: "1-3", text: "Basic UI Shell", status: "Completed", startDate: "2025-02-14", durationDays: 15 },
      { id: "1-4", text: "API Architecture", status: "Completed", startDate: "2025-03-01", durationDays: 15 },
    ],
  },
  {
    id: "2",
    title: "Contact & Lead Management",
    description: "Building the core CRM entities: Contacts, Companies, Deals, and Pipelines.",
    status: "Implementing",
    iconName: "LuUsers",
    icon: LuUsers,
    deliverables: [
      { id: "2-1", text: "Contact 360 View", status: "Completed", startDate: "2025-03-15", durationDays: 7 },
      { id: "2-2", text: "Kanban Deal Pipelines", status: "Implementing", startDate: "2025-03-22", durationDays: 8 },
      { id: "2-3", text: "Activity Logging (Calls/Notes)", status: "Planning & Research", startDate: "2025-03-30", durationDays: 7 },
      { id: "2-4", text: "Import/Export Engines", status: "Not Started", startDate: "2025-04-06", durationDays: 8 },
    ],
  },
  {
    id: "3",
    title: "Social Media Aggregation",
    description: "Integrating APIs from LinkedIn, X (Twitter), Instagram, and Facebook for unified inbox and posting.",
    status: "Not Started",
    iconName: "LuShare2",
    icon: LuShare2,
    deliverables: [
      { id: "3-1", text: "LinkedIn API Integration", status: "Not Started", startDate: "2025-04-15", durationDays: 10 },
      { id: "3-2", text: "X (Twitter) API Integration", status: "Not Started", startDate: "2025-04-25", durationDays: 10 },
      { id: "3-3", text: "Instagram API Integration", status: "Not Started", startDate: "2025-05-05", durationDays: 10 },
      { id: "3-4", text: "Unified Inbox", status: "Not Started", startDate: "2025-05-15", durationDays: 15 },
    ],
  },
  {
    id: "4",
    title: "Content Scheduler & Publisher",
    description: "The visual calendar for planning, drafting, and scheduling posts across all channels.",
    status: "Not Started",
    iconName: "LuCalendar",
    icon: LuCalendar,
    deliverables: [
      { id: "4-1", text: "Visual Calendar", status: "Not Started", startDate: "2025-06-01", durationDays: 10 },
      { id: "4-2", text: "Post Drafting", status: "Not Started", startDate: "2025-06-11", durationDays: 10 },
      { id: "4-3", text: "Multi-channel Scheduling", status: "Not Started", startDate: "2025-06-21", durationDays: 10 },
    ],
  },
  {
    id: "5",
    title: "Analytics & ROI Dashboard",
    description: "Tracking performance: Engagement rates, lead conversion from social, and team productivity.",
    status: "Planning & Research",
    iconName: "LuTrendingUp",
    icon: LuBarChart, // Note: LuBarChart was aliased to LuTrendingUp? No, LuTrendingUp was aliased to LuBarChart in imports?
    // In imports: LuTrendingUp as LuBarChart.
    // So iconName should be LuTrendingUp? Or LuBarChart to match component alias?
    // iconConfig used LuTrendingUp. I will use LuTrendingUp.
    deliverables: [
      { id: "5-1", text: "Engagement Metrics", status: "Planning & Research", startDate: "2025-07-01", durationDays: 10 },
      { id: "5-2", text: "Lead Conversion Tracking", status: "Not Started", startDate: "2025-07-11", durationDays: 10 },
      { id: "5-3", text: "Team Productivity Reports", status: "Not Started", startDate: "2025-07-21", durationDays: 10 },
    ],
  },
  {
    id: "6",
    title: "Beta Launch & Optimization",
    description: "Closed beta testing, bug squashing, performance tuning, and final public release.",
    status: "Not Started",
    iconName: "LuRocket",
    icon: LuRocket,
    deliverables: [
      { id: "6-1", text: "Closed Beta Testing", status: "Not Started", startDate: "2025-08-01", durationDays: 7 },
      { id: "6-2", text: "Bug Fixes", status: "Not Started", startDate: "2025-08-08", durationDays: 8 },
      { id: "6-3", text: "Performance Optimization", status: "Not Started", startDate: "2025-08-16", durationDays: 7 },
      { id: "6-4", text: "Public Release", status: "Not Started", startDate: "2025-08-23", durationDays: 8 },
    ],
  },
];
