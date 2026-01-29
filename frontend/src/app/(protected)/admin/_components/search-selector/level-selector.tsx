import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface LevelSelectorProps {
  value?: string;
  levels: { id: string; name: string }[];
  onLevelSelect?: (id: string) => void;
}

export default function LevelSelector({
  value,
  levels,
  onLevelSelect,
}: LevelSelectorProps) {
  return (
    <Box className="max-w-[8rem] w-full">
      <Select.Root
        value={value || ""}
        onValueChange={(id) => onLevelSelect?.(id)}
      >
        <Select.Trigger
          placeholder="Level"
          variant="classic"
          className="w-full text-sm flex items-center justify-between !cursor-pointer"
          style={{ width: "100%" }}
        />
        <Select.Content position="popper" sideOffset={4}>
          {levels.map((lvl) => (
            <Select.Item
              key={lvl.id}
              value={lvl.id}
              className={`px-2 py-1 my-1 hover:!bg-accent focus:!bg-accent !cursor-pointer ${
                value === lvl.id ? "bg-accent text-white" : ""
              }`}
            >
              <Flex align="center" gap="2" px="2" py="1">
                <Text size="2">{lvl.name}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
