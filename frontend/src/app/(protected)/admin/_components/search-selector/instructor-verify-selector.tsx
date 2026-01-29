import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface InstructorVerifiedStatusSelectorProps {
  value?: string;
  onSelect?: (value: string) => void;
}

const OPTIONS = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
];

export default function InstructorVerifiedStatusSelector({
  value = "",
  onSelect,
}: InstructorVerifiedStatusSelectorProps) {
  return (
    <Box className="max-w-[160px] w-full">
      <Select.Root value={value} onValueChange={onSelect}>
        <Select.Trigger
          placeholder="Instructor Verified"
          variant="classic"
          className="w-full text-sm flex items-center justify-between !cursor-pointer"
          style={{ width: "100%" }}
        />
        <Select.Content position="popper" sideOffset={4}>
          {OPTIONS.map(({ value: val, label }) => (
            <Select.Item
              key={val}
              value={val}
              className={`px-2 py-1 my-1 transition-colors hover:!bg-accent focus:!bg-accent !cursor-pointer ${
                value === val ? "bg-accent text-white" : ""
              }`}
            >
              <Flex align="center" gap="2">
                <Text size="2">{label}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
