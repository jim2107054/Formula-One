"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { useInView } from "react-intersection-observer";

import {
  useSectionsInfinite,
  useSection as useSectionQuery,
} from "@/hooks/queries/useSectionQueries";
import { Section } from "@/zustand/types/section";

interface SectionSearchProps {
  value?: string;
  onSelectSection: (id: string) => void;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
  currentSectionTitle?: string;
  courseId?: string;
}

const SectionSearch = memo(function SectionSearch({
  value,
  onSelectSection,
  placeholder = "Search by section",
  width = "300px",
  disabled = false,
  currentSectionTitle,
  courseId,
}: SectionSearchProps) {
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

  /* -------------------- fetch sections (infinite scroll) -------------------- */
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useSectionsInfinite(
      {
        limit: 20,
        search: debouncedTerm || undefined,
        courseId: courseId || undefined,
      },
      {
        enabled: isOpen,
      }
    );

  const sections: Section[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  /* -------------------- selected section fallback -------------------- */
  const { data: selectedSectionData } = useSectionQuery(value || "", {
    enabled: !!value && !sections.some((s) => s._id === value),
  });

  const selectedSection = useMemo(() => {
    if (!value) return null;
    return (
      sections.find((s) => s._id === value) ??
      (selectedSectionData?._id === value ? selectedSectionData : null)
    );
  }, [value, sections, selectedSectionData]);

  /* -------------------- sync input label -------------------- */
  const displayText = selectedSection?.title ?? currentSectionTitle ?? "";
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

  const handleSelectSection = useCallback(
    (section: Section) => {
      onSelectSection(section._id);
      setInputText(section.title);
      setIsTyping(false);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelectSection]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || sections.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) => (i + 1) % sections.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) => (i <= 0 ? sections.length - 1 : i - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0)
            handleSelectSection(sections[highlightedIndex]);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, sections, highlightedIndex, handleSelectSection]
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
                onSelectSection("");
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
          ) : sections.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                No sections found
              </Text>
            </Box>
          ) : (
            <>
              {sections.map((section, i) => (
                <Box
                  key={section._id}
                  role="option"
                  aria-selected={section._id === value}
                  p="3"
                  style={{
                    cursor: "pointer",
                    background:
                      i === highlightedIndex
                        ? "var(--gray-3)"
                        : section._id === value
                        ? "var(--blue-3)"
                        : "transparent",
                    borderBottom: "1px solid var(--gray-4)",
                  }}
                  onMouseDown={() => handleSelectSection(section)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  <Text size="2" weight="medium">
                    {section.title}
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

export default SectionSearch;
