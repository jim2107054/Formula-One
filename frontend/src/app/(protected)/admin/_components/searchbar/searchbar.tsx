"use client";

import React, { useEffect, useState } from "react";
import { Button, Flex, TextField } from "@radix-ui/themes";
import { FaSearch } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  width?: string;
  fetching?: boolean;
}

export default function SearchBar({
  value,
  onSearch,
  placeholder = "Search by name or email",
  width = "300px",
  fetching,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSearch = () => {
    if (localValue.trim() !== value) {
      onSearch(localValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Flex style={{ width }}>
      <TextField.Root
        size="2"
        variant="classic"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 !rounded-r-none h-full"
        style={{
          borderRadius: 6,
        }}
      />

      {value ? (
        <Button
          disabled={fetching}
          variant="solid"
          className="!bg-accent !rounded-l-none"
        >
          <MdOutlineCancel
            size={16}
            onClick={() => {
              setLocalValue("");
              onSearch("");
            }}
            className="cursor-pointer text-white"
          />
        </Button>
      ) : (
        <Button
          disabled={fetching}
          variant="solid"
          onClick={handleSearch}
          className="!bg-accent !rounded-l-none"
        >
          <FaSearch size={15} className="cursor-pointer text-white" />
        </Button>
      )}
    </Flex>
  );
}
