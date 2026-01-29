"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Deliverable, TaskStatus, getStatusCounts, TASK_STATUSES } from "./data";
import { motion } from "framer-motion";

interface ProgressGraphProps {
  deliverables: Deliverable[];
  status: TaskStatus;
}

// Gradient definitions for premium 3D look
const GRADIENTS: Record<TaskStatus, { from: string; to: string; bg: string }> = {
  Completed: { from: "#34d399", to: "#059669", bg: "#ecfdf5" },
  Implementing: { from: "#60a5fa", to: "#2563eb", bg: "#eff6ff" },
  "Planning & Research": { from: "#f472b6", to: "#db2777", bg: "#fdf2f8" },
  "On Hold": { from: "#fbbf24", to: "#d97706", bg: "#fffbeb" },
  "Not Started": { from: "#9ca3af", to: "#4b5563", bg: "#f9fafb" },
};

// Polar to Cartesian conversion
const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

// Create SVG path
const createArcPath = (cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number): string => {
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};

const MotionPath = motion.path;
const MotionBox = motion.create(Box);

export const ProgressGraph = ({ deliverables }: ProgressGraphProps) => {
  const totalTasks = deliverables.length;
  const statusCounts = getStatusCounts(deliverables);
  const completedCount = statusCounts["Completed"];
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Filter segments
  const segments: { status: TaskStatus; count: number; percent: number }[] = [];
  TASK_STATUSES.forEach((s) => {
    const count = statusCounts[s];
    if (count > 0) {
      segments.push({
        status: s,
        count,
        percent: Math.round((count / totalTasks) * 100),
      });
    }
  });

  if (segments.length === 0) return null;

  // Dimensions
  const size = 280; // Increased for external labels
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 85;
  const innerRadius = 55;
  const gapAngle = 4;
  const labelRadius = outerRadius + 30; // Labels positioned outside

  let currentAngle = 0;
  const arcs = segments.map((seg) => {
    const segmentAngle = (seg.percent / 100) * 360;
    const adjustedAngle = Math.max(segmentAngle - gapAngle, 2);
    const startAngle = currentAngle + gapAngle / 2;
    const endAngle = startAngle + adjustedAngle;
    currentAngle += segmentAngle;

    const midAngle = (startAngle + endAngle) / 2;
    // Point on outer edge of arc (start of line)
    const arcEdge = polarToCartesian(cx, cy, outerRadius, midAngle);
    // Point for label (end of line, outside)
    const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

    return {
      ...seg,
      startAngle,
      endAngle,
      path: createArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle),
      arcEdge,
      labelPos,
      midAngle,
    };
  });

  return (
    <Flex direction="column" align="center" gap={4}>
      <Box position="relative" width={`${size}px`} height={`${size}px`}>
        <svg width={size} height={size} style={{ overflow: "visible", filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))" }}>
          <defs>
            {Object.entries(GRADIENTS).map(([status, colors]) => {
              const gradientId = `grad-${status.replace(/[^a-zA-Z0-9]/g, "-")}`;
              return (
                <linearGradient key={status} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.from} />
                  <stop offset="100%" stopColor={colors.to} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Donut segments */}
          {arcs.map((arc, i) => {
            const gradientId = `grad-${arc.status.replace(/[^a-zA-Z0-9]/g, "-")}`;
            return (
              <MotionPath
                key={arc.status}
                d={arc.path}
                fill={`url(#${gradientId})`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
                style={{ originX: "50%", originY: "50%", cursor: "pointer" }}
              />
            );
          })}

          {/* Dew drop connector lines */}
          {arcs.map((arc) => {
            if (arc.percent < 8) return null;
            const gradientId = `grad-${arc.status.replace(/[^a-zA-Z0-9]/g, "-")}`;
            return (
              <line key={`line-${arc.status}`} x1={arc.arcEdge.x} y1={arc.arcEdge.y} x2={arc.labelPos.x} y2={arc.labelPos.y} stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" />
            );
          })}
        </svg>

        {/* Center Info */}
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          direction="column"
          align="center"
          justify="center"
          w={`${innerRadius * 2 - 8}px`}
          h={`${innerRadius * 2 - 8}px`}
          borderRadius="full"
          bg="rgba(255,255,255,0.95)"
          backdropFilter="blur(5px)"
          boxShadow="inset 0 2px 10px rgba(0,0,0,0.05)"
        >
          <Text fontSize="3xl" fontWeight="800" letterSpacing="-1px" color="gray.800" lineHeight="1">
            {completionPercent}%
          </Text>
          <Text fontSize="2xs" fontWeight="bold" textTransform="uppercase" letterSpacing="1px" color="gray.400" mt={1}>
            Done
          </Text>
        </Flex>

        {/* Dew Drop Labels - Outside the donut */}
        {arcs.map((arc, i) => {
          if (arc.percent < 8) return null;
          const colors = GRADIENTS[arc.status];
          return (
            <MotionBox
              key={`lbl-${arc.status}`}
              position="absolute"
              left={`${arc.labelPos.x}px`}
              top={`${arc.labelPos.y}px`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              style={{ transform: "translate(-50%, -50%)" }}
              pointerEvents="none"
            >
              {/* Dew drop bubble */}
              <Box bg={colors.to} color="white" px={2} py={1} borderRadius="full" boxShadow={`0 4px 12px ${colors.to}40`} fontSize="xs" fontWeight="800" whiteSpace="nowrap">
                {arc.percent}%
              </Box>
            </MotionBox>
          );
        })}
      </Box>

      {/* Compact Legend */}
      <Flex gap={2} flexWrap="wrap" justify="center" px={2}>
        {arcs.map((arc, i) => {
          const colors = GRADIENTS[arc.status];
          return (
            <MotionBox key={arc.status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
              <Flex
                align="center"
                gap={1.5}
                bg="white"
                py={1}
                px={2}
                borderRadius="full"
                boxShadow="0 2px 6px rgba(0,0,0,0.06)"
                border="1px solid"
                borderColor="gray.100"
                fontSize="2xs"
                _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
                transition="all 0.2s"
              >
                <Box w="6px" h="6px" borderRadius="full" bg={colors.to} flexShrink={0} />
                <Text fontWeight="600" color="gray.600">
                  {arc.status.replace("Planning & Research", "Planning")}
                </Text>
                <Text fontWeight="bold" color="gray.800">
                  {arc.count}
                </Text>
              </Flex>
            </MotionBox>
          );
        })}
      </Flex>
    </Flex>
  );
};
