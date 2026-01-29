"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "icon"
    | "light"
    | "login"
    | "end"
    | "success"
    | "danger"
    | "danger-outline"
    | "warn";
  size?: "sm" | "md" | "lg";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "sm",
  className = "",
  startIcon,
  endIcon,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (onClick) onClick(e);
  };

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all outline-none box-border !cursor-pointer hover:text-white";

  const sizes =
    size === "sm"
      ? "h-8 px-3 text-sm"
      : size === "lg"
      ? "h-14 px-8 text-lg"
      : variant === "icon"
      ? "h-12 w-12 p-3"
      : "h-12 px-6 text-base";

  const stateStyles =
    variant === "icon"
      ? "bg-[var(--Primary-light)] hover:bg-[var(--Accent-dark-1)] focus:ring-2 focus:ring-[var(--Primary-light)] focus:ring-offset-2 active:bg-[var(--Accent-dark-2)] disabled:bg-[var(--Accent-light)] disabled:opacity-50 disabled:pointer-events-none"
      : variant === "light"
      ? "bg-white text-[var(--Accent-default)] border border-[var(--Primary-light)] shadow-[var(--shadow-button)] hover:bg-[var(--Primary-light)] focus:ring-4 focus:ring-[var(--Primary-light)] active:bg-[var(--pressed-bg)] disabled:bg-[var(--Accent-light)] disabled:text-white disabled:opacity-50 disabled:pointer-events-none"
      : variant === "login"
      ? ""
      : variant === "end"
      ? "bg-white text-[var(--Orange-default)] border border-[var(--Primary-light)] shadow-[var(--shadow-button)] hover:bg-[var(--Primary-light)] active:bg-[var(--pressed-bg)]"
      : variant === "success"
      ? "bg-green-600 text-white shadow-[var(--shadow-button)] hover:bg-green-700 focus:ring-2 focus:ring-green-500 active:bg-green-800 disabled:bg-green-300 disabled:opacity-50 disabled:pointer-events-none"
      : variant === "danger"
      ? "bg-red-600 text-white shadow-[var(--shadow-button)] hover:bg-red-700 focus:ring-2 focus:ring-red-500 active:bg-red-800 disabled:bg-red-300 disabled:opacity-50 disabled:pointer-events-none"
      : variant === "danger-outline"
      ? "bg-transparent text-red-400 border border-dashed border-red-400 shadow-[var(--shadow-button)] hover:bg-red-50 hover:text-red-500 active:bg-red-100 disabled:text-red-300 disabled:border-red-300 disabled:pointer-events-none"
      : variant === "warn"
      ? "bg-yellow-500 text-white shadow-[var(--shadow-button)] hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 active:bg-yellow-700 disabled:bg-yellow-200 disabled:opacity-50 disabled:pointer-events-none"
      : "bg-[var(--Accent-default)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--Accent-default-hover)] focus:ring-2 focus:ring-[var(--Primary-light)] active:bg-[var(--Accent-dark-1)] disabled:bg-[var(--Accent-light)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  return (
    <button
      className={cn(baseStyles, sizes, stateStyles, className)}
      onClick={handleClick}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
};
