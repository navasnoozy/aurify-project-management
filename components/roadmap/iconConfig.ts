import { IconType } from "react-icons";
import { LuDatabase, LuUsers, LuShare2, LuCalendar, LuTrendingUp, LuRocket, LuCode, LuLayoutDashboard, LuShieldCheck, LuZap, LuFlag, LuCheck } from "react-icons/lu";

export type IconName = "LuDatabase" | "LuUsers" | "LuShare2" | "LuCalendar" | "LuTrendingUp" | "LuRocket" | "LuCode" | "LuLayoutDashboard" | "LuShieldCheck" | "LuZap" | "LuFlag" | "LuCheck";

export interface IconOption {
  name: IconName;
  component: IconType;
  label: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { name: "LuRocket", component: LuRocket, label: "Launch" },
  { name: "LuDatabase", component: LuDatabase, label: "Backend" },
  { name: "LuUsers", component: LuUsers, label: "Users" },
  { name: "LuLayoutDashboard", component: LuLayoutDashboard, label: "Frontend" },
  { name: "LuShare2", component: LuShare2, label: "Social" },
  { name: "LuCalendar", component: LuCalendar, label: "Schedule" },
  { name: "LuTrendingUp", component: LuTrendingUp, label: "Growth" },
  { name: "LuCode", component: LuCode, label: "Code" },
  { name: "LuShieldCheck", component: LuShieldCheck, label: "Security" },
  { name: "LuZap", component: LuZap, label: "Fast" },
  { name: "LuFlag", component: LuFlag, label: "Milestone" },
  { name: "LuCheck", component: LuCheck, label: "Done" },
];

export const ICON_MAP: Record<string, IconType> = ICON_OPTIONS.reduce(
  (acc, icon) => {
    acc[icon.name] = icon.component;
    return acc;
  },
  {} as Record<string, IconType>,
);

export const DEFAULT_ICON_NAME: IconName = "LuRocket";

export const isValidIconName = (name: string): name is IconName => {
  return name in ICON_MAP;
};
