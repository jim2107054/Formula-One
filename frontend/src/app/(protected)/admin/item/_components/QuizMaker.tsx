"use client";

import { Box, Flex, Select, Text, TextArea, TextField } from "@radix-ui/themes";
import { useState } from "react";
import toast from "react-hot-toast";
import { BiCollapse, BiPlus, BiTrash } from "react-icons/bi";
import { Button } from "../../_components/button";
import { InputLabel } from "../../_components/input-label";
import { MdEditSquare } from "react-icons/md";

interface ChoiceAnswer {
  label: string;
  is_correct: boolean;
  explanation?: string;
}

interface MatchingAnswer {
  left: string;
  right: string;
}

type Answer = ChoiceAnswer | MatchingAnswer;

interface QuizQuestion {
  question: string;
  media_url?: string;
  answer_type: number;
  answers: Answer[];
}

interface QuizMakerProps {
  quizzes: QuizQuestion[];
  onChange: (quizzes: QuizQuestion[]) => void;
}

export default function QuizMaker({ quizzes, onChange }: QuizMakerProps) {
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null);

  const addNewQuiz = () => {
    const newQuiz: QuizQuestion = {
      question: "",
      answer_type: 2,
      answers: [
        { label: "", is_correct: false, explanation: "" },
        { label: "", is_correct: false, explanation: "" },
      ] as ChoiceAnswer[],
    };
    onChange([...quizzes, newQuiz]);
    setExpandedQuiz(quizzes.length);
  };

  const removeQuiz = (index: number) => {
    const updated = quizzes.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedQuiz === index) {
      setExpandedQuiz(null);
    }
  };

  const updateQuiz = (
    index: number,
    field: keyof QuizQuestion,
    value: unknown
  ) => {
    const updated = [...quizzes];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "answer_type") {
      const answerType = value as number;
      if (answerType === 3) {
        // Matching question: left-right pairs
        updated[index].answers = [
          { left: "", right: "" },
          { left: "", right: "" },
        ] as MatchingAnswer[];
      } else if (answerType === 2) {
        // Choice question: label, is_correct, explanation
        updated[index].answers = [
          { label: "", is_correct: false, explanation: "" },
          { label: "", is_correct: false, explanation: "" },
        ] as ChoiceAnswer[];
      }
    }

    onChange(updated);
  };

  const addAnswer = (quizIndex: number) => {
    const updated = [...quizzes];
    const quiz = updated[quizIndex];

    if (quiz.answer_type === 3) {
      // Matching question
      (quiz.answers as MatchingAnswer[]).push({ left: "", right: "" });
    } else {
      // Choice question
      (quiz.answers as ChoiceAnswer[]).push({
        label: "",
        is_correct: false,
        explanation: "",
      });
    }
    onChange(updated);
  };

  const removeAnswer = (quizIndex: number, answerIndex: number) => {
    const updated = [...quizzes];
    const quiz = updated[quizIndex];

    if (quiz.answers.length <= 2) {
      toast.error("A question must have at least 2 answers");
      return;
    }

    quiz.answers = quiz.answers.filter((_, i) => i !== answerIndex);
    onChange(updated);
  };

  const updateAnswer = (
    quizIndex: number,
    answerIndex: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = [...quizzes];
    const quiz = updated[quizIndex];

    if (quiz.answer_type === 2) {
      // Choice question
      const answers = quiz.answers as ChoiceAnswer[];
      if (field === "is_correct") {
        // Allow multiple correct answers for choice questions
        answers[answerIndex] = {
          ...answers[answerIndex],
          is_correct: value as boolean,
        };
      } else if (field === "label") {
        answers[answerIndex] = {
          ...answers[answerIndex],
          label: value as string,
        };
      } else if (field === "explanation") {
        answers[answerIndex] = {
          ...answers[answerIndex],
          explanation: value as string,
        };
      }
    } else if (quiz.answer_type === 3) {
      // Matching question
      const answers = quiz.answers as MatchingAnswer[];
      if (field === "left") {
        answers[answerIndex] = {
          ...answers[answerIndex],
          left: value as string,
        };
      } else if (field === "right") {
        answers[answerIndex] = {
          ...answers[answerIndex],
          right: value as string,
        };
      }
    }

    onChange(updated);
  };

  const getAnswerTypeLabel = (type: number) => {
    switch (type) {
      case 2:
        return "Choice Question";
      case 3:
        return "Matching Question";
      default:
        return "Unknown";
    }
  };

  const validateQuiz = (quiz: QuizQuestion): string | null => {
    if (!quiz.question.trim()) {
      return "Question text is required";
    }
    if (quiz.answers.length < 2) {
      return "At least 2 answers are required";
    }

    if (quiz.answer_type === 2) {
      // Choice question validation
      const choiceAnswers = quiz.answers as ChoiceAnswer[];
      if (choiceAnswers.some((ans) => !ans.label.trim())) {
        return "All answer labels must have text";
      }
      if (!choiceAnswers.some((ans) => ans.is_correct)) {
        return "At least one answer must be marked as correct";
      }
    } else if (quiz.answer_type === 3) {
      // Matching question validation
      const matchingAnswers = quiz.answers as MatchingAnswer[];
      if (
        matchingAnswers.some((ans) => !ans.left.trim() || !ans.right.trim())
      ) {
        return "All matching pairs must have both left and right values";
      }
    }

    return null;
  };

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="4" weight="bold">
          Quiz Questions ({quizzes.length})
        </Text>
        <Button type="button" onClick={addNewQuiz}>
          <BiPlus size={18}/>
          Add Question
        </Button>
      </Flex>

      {quizzes.length === 0 && (
        <Box
          style={{
            padding: "2rem",
            textAlign: "center",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            color: "#666",
          }}
        >
          <Text>
            No questions yet. Click &quot;Add Question&quot; to create your
            first quiz question.
          </Text>
        </Box>
      )}

      <Flex direction="column" gap="3">
        {quizzes.map((quiz, quizIndex) => {
          const isExpanded = expandedQuiz === quizIndex;
          const validationError = validateQuiz(quiz);

          return (
            <Box
              key={quizIndex}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: isExpanded ? "#f9f9f9" : "white",
              }}
            >
              <Flex
                justify="between"
                align="center"
                mb={isExpanded ? "4" : "0"}
                gap="2"
                style={{ flexWrap: "wrap" }}
              >
                <Flex
                  align="start"
                  gap="3"
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Text weight="bold" size="2" style={{ flexShrink: 0 }}>
                    Q{quizIndex + 1}
                  </Text>
                  <Text
                    size="2"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      wordBreak: "break-word",
                    }}
                  >
                    {quiz.question || "(Empty question)"}
                  </Text>
                  <Text
                    size="1"
                    style={{ color: "#666", flexShrink: 0, display: "none" }}
                    className="sm:block"
                  >
                    {getAnswerTypeLabel(quiz.answer_type)}
                  </Text>
                  {validationError && (
                    <Text size="1" style={{ color: "red", flexShrink: 0 }}>
                      ⚠️
                    </Text>
                  )}
                </Flex>
                <Flex gap="2" style={{ flexShrink: 0 }}>
                  <Button
                    type="button"
                    onClick={() =>
                      setExpandedQuiz(isExpanded ? null : quizIndex)
                    }
                  >
                    {isExpanded ? <BiCollapse /> : <MdEditSquare />}
                    {isExpanded ? "Collapse" : "Edit"}
                  </Button>
                  <Button
                    type="button"
                    variant="danger-outline"
                    onClick={() => removeQuiz(quizIndex)}
                  >
                    <BiTrash />
                  </Button>
                </Flex>
              </Flex>

              {isExpanded && (
                <Box mt="4">
                  {validationError && (
                    <Box
                      mb="3"
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#fff3cd",
                        borderRadius: "4px",
                        color: "#856404",
                      }}
                    >
                      <Text size="2">⚠️ {validationError}</Text>
                    </Box>
                  )}

                  <Flex direction="column" gap="4">
                    <Box>
                      <Text as="label" size="2" weight="bold" mb="1">
                        Question Type
                      </Text>
                      <Select.Root
                        value={String(quiz.answer_type)}
                        onValueChange={(val) =>
                          updateQuiz(quizIndex, "answer_type", parseInt(val))
                        }
                      >
                        <Select.Trigger style={{ width: "100%" }} />
                        <Select.Content>
                          <Select.Item value="2">
                            Choice Question (Single/Multiple correct answers)
                          </Select.Item>
                          <Select.Item value="3">
                            Matching Question (Left-Right pairs)
                          </Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box>
                      <InputLabel required>Question</InputLabel>
                      <TextArea
                        placeholder="Enter your question here..."
                        value={quiz.question}
                        onChange={(e) =>
                          updateQuiz(quizIndex, "question", e.target.value)
                        }
                        rows={3}
                        style={{ width: "100%" }}
                      />
                    </Box>

                    <Box>
                      <Flex justify="between" align="center" mb="2">
                        <InputLabel required>
                          {quiz.answer_type === 3
                            ? "Matching Pairs"
                            : "Answer Options"}
                        </InputLabel>
                        <Button
                          type="button"
                          onClick={() => addAnswer(quizIndex)}
                        >
                          <BiPlus className="mr-1" />
                          {quiz.answer_type === 3 ? "Add Pair" : "Add Answer"}
                        </Button>
                      </Flex>

                      <Flex direction="column" gap="2">
                        {quiz.answer_type === 2
                          ? // Choice Question Answers
                            (quiz.answers as ChoiceAnswer[]).map(
                              (answer, answerIndex) => (
                                <Box key={answerIndex}>
                                  <Flex
                                    gap="2"
                                    align="start"
                                    style={{ flexWrap: "wrap" }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={answer.is_correct}
                                      onChange={(e) =>
                                        updateAnswer(
                                          quizIndex,
                                          answerIndex,
                                          "is_correct",
                                          e.target.checked
                                        )
                                      }
                                      style={{
                                        flexShrink: 0,
                                        marginTop: "8px",
                                      }}
                                    />
                                    <Box style={{ flex: 1, minWidth: "200px" }}>
                                      <TextField.Root
                                        placeholder={`Answer ${
                                          answerIndex + 1
                                        }`}
                                        value={answer.label}
                                        onChange={(e) =>
                                          updateAnswer(
                                            quizIndex,
                                            answerIndex,
                                            "label",
                                            e.target.value
                                          )
                                        }
                                        style={{ width: "100%" }}
                                      />
                                    </Box>
                                    {quiz.answers.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="danger-outline"
                                        onClick={() =>
                                          removeAnswer(quizIndex, answerIndex)
                                        }
                                        style={{ flexShrink: 0 }}
                                      >
                                        <BiTrash />
                                      </Button>
                                    )}
                                  </Flex>
                                  <Box ml="6" mt="1">
                                    <TextField.Root
                                      placeholder="Explanation (optional)"
                                      value={answer.explanation || ""}
                                      onChange={(e) =>
                                        updateAnswer(
                                          quizIndex,
                                          answerIndex,
                                          "explanation",
                                          e.target.value
                                        )
                                      }
                                      style={{
                                        fontSize: "12px",
                                        width: "100%",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              )
                            )
                          : quiz.answer_type === 3
                          ? // Matching Question Pairs
                            (quiz.answers as MatchingAnswer[]).map(
                              (answer, answerIndex) => (
                                <Flex key={answerIndex} gap="2" align="center">
                                  <TextField.Root
                                    placeholder={`Left ${answerIndex + 1}`}
                                    value={answer.left}
                                    onChange={(e) =>
                                      updateAnswer(
                                        quizIndex,
                                        answerIndex,
                                        "left",
                                        e.target.value
                                      )
                                    }
                                    style={{ flex: 1 }}
                                  />
                                  <Text size="2" style={{ flexShrink: 0 }}>
                                    →
                                  </Text>
                                  <TextField.Root
                                    placeholder={`Right ${answerIndex + 1}`}
                                    value={answer.right}
                                    onChange={(e) =>
                                      updateAnswer(
                                        quizIndex,
                                        answerIndex,
                                        "right",
                                        e.target.value
                                      )
                                    }
                                    style={{ flex: 1 }}
                                  />
                                  {quiz.answers.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="danger-outline"
                                      onClick={() =>
                                        removeAnswer(quizIndex, answerIndex)
                                      }
                                    >
                                      <BiTrash />
                                    </Button>
                                  )}
                                </Flex>
                              )
                            )
                          : null}
                      </Flex>
                      <Text
                        size="1"
                        style={{ color: "#666", marginTop: "0.5rem" }}
                      >
                        {quiz.answer_type === 2
                          ? "Check all correct answers. Add explanations for feedback (optional)."
                          : quiz.answer_type === 3
                          ? "Create matching pairs. Left items will be shuffled, students match them to right items."
                          : ""}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              )}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
