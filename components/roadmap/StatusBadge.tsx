"use client";

import { Menu, Badge, Box } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { TaskStatus, TASK_STATUSES } from "./data";

interface StatusBadgeProps {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
}

// Color mapping for each status
const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "Completed":
      return "green";
    case "Implementing":
      return "blue";
    case "Planning & Research":
      return "purple";
    case "On Hold":
      return "orange";
    case "Not Started":
    default:
      return "gray";
  }
};

export const StatusBadge = ({ status, onStatusChange }: StatusBadgeProps) => {
  const colorPalette = getStatusColor(status);

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Box cursor="pointer" display="inline-flex" alignItems="center">
          <Badge
            colorPalette={colorPalette}
            variant="solid"
            display="flex"
            alignItems="center"
            gap={1}
            pr={1}
            cursor="pointer"
            _hover={{ opacity: 0.85 }}
            transition="opacity 0.2s"
            bg={status === "Not Started" ? "gray.500" : undefined}
            color={status === "Not Started" ? "white" : undefined}
          >
            {status}
            <ChevronDown size={12} />
          </Badge>
        </Box>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content minW="160px">
          {TASK_STATUSES.map((s) => (
            <Menu.Item key={s} value={s} onClick={() => onStatusChange(s)} fontWeight={s === status ? "bold" : "normal"} bg={s === status ? `${getStatusColor(s)}.50` : "transparent"}>
              <Badge colorPalette={getStatusColor(s)} variant="subtle" size="sm">
                {s}
              </Badge>
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};
