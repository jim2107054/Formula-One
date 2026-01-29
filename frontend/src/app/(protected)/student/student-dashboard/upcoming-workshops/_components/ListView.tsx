"use client";

import FlagSelector from "@/components/ui/flag-selector/FlagSelector";
import { UpcomingModule } from "@/zustand/types/upcomingModules";
import Link from "next/link";
import { useIntl } from "react-intl";

export default function ListView({
  coursesData,
}: {
  coursesData: UpcomingModule[];
}) {
  const intl = useIntl();

  return (
    <div className="border border-[var(--Primary)] rounded-lg">
      <table className="w-full  rounded-lg overflow-hidden  text-sm">
        <thead className="bg-[var(--Accent-light-2)] !font-normal text-xs text-left">
          <tr>
            <th className="py-3 ps-4 w-[149px]">
              {intl.formatMessage({
                id: "upcomingWorkshops.listView.courseNo",
              })}
            </th>
            <th className="py-3 ps-4 w-[243px]">
              {intl.formatMessage({
                id: "upcomingWorkshops.listView.courseTitle",
              })}
            </th>
            <th className="py-3 ps-4 w-[110px]">
              {intl.formatMessage({ id: "language" })}
            </th>
            <th className="py-3 ps-4 w-[109px]">
              {intl.formatMessage({ id: "start" })}
            </th>
            <th className="py-3 ps-4 w-[109px]">
              {intl.formatMessage({ id: "end" })}
            </th>
            <th className="py-3 ps-4 w-[109px]">
              {intl.formatMessage({ id: "location" })}
            </th>
            <th className="py-3 ps-4">
              {intl.formatMessage({ id: "upcomingWorkshops.listView.price" })}
            </th>
            <th className="py-3 ps-4 w-[138px]"></th>
          </tr>
        </thead>

        <tbody>
          {coursesData.map((course, index) => (
            <tr
              key={index}
              className="  border-b border-[var(--Primary)]  transition-all duration-300 ease-in-out !text-sm"
            >
              <td className="py-5 px-4 w-[149px]">{course.courseNong}</td>

              <td className="py-5  text-[var(--Accent-default)] w-[243px]">
                {course.title}
              </td>

              <td className="py-5 px-2 w-[120px]">
                <div className="flex items-center gap-2">
                  <FlagSelector className="size-5" name={course.language} />
                  <span>{course.language}</span>
                </div>
              </td>

              <td className="py-5 px-4 w-[109px]">
                {course.startDate || "Flexible"}
              </td>

              <td className="py-5 px-4 w-[109px]">
                {course.endDate || "Flexible"}
              </td>

              <td className="py-5 px-4">{course.location || "By choice"}</td>

              <td className="py-5 px-4">
                <p>
                  {intl.formatMessage({
                    id: "upcomingWorkshops.standardPrice",
                  })}{" "}
                  <span className="font-bold">{course.standardPrice}</span>€
                </p>
                {course.discountedPrice !== 0 && (
                  <p>
                    {intl.formatMessage({
                      id: "upcomingWorkshops.discountedPriceForRepeatCustomer",
                    })}{" "}
                    <span className="font-bold">{course.discountedPrice}</span>€
                  </p>
                )}
              </td>

              <td className="py-5 px-4 w-[138px]">
                <Link
                  href={course.bookingUrl || "#"}
                  target="_blank"
                  className="bg-[var(--Accent-dark-1)] hover:bg-[var(--Accent-default)] text-white rounded-lg px-6 py-3 flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out"
                >
                  {intl.formatMessage({ id: "button.bookYourSession" })}
                  <span className="ml-2 text-lg">→</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {coursesData.length === 0 && (
        <div className="p-6 text-center text-[var(--Primary-dark)]">
          {intl.formatMessage({ id: "UpcomingWorkshops.noCourses" })}
        </div>
      )}
    </div>
  );
}
