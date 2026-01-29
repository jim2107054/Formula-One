"use client";

import { Box, Select, Text } from "@radix-ui/themes";

interface PageSizeSelectorProps {
  value: 10 | 20 | 50 | 100;
  onChange: (size: 10 | 20 | 50 | 100) => void;
  className?: string;
}

const OPTIONS = [
  { value: 10, label: "10 / page" },
  { value: 20, label: "20 / page" },
  { value: 50, label: "50 / page" },
  { value: 100, label: "100 / page" },
] as const;

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => (
  <Box className={`flex items-center gap-2 ${className}`}>
    <Select.Root
      value={value.toString()}
      onValueChange={(val) => onChange(Number(val) as 10 | 20 | 50 | 100)}
    >
      <Select.Trigger
        variant="surface"
        radius="medium"
        className="w-32 text-sm !cursor-pointer"
      />
      <Select.Content>
        {OPTIONS.map((opt) => (
          <Select.Item
            key={opt.value}
            value={opt.value.toString()}
            className="!cursor-pointer"
          >
            <Text size="2">{opt.label}</Text>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  </Box>
);
