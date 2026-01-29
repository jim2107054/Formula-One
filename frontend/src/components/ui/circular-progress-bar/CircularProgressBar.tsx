"use client";
import React from "react";
import { IoMdLock } from "react-icons/io";
import { useIntl } from "react-intl";

interface CircularProgressProps {
  progress?: number;
  total?: number;
  sectionName?: string;
  variant?: string;
  isLocked?: boolean;
}

const CircularProgress = ({
  progress = 0,
  total = 0,
  sectionName,
  isLocked = false,
  variant = "default",
}: CircularProgressProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    total === 0
      ? circumference
      : circumference - (progress / total) * circumference;

  const intl = useIntl();

  return (
    <div className="">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            className="text-[var(--Primary)]"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />

          {/* Progress circle */}
          <circle
            className="text-[var(--Accent-default)] transition-all duration-500 ease-in-out"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset && strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)" // Start from the top
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          {isLocked ? (
            <IoMdLock className="text-[var(--Primary-dark)] text-5xl shrink-0" />
          ) : variant === "default" ? (
            <div className="flex flex-col justify-center items-center">
              <span className="text-[32px] font-bold">
                {total === 0 ? "0" : Math.round((progress / total) * 100)}%
              </span>
              <span className="text-sm text-black">
                {intl.formatMessage({ id: "completed" })}
              </span>
            </div>
          ) : (
            <div>
              {" "}
              <span className="text-3xl font-bold text-black">
                {progress}/{total}
              </span>
              {sectionName && (
                <>
                  <span className="text-lg text-black">{sectionName}</span>
                  <span className="text-sm text-black">
                    {intl.formatMessage({ id: "completed" })}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
