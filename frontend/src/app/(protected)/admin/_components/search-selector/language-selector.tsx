import { Select, Flex, Text, Box } from "@radix-ui/themes";

interface LanguageSelectorProps {
  value?: string;
  // languages: { code: string; name: string }[];
  onLanguageSelect?: (code: string) => void;
  width?: string | number;
  placeholder?: string;
}

const languages = [
  { code: "english", name: "English" },
  { code: "german", name: "German" },
  { code: "romainan", name: "Romanian" },
  { code: "spanish", name: "Spanish" },
];

export default function LanguageSelector({
  value,
  onLanguageSelect,
  width = "8rem",
  placeholder = "Language",
}: LanguageSelectorProps) {
  return (
    <Box style={{ width }} className="w-full">
      <Select.Root
        value={value || ""}
        onValueChange={(code) => onLanguageSelect?.(code)}
      >
        <Select.Trigger
          placeholder={placeholder}
          variant="classic"
          className="w-full text-sm flex items-center justify-between !cursor-pointer"
          style={{ width: "100%" }}
        />
        <Select.Content position="popper" sideOffset={4}>
          {languages.map((lang) => (
            <Select.Item
              key={lang.code}
              value={lang.code}
              className={`px-2 py-1 my-1 hover:!bg-accent focus:!bg-accent !cursor-pointer ${
                value === lang.code ? "bg-accent text-white" : ""
              }`}
            >
              <Flex align="center" gap="2" px="2" py="1">
                <Text size="2">{lang.name}</Text>
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
