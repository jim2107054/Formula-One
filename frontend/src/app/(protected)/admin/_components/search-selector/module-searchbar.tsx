"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { useInView } from "react-intersection-observer";

import {
  useCoursesInfinite,
  useCourse as useCourseQuery,
} from "@/hooks/queries/useCourseQueries";
import { Course } from "@/zustand/types/course";

interface ModuleSearchProps {
  value?: string;
  onSelectModule: (id: string) => void;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
  currentModuleTitle?: string;
}

const ModuleSearch = memo(function ModuleSearch({
  value,
  onSelectModule,
  placeholder = "Search by module",
  width = "300px",
  disabled = false,
  currentModuleTitle,
}: ModuleSearchProps) {
  const [inputText, setInputText] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(inputText.trim()), 300);
    return () => clearTimeout(timer);
  }, [inputText]);

  /* -------------------- fetch courses (infinite scroll) -------------------- */
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useCoursesInfinite(
      {
        limit: 10,
        search: debouncedTerm || undefined,
      },
      {
        enabled: isOpen,
      }
    );

  const courses: Course[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  /* -------------------- selected course fallback -------------------- */
  const { data: selectedCourseData } = useCourseQuery(value || "", {
    enabled: !!value && !courses.some((c) => c._id === value),
  });

  const selectedCourse = useMemo(() => {
    if (!value) return null;
    return (
      courses.find((c) => c._id === value) ??
      (selectedCourseData?._id === value ? selectedCourseData : null)
    );
  }, [value, courses, selectedCourseData]);

  /* -------------------- sync input label -------------------- */
  const displayText = selectedCourse?.title ?? currentModuleTitle ?? "";
  useEffect(() => {
    if (!isTyping) setInputText(displayText);
  }, [displayText, isTyping]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
      setIsTyping(true);
      setIsOpen(true);
      setHighlightedIndex(-1);
    },
    []
  );

  const handleSelectModule = useCallback(
    (course: Course) => {
      onSelectModule(course._id);
      setInputText(course.title);
      setIsTyping(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelectModule]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || courses.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % courses.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) => (i <= 0 ? courses.length - 1 : i - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0)
            handleSelectModule(courses[highlightedIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, courses, highlightedIndex, handleSelectModule]
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
                onSelectModule("");
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
          ) : courses.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                No courses found
              </Text>
            </Box>
          ) : (
            <>
              {courses.map((course, i) => (
                <Box
                  key={`${course._id}-${i}`}
                  role="option"
                  aria-selected={course._id === value}
                  p="3"
                  style={{
                    cursor: "pointer",
                    background:
                      i === highlightedIndex
                        ? "var(--gray-3)"
                        : course._id === value
                        ? "var(--blue-3)"
                        : "transparent",
                    borderBottom: "1px solid var(--gray-4)",
                  }}
                  onMouseDown={() => handleSelectModule(course)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  <Text size="2" weight="medium">
                    {course.title}
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

export default ModuleSearch;
