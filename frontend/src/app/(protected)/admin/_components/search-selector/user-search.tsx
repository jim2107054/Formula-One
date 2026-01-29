"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { ImSpinner3 } from "react-icons/im";
import { useInView } from "react-intersection-observer";

import {
  useUsersInfinite,
  useUser as useUserQuery,
} from "@/hooks/queries/useUserQueries";
import { User, UserRole } from "@/zustand/types/user";

interface UserSearchProps {
  role: UserRole;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  currentUserName?: string;
}

const UserSearch = memo(function UserSearch({
  role,
  value,
  onChange,
  placeholder = "Search users…",
  disabled = false,
  currentUserName,
}: UserSearchProps) {
  /* -------------------- state -------------------- */
  const [inputText, setInputText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);

  /* -------------------- debounce -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(inputText.trim()), 300);
    return () => clearTimeout(timer);
  }, [inputText]);

  /* -------------------- fetch users (infinite scroll) -------------------- */
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } =
    useUsersInfinite(
      {
        role,
        limit: 20,
        search: debounced || undefined, // always fetch
      },
      {
        enabled: isOpen, // fetch only when dropdown open
      }
    );

  const users: User[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  );

  /* -------------------- selected user fallback -------------------- */
  const { data: selectedUserData } = useUserQuery(value, {
    enabled: !!value && !users.some((u) => u._id === value),
  });

  const selectedUser = useMemo(() => {
    if (!value) return null;
    return (
      users.find((u) => u._id === value && u.role === role) ??
      (selectedUserData?.data?._id === value ? selectedUserData.data : null)
    );
  }, [value, role, users, selectedUserData]);

  /* -------------------- sync input label -------------------- */
  const displayText = selectedUser?.name ?? currentUserName ?? "";
  useEffect(() => {
    if (!isTyping) setInputText(displayText);
  }, [displayText, isTyping]);

  /* -------------------- handlers -------------------- */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
      setIsTyping(true);
      setIsOpen(true);
      setHighlight(-1);
    },
    []
  );

  const handleSelect = useCallback(
    (user: User) => {
      onChange(user._id);
      setInputText(user.name);
      setIsTyping(false);
      setIsOpen(false);
      setHighlight(-1);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || users.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlight((i) => (i + 1) % users.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlight((i) => (i <= 0 ? users.length - 1 : i - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (highlight >= 0) handleSelect(users[highlight]);
          break;
        case "Escape":
          setIsOpen(false);
          setHighlight(-1);
          break;
      }
    },
    [isOpen, users, highlight, handleSelect]
  );

  /* -------------------- infinite scroll -------------------- */
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  useEffect(() => {
    if (inView && hasNextPage && !isFetching) fetchNextPage();
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  return (
    <Box position="relative">
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
                onChange("");
                setInputText("");
                setIsTyping(false);
                setIsOpen(false);
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
          ) : users.length === 0 ? (
            <Box p="3">
              <Text size="2" color="gray">
                No users found
              </Text>
            </Box>
          ) : (
            <>
              {users.map((u, i) => (
                <Flex
                  key={u._id}
                  p="2"
                  gap="2"
                  align="center"
                  role="option"
                  aria-selected={u._id === value}
                  onMouseDown={() => handleSelect(u)}
                  onMouseEnter={() => setHighlight(i)}
                  style={{
                    cursor: "pointer",
                    background:
                      i === highlight
                        ? "var(--gray-3)"
                        : u._id === value
                        ? "var(--blue-3)"
                        : "transparent",
                    borderBottom: "1px solid var(--gray-4)",
                  }}
                >
                  <FaUserCircle size={20} opacity={0.3} />
                  <Flex direction="column" style={{ minWidth: 0 }}>
                    <Text size="1" weight="bold" truncate>
                      {u.name}
                    </Text>
                    <Text size="1" color="gray" truncate>
                      {u.email}
                    </Text>
                  </Flex>
                </Flex>
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

export default UserSearch;
