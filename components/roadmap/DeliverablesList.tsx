"use client";

import { Box, Text, Flex, Input, IconButton, useBreakpointValue, Badge, Popover, Textarea, Portal } from "@chakra-ui/react";
import { useState, memo } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Check, X, Pencil, GripVertical } from "lucide-react";
import { Deliverable, TaskStatus, getNextAvailableDate, isDateRangeOccupied } from "./data";
import { DeliverableDuration } from "./DeliverableDuration";
import { StatusBadge } from "./StatusBadge";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { addWorkingDays, getWorkingDays } from "@/lib/dateUtils";
import { format, parseISO } from "date-fns";

// dnd-kit imports
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DeliverablesListProps {
  deliverables: Deliverable[];
  onUpdate: (deliverables: Deliverable[]) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isEditable?: boolean;
}

// Sortable Deliverable Item Component
interface SortableDeliverableProps {
  deliverable: Deliverable;
  isEditable: boolean;
  editingId: string | null;
  editText: string;
  onEditOpen: (d: Deliverable) => void;
  onEditTextChange: (text: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDurationUpdate: (id: string, startDate: string, durationDays: number, options?: { excludeHolidays?: boolean; excludeSaturdays?: boolean }) => void;
  allDeliverables: Deliverable[];
}

const SortableDeliverable = memo(
  ({
    deliverable,
    isEditable,
    editingId,
    editText,
    onEditOpen,
    onEditTextChange,
    onEditSave,
    onEditCancel,
    onEditKeyDown,
    onDelete,
    onStatusChange,
    onDurationUpdate,
    allDeliverables,
  }: SortableDeliverableProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deliverable.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 10 : 1,
    };

    const d = deliverable;

    return (
      <Box
        ref={setNodeRef}
        style={style}
        bg="white"
        py={{ base: 1.5, md: 1, "2xl": 1.5 }}
        px={2}
        borderRadius="md"
        borderWidth="1px"
        borderColor={editingId === d.id ? "blue.400" : isDragging ? "blue.300" : "gray.200"}
        boxShadow={isDragging ? "lg" : editingId === d.id ? "0 0 0 2px var(--chakra-colors-blue-100)" : "none"}
        transition="border-color 0.15s, box-shadow 0.15s"
        css={{
          "& .action-btn": { opacity: 0, transition: "opacity 0.2s" },
          "&:hover .action-btn": { opacity: 1 },
        }}
      >
        {/* Row 1: Drag Handle + Name + Actions */}
        <Flex justify="space-between" align="flex-start" gap={2}>
          {/* Drag Handle - LEFT SIDE */}
          {isEditable && (
            <IconButton {...listeners} {...attributes} aria-label="Drag to reorder" size="xs" variant="ghost" colorPalette="gray" cursor="grab" _active={{ cursor: "grabbing" }} minW="20px" px={0}>
              <GripVertical size={14} />
            </IconButton>
          )}

          {/* Text + Edit Popover */}
          <Popover.Root
            open={editingId === d.id}
            onOpenChange={(e) => {
              if (!e.open) onEditCancel();
            }}
          >
            <Flex flex={1} align="center" gap={1}>
              <Text fontSize="xs" fontWeight="medium" flex={1} textDecoration={d.status === "Completed" ? "line-through" : "none"} color={d.status === "Completed" ? "gray.400" : "gray.700"}>
                {d.text}
              </Text>

              {isEditable && (
                <Popover.Trigger asChild>
                  <IconButton className="action-btn" aria-label="Edit deliverable" size="xs" variant="ghost" colorPalette="blue" onClick={() => onEditOpen(d)}>
                    <Pencil size={12} />
                  </IconButton>
                </Popover.Trigger>
              )}
            </Flex>

            <Portal>
              <Popover.Positioner zIndex="popover">
                <Popover.Content width="300px" boxShadow="xl" borderRadius="lg" p={0} overflow="hidden">
                  <Popover.Arrow>
                    <Popover.ArrowTip />
                  </Popover.Arrow>
                  <Popover.Body p={3}>
                    <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={2}>
                      Edit Deliverable
                    </Text>
                    <Textarea
                      value={editText}
                      onChange={(e) => onEditTextChange(e.target.value)}
                      onKeyDown={onEditKeyDown}
                      placeholder="Enter deliverable text..."
                      rows={3}
                      fontSize="sm"
                      resize="vertical"
                      autoFocus
                      _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                    />
                    <Text fontSize="2xs" color="gray.400" mt={1}>
                      Ctrl+Enter to save • Esc to cancel
                    </Text>
                    <Flex justify="flex-end" gap={1} mt={3}>
                      <IconButton aria-label="Cancel" size="sm" variant="ghost" colorPalette="gray" onClick={onEditCancel}>
                        <X size={14} />
                      </IconButton>
                      <IconButton aria-label="Save" size="sm" variant="solid" colorPalette="green" onClick={onEditSave} disabled={!editText.trim()}>
                        <Check size={14} />
                      </IconButton>
                    </Flex>
                  </Popover.Body>
                </Popover.Content>
              </Popover.Positioner>
            </Portal>
          </Popover.Root>

          {/* Delete Button */}
          {isEditable && (
            <IconButton className="action-btn" aria-label="Delete deliverable" size="xs" variant="ghost" colorPalette="red" onClick={() => onDelete(d.id)}>
              <Trash2 size={12} />
            </IconButton>
          )}
        </Flex>

        {/* Row 2: Status + Duration */}
        <Flex justify="space-between" align="center" mt={1.5} flexWrap="wrap" gap={1} pl={isEditable ? "28px" : 0}>
          <StatusBadge status={d.status} onStatusChange={(status) => isEditable && onStatusChange(d.id, status)} />
          <DeliverableDuration
            deliverable={d}
            allDeliverables={allDeliverables}
            onUpdate={(startDate, durationDays, options) => onDurationUpdate(d.id, startDate, durationDays, options)}
            isEditable={isEditable}
          />
        </Flex>
      </Box>
    );
  },
);

