"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "icon" | "light" | "login" | "end";
  size?: "xs" | "sm" | "md" | "lg";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className = "",
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-300 ease-in-out outline-none box-border ";

  const sizeClasses: Record<string, string> = {
    xs: variant === "icon" ? "h-8 w-8 p-2" : "h-8 px-3 text-sm",
    sm: variant === "icon" ? "h-10 w-10 p-2.5" : "h-10 px-4 text-sm",
    md: variant === "icon" ? "h-12 w-12 p-3" : "h-12 px-6 text-base",
    lg: variant === "icon" ? "h-14 w-14 p-4" : "h-14 px-8 text-lg",
  };

  const stateStyles =
    variant === "icon"
      ? "bg-[var(--Primary-light)] hover:bg-[var(--Accent-dark-1)] active:ring-2 active:ring-[var(--Primary-light)] active:ring-offset-2 active:bg-[var(--Accent-dark-2)] disabled:bg-[var(--Accent-light)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer "
      : variant === "light"
      ? "bg-white text-[var(--Accent-default)] border border-[var(--Primary-light)] shadow-[var(--shadow-button)] hover:bg-[var(--Primary-light)] active:ring-4 active:ring-[var(--Primary-light)] active:bg-[var(--pressed-bg)] disabled:bg-[var(--Accent-light)] disabled:text-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer "
      : variant === "login"
      ? ""
      : variant === "end"
      ? "bg-white text-[var(--Orange-default)] border border-[var(--Primary-light)] shadow-[var(--shadow-button)] hover:bg-[var(--Primary-light)] active:bg-[var(--pressed-bg)] cursor-pointer "
      : "bg-[var(--Accent-default)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--Accent-dark-1)] active:ring-2 active:ring-[var(--Primary-light)] active:ring-offset-2 active:bg-[var(--Accent-dark-2)] disabled:bg-[var(--Accent-light)] disabled:opacity-50 disabled:pointer-events-none border-[1.5px] border-white shadow ";

  return (
    <button
      className={cn(
        baseStyles,
        sizeClasses[size],
        stateStyles,
        className,
        "cursor-pointer"
      )}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
};
