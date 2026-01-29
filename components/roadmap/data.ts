import { IconType } from "react-icons";
import { LuDatabase, LuUsers, LuShare2, LuCalendar, LuTrendingUp as LuBarChart, LuRocket } from "react-icons/lu";

export interface RoadmapItem {
  month: string;
  category: string;
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Planned";
  icon: IconType;
  deliverables?: string[];
}

export const ROADMAP_DATA: RoadmapItem[] = [
  {
    month: "MONTH 1-2 • CORE CRM",
    category: "Foundation & Architecture",
    title: "Foundation & Architecture",
    description: "Setting up the bedrock of the CRM: Database schemas, Authentication, and basic UI shell.",
    status: "Completed",
    icon: LuDatabase,
  },
  {
    month: "MONTH 3 • CORE CRM",
    category: "Contact & Lead Management",
    title: "Contact & Lead Management",
    description: "Building the core CRM entities: Contacts, Companies, Deals, and Pipelines.",
    status: "In Progress",
    icon: LuUsers,
    deliverables: ["Contact 360 View", "Kanban Deal Pipelines", "Activity Logging (Calls/Notes)", "Import/Export Engines"],
  },
  {
    month: "MONTH 4-5 • SOCIAL INTEGRATION",
    category: "Social Media Aggregation",
    title: "Social Media Aggregation",
    description: "Integrating APIs from LinkedIn, X (Twitter), Instagram, and Facebook for unified inbox and posting.",
    status: "Planned",
    icon: LuShare2,
  },
  {
    month: "MONTH 6 • SOCIAL INTEGRATION",
    category: "Content Scheduler & Publisher",
    title: "Content Scheduler & Publisher",
    description: "The visual calendar for planning, drafting, and scheduling posts across all channels.",
    status: "Planned",
    icon: LuCalendar,
  },
  {
    month: "MONTH 7 • INTELLIGENCE",
    category: "Analytics & ROI Dashboard",
    title: "Analytics & ROI Dashboard",
    description: "Tracking performance: Engagement rates, lead conversion from social, and team productivity.",
    status: "Planned",
    icon: LuBarChart,
  },
  {
    month: "MONTH 8 • GO-TO-MARKET",
    category: "Beta Launch & Optimization",
    title: "Beta Launch & Optimization",
    description: "Closed beta testing, bug squashing, performance tuning, and final public release.",
    status: "Planned",
    icon: LuRocket,
  },
];
