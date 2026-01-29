"use client";

import { Box, Text, Flex, Input, IconButton, Checkbox } from "@chakra-ui/react";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Deliverable, getNextAvailableDate } from "./data";
import { DeliverableDuration } from "./DeliverableDuration";

interface DeliverablesListProps {
  deliverables: Deliverable[];
  onUpdate: (deliverables: Deliverable[]) => void;
}

export const DeliverablesList = ({ deliverables, onUpdate }: DeliverablesListProps) => {
  const [newDeliverable, setNewDeliverable] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleToggle = (id: string) => {
    const updated = deliverables.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d));
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deliverables.filter((d) => d.id !== id);
    onUpdate(updated);
  };

  const handleAdd = () => {
    if (!newDeliverable.trim()) return;

    const nextStartDate = getNextAvailableDate(deliverables);

    const newItem: Deliverable = {
      id: `${Date.now()}`,
      text: newDeliverable.trim(),
      completed: false,
      startDate: nextStartDate,
      durationDays: 7, // Default 7 days
    };
    onUpdate([...deliverables, newItem]);
    setNewDeliverable("");
    setIsAdding(false);
  };

  const handleDurationUpdate = (id: string, startDate: string, durationDays: number) => {
    const updated = deliverables.map((d) => (d.id === id ? { ...d, startDate, durationDays } : d));
    onUpdate(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setNewDeliverable("");
      setIsAdding(false);
    }
  };

  return (
    <Box mt={4} bg="gray.50" p={3} borderRadius="md">
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="xs" fontWeight="bold" color="gray.500">
          KEY DELIVERABLES
        </Text>
        {!isAdding && (
          <IconButton aria-label="Add deliverable" size="xs" variant="ghost" colorPalette="blue" onClick={() => setIsAdding(true)}>
            <Plus size={14} />
          </IconButton>
        )}
      </Flex>

      {/* Deliverables List */}
      <Flex direction="column" gap={2}>
        {deliverables.map((d) => (
          <Box
            key={d.id}
            bg="white"
            p={2}
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.200"
            css={{
              "& .delete-btn": { opacity: 0, transition: "opacity 0.2s" },
              "&:hover .delete-btn": { opacity: 1 },
            }}
          >
            <Flex align="center" gap={2}>
              <Checkbox.Root checked={d.completed} onCheckedChange={() => handleToggle(d.id)} size="sm" colorPalette="green">
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Root>
              <Text fontSize="sm" flex={1} textDecoration={d.completed ? "line-through" : "none"} color={d.completed ? "gray.400" : "gray.700"}>
                {d.text}
              </Text>
              <IconButton className="delete-btn" aria-label="Delete deliverable" size="xs" variant="ghost" colorPalette="red" onClick={() => handleDelete(d.id)}>
                <Trash2 size={12} />
              </IconButton>
            </Flex>
            {/* Duration row */}
            <Flex mt={2} ml={6}>
              <DeliverableDuration deliverable={d} allDeliverables={deliverables} onUpdate={(startDate, durationDays) => handleDurationUpdate(d.id, startDate, durationDays)} />
            </Flex>
          </Box>
        ))}

        {/* Add New Input */}
        {isAdding && (
          <Flex align="center" gap={2} mt={2}>
            <Input size="sm" placeholder="New deliverable..." value={newDeliverable} onChange={(e) => setNewDeliverable(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
            <IconButton aria-label="Save" size="xs" colorPalette="green" onClick={handleAdd} disabled={!newDeliverable.trim()}>
              <Plus size={14} />
            </IconButton>
          </Flex>
        )}

        {/* Empty state */}
        {deliverables.length === 0 && !isAdding && (
          <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>
            No deliverables yet. Click + to add.
          </Text>
        )}
      </Flex>
    </Box>
  );
};
