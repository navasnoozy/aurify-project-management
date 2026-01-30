"use client";

import { memo } from "react";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { Deliverable, TaskStatus, getStatusCounts, TASK_STATUSES } from "./types";
import { motion } from "motion/react";

interface ProgressGraphProps {
  deliverables: Deliverable[];
  status: TaskStatus;
}

// AAA Pro Color Palette with High Vibrance
const GRADIENTS: Record<TaskStatus, { from: string; to: string; hex: string }> = {
  Completed: { from: "#34d399", to: "#059669", hex: "#10b981" },
  Implementing: { from: "#60a5fa", to: "#2563eb", hex: "#3b82f6" },
  "Planning & Research": { from: "#f472b6", to: "#db2777", hex: "#ec4899" },
  "On Hold": { from: "#fbbf24", to: "#d97706", hex: "#f59e0b" },
  "Not Started": { from: "#9ca3af", to: "#4b5563", hex: "#6b7280" },
};

// Polar to Cartesian conversion
const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

// SVG Arc Path for a stroke-based segment
const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
};

const MotionPath = motion.path;
const MotionBox = motion.create(Box);

export const ProgressGraph = memo(({ deliverables }: ProgressGraphProps) => {
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

  // Dimensions - Compact to fit within layout constraints
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 72;
  const innerRadius = 48;
  const strokeWidth = outerRadius - innerRadius;
  const pathRadius = (outerRadius + innerRadius) / 2;

  const gapAngle = 8;
  const labelDist = 36; // Distance from outer segment to bubble center

  let currentAngle = 0;
  const arcs = segments.map((seg) => {
    const segmentAngle = (seg.percent / 100) * 360;
    const startAngle = currentAngle + gapAngle / 2;
    const endAngle = currentAngle + segmentAngle - gapAngle / 2;
    const actualEndAngle = endAngle - startAngle < 5 ? startAngle + 5 : endAngle;

    currentAngle += segmentAngle;

    const midAngle = (startAngle + actualEndAngle) / 2;
    const labelPos = polarToCartesian(cx, cy, outerRadius + labelDist, midAngle);

    // Line stays short: from just past segment to just before bubble
    const lineStartPos = polarToCartesian(cx, cy, outerRadius + 6, midAngle);
    const lineEndPos = polarToCartesian(cx, cy, outerRadius + labelDist - 22, midAngle);

    return {
      ...seg,
      path: describeArc(cx, cy, pathRadius, startAngle, actualEndAngle),
      labelPos,
      lineStartPos,
      lineEndPos,
      midAngle,
    };
  });

  return (
    <Flex direction="column" align="center" gap={4}>
      <Box position="relative" width={`${size}px`} height={`${size}px`}>
        {/* SVG Layer */}
        <svg width={size} height={size} style={{ overflow: "visible", filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.1))" }}>
          <defs>
            {Object.entries(GRADIENTS).map(([status, colors]) => {
              const gradientId = `grad-pro-${status.replace(/[^a-zA-Z0-9]/g, "-")}`;
              return (
                <linearGradient key={status} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.from} />
                  <stop offset="100%" stopColor={colors.to} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Depth Rings */}
          <circle cx={cx} cy={cy} r={pathRadius} fill="none" stroke="gray.50" strokeWidth={strokeWidth} />
          <circle cx={cx} cy={cy} r={innerRadius - 2} fill="none" stroke="gray.100" strokeWidth="1" />

          {/* Sausage Segments */}
          {arcs.map((arc, i) => {
            const gradientId = `grad-pro-${arc.status.replace(/[^a-zA-Z0-9]/g, "-")}`;
            return (
              <MotionPath
                key={arc.status}
                d={arc.path}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                whileHover={{ opacity: 0.9 }}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* Pro Level Connecting Lines */}
          {arcs.map((arc) => {
            if (arc.percent < 5) return null;
            return (
              <motion.line
                key={`line-${arc.status}`}
                x1={arc.lineStartPos.x}
                y1={arc.lineStartPos.y}
                x2={arc.lineEndPos.x}
                y2={arc.lineEndPos.y}
                stroke={GRADIENTS[arc.status].hex}
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ delay: 0.6 }}
              />
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
          w={`${innerRadius * 2 - 10}px`}
          h={`${innerRadius * 2 - 10}px`}
          borderRadius="full"
          bg="white"
          boxShadow="0 4px 20px rgba(0,0,0,0.03), inset 0 2px 8px rgba(0,0,0,0.02)"
          zIndex={5}
        >
          <Text fontSize="4xl" fontWeight="900" color="gray.800" lineHeight="0.9">
            {completionPercent}%
          </Text>
          <Text fontSize="xs" fontWeight="extrabold" textTransform="uppercase" letterSpacing="2px" color="gray.400" mt={2}>
            Done
          </Text>
        </Flex>

        {/* AAA Dew Drop Labels - Robust Alignment Fix */}
        {arcs.map((arc, i) => {
          if (arc.percent < 5) return null;
          const colors = GRADIENTS[arc.status];
          return (
            <div
              key={`container-${arc.status}`}
              style={{
                position: "absolute",
                left: `${arc.labelPos.x}px`,
                top: `${arc.labelPos.y}px`,
                transform: "translate(-50%, -50%)", // Static container does centering
                zIndex: 20,
              }}
            >
              <Tooltip content={`${arc.status}: ${arc.count} tasks`} showArrow positioning={{ placement: "top" }} openDelay={200} closeDelay={100}>
                <MotionBox
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  cursor="help"
                >
                  <Box
                    bg={colors.hex}
                    color="white"
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    boxShadow={`0 8px 20px ${colors.hex}60, 0 0 0 1px ${colors.hex}30`}
                    fontSize="sm"
                    fontWeight="900"
                    whiteSpace="nowrap"
                  >
                    {arc.percent}%
                  </Box>
                </MotionBox>
              </Tooltip>
            </div>
          );
        })}
      </Box>

      {/* Legend */}
      <Flex gap={3} flexWrap="wrap" justify="center" px={4} mt={-4}>
        {arcs.map((arc, i) => {
          const colors = GRADIENTS[arc.status];
          return (
            <MotionBox key={arc.status} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.1 }}>
              <Flex
                align="center"
                gap={2}
                bg="white"
                py={1.5}
                px={3.5}
                borderRadius="full"
                boxShadow="0 4px 12px rgba(0,0,0,0.05)"
                border="1px solid"
                borderColor="gray.50"
                transition="all 0.2s"
                _hover={{ transform: "scale(1.05)", boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}
              >
                <Box w="10px" h="10px" borderRadius="full" bg={colors.hex} flexShrink={0} />
                <Text fontSize="xs" fontWeight="700" color="gray.600">
                  {arc.status.replace("Planning & Research", "Planning")}
                </Text>
                <Text fontSize="xs" fontWeight="900" color="gray.900">
                  {arc.count}
                </Text>
              </Flex>
            </MotionBox>
          );
        })}
      </Flex>
    </Flex>
  );
});

ProgressGraph.displayName = "ProgressGraph";
