"use client";

import { UpcomingModuleItem } from "@/zustand/types/cms";
import {
  Box,
  Checkbox,
  Flex,
  RadioGroup,
  Select,
  Text,
} from "@radix-ui/themes";
import { BiChevronDown, BiChevronUp, BiPlus, BiTrash } from "react-icons/bi";
import { Button } from "../../_components/button";

interface UpcomingModuleFormProps {
  items: UpcomingModuleItem[];
  onChange: (items: UpcomingModuleItem[]) => void;
}

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "German", label: "German" },
  { value: "Romanian", label: "Romanian" },
  { value: "Spanish", label: "Spanish" },
];

export default function UpcomingModuleForm({
  items,
  onChange,
}: UpcomingModuleFormProps) {
  const addItem = () => {
    const newItem: UpcomingModuleItem = {
      courseNong: "",
      title: "",
      language: "English",
      location: "Online (Zoom)",
      standardPrice: 0,
      discountedPrice: 0,
      courseTitleUrl: "",
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
    field: keyof UpcomingModuleItem,
    value: string | number | boolean
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

  const toggleFlexibleSchedule = (index: number, isFlexible: boolean) => {
    const newItems = [...items];
    if (isFlexible) {
      // Remove date/time fields for flexible schedule
      delete newItems[index].startDate;
      delete newItems[index].endDate;
      delete newItems[index].startTime;
      delete newItems[index].endTime;
    } else {
      // Add empty date/time fields for fixed schedule
      newItems[index].startDate = "";
      newItems[index].endDate = "";
      newItems[index].startTime = "";
      newItems[index].endTime = "";
    }
    onChange(newItems);
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="4" weight="bold">
          Modules
        </Text>
        <Button onClick={addItem}>
          <BiPlus size={18} />
          Add Module
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
            No upcoming modules yet. Click &quot;Add Module&quot; to create one.
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="4">
          {items.map((item, index) => {
            const isFlexible =
              item.startDate === undefined &&
              item.endDate === undefined &&
              item.startTime === undefined &&
              item.endTime === undefined;

            return (
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
                      Module #{index + 1}
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
                  <Flex gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="bold" mb="1">
                        Course Nong *
                      </Text>
                      <input
                        type="text"
                        value={item.courseNong}
                        onChange={(e) =>
                          updateItem(index, "courseNong", e.target.value)
                        }
                        placeholder="e.g., WebDevBatch07"
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

                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="bold" mb="1">
                        Language *
                      </Text>

                      <Select.Root
                        value={item.language}
                        onValueChange={(value) =>
                          updateItem(index, "language", value)
                        }
                      >
                        <Select.Trigger
                          placeholder="Select language"
                          style={{ width: "100%" }}
                          className="!cursor-pointer"
                        />

                        <Select.Content position="popper" sideOffset={4}>
                          {LANGUAGES.map((lang) => (
                            <Select.Item
                              key={lang.value}
                              value={lang.value}
                              className="!cursor-pointer hover:!bg-accent"
                            >
                              {lang.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>
                  </Flex>

                  <Box>
                    <Text as="label" size="2" weight="bold" mb="1">
                      Title *
                    </Text>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateItem(index, "title", e.target.value)
                      }
                      placeholder="e.g., High demand skill Bootcamp3"
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
                      Location *
                    </Text>
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) =>
                        updateItem(index, "location", e.target.value)
                      }
                      placeholder="e.g., Online (Zoom)"
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
                    <Flex align="center" gap="2" mb="2">
                      <Checkbox
                        checked={isFlexible}
                        onCheckedChange={(checked) =>
                          toggleFlexibleSchedule(index, checked === true)
                        }
                        color="cyan"
                        className="!cursor-pointer"
                      />
                      <Text size="2">
                        Flexible Schedule (No fixed dates/times)
                      </Text>
                    </Flex>
                  </Box>

                  {!isFlexible && (
                    <>
                      <Flex gap="3">
                        <Box style={{ flex: 1 }}>
                          <Text as="label" size="2" weight="bold" mb="1">
                            Start Date
                          </Text>
                          <input
                            type="date"
                            value={
                              item.startDate
                                ? new Date(item.startDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "startDate",
                                e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : ""
                              )
                            }
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

                        <Box style={{ flex: 1 }}>
                          <Text as="label" size="2" weight="bold" mb="1">
                            End Date
                          </Text>
                          <input
                            type="date"
                            value={
                              item.endDate
                                ? new Date(item.endDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              updateItem(
                                index,
                                "endDate",
                                e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : ""
                              )
                            }
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

                      <Flex gap="3">
                        <Box style={{ flex: 1 }}>
                          <Text as="label" size="2" weight="bold" mb="1">
                            Start Time
                          </Text>
                          <input
                            type="time"
                            value={item.startTime || ""}
                            onChange={(e) =>
                              updateItem(index, "startTime", e.target.value)
                            }
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

                        <Box style={{ flex: 1 }}>
                          <Text as="label" size="2" weight="bold" mb="1">
                            End Time
                          </Text>
                          <input
                            type="time"
                            value={item.endTime || ""}
                            onChange={(e) =>
                              updateItem(index, "endTime", e.target.value)
                            }
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
                    </>
                  )}

                  <Flex gap="3">
                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="bold" mb="1">
                        Standard Price *
                      </Text>
                      <input
                        type="number"
                        value={item.standardPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "standardPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        min="0"
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

                    <Box style={{ flex: 1 }}>
                      <Text as="label" size="2" weight="bold" mb="1">
                        Discounted Price
                      </Text>
                      <input
                        type="number"
                        value={item.discountedPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "discountedPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0"
                        min="0"
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

                  <Box>
                    <Text as="label" size="2" weight="bold" mb="1">
                      Course Title URL *
                    </Text>
                    <input
                      type="url"
                      value={item.courseTitleUrl}
                      onChange={(e) =>
                        updateItem(index, "courseTitleUrl", e.target.value)
                      }
                      placeholder="https://example.com/course"
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
                      Booking URL *
                    </Text>
                    <input
                      type="url"
                      value={item.bookingUrl}
                      onChange={(e) =>
                        updateItem(index, "bookingUrl", e.target.value)
                      }
                      placeholder="https://example.com/enroll-now"
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
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
