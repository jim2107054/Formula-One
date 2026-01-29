"use client";

import TipTapEditor from "@/components/common/TipTapEditor";
import { GeneratedQuestion } from "@/services/quiz.service";
import { CreateItemRequest } from "@/zustand/types/item";
import { Lesson } from "@/zustand/types/lesson";
import {
  Box,
  Checkbox,
  Flex,
  RadioGroup,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import AIQuizGeneratorModal from "./AIQuizGeneratorModal";
import QuizMaker from "./QuizMaker";
import { InputLabel } from "../../_components/input-label";

interface ChoiceAnswer {
  label: string;
  is_correct: boolean;
  explanation?: string;
}

interface MatchingAnswer {
  left: string;
  right: string;
}

interface QuizQuestion {
  question: string;
  media_url?: string;
  answer_type: number;
  answers: (ChoiceAnswer | MatchingAnswer)[];
}

interface ItemFormProps {
  formData: Partial<Omit<CreateItemRequest, "lessonId">>;
  onChange: (
    field: keyof Omit<CreateItemRequest, "lessonId">,
    value: Omit<CreateItemRequest, "lessonId">[keyof Omit<
      CreateItemRequest,
      "lessonId"
    >]
  ) => void;
  lessons?: Lesson[];
  courseTitle?: string;
  sectionTitle?: string;
  lessonTitle?: string;
}

export default function ItemForm({
  formData,
  onChange,
  courseTitle,
  sectionTitle,
  lessonTitle,
}: ItemFormProps) {
  type ResourceType = "file" | "link" | "text" | "video";
  const [resourceType, setResourceType] = useState<ResourceType>("file");

  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    const mt = formData.content?.mediaType as ResourceType | undefined;
    if (!mt) return;

    if (["file", "link", "text", "video"].includes(mt)) {
      setResourceType(mt);
    } else {
      setResourceType("file");
      onChange("content", {
        ...formData.content,
        mediaType: "file",
      });
    }
  }, [formData.content?.mediaType, formData.content, onChange]);

  const handleAIQuestionsGenerated = (questions: GeneratedQuestion[]) => {
    const transformedQuestions = questions.map((q) => ({
      question: q.question,
      media_url: "",
      answer_type: q.answer_type === "2" ? 2 : 3,
      answers: q.answers.map((ans) => {
        if ("label" in ans) {
          return {
            label: ans.label || "",
            is_correct: ans.is_correct || false,
            explanation: ans.explanation || "",
          };
        }
        return {
          left: ans.left || "",
          right: ans.right || "",
        };
      }),
    }));

    const existingQuizzes = (formData.content?.quizzes as QuizQuestion[]) || [];
    onChange("content", {
      ...formData.content,
      quizzes: [...existingQuizzes, ...transformedQuestions],
    });
  };

  const itemTypes = [
    { value: "resource", label: "Resource" },
    { value: "exam", label: "Exam" },
  ];

  return (
    <Box>
      <Flex direction="column" gap="4" mt="4">
        <Box>
          <InputLabel required>Item Title</InputLabel>
          <TextField.Root
            type="text"
            value={formData.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Enter item title"
            required
          />
        </Box>

        <Box>
          <InputLabel>Description</InputLabel>
          <TipTapEditor
            value={formData.description || ""}
            onChange={(value: string) => onChange("description", value)}
            placeholder="Enter item description..."
            height={200}
          />
        </Box>

        <Box>
          <InputLabel>Status</InputLabel>
          <RadioGroup.Root
            value={formData.isPublished ? "published" : "draft"}
            onValueChange={(value) =>
              onChange("isPublished", value === "published")
            }
            size="2"
            variant="surface"
            color="cyan"
          >
            <Flex gap="4">
              <Text as="label" size="2" className="!cursor-pointer">
                <Flex gap="2">
                  <RadioGroup.Item value="draft" className="!cursor-pointer" />
                  Draft
                </Flex>
              </Text>
              <Text as="label" size="2" className="!cursor-pointer">
                <Flex gap="2">
                  <RadioGroup.Item
                    value="published"
                    className="!cursor-pointer"
                  />
                  Published
                </Flex>
              </Text>
            </Flex>
          </RadioGroup.Root>
        </Box>

        <Box>
          <InputLabel>Item Type</InputLabel>
          <Select.Root
            value={formData.type || ""}
            onValueChange={(value) => {
              if (value && value !== formData.type) {
                onChange("type", value);
                if (formData.type) {
                  onChange("content", {});
                }
              }
            }}
          >
            <Select.Trigger
              placeholder="Select item type"
              className="!cursor-pointer"
            />
            <Select.Content>
              {itemTypes.map((type) => (
                <Select.Item
                  key={type.value}
                  value={type.value}
                  className="hover:!bg-accent !cursor-pointer"
                >
                  {type.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Box>

        {formData.type === "resource" && (
          <Flex direction="column" gap="4">
            <Box>
              <InputLabel>Resource Type</InputLabel>
              <Select.Root
                value={
                  (formData.content?.mediaType as
                    | "file"
                    | "link"
                    | "text"
                    | "video") || resourceType
                }
                onValueChange={(value: "file" | "link" | "text" | "video") => {
                  setResourceType(value);
                  onChange("content", {
                    ...formData.content,
                    mediaType: value,
                  });
                }}
              >
                <Select.Trigger
                  placeholder="Select resource type"
                  className="!cursor-pointer"
                />
                <Select.Content>
                  <Select.Item
                    value="file"
                    className="hover:!bg-accent !cursor-pointer"
                  >
                    File
                  </Select.Item>
                  <Select.Item
                    value="link"
                    className="hover:!bg-accent !cursor-pointer"
                  >
                    Link
                  </Select.Item>
                  <Select.Item
                    value="text"
                    className="hover:!bg-accent !cursor-pointer"
                  >
                    Text
                  </Select.Item>
                  <Select.Item
                    value="video"
                    className="hover:!bg-accent !cursor-pointer"
                  >
                    Video
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            {resourceType === "file" && (
              <>
                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    Upload File
                  </Text>

                  {formData.content?.url && (
                    <Box
                      mb="2"
                      p="3"
                      style={{
                        backgroundColor: "var(--gray-2)",
                        borderRadius: "6px",
                        border: "1px solid var(--gray-4)",
                      }}
                    >
                      <Flex direction="column" gap="2">
                        <Text size="2" weight="bold" color="gray">
                          Current File:
                        </Text>
                        <Flex align="center" gap="2">
                          <Text size="2" style={{ wordBreak: "break-all" }}>
                            {formData.content.fileName || "File"}
                          </Text>
                          {formData.content.url && (
                            <a
                              href={formData.content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--accent-9)",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              View
                            </a>
                          )}
                        </Flex>
                        {formData.content.fileExtension && (
                          <Text size="1" color="gray">
                            Type: {formData.content.fileExtension.toUpperCase()}
                            {formData.content.fileSize &&
                              ` • Size: ${(
                                formData.content.fileSize / 1024
                              ).toFixed(1)} KB`}
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  )}

                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange("content", {
                          ...formData.content,
                          resource: file,
                          fileName: file.name,
                          fileSize: file.size,
                          fileExtension: file.name.split(".").pop(),
                          mediaType: "file",
                        });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid var(--gray-6)",
                      borderRadius: "4px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                  {formData.content?.fileName && !formData.content?.url && (
                    <Text
                      size="1"
                      style={{ marginTop: "4px", color: "var(--gray-11)" }}
                    >
                      Selected: {formData.content.fileName}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    File Name
                  </Text>
                  <input
                    type="text"
                    value={formData.content?.fileName || ""}
                    onChange={(e) =>
                      onChange("content", {
                        ...formData.content,
                        fileName: e.target.value,
                      })
                    }
                    placeholder="Enter file name"
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
                  <Flex align="center" gap="2">
                    <Checkbox
                      checked={!!formData.content?.downloadable}
                      onCheckedChange={(checked) =>
                        onChange("content", {
                          ...formData.content,
                          downloadable: checked === true,
                        })
                      }
                      color="cyan"
                    />
                    <Text as="label" size="2">
                      Allow users to download this file
                    </Text>
                  </Flex>
                </Box>
              </>
            )}

            {(["link", "video"].includes(
              formData.content?.mediaType as string
            ) ||
              ["link", "video"].includes(resourceType)) && (
              <>
                <Box>
                  <InputLabel>URL</InputLabel>
                  <input
                    type="url"
                    value={formData.content?.url || ""}
                    onChange={(e) =>
                      onChange("content", {
                        ...formData.content,
                        url: e.target.value,
                        mediaType: resourceType,
                      })
                    }
                    placeholder="https://example.com"
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
                  <Text
                    as="label"
                    size="2"
                    weight="bold"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    File Name / Title
                  </Text>
                  <input
                    type="text"
                    value={formData.content?.fileName || ""}
                    onChange={(e) =>
                      onChange("content", {
                        ...formData.content,
                        fileName: e.target.value,
                      })
                    }
                    placeholder="Enter a display name"
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
              </>
            )}

            {((formData.content?.mediaType as string) === "text" ||
              resourceType === "text") && (
              <Box>
                <InputLabel>Text Content</InputLabel>
                <TipTapEditor
                  value={formData.content?.text || ""}
                  onChange={(value: string) =>
                    onChange("content", {
                      ...formData.content,
                      text: value,
                      mediaType: "text",
                    })
                  }
                  placeholder="Enter your text content here..."
                  height={400}
                />
              </Box>
            )}
          </Flex>
        )}

        {formData.type === "exam" && (
          <Flex direction="column" gap="4">
            <Box>
              <Text
                as="label"
                size="2"
                weight="bold"
                mb="2"
                style={{ display: "block" }}
              >
                Exam Type
              </Text>
              <Select.Root
                value={(formData.content?.examType as string) || "quiz"}
                onValueChange={(value) =>
                  onChange("content", {
                    ...formData.content,
                    examType: value as "quiz" | "assignment",
                  })
                }
              >
                <Select.Trigger
                  placeholder="Select exam type"
                  className="!cursor-pointer"
                />
                <Select.Content>
                  <Select.Item
                    value="quiz"
                    className="hover:!bg-accent !cursor-pointer"
                  >
                    Quiz
                  </Select.Item>
                  <Select.Item
                    value="assignment"
                    disabled
                    className="!cursor-not-allowed"
                  >
                    Assignment (Coming Soon)
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <InputLabel>Exam Title</InputLabel>
              <TextField.Root
                type="text"
                value={formData.content?.examTitle || ""}
                onChange={(e) =>
                  onChange("content", {
                    ...formData.content,
                    examTitle: e.target.value,
                  })
                }
                placeholder="Enter exam title"
                style={{
                  width: "100%",
                  border: "1px solid var(--gray-6)",
                  borderRadius: "4px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />
            </Box>

            <Box>
              <InputLabel>Exam Description</InputLabel>
              <TipTapEditor
                value={formData.content?.examDesc || ""}
                onChange={(value: string) =>
                  onChange("content", { ...formData.content, examDesc: value })
                }
                placeholder="Enter exam description..."
                height={200}
              />
            </Box>

            <Box
              style={{
                padding: "16px",
                backgroundColor: "var(--gray-2)",
                borderRadius: "8px",
                border: "1px solid var(--gray-4)",
              }}
            >
              <Flex justify="between" align="center" mb="3">
                <Text size="3" weight="bold">
                  Quiz Questions
                </Text>
                <button
                  type="button"
                  onClick={() => setShowAIModal(true)}
                  style={{
                    padding: "8px 16px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(102, 126, 234, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      animation: "sparkle 2s ease-in-out infinite",
                    }}
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span>Generate with AI</span>
                  <style>{`
                    @keyframes sparkle {
                      0%, 100% { 
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                      }
                      50% { 
                        opacity: 0.8;
                        transform: scale(1.1) rotate(5deg);
                      }
                    }
                  `}</style>
                </button>
              </Flex>
              <QuizMaker
                quizzes={(formData.content?.quizzes as QuizQuestion[]) || []}
                onChange={(quizzes) =>
                  onChange("content", {
                    ...formData.content,
                    quizzes,
                  })
                }
              />
            </Box>
          </Flex>
        )}
      </Flex>

      <AIQuizGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onQuestionsGenerated={handleAIQuestionsGenerated}
        defaultTopic={
          courseTitle || formData.content?.examTitle || formData.title || ""
        }
        defaultContext={
          sectionTitle && lessonTitle
            ? `${sectionTitle} > ${lessonTitle}`
            : formData.description || ""
        }
      />
    </Box>
  );
}
