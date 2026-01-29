import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface StatusSelectorProps {
  value?: string | null;
  statuses?: { id: string; name: string }[];
  onStatusSelect?: (id: string | undefined) => void;
}

export default function StatusSelector({
  value,
  statuses,
  onStatusSelect,
}: StatusSelectorProps) {
  const normalizedValue = value === null || value === "" ? undefined : value;

  return (
    <Box className="max-w-[7rem] w-full">
      <Select.Root
        key={normalizedValue ?? "empty"}
        value={normalizedValue}
        onValueChange={(id) => onStatusSelect?.(id || undefined)}
      >
        <Select.Trigger
          placeholder="Status"
          variant="classic"
          className="w-full text-sm flex items-center justify-between !cursor-pointer"
        />

        <Select.Content position="popper" sideOffset={4}>
          {statuses?.map((status) => (
            <Select.Item
              key={status.id}
              value={status.id}
              className={`px-2 py-1 my-1 hover:!bg-accent focus:!bg-accent !cursor-pointer ${
                normalizedValue === status.id ? "bg-accent text-white" : ""
              }`}
            >
              <Flex align="center" gap="2" px="2" py="1">
                <Text size="2">{status.name}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
