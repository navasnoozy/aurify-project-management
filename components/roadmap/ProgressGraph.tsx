"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Deliverable, TaskStatus, computeCardDuration, getStatusCounts, TASK_STATUSES } from "./data";
import { differenceInDays, parseISO } from "date-fns";
import { Check, Clock, AlertTriangle, Pause, Search } from "lucide-react";

interface ProgressGraphProps {
  deliverables: Deliverable[];
  status: TaskStatus;
}

// Get color based on status
const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case "Completed":
      return { main: "#22c55e", light: "#dcfce7", track: "#bbf7d0" };
    case "Implementing":
      return { main: "#3b82f6", light: "#dbeafe", track: "#bfdbfe" };
    case "Planning & Research":
      return { main: "#a855f7", light: "#f3e8ff", track: "#e9d5ff" };
    case "On Hold":
      return { main: "#f97316", light: "#ffedd5", track: "#fed7aa" };
    case "Not Started":
    default:
      return { main: "#6b7280", light: "#f3f4f6", track: "#e5e7eb" };
  }
};

// Get status icon
const getStatusIcon = (status: TaskStatus, size = 14) => {
  switch (status) {
    case "Completed":
      return <Check size={size} />;
    case "Implementing":
      return <Clock size={size} />;
    case "On Hold":
      return <Pause size={size} />;
    case "Planning & Research":
      return <Search size={size} />;
    default:
      return <AlertTriangle size={size} />;
  }
};

export const ProgressGraph = ({ deliverables, status }: ProgressGraphProps) => {
  const totalTasks = deliverables.length;
  const statusCounts = getStatusCounts(deliverables);
  const completedTasks = statusCounts["Completed"];
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate time progress
  const duration = computeCardDuration(deliverables);
  const today = new Date();
  let timeProgress = 0;
  let daysElapsed = 0;
  let totalDays = 0;

  if (duration) {
    const startDate = parseISO(duration.startDate);
    totalDays = duration.durationDays;
    daysElapsed = Math.max(0, differenceInDays(today, startDate));
    timeProgress = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;
  }

  const colors = getStatusColor(status);

  // SVG circular progress
  const size = 64;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (completionPercent / 100) * circumference;

  return (
    <Box bg="rgba(255, 255, 255, 0.95)" backdropFilter="blur(10px)" borderRadius="xl" boxShadow="lg" p={3} minW="150px" borderWidth="1px" borderColor="gray.200">
      <Flex direction="column" align="center" gap={2}>
        {/* Circular Progress */}
        <Box position="relative">
          <svg width={size} height={size}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.track} strokeWidth={strokeWidth} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors.main}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <Flex position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" direction="column" align="center">
            <Text fontSize="md" fontWeight="bold" color={colors.main}>
              {completionPercent}%
            </Text>
          </Flex>
        </Box>

        {/* Status Breakdown */}
        <Box w="full">
          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
            Status Breakdown
          </Text>
          <Flex direction="column" gap={1}>
            {TASK_STATUSES.map((s) => {
              const count = statusCounts[s];
              if (count === 0) return null;
              const statusColors = getStatusColor(s);
              return (
                <Flex key={s} align="center" gap={2} fontSize="xs">
                  <Box color={statusColors.main}>{getStatusIcon(s, 12)}</Box>
                  <Text flex={1} color="gray.600">
                    {s}
                  </Text>
                  <Text fontWeight="bold" color={statusColors.main}>
                    {count}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>

        {/* Time Progress Bar */}
        {duration && (
          <Box w="full">
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.500">
                Time
              </Text>
              <Text fontSize="xs" color="gray.500">
                {timeProgress}%
              </Text>
            </Flex>
            <Box bg="gray.200" borderRadius="full" h="6px" w="full" overflow="hidden">
              <Box bg={timeProgress > completionPercent ? "orange.400" : colors.main} h="full" w={`${timeProgress}%`} borderRadius="full" transition="width 0.3s ease" />
            </Box>
            <Text fontSize="xs" color="gray.400" mt={1} textAlign="center">
              Day {Math.min(daysElapsed, totalDays)} of {totalDays}
            </Text>
          </Box>
        )}

        {/* Mini Deliverable Timeline with status colors */}
        <Flex w="full" h="8px" borderRadius="full" overflow="hidden" gap="1px">
          {deliverables.map((d) => {
            const dColors = getStatusColor(d.status);
            return <Box key={d.id} flex={d.durationDays} bg={dColors.main} h="full" title={`${d.text} (${d.status})`} opacity={d.status === "Not Started" ? 0.4 : 1} />;
          })}
        </Flex>
      </Flex>
    </Box>
  );
};
