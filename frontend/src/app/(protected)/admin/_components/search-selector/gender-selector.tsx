import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface GenderSelectorProps {
  value?: string;
  onGenderSelect?: (gender: string) => void;
}

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function GenderSelector({
  value,
  onGenderSelect,
}: GenderSelectorProps) {
  return (
    <Box className="max-w-[8rem] w-full">
      <Select.Root
        value={value || ""}
        onValueChange={(gender) => onGenderSelect?.(gender)}
      >
        <Select.Trigger
          placeholder="Gender"
          variant="classic"
          className="w-full text-sm flex items-center justify-between !cursor-pointer"
          style={{ width: "100%" }}
        />
        <Select.Content position="popper" sideOffset={4}>
          {GENDERS.map((gender) => (
            <Select.Item
              key={gender.value}
              value={gender.value}
              className={`px-2 py-1 my-1 hover:!bg-accent focus:!bg-accent !cursor-pointer ${
                value === gender.value ? "bg-accent text-white" : ""
              }`}
            >
              <Flex align="center" gap="2">
                <Text size="2">{gender.label}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
