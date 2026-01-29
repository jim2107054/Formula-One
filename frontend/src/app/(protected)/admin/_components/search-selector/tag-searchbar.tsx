"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Text, Badge } from "@radix-ui/themes";
import { BiSearch, BiX } from "react-icons/bi";
import { ImSpinner3 } from "react-icons/im";
import { useInView } from "react-intersection-observer";

import { useTagsInfinite } from "@/hooks/queries/useTagQueries";
import type { Tag } from "@/zustand/types/tag";

interface TagSearchSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TagSearchSelect = memo(function TagSearchSelect({
  value,
  onChange,
  placeholder = "Search or add tags…",
  disabled = false,
}: TagSearchSelectProps) {
  const [inputText, setInputText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(inputText.trim()), 300);
    return () => clearTimeout(t);
  }, [inputText]);

  // Enable the query even when not open to fetch selected tag data
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useTagsInfinite(
      {
        search: debounced || undefined,
        is_published: true,
        limit: 20,
      },
      {
        enabled: isOpen || value.length > 0,
      }
    );

  const allTags: Tag[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  const tagsForDropdown: Tag[] = useMemo(
    () => allTags.filter((t) => !value.includes(t._id)),
    [allTags, value]
  );

  // const selectedTags: Tag[] = useMemo(
  //   () => allTags.filter((t) => value.includes(t._id)),
  //   [allTags, value]
  // );

  const tagTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    allTags.forEach((tag) => {
      map.set(tag._id, tag.title);
    });
    return map;
  }, [allTags]);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetching) fetchNextPage();
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const handleSelect = useCallback(
    (id: string) => {
      if (!value.includes(id)) onChange([...value, id]);
      setInputText("");
      setIsOpen(false);
      setHighlight(-1);
      inputRef.current?.blur();
    },
    [value, onChange]
  );

  const handleRemove = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v !== id));
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !inputText && value.length) {
        handleRemove(value[value.length - 1]);
        return;
      }

      if (!isOpen || tagsForDropdown.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlight((i) => (i + 1) % tagsForDropdown.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlight((i) => (i <= 0 ? tagsForDropdown.length - 1 : i - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlight >= 0) handleSelect(tagsForDropdown[highlight]._id);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlight(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [
      isOpen,
      tagsForDropdown,
      highlight,
      handleSelect,
      inputText,
      value,
      handleRemove,
    ]
  );

  const selectedBadges = (
    <Flex wrap="wrap" gap="2" mb="2">
      {value.map((id) => {
        const tagTitle = tagTitleMap.get(id) || id;
        return (
          <Badge
            key={id}
            size="2"
            radius="full"
            style={{ display: "flex", gap: 4, alignItems: "center" }}
          >
            <Text size="1">{tagTitle}</Text>
            <BiX
              style={{ cursor: "pointer" }}
              onClick={() => handleRemove(id)}
            />
          </Badge>
        );
      })}
    </Flex>
  );

  return (
    <Box style={{ position: "relative", width: "100%" }}>
      <Flex
        align="center"
        mb="1"
        style={{
          border: "1px solid var(--gray-6)",
          borderRadius: 4,
          background: "var(--color-background)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <BiSearch style={{ marginLeft: 8 }} />
        <input
          ref={inputRef}
          value={inputText}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setInputText(e.target.value);
            setIsOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "3px 10px",
          }}
        />
      </Flex>

      {value.length > 0 && selectedBadges}

      {isOpen && (
        <Box
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 2,
            maxHeight: 250,
            overflowY: "auto",
            background: "var(--color-background)",
            border: "1px solid var(--gray-6)",
            borderRadius: 4,
            zIndex: 1000,
          }}
        >
          {isLoading ? (
            <Flex p="3" justify="center">
              <ImSpinner3 className="animate-spin" />
            </Flex>
          ) : tagsForDropdown.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                {debounced ? "No tags found" : "Type to search for tags"}
              </Text>
            </Box>
          ) : (
            <>
              {tagsForDropdown.map((t, i) => (
                <Box
                  key={t._id}
                  p="3"
                  role="option"
                  aria-selected={false}
                  onMouseDown={() => handleSelect(t._id)}
                  onMouseEnter={() => setHighlight(i)}
                  style={{
                    cursor: "pointer",
                    background:
                      i === highlight ? "var(--gray-3)" : "transparent",
                    borderBottom: "1px solid var(--gray-4)",
                  }}
                >
                  <Text size="2">{t.title}</Text>
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

export default TagSearchSelect;
