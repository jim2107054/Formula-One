import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface EmailVerifiedStatusSelectorProps {
  value?: string;
  onSelect?: (value: string) => void;
}

const OPTIONS = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

export default function EmailVerifiedStatusSelector({
  value,
  onSelect,
}: EmailVerifiedStatusSelectorProps) {
  return (
    <Box className="max-w-[12rem] w-full">
      <Select.Root value={value} onValueChange={onSelect}>
        <Select.Trigger
          placeholder="Search by Email Status"
          variant="classic"
          className="w-full text-sm flex items-center justify-between !cursor-pointer"
          style={{ width: "100%" }}
        />
        <Select.Content position="popper" sideOffset={4}>
          {OPTIONS.map((option) => (
            <Select.Item
              key={option.value}
              value={option.value}
              className={`px-2 py-1 my-1 hover:!bg-accent focus:!bg-accent !cursor-pointer ${
                value === option.value ? "bg-accent text-white" : ""
              }`}
            >
              <Flex align="center" gap="2">
                <Text size="2">{option.label}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
