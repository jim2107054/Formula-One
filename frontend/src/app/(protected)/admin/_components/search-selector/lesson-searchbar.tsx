"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { useInView } from "react-intersection-observer";

import {
  useLessonsInfinite,
  useLesson as useLessonQuery,
} from "@/hooks/queries/useLessonQueries";
import { Lesson } from "@/zustand/types/lesson";

interface LessonSearchProps {
  value?: string;
  onSelectLesson: (id: string) => void;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
  currentLessonTitle?: string;
  sectionId?: string;
  courseId?: string;
}

const LessonSearch = memo(function LessonSearch({
  value,
  onSelectLesson,
  placeholder = "Search by lesson",
  width = "300px",
  disabled = false,
  currentLessonTitle,
  sectionId,
  courseId,
}: LessonSearchProps) {
  /* -------------------- state -------------------- */
  const [inputText, setInputText] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  /* -------------------- debounce -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(inputText.trim()), 300);
    return () => clearTimeout(timer);
  }, [inputText]);

  /* -------------------- fetch lessons (infinite scroll) -------------------- */
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useLessonsInfinite(
      {
        limit: 20,
        search: debouncedTerm || undefined,
        sectionId: sectionId || undefined,
        courseId: courseId || undefined,
      },
      {
        enabled: isOpen,
      }
    );

  const lessons: Lesson[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  /* -------------------- selected lesson fallback -------------------- */
  const { data: selectedLessonData } = useLessonQuery(value || "", {
    enabled: !!value && !lessons.some((l) => l._id === value),
  });

  const selectedLesson = useMemo(() => {
    if (!value) return null;
    return (
      lessons.find((l) => l._id === value) ??
      (selectedLessonData?._id === value ? selectedLessonData : null)
    );
  }, [value, lessons, selectedLessonData]);

  /* -------------------- sync input label -------------------- */
  const displayText = selectedLesson?.title ?? currentLessonTitle ?? "";
  useEffect(() => {
    if (!isTyping) setInputText(displayText);
  }, [displayText, isTyping]);

  /* -------------------- handlers -------------------- */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
      setIsTyping(true);
      setIsOpen(true);
      setHighlightedIndex(-1);
    },
    []
  );

  const handleSelectLesson = useCallback(
    (lesson: Lesson) => {
      onSelectLesson(lesson._id);
      setInputText(lesson.title);
      setIsTyping(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelectLesson]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || lessons.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % lessons.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) => (i <= 0 ? lessons.length - 1 : i - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0)
            handleSelectLesson(lessons[highlightedIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, lessons, highlightedIndex, handleSelectLesson]
  );

  /* -------------------- infinite scroll -------------------- */
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetching) fetchNextPage();
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  return (
    <Box style={{ position: "relative", width }}>
      <Flex align="center">
        <TextField.Root
          ref={inputRef}
          placeholder={placeholder}
          disabled={disabled}
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={handleKeyDown}
          className="flex-1 !rounded-tr-none !rounded-br-none !border-r-none"
        />

        {value && !disabled ? (
          <Button className="!bg-accent !rounded-l-none">
            <MdOutlineCancel
              size={16}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLesson("");
                setInputText("");
                setIsTyping(false);
                setIsOpen(false);
              }}
            />
          </Button>
        ) : (
          <Button className="!bg-accent !rounded-l-none !cursor-pointer">
            {isLoading ? (
              <ImSpinner3 className="animate-spin" />
            ) : (
              <FaSearch size={15} />
            )}
          </Button>
        )}
      </Flex>

      {isOpen && (
        <Box
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 2,
            maxHeight: 300,
            overflowY: "auto",
            background: "var(--color-background)",
            border: "1px solid var(--gray-6)",
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            zIndex: 1000,
          }}
        >
          {isLoading ? (
            <Flex p="3" justify="center">
              <ImSpinner3 className="animate-spin" />
            </Flex>
          ) : lessons.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                No lessons found
              </Text>
            </Box>
          ) : (
            <>
              {lessons.map((lesson, i) => (
                <Box
                  key={lesson._id}
                  role="option"
                  aria-selected={lesson._id === value}
                  p="3"
                  style={{
                    cursor: "pointer",
                    background:
                      i === highlightedIndex
                        ? "var(--gray-3)"
                        : lesson._id === value
                        ? "var(--blue-3)"
                        : "transparent",
                    borderBottom: "1px solid var(--gray-4)",
                  }}
                  onMouseDown={() => handleSelectLesson(lesson)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  <Text size="2" weight="medium">
                    {lesson.title}
                  </Text>
                </Box>
              ))}

              {isFetching && (
                <Flex p="3" justify="center">
                  <ImSpinner3 className="animate-spin" />
                </Flex>
              )}

              {hasNextPage && !isFetching && (
                <div ref={loadMoreRef} style={{ height: 1 }} />
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
});

export default LessonSearch;
