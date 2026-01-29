"use client";

import { FaqItem } from "@/zustand/types/cms";
import { Box, Flex, RadioGroup, Text } from "@radix-ui/themes";
import { BiChevronDown, BiChevronUp, BiPlus, BiTrash } from "react-icons/bi";
import { Button } from "../../_components/button";
import { InputLabel } from "../../_components/input-label";
import TipTapEditor from "@/components/common/TipTapEditor";

interface FaqFormProps {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}

export default function FaqForm({ items, onChange }: FaqFormProps) {
  const addItem = () => {
    const newItem: FaqItem = {
      question: "",
      answer: "",
      order: items.length + 1,
      isPublished: true,
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Re-order items
    const reorderedItems = newItems.map((item, i) => ({
      ...item,
      order: i + 1,
    }));
    onChange(reorderedItems);
  };

  const updateItem = (
    index: number,
    field: keyof FaqItem,
    value: string | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "order" ? parseInt(value as string) || 0 : value,
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

    // Update order numbers
    const reorderedItems = newItems.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    onChange(reorderedItems);
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="4" weight="bold">
          FAQ Items
        </Text>
        <Button onClick={addItem}>
          <BiPlus size={18} />
          Add FAQ
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
            No FAQ items yet. Click &quot;Add FAQ&quot; to create one.
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
                    FAQ #{item.order}
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
                    <BiTrash />
                  </Button>
                </Flex>
              </Flex>

              <Flex direction="column" gap="3">
                <Box>
                  <InputLabel required>Question</InputLabel>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) =>
                      updateItem(index, "question", e.target.value)
                    }
                    placeholder="Enter question"
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
                  <InputLabel required>Answer</InputLabel>
                  <TipTapEditor
                    value={item.answer || ""}
                    onChange={(value) => updateItem(index, "answer", value)}
                    placeholder="Enter answer"
                    height={200}
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