SortableDeliverable.displayName = "SortableDeliverable";

// Main Component
export const DeliverablesList = memo(({ deliverables, onUpdate, isExpanded, onToggleExpand, isEditable = false }: DeliverablesListProps) => {
  const [newDeliverable, setNewDeliverable] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDuration, setNewDuration] = useState(7);
  const [newEndDate, setNewEndDate] = useState("");
  const [newEditMode, setNewEditMode] = useState<"duration" | "endDate">("duration");
  const [newError, setNewError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // dnd-kit sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px movement before drag starts
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 }, // 250ms hold before drag on touch
    }),
  );

  // Check if screen is large desktop (2xl+)
  const isLargeScreen = useBreakpointValue({ base: false, "2xl": true });
  // Default show all on large screens, or if expanded. Otherwise show top 2.
  const showAll = isLargeScreen || isExpanded;
  const visibleDeliverables = showAll ? deliverables : deliverables.slice(0, 2);
  const hiddenCount = deliverables.length - 2;
  const completedCount = deliverables.filter((d) => d.status === "Completed").length;

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const updated = deliverables.map((d) => (d.id === id ? { ...d, status } : d));
    onUpdate(updated);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updated = deliverables.filter((d) => d.id !== deleteId);
      onUpdate(updated);
      setDeleteId(null);
    }
  };

  const handleEditOpen = (d: Deliverable) => {
    setEditingId(d.id);
    setEditText(d.text);
  };

  const handleEditSave = () => {
    if (editingId && editText.trim()) {
      const updated = deliverables.map((d) => (d.id === editingId ? { ...d, text: editText.trim() } : d));
      onUpdate(updated);
    }
    setEditingId(null);
    setEditText("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleEditCancel();
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleEditSave();
    }
  };

  // Validation helper for new deliverable
  const validateNewDeliverable = (startDate: string, durationDays: number): boolean => {
    if (!startDate) {
      setNewError(null); // No error if no start date yet
      return true;
    }

    if (durationDays < 1) {
      setNewError("Duration must be at least 1 day");
      return false;
    }

    const options = { excludeHolidays: true, excludeSaturdays: false };
    if (isDateRangeOccupied(deliverables, startDate, durationDays, undefined, options)) {
      setNewError("Overlaps with another deliverable");
      return false;
    }

    setNewError(null);
    return true;
  };

  const handleAdd = () => {
    if (!newDeliverable.trim()) return;

    const startDate = newStartDate || getNextAvailableDate(deliverables);
    const duration = newDuration || 7;

    // Final validation before save
    if (!validateNewDeliverable(startDate, duration)) {
      return;
    }

    const newItem: Deliverable = {
      id: `${Date.now()}`,
      text: newDeliverable.trim(),
      status: "Not Started",
      startDate: startDate,
      durationDays: duration,
      excludeHolidays: true,
      excludeSaturdays: false,
    };
    onUpdate([...deliverables, newItem]);
    setNewDeliverable("");
    setNewStartDate("");
    setNewDuration(7);
    setNewEndDate("");
    setNewError(null);
    setIsAdding(false);
  };

  // Initialize new deliverable defaults when opening add form
  const handleOpenAdd = () => {
    const nextDate = getNextAvailableDate(deliverables);
    setNewStartDate(nextDate);
    setNewDuration(7);
    // Calculate initial end date
    const initialEnd = addWorkingDays(nextDate, 6, { excludeHolidays: true, excludeSaturdays: false });
    setNewEndDate(format(initialEnd, "yyyy-MM-dd"));
    setNewError(null);
    setIsAdding(true);
  };

  const handleDurationUpdate = (id: string, startDate: string, durationDays: number, options?: { excludeHolidays?: boolean; excludeSaturdays?: boolean }) => {
    const updated = deliverables.map((d) => (d.id === id ? { ...d, startDate, durationDays, ...options } : d));
    onUpdate(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleAdd();
    } else if (e.key === "Escape") {
      setNewDeliverable("");
      setNewStartDate("");
      setNewDuration(7);
      setIsAdding(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (_event: DragStartEvent) => {
    // Close any open popover to prevent z-index issues
    setEditingId(null);
    setEditText("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = deliverables.findIndex((d) => d.id === active.id);
      const newIndex = deliverables.findIndex((d) => d.id === over.id);
      const newOrder = arrayMove(deliverables, oldIndex, newIndex);
      onUpdate(newOrder);
    }
  };

  return (
    <Box mt={2} bg="gray.50" p={1.5} borderRadius="md">
      <Flex justify="space-between" align="center" mb={1}>
        <Text fontSize="xs" fontWeight="bold" color="gray.500">
          KEY DELIVERABLES
        </Text>
        <Flex align="center" gap={2}>
          {/* Progress badge */}
          {deliverables.length > 0 && (
            <Badge colorPalette="green" variant="subtle" fontSize="2xs">
              <Check size={10} style={{ marginRight: "2px" }} />
              {completedCount}/{deliverables.length}
            </Badge>
          )}
          {isEditable && !isAdding && (
            <IconButton aria-label="Add deliverable" size="xs" variant="ghost" colorPalette="blue" onClick={handleOpenAdd}>
              <Plus size={14} />
            </IconButton>
          )}
        </Flex>
      </Flex>

      {/* Deliverables List with Drag and Drop */}
      <Flex direction="column" gap={1}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleDeliverables.map((d) => d.id)} strategy={verticalListSortingStrategy}>
            {visibleDeliverables.map((d) => (
              <SortableDeliverable
                key={d.id}
                deliverable={d}
                isEditable={isEditable}
                editingId={editingId}
                editText={editText}
                onEditOpen={handleEditOpen}
                onEditTextChange={setEditText}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onEditKeyDown={handleEditKeyDown}
                onDelete={setDeleteId}
                onStatusChange={handleStatusChange}
                onDurationUpdate={handleDurationUpdate}
                allDeliverables={deliverables}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add New Input - Enhanced with Date and Duration/End Date Toggle */}
        {isAdding && (
          <Box mt={2} p={2} bg="white" borderRadius="md" borderWidth="1px" borderColor="blue.200" boxShadow="sm">
            <Flex direction="column" gap={2}>
              {/* Title */}
              <Input size="sm" placeholder="Deliverable title..." value={newDeliverable} onChange={(e) => setNewDeliverable(e.target.value)} onKeyDown={handleKeyDown} autoFocus />

              {/* Start Date */}
              <Flex direction="column">
                <Text fontSize="2xs" color="gray.500" mb={0.5}>
                  Start Date
                </Text>
                <Input
                  type="date"
                  size="xs"
                  value={newStartDate}
                  onChange={(e) => {
                    setNewStartDate(e.target.value);
                    // Recalculate end date if in duration mode
                    if (newEditMode === "duration" && e.target.value) {
                      const end = addWorkingDays(e.target.value, Math.max(0, newDuration - 1), { excludeHolidays: true, excludeSaturdays: false });
                      setNewEndDate(format(end, "yyyy-MM-dd"));
                    }
                    // Validate
                    validateNewDeliverable(e.target.value, newDuration);
                  }}
                />
              </Flex>

              {/* Error Display */}
              {newError && (
                <Text fontSize="2xs" color="red.500" bg="red.50" p={1} borderRadius="sm">
                  {newError}
                </Text>
              )}

              {/* Duration / End Date Toggle */}
              <Flex gap={2} fontSize="2xs" mb={1}>
                <Text
                  fontWeight={newEditMode === "duration" ? "bold" : "normal"}
                  color={newEditMode === "duration" ? "blue.600" : "gray.500"}
                  cursor="pointer"
                  onClick={() => setNewEditMode("duration")}
                >
                  Duration
                </Text>
                <Text color="gray.400">|</Text>
                <Text fontWeight={newEditMode === "endDate" ? "bold" : "normal"} color={newEditMode === "endDate" ? "blue.600" : "gray.500"} cursor="pointer" onClick={() => setNewEditMode("endDate")}>
                  End Date
                </Text>
              </Flex>

              {/* Duration or End Date Input */}
              {newEditMode === "duration" ? (
                <Flex direction="column" w="100px">
                  <Input
                    type="number"
                    size="xs"
                    min={1}
                    value={newDuration}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 1;
                      setNewDuration(days);
                      // Update end date preview
                      if (newStartDate) {
                        const end = addWorkingDays(newStartDate, Math.max(0, days - 1), { excludeHolidays: true, excludeSaturdays: false });
                        setNewEndDate(format(end, "yyyy-MM-dd"));
                      }
                      // Validate
                      validateNewDeliverable(newStartDate, days);
                    }}
                  />
                  <Text fontSize="2xs" color="gray.500" mt={0.5}>
                    End: {newEndDate ? format(parseISO(newEndDate), "MMM d, yyyy") : "-"}
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column">
                  <Input
                    type="date"
                    size="xs"
                    value={newEndDate}
                    min={newStartDate}
                    onChange={(e) => {
                      setNewEndDate(e.target.value);
                      // Calculate duration from end date
                      if (newStartDate && e.target.value) {
                        const days = getWorkingDays(newStartDate, e.target.value, { excludeHolidays: true, excludeSaturdays: false }) + 1;
                        if (days > 0) {
                          setNewDuration(days);
                          // Validate
                          validateNewDeliverable(newStartDate, days);
                        }
                      }
                    }}
                  />
                  <Text fontSize="2xs" color="gray.500" mt={0.5}>
                    Duration: {newDuration} working days
                  </Text>
                </Flex>
              )}

              {/* Action Buttons */}
              <Flex justify="flex-end" gap={1} mt={1}>
                <Text fontSize="2xs" color="gray.400" alignSelf="center" mr="auto">
                  Ctrl+Enter to save
                </Text>
                <IconButton
                  aria-label="Cancel"
                  size="xs"
                  variant="ghost"
                  colorPalette="gray"
                  onClick={() => {
                    setIsAdding(false);
                    setNewDeliverable("");
                  }}
                >
                  <X size={12} />
                </IconButton>
                <IconButton aria-label="Save" size="xs" colorPalette="green" onClick={handleAdd} disabled={!newDeliverable.trim() || !!newError}>
                  <Check size={12} />
                </IconButton>
              </Flex>
            </Flex>
          </Box>
        )}

        {/* Empty state */}
        {deliverables.length === 0 && !isAdding && (
          <Text fontSize="xs" color="gray.400" textAlign="center" py={2}>
            No deliverables yet. Click + to add.
          </Text>
        )}

        {/* Show More / Show Less Button - Only for Laptop/Tablet screens */}
        {!isLargeScreen && deliverables.length > 2 && (
          <Flex
            as="button"
            onClick={onToggleExpand}
            align="center"
            justify="center"
            gap={1}
            mt={1}
            py={1.5}
            borderRadius="md"
            bg={isExpanded ? "purple.50" : "gray.100"}
            color={isExpanded ? "purple.600" : "gray.600"}
            fontSize="xs"
            fontWeight="medium"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: isExpanded ? "purple.100" : "gray.200" }}
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp size={12} />
              </>
            ) : (
              <>
                +{hiddenCount} more items <ChevronDown size={12} />
              </>
            )}
          </Flex>
        )}
      </Flex>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Deliverable"
        message="Are you sure you want to delete this key deliverable? This action cannot be undone."
        confirmText="Delete"
        confirmColorPalette="red"
      />
    </Box>
  );
});

DeliverablesList.displayName = "DeliverablesList";
