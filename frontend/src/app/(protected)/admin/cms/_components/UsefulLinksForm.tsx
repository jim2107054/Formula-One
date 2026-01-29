"use client";

import { UsefulLinkItem } from "@/zustand/types/cms";
import { Box, Flex, RadioGroup, Text } from "@radix-ui/themes";
import { BiChevronDown, BiChevronUp, BiPlus, BiTrash } from "react-icons/bi";
import { Button } from "../../_components/button";

interface UsefulLinksFormProps {
  items: UsefulLinkItem[];
  onChange: (items: UsefulLinkItem[]) => void;
}

export default function UsefulLinksForm({
  items,
  onChange,
}: UsefulLinksFormProps) {
  const addItem = () => {
    const newItem: UsefulLinkItem = {
      title: "",
      bookingUrl: "",
      isPublished: true,
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (
    index: number,
    field: keyof UsefulLinkItem,
    value: string | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onChange(newItems);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ];

    onChange(newItems);
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="4" weight="bold">
          Links
        </Text>
        <Button onClick={addItem}>
          <BiPlus size={18} />
          Add Link
        </Button>
      </Flex>
      {items.length === 0 ? (
        <Box
          p="6"
          style={{
            border: "2px dashed var(--gray-6)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Text color="gray">
            No useful links yet. Click &quot;Add Link&quot; to create one.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="4">
          {items.map((item, index) => (
            <Box
              key={index}
              p="4"
              style={{
                border: "1px solid var(--gray-6)",
                borderRadius: "8px",
                backgroundColor: "var(--gray-1)",
              }}
            >
              <Flex justify="between" align="center" mb="3">
                <Flex align="center" gap="2">
                  <Text size="2" weight="bold" color="gray">
                    Link #{index + 1}
                  </Text>
                  <RadioGroup.Root
                    value={item.isPublished ? "published" : "unpublished"}
                    onValueChange={(value) =>
                      updateItem(index, "isPublished", value === "published")
                    }
                    size="1"
                    variant="surface"
                    color="cyan"
                  >
                    <Flex direction="row" gap="4" align="center">
                      <Text as="label" size="2" className="!cursor-pointer">
                        <Flex gap="1" align="center">
                          <RadioGroup.Item value="published" />
                          Publish
                        </Flex>
                      </Text>
                      <Text as="label" size="2" className="!cursor-pointer">
                        <Flex gap="1" align="center">
                          <RadioGroup.Item value="unpublished" />
                          Unpublish
                        </Flex>
                      </Text>
                    </Flex>
                  </RadioGroup.Root>
                </Flex>

                <Flex gap="2">
                  <Button
                    type="button"
                    variant="icon"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                  >
                    <BiChevronUp size={18} />
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === items.length - 1}
                  >
                    <BiChevronDown size={18} />
                  </Button>
                  <Button
                    type="button"
                    variant="danger-outline"
                    onClick={() => removeItem(index)}
                  >
                    <BiTrash size={18} />
                  </Button>
                </Flex>
              </Flex>

              <Flex direction="column" gap="3">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    Title
                  </Text>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="Enter link title"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid var(--gray-6)",
                      borderRadius: "4px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="1">
                    URL
                  </Text>
                  <input
                    type="url"
                    value={item.bookingUrl}
                    onChange={(e) =>
                      updateItem(index, "bookingUrl", e.target.value)
                    }
                    placeholder="https://example.com"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid var(--gray-6)",
                      borderRadius: "4px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </Box>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}
