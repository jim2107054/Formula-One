import { Box, Select } from "@radix-ui/themes";
import { useEffect, useMemo } from "react";
import {
  ItemType,
  ItemResourceMediaType,
  ExamType,
} from "@/zustand/types/item";

interface ItemResourceTypeSelectorProps {
  itemType?: ItemType;
  examType?: ExamType;
  value?: ItemResourceMediaType;
  onChange: (value: ItemResourceMediaType) => void;
  placeholder?: string;
}

// Declare all resource types
const RESOURCE_TYPES: { label: string; value: ItemResourceMediaType }[] = [
  { label: "File", value: "file" },
  { label: "PDF", value: "pdf" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Link", value: "link" },
  { label: "Text", value: "text" },
];

// Declare all exam subtypes
const EXAM_TYPES: { label: string; value: ExamType }[] = [
  { label: "Quiz", value: "quiz" },
  // { label: "Assignment", value: "assignment" },
];

export default function ItemResourceTypeSelector({
  itemType,
  // examType,
  value,
  onChange,
  placeholder = "Select Type",
}: ItemResourceTypeSelectorProps) {
  // Determine options to display based on itemType and examType
  const options = useMemo(() => {
    if (itemType === "exam") return EXAM_TYPES;
    if (itemType === "resource") return RESOURCE_TYPES;
    return [];
  }, [itemType]);

  const isDisabled = options.length === 0;

  // Reset value if it becomes invalid after type change
  useEffect(() => {
    if (value && !options.some((opt) => opt.value === value)) {
      onChange(undefined as unknown as ItemResourceMediaType);
    }
  }, [options, value, onChange]);

  return (
    <Box className="max-w-xs">
      <Select.Root
        value={value ?? ""}
        disabled={isDisabled}
        onValueChange={(val) =>
          !isDisabled && onChange(val as ItemResourceMediaType)
        }
      >
        <Select.Trigger
          placeholder={placeholder}
          className={
            isDisabled ? "!cursor-not-allowed opacity-60" : "!cursor-pointer"
          }
        />
        <Select.Content position="popper" sideOffset={4}>
          <Select.Group>
            {options.map((type) => (
              <Select.Item
                key={type.value}
                value={type.value}
                disabled={isDisabled}
                className={`
                  my-1
                  ${isDisabled ? "!cursor-not-allowed" : "!cursor-pointer"}
                  hover:!bg-accent focus:!bg-accent
                `}
              >
                {type.label}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
