"use client";

import React from "react";

import { cn } from "@/lib/utils";
import styles from "./SearchBar.module.css";
import { Icon } from "../icon/Icon";

export const SearchBar: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = ({ className = "", placeholder = "Search", ...props }) => {
  return (
    <section
      className={cn(styles.searchBar, className)}
      aria-label="Search input"
    >
      <div className="relative h-[48px] w-full">
        <input
          type="text"
          placeholder={placeholder}
          {...props}
          className="w-full  h-[48px] px-3.5 pe-2.5 ps-[42px] outline outline-[var(--Primary)] rounded-lg hover:outline-[var(--Primary-dark)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out  "
        />
        <Icon
          name="search"
          className="absolute top-1/2 left-3.5 transform -translate-y-1/2  "
        />
      </div>
    </section>
  );
};
