"use client";

import React from "react";
import Link from "next/link";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

import { IoIosArrowBack } from "react-icons/io";
import { useBreadcrumb } from "@/hooks/queries/useBreadcrumbQueries";
import { useIntl } from "react-intl";

interface BreadcrumbsProps {
  courseId: string;
  sectionId: string;
  lessonId: string;
  itemId: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  courseId,
  sectionId,
  lessonId,
  itemId,
}) => {
  const {
    data: breadcrumbData,
    isLoading,
    isError,
  } = useBreadcrumb({
    courseId,
    sectionId,
    lessonId,
    itemId,
  });

  const intl = useIntl();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mt-6 sm:mt-[47px]  ">
      <button
        onClick={() => {
          window.history.back();
        }}
        className="flex justify-center items-center space-x-2.5 rounded-lg border border-[var(--Primary-light)] py-2 ps-4 pe-6 font-semibold text-[var(--Primary-dark)] hover:bg-[var(--Primary-light)] hover:text-[var(--Accent-default)] transition-all duration-300 ease-in-out cursor-pointer w-fit shrink-0"
      >
        <IoIosArrowBack />
        <p>{intl.formatMessage({ id: "button.back" })}</p>
      </button>
      <div className="flex flex-1">
        <div className="flex items-center flex-wrap gap-y-2">
          {isLoading && (
            <p className="text-sm sm:text-base font-semibold text-[var(--Accent-default)] animate-pulse">
              {intl.formatMessage({ id: "breadcrumbs.loading" })}
            </p>
          )}
          {isError && (
            <p className="text-sm sm:text-base font-semibold text-red-500">
              {intl.formatMessage({ id: "breadcrumbs.error" })}
            </p>
          )}
          {!isLoading &&
            breadcrumbData?.levels?.map((item, index) => (
              <div key={item.id} className="flex items-center">
                {index > 0 && (
                  <MdOutlineKeyboardDoubleArrowRight className="text-xl sm:text-2xl mx-1 sm:mx-2 text-[var(--Primary)] font-semibold shrink-0" />
                )}

                <Link
                  href={`/student/student-dashboard/${item.url}`}
                  className={`text-sm sm:text-base break-words ${
                    item.isActive
                      ? "text-[var(--Accent-default)]"
                      : "text-[var(--Primary)]"
                  } font-semibold hover:underline`}
                >
                  {item.title}
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumbs;
