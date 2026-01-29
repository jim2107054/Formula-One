"use client";

import { IoIosLink, IoMdTime } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import FlagSelector from "@/components/ui/flag-selector/FlagSelector";
import { UpcomingModule } from "@/zustand/types/upcomingModules";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useIntl } from "react-intl";

export default function GridView({
  coursesData,
}: {
  coursesData: UpcomingModule[];
}) {
  const intl = useIntl();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {coursesData.map((course, index) => (
        <div
          key={index}
          className="relative group  justify-between px-7 pt-[65px] pb-[31px] rounded-lg border border-[var(--Primary)] flex flex-col"
        >
          <div className="bg-[var(--Accent-default)] rounded-tr-lg rounded-bl-lg py-2 px-4 text-white flex items-center justify-center gap-2 absolute top-0 right-0">
            <IoMdTime />
            <span className="text-xs font-semibold">
              {course.startDate
                ? formatDateTime(course.startDate) +
                  "-" +
                  formatDateTime(course.endDate)
                : "Flexible"}
            </span>
          </div>
          <p className="text-xs mb-5">{course.courseNong}</p>
          <Link
            target="_blank"
            href={course.courseTitleUrl || "#"}
            className="text-xl font-semibold group-hover:text-[var(--Accent-default)] transition-all duration-300 ease-in-out mb-[27.5px] "
          >
            {course.title}
            <IoIosLink className="text-2xl" />
          </Link>
          <div className="flex justify-between border-b border-b-[var(--Primary)] my-4 pb-4">
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-[10px]">
                {intl.formatMessage({ id: "location" })}
              </p>
              <p className="text-xs text-[var(--Primary-dark)] space-x-1 flex items-center">
                <FaLocationDot className="text-lg " />{" "}
                <span>{course.location}</span>
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2">
              <p className="text-[10px]">
                {intl.formatMessage({ id: "language" })}
              </p>
              <div className="flex items-center gap-2 ">
                <FlagSelector className="size-5" name={course.language} />
                <span className="text-xs font-semibold">{course.language}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center ">
            <p>
              {intl.formatMessage({ id: "upcomingWorkshops.standardPrice" })}{" "}
              <span className="font-bold">{course.standardPrice}</span>€
            </p>
            {course.discountedPrice !== 0 && (
              <p className="text-center">
                {intl.formatMessage({
                  id: "upcomingWorkshops.discountedPriceForRepeatCustomer",
                })}{" "}
                <span className="font-bold">{course.discountedPrice}</span>€
              </p>
            )}
          </div>
          <Link href={course.bookingUrl || "#"} target="_blank">
            {" "}
            <button className=" bg-[var(--Accent-dark-1)] hover:bg-[var(--Accent-default)] transition-all duration-300 ease-in-out text-white rounded-lg px-6 py-2 mt-5 flex items-center justify-center cursor-pointer w-full">
              Book your session
              <span className="ml-2 text-lg">→</span>
            </button>
          </Link>
        </div>
      ))}
      {coursesData.length === 0 && (
        <div className="p-6 col-span-3 text-center text-[var(--Primary-dark)]">
          {intl.formatMessage({ id: "upcomingWorkshops.noCourses" })}
        </div>
      )}
    </div>
  );
}
