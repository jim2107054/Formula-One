"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { useInView } from "react-intersection-observer";

import { useCategoriesInfinite } from "@/hooks/queries/useCategoryQueries";
import type { Category } from "@/zustand/types/category";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CategorySearch = memo(function CategorySearch({
  value,
  onChange,
  placeholder = "Search Category…",
  disabled = false,
}: CategorySearchProps) {
  const [inputText, setInputText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [lastValue, setLastValue] = useState<string>(value);

  const inputRef = useRef<HTMLInputElement>(null);

  // Track external value changes and reset input when value becomes empty
  useEffect(() => {
    if (value !== lastValue) {
      setLastValue(value);

      // Clear input when value becomes empty or undefined
      if (
        !value ||
        value.trim() === "" ||
        value === "undefined" ||
        value === "null"
      ) {
        setInputText("");
        setIsTyping(false);
      }
    }
  }, [value, lastValue]);

  // Debounce input for search queries
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(inputText.trim()), 300);
    return () => clearTimeout(timer);
  }, [inputText]);

  // Fetch categories with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useCategoriesInfinite(
      {
        search: debounced || undefined,
        is_published: true,
        limit: 20,
      },
      {
        enabled: isOpen,
      }
    );

  const categories: Category[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  // Find the selected category from the fetched list
  const selectedCategory = useMemo(() => {
    if (!value || value.trim() === "") return null;
    return (
      categories.find(
        (category) =>
          category.title.trim().toLowerCase() === value.trim().toLowerCase()
      ) || null
    );
  }, [categories, value]);

  // Synchronize display text with selected value
  useEffect(() => {
    if (isTyping) return;

    if (!value || value.trim() === "") {
      setInputText("");
    } else if (selectedCategory) {
      setInputText(selectedCategory.title);
    } else {
      // Display raw value if no matching category found (e.g., URL-encoded value)
      setInputText(decodeURIComponent(value));
    }
  }, [value, selectedCategory, isTyping]);

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  // Event handlers
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputText(newValue);
      setIsTyping(true);
      setIsOpen(true);
      setHighlight(-1);

      // Clear value when input is emptied
      if (newValue.trim() === "") {
        onChange("");
        setIsTyping(false);
      }
    },
    [onChange]
  );

  const handleSelect = useCallback(
    (category: Category) => {
      onChange(category.title);
      setInputText(category.title);
      setIsTyping(false);
      setIsOpen(false);
      setHighlight(-1);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setInputText("");
    setIsTyping(false);
    setHighlight(-1);
    setLastValue("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || categories.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlight((index) => (index + 1) % categories.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlight((index) =>
            index <= 0 ? categories.length - 1 : index - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (highlight >= 0) handleSelect(categories[highlight]);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlight(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, categories, highlight, handleSelect]
  );

  const handleFocus = useCallback(() => {
    setIsOpen(true);
    setHighlight(-1);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const shouldShowClearButton = inputText.trim() !== "" && !disabled;

  return (
    <Box position="relative">
      <Flex align="center">
        <TextField.Root
          ref={inputRef}
          value={inputText}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 !rounded-tr-none !rounded-br-none !border-r-none"
        />

        {shouldShowClearButton ? (
          <Button className="!bg-accent !rounded-l-none">
            <MdOutlineCancel
              size={16}
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
            />
          </Button>
        ) : (
          <Button className="!bg-accent !rounded-l-none !cursor-pointer">
            <FaSearch size={15} />
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
            maxHeight: 220,
            overflowY: "auto",
            background: "var(--color-background)",
            border: "1px solid var(--gray-6)",
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          {isLoading ? (
            <Flex p="3" justify="center">
              <ImSpinner3 className="animate-spin" />
            </Flex>
          ) : categories.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                No categories found
              </Text>
            </Box>
          ) : (
            <>
              {categories.map((category, index) => (
                <Box
                  key={category._id}
                  p="3"
                  role="option"
                  aria-selected={value === category.title}
                  onMouseDown={() => handleSelect(category)}
                  onMouseEnter={() => setHighlight(index)}
                  style={{
                    cursor: "pointer",
                    background:
                      index === highlight
                        ? "var(--gray-3)"
                        : value === category.title
                        ? "var(--blue-3)"
                        : "transparent",
                    borderBottom: "1px solid var(--gray-4)",
                  }}
                >
                  <Text size="2" weight="medium">
                    {category.title}
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

export default CategorySearch;
