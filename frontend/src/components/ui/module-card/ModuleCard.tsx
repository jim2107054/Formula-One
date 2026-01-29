"use client";
import SectionTag from "../section-tag/SectionTag";
import { Icon } from "../icon/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import FlagSelector from "../flag-selector/FlagSelector";

import CircularProgress from "../circular-progress-bar/CircularProgressBar";
import { Enroll } from "@/zustand/types/enroll";
import { useEffect, useState } from "react";
import { CiWarning } from "react-icons/ci";
import { useIntl } from "react-intl";

interface Props {
  property1: "variant-2" | "default";
  moduleDetail: Enroll;
}

export const ModuleCard = ({ property1, moduleDetail }: Props) => {
  const intl = useIntl();
  const [isExpired, setIsExpired] = useState(false);

  const formatDate = () => {
    const end = new Date(
      moduleDetail?.expires_at ?? "2025-12-20T14:38:41.049Z"
    );
    const start = new Date();

    if (isNaN(end.getTime()) || isNaN(start.getTime())) {
      return 0;
    }

    const timeDifference = end.getTime() - start.getTime();

    const daysDifference = timeDifference / (1000 * 3600 * 24);

    return Math.round(daysDifference);
  };

  useEffect(() => {
    const checkExpiry = () => {
      const end = new Date(moduleDetail?.expires_at || "");
      const start = new Date();

      if (isNaN(end.getTime()) || isNaN(start.getTime())) {
        return;
      }

      const timeDifference = end.getTime() - start.getTime();

      const daysDifference = timeDifference / (1000 * 3600 * 24);

      setIsExpired(daysDifference < 0);
    };

    checkExpiry();
  }, [moduleDetail?.expires_at]);

  return (
    <section
      className={cn(
        // Base container
        "flex flex-row items-stretch gap-4 w-full max-w-full",
        // Responsive
        "max-sm:flex-col max-sm:items-center",
        // Group for hover effects
        `${isExpired ? "" : "group cursor-pointer"}`,
        // Variant-2 shadows
        property1 === "variant-2" &&
          "[&>a]:shadow-[0px_1px_1px_rgba(0,0,0,0.03),0px_2px_4px_rgba(0,0,0,0.04)] [&>aside]:shadow-[0px_1px_1px_rgba(0,0,0,0.03),0px_2px_4px_rgba(0,0,0,0.04)]",
        // Hover shadows
        "hover:[&>a]:shadow-[0px_2px_8px_rgba(0,0,0,0.06),0px_4px_16px_rgba(0,0,0,0.04)] hover:[&>aside]:shadow-[0px_2px_8px_rgba(0,0,0,0.06),0px_4px_16px_rgba(0,0,0,0.04)]",
        // Variant-2 enhanced hover
        property1 === "variant-2" &&
          "hover:[&>a]:shadow-[0px_3px_12px_rgba(0,0,0,0.08),0px_6px_20px_rgba(0,0,0,0.06)] hover:[&>aside]:shadow-[0px_3px_12px_rgba(0,0,0,0.08),0px_6px_20px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Left Card - Main Content */}
      <Link
        href={
          isExpired
            ? "#"
            : `/student/student-dashboard/module/${moduleDetail?.course?._id}`
        }
        className={cn(
          // Base styles
          "flex flex-col items-start rounded-lg py-[27px] px-6 pr-[30px] gap-6 flex-1 w-full",
          // Transition
          "transition-shadow duration-500",
          // Conditional background
          isExpired
            ? "pointer-events-none bg-[var(--Orange-light)]"
            : "bg-white"
        )}
      >
        {/* Header Section */}
        <header className="flex justify-start items-center gap-6 w-full">
          <SectionTag
            icon="module"
            status="default"
            className="group-hover:bg-[var(--Accent-default)]"
          />

          <div className="text-sm flex items-center space-x-2">
            <FlagSelector name={moduleDetail?.course?.language || "English"} />
            <span>{moduleDetail?.course?.language}</span>
          </div>
        </header>

        {/* Title */}
        <h2
          className={cn(
            "font-semibold text-2xl tracking-[-0.48px] leading-9 m-0 max-w-full transition-colors duration-500",
            property1 === "default"
              ? "text-black"
              : "text-[var(--Accent-default)]",
            "group-hover:text-[var(--Accent-default)]"
          )}
        >
          {moduleDetail.course?.title}
        </h2>

        {/* Date and Sections Info */}
        <div className="flex max-md:flex-col max-md:space-y-4 justify-between w-full">
          {/* Date Wrapper */}
          <div className="flex items-center gap-2">
            {isExpired ? (
              <CiWarning className="text-[var(--Orange-default)] text-xl w-6 h-6" />
            ) : (
              <Icon
                name={
                  moduleDetail.expires_at === null
                    ? "tick-double-02"
                    : "calendar"
                }
                className="w-6 h-6"
              />
            )}
            <time
              className={`${
                isExpired
                  ? "text-[var(--Orange-default)]"
                  : "text-[var(--Primary-dark)]"
              } text-base font-normal whitespace-nowrap`}
            >
              {isExpired
                ? intl.formatMessage({ id: "dashboard.moduleCard.expiredOn" }) +
                  " " +
                  new Date(moduleDetail.expires_at!).toLocaleDateString()
                : moduleDetail?.expires_at === null
                ? intl.formatMessage({
                    id: "dashboard.moduleCard.lifetimeAccess",
                  })
                : formatDate() +
                  " " +
                  intl.formatMessage({
                    id: "dashboard.moduleCard.daysRemaining",
                  })}
            </time>
          </div>
          {!isExpired && (
            <div className="text-[var(--Primary-dark)] flex space-x-2">
              <Icon name="sectionIcon2" />
              <span>{moduleDetail?.course?.totalSections}</span>
              <span>
                {intl.formatMessage({ id: "dashboard.moduleCard.sections" })}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Right Card - Countdown */}
      <aside
        className={cn(
          // Base styles
          "flex flex-col items-center justify-center rounded-lg p-6 min-w-32 flex-shrink-0",
          // Transition
          "transition-shadow duration-500",
          // Responsive
          "max-sm:hidden",
          // Conditional background
          isExpired
            ? "pointer-events-none bg-[var(--Orange-light)]"
            : "bg-white"
        )}
      >
        <CircularProgress
          isLocked={isExpired}
          total={moduleDetail?.course?.totalSections || 0}
          progress={moduleDetail?.course?.completedSections || 0}
        />
      </aside>
    </section>
  );
};
