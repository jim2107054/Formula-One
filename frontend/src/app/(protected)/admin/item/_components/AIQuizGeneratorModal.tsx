"use client";

import { Button } from "@/app/(protected)/admin/_components/button";
import { Icon } from "@/components/ui";
import quizService, {
  AIQuizGenerationRequest,
  GeneratedQuestion,
} from "@/services/quiz.service";
import { Box, Dialog, Flex, Select, Text, TextArea } from "@radix-ui/themes";
import { useState } from "react";
import toast from "react-hot-toast";
import { BiX } from "react-icons/bi";
import { RiSparklingFill } from "react-icons/ri";

interface AIQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
  defaultTopic?: string;
  defaultContext?: string;
}

export default function AIQuizGeneratorModal({
  isOpen,
  onClose,
  onQuestionsGenerated,
  defaultTopic = "",
  defaultContext = "",
}: AIQuizGeneratorModalProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [context, setContext] = useState(defaultContext);
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [matchingCount, setMatchingCount] = useState(1);
  const [language, setLanguage] = useState("en");
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please provide a topic for quiz generation");
      return;
    }

    setIsGenerating(true);

    try {
      const multipleChoiceCount = Math.max(questionCount - matchingCount, 0);

      const payload: AIQuizGenerationRequest = {
        topic: topic.trim(),
        context: context.trim() || undefined,
        difficulty,
        questionCount,
        matchingCount,
        language,
        includeExplanations,
        questionPlan: [
          ...(multipleChoiceCount > 0
            ? [{ answer_type: "2", count: multipleChoiceCount }]
            : []),
          ...(matchingCount > 0
            ? [{ answer_type: "3", count: matchingCount }]
            : []),
        ],
        temperature: 0.2,
      };

      const response = await quizService.generateQuizWithAI(payload);

      if (response.success && response.data?.questions) {
        onQuestionsGenerated(response.data.questions);
        toast.success(
          `Successfully generated ${response.data.questions.length} questions!`
        );
        onClose();
      } else {
        toast.error("Failed to generate questions. Please try again.");
      }
    } catch (error) {
      console.error("AI Quiz Generation Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate quiz questions"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 600 }}>
        {isGenerating ? (
          <Box style={{ padding: "3rem", textAlign: "center" }}>
            <Flex direction="column" align="center" gap="3">
              <Box
                style={{ position: "relative", width: "60px", height: "60px" }}
              >
                <Icon
                  name="circle-loading"
                  className="animate-spin size-[60px]"
                />
                <Icon
                  name="brain"
                  className="size-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Box>
              <Text size="2" color="gray">
                Generating quiz questions...
              </Text>
            </Flex>
          </Box>
        ) : (
          <>
            <Dialog.Title>
              <Flex align="center" gap="2">
                <RiSparklingFill size={20} />
                Generate Quiz with AI
              </Flex>
            </Dialog.Title>

            <Dialog.Description size="2" mb="4">
              Configure the parameters to generate quiz questions using AI. The
              generated questions will be added to your quiz.
            </Dialog.Description>

            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="bold" mb="2">
                  Topic <span style={{ color: "var(--red-9)" }}>*</span>
                </Text>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., COVID-19 global impact"
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
                <Text as="label" size="2" weight="bold" mb="2">
                  Context
                </Text>
                <TextArea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., Course: Infectious Diseases > Pandemic Response"
                  rows={2}
                />
                <Text size="1" color="gray" mt="1">
                  Provide course/section/lesson context for better relevance
                </Text>
              </Box>

              <Flex gap="4">
                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Difficulty
                  </Text>
                  <Select.Root
                    value={difficulty}
                    onValueChange={(val) =>
                      setDifficulty(
                        val as "beginner" | "intermediate" | "advanced"
                      )
                    }
                  >
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content>
                      <Select.Item value="beginner">Beginner</Select.Item>
                      <Select.Item value="intermediate">
                        Intermediate
                      </Select.Item>
                      <Select.Item value="advanced">Advanced</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Language
                  </Text>
                  <Select.Root value={language} onValueChange={setLanguage}>
                    <Select.Trigger style={{ width: "100%" }} />
                    <Select.Content>
                      <Select.Item value="en">English</Select.Item>
                      <Select.Item value="es">Spanish</Select.Item>
                      <Select.Item value="fr">French</Select.Item>
                      <Select.Item value="de">German</Select.Item>
                      <Select.Item value="ar">Arabic</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Flex>

              <Flex gap="4">
                <Box style={{ flex: 1 }}>
                  <Text as="label" size="2" weight="bold" mb="2">
                    Total Questions
                  </Text>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(
                        Math.min(20, Math.max(2, +e.target.value))
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
                  <Text as="label" size="2" weight="bold" mb="2">
                    Matching Questions
                  </Text>
                  <input
                    type="number"
                    min="0"
                    max={questionCount}
                    value={matchingCount}
                    onChange={(e) =>
                      setMatchingCount(
                        Math.min(questionCount, Math.max(0, +e.target.value))
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

              <Box>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeExplanations}
                    onChange={(e) => setIncludeExplanations(e.target.checked)}
                  />
                  <Text size="2">Include explanations for answers</Text>
                </label>
              </Box>

              <Box
                p="3"
                style={{
                  backgroundColor: "var(--gray-2)",
                  borderRadius: "6px",
                  border: "1px solid var(--gray-4)",
                }}
              >
                <Text size="2" weight="bold" mb="2">
                  Generation Summary
                </Text>
                <Text size="1" color="gray">
                  <br />• {questionCount - matchingCount} Multiple Choice
                  Questions
                  <br />• {matchingCount} Matching Questions
                  <br />• Difficulty: {difficulty}
                  <br />• Language: {language}
                </Text>
              </Box>
            </Flex>

            <Flex gap="3" mt="5" justify="end">
              <Dialog.Close>
                <Button variant="light" disabled={isGenerating}>
                  <BiX className="mr-1" />
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
              >
                <RiSparklingFill className="mr-1" />
                {isGenerating ? "Generating..." : "Generate Questions"}
              </Button>
            </Flex>
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
