"use client";

import { Button, Icon } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";
import { useCourseWithSections } from "@/hooks/queries/useCourseQueries";
import { useEnrollments } from "@/hooks/queries/useEnrollmentQueries";
import { useSectionWithLessons } from "@/hooks/queries/useSectionQueries";
import { itemTypes } from "@/zustand/types/item";
import Link from "next/link";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FaCirclePlay } from "react-icons/fa6";
import { useIntl } from "react-intl";

interface Item {
  id: string;
  order: number;
  status: string;
  title: string;
  type: string;
  mediaType: string;
}

interface ItemCardProps {
  item: Item;
  moduleId?: string;
  sectionId?: string;
  lessonId?: string;
  isLoading?: boolean;
  onhandleMarkAsDone: (id: string) => void;
}

export default function ItemCard({
  item,
  moduleId,
  sectionId,
  lessonId,

  onhandleMarkAsDone,
}: ItemCardProps) {
  const [isMarkingAsDone, setIsMarkingAsDone] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const intl = useIntl();

  const { refetch: sectionRefetch } = useSectionWithLessons(
    sectionId as string
  );
  const { refetch: moduleRefetch } = useCourseWithSections(moduleId as string);
  const { refetch: enrollmentRefetch } = useEnrollments();

  const handleMarkAsDone = async () => {
    if (item.status === "completed") return;

    setIsMarkingAsDone(true);

    try {
      await onhandleMarkAsDone(item.id);
      sectionRefetch();
      moduleRefetch();
      enrollmentRefetch();
    } finally {
      setIsMarkingAsDone(false);
    }
  };

  return (
    <div className="relative rounded-lg border border-[var(--Primary)] hover:border-[var(--Accent-default)] hover:shadow-md transition-all duration-300 ease-in-out my-6 py-6 px-[26px] flex flex-col ">
      {item.status === "completed" && (
        <div className="absolute top-0 right-0 w-fit px-6 py-2 flex items-center gap-2.5 rounded-tr-lg rounded-bl-lg bg-primary-light ">
          <span className="font-semibold text-[var(--Accent-default)]">
            {intl.formatMessage({ id: "completed" })}
          </span>
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              item?.status !== "completed"
                ? "border-[var(--Accent-default)] border"
                : "bg-[var(--Accent-default)] "
            } p-[3px] `}
          >
            <FaCheck
              className={`${
                item?.status === "completed"
                  ? "text-white "
                  : "text-[var(--Accent-default)]"
              }`}
            />
          </div>
        </div>
      )}
      <div
        className={` rounded-full p-3 w-fit flex items-center justify-center ${
          item.mediaType !== "quiz"
            ? "bg-[var(--Accent-default)]"
            : "bg-[var(--Orange-default)]"
        }`}
      >
        <Icon
          name={itemTypes.includes(item.mediaType) ? item.mediaType : "item"}
          className="size-10 shrink-0"
        ></Icon>
      </div>
      <h2 className="text-2xl font-semibold mt-4 mb-8"> {item.title}</h2>
      <div className="flex max-xl:flex-col max-xl:space-y-4 xl:space-x-[28px]">
        {" "}
        {item.status !== "completed" && (
          <Button
            variant="light"
            onClick={item.status !== "completed" ? handleMarkAsDone : undefined}
            endIcon={
              isMarkingAsDone ? (
                <Spinner
                  className={
                    item.mediaType === "quiz"
                      ? "!text-[var(--Orange-default)]"
                      : "!text-[var(--Accent-default)]"
                  }
                />
              ) : (
                <div
                  className={`w-4 h-4 rounded-full  flex items-center justify-center ${
                    item?.mediaType === "quiz"
                      ? item?.status === "completed"
                        ? "bg-[var(--Orange-default)]"
                        : "border border-[var(--Orange-default)]"
                      : item?.status === "completed"
                      ? "bg-[var(--Accent-default)] "
                      : "border-[var(--Accent-default)] border "
                  } p-[3px] `}
                >
                  <FaCheck
                    className={`${
                      item?.mediaType === "quiz"
                        ? item?.status === "completed"
                          ? "text-white "
                          : "text-[var(--Orange-default)]"
                        : item?.status === "completed"
                        ? "text-white "
                        : "text-[var(--Accent-default)]"
                    }`}
                  />
                </div>
              )
            }
            className={`w-fit ${
              item?.status === "completed"
                ? "pointer-events-none"
                : "cursor-pointer"
            } ${item.mediaType === "quiz" && "text-[var(--Orange-default)]"}`}
          >
            {intl.formatMessage({ id: "markAsDone" })}
          </Button>
        )}
        <Link
          href={
            item.mediaType === "quiz"
              ? `/student/student-dashboard/module/${moduleId}/section/${sectionId}/lesson/${lessonId}/quiz/${item.id}`
              : `/student/student-dashboard/module/${moduleId}/section/${sectionId}/lesson/${lessonId}/item/${item.id}`
          }
        >
          <Button
            onClick={() => setIsNavigating(true)}
            variant={
              item.mediaType === "quiz"
                ? "end"
                : item?.status === "in-progress"
                ? "default"
                : "light"
            }
            endIcon={
              (item?.status === "completed" || item?.status === "incomplete") &&
              (isNavigating ? (
                <Spinner className="!text-[var(--Accent-default)]" />
              ) : item.mediaType === "quiz" ? (
                <Icon name="arrow-circle-right-2" />
              ) : (
                <Icon name="arrow-circle-right" />
              ))
            }
            startIcon={
              item?.status === "in-progress" &&
              (isNavigating ? <Spinner /> : <FaCirclePlay />)
            }
            className={"cursor-pointer  py-[14.5px] "}
          >
            {item?.status === "in-progress"
              ? intl.formatMessage({ id: "button.continue" })
              : item?.status === "incomplete"
              ? intl.formatMessage({ id: "button.startNow" })
              : intl.formatMessage({ id: "button.startAgain" })}
          </Button>
        </Link>
      </div>
    </div>
  );
}
