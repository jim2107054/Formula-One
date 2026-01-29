import { ROLE_LABELS, UserRole } from "@/zustand/types/user";
import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface RoleSelectorProps {
  value?: UserRole;
  onRoleSelect?: (role: UserRole) => void;
  placeholder?: string;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 0, label: ROLE_LABELS[0] },
  { value: 1, label: ROLE_LABELS[1] },
  { value: 2, label: ROLE_LABELS[2] },
];

export default function RoleSelector({
  value,
  onRoleSelect,
  placeholder = "Select Role",
}: RoleSelectorProps) {
  const selectValue = value !== undefined ? value.toString() : "";
  const handleValueChange = (selectedValue: string) => {

    if (selectedValue) {
      const roleNumber = parseInt(selectedValue, 10) as UserRole;
      onRoleSelect?.(roleNumber);
    }
  };

  return (
    <Box className="max-w-[10rem] w-full">
      <Select.Root value={selectValue} onValueChange={handleValueChange}>
        <Select.Trigger
          placeholder={placeholder}
          variant="classic"
          className="text-sm flex items-center justify-between !cursor-pointer"
          style={{ width: "100%" }}
        />
        <Select.Content position="popper" sideOffset={4}>
          {ROLE_OPTIONS.map((role) => (
            <Select.Item
              key={role.value}
              value={role.value.toString()}
              className={`
                px-2 py-1 my-1 
                hover:!bg-accent focus:!bg-accent 
                !cursor-pointer transition-colors
                ${value === role.value ? "bg-accent text-white" : ""}
              `}
            >
              <Flex align="center" gap="2" px="2" py="1">
                <Text size="2">{role.label}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
