import { Box, Select } from "@radix-ui/themes";
import { ItemType } from "@/zustand/types/course";

interface ItemTypeSelectorProps {
  value?: ItemType;
  onChange: (value: ItemType) => void;
  placeholder?: string;
}

const ITEM_TYPES: { label: string; value: ItemType }[] = [
  { label: "Exam", value: "exam" },
  { label: "Resource", value: "resource" },
  // { label: "Video", value: "video" },
  // { label: "PDF", value: "pdf" },
  // { label: "Quiz", value: "quiz" },
  // { label: "Upload", value: "upload" },
  // { label: "Text", value: "text" },
];

export default function ItemTypeSelector({
  value,
  onChange,
  placeholder = "Select Item Type",
}: ItemTypeSelectorProps) {
  return (
    <Box className="max-w-xs">
      <Select.Root
        value={value ?? ""}
        onValueChange={(val) => onChange(val as ItemType)}
      >
        <Select.Trigger placeholder={placeholder} className="!cursor-pointer"/>
        <Select.Content position="popper" sideOffset={4}>
          <Select.Group>
            {ITEM_TYPES.map((type) => (
              <Select.Item
                key={type.value}
                value={type.value}
                className="my-1 hover:!bg-accent focus:!bg-accent !cursor-pointer"
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
