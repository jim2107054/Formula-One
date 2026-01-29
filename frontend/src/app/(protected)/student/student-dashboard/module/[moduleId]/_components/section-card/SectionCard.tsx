"use client";

import { Button, Icon } from "@/components/ui";
import SectionTag from "@/components/ui/section-tag/SectionTag";
import { cn } from "@/lib/utils";
import { useRef, useState, useLayoutEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { motion } from "motion/react";
import Link from "next/link";
import { Lesson } from "@/zustand/types/lesson";
import Spinner from "@/components/ui/spinner/Spinner";
import { useIntl } from "react-intl";

interface SectionCardProps {
  section: Section;
  className?: string;
  moduleId?: string;
}
interface Section {
  id: string;
  title: string;
  order: number;
  isSpecial: boolean;
  completedLessons: number;
  totalLessons: number;
  state: string;
  lessons: Lesson[];
}

export default function SectionCard({
  section,
  className,
  moduleId,
}: SectionCardProps) {
  const [showMore, setShowMore] = useState(false);
  const [lessons, setLessons] = useState(section.lessons.slice(0, 4));
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const lessonTitle = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  // Calculate collapsed height dynamically based on lesson item height
  useLayoutEffect(() => {
    if (lessonTitle.current) {
      setCollapsedHeight(lessonTitle.current.offsetHeight * 2);
    }
  }, [section.lessons]);

  return (
    <div className={cn(className, "")}>
      <div className=" w-auto xl:w-[751px] px-[26px] py-7 rounded-lg border border-[var(--Primary)] hover:shadow-md hover:border-[var(--Accent-default)] transition-all duration-300 ease-in-out  group">
        {/* sectiontag and date */}
        <div className="flex max-xl:flex-col items-start max-xl:space-y-3 xl:items-center space-x-[18px] ">
          <SectionTag
            text={`${intl.formatMessage({ id: "section" })} ${section.order}`}
            icon="section"
            status={section.isSpecial ? "special" : section.state}
          />
          <p className="text-sm">
            {section.completedLessons}/{section.totalLessons}{" "}
            {intl.formatMessage({
              id: "modulePage.sectionCard.lessonsCompleted",
            })}
          </p>
        </div>

        {/* section details and button */}
        <div className="w-full flex max-xl:flex-col justify-between ">
          <div className="xl:w-[450px] ">
            <h2 className="text-2xl font-semibold my-6">{section.title}</h2>

            {/* Animated lesson list */}
            <div className=" w-full justify-between overflow-hidden">
              <motion.div
                initial={false}
                animate={{
                  height: showMore
                    ? "auto"
                    : section.lessons.length > 4
                    ? collapsedHeight
                    : "auto",
                }}
                onAnimationComplete={() =>
                  !showMore && setLessons(section.lessons.slice(0, 4))
                }
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden grid grid-cols-1 xl:grid-cols-2 gap-2"
              >
                {lessons?.map((lesson, index) => (
                  <div
                    key={index}
                    ref={index === 0 ? lessonTitle : null}
                    className="flex items-center space-x-2 xl:py-2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        lesson?.status === "completed"
                          ? "bg-[var(--Accent-default)]"
                          : lesson?.status === "in-progress"
                          ? "border border-[var(--Accent-default)]"
                          : "border"
                      } p-[3px]`}
                    >
                      <FaCheck
                        className={`${
                          lesson?.status !== "completed"
                            ? "hidden "
                            : "text-white"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm line-clamp-1 ${
                        lesson?.status === "completed"
                          ? "text-black"
                          : lesson?.status === "in-progress"
                          ? "text-[var(--Accent-default)]"
                          : "text-black"
                      }`}
                    >
                      {lesson.title}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* See More / See Less Button */}
            {section.lessons.length > 4 && (
              <button
                onClick={() => {
                  setShowMore(!showMore);
                  setLessons(section.lessons);
                }}
                className="text-[var(--Primary-dark)] hover:text-[var(--Accent-default)] duration-300 transition-all ease-in-out group-hover:text-black text-sm flex items-center mt-[21.5px] cursor-pointer space-x-2"
              >
                <span>
                  {showMore
                    ? intl.formatMessage({ id: "seeLess" })
                    : intl.formatMessage({ id: "seeMore" })}
                </span>
                <IoIosArrowDown
                  className={`${
                    showMore ? "rotate-180" : ""
                  } transition-all duration-300 ease-in-out`}
                />
              </button>
            )}
          </div>

          <div className="xl:w-[180px] flex items-center  xl:justify-center max-xl:mt-[27px]">
            <Link
              href={`/student/student-dashboard/module/${moduleId}/section/${section?.id}`}
            >
              <Button
                onClick={() => setLoading(true)}
                variant={
                  section?.isSpecial
                    ? "end"
                    : section?.state === "in-progress"
                    ? "default"
                    : "light"
                }
                endIcon={
                  (section?.state === "completed" ||
                    section?.state === "incomplete") &&
                  (section?.isSpecial ? (
                    <Icon name="arrow-circle-right-2" />
                  ) : loading ? (
                    <Spinner className="!text-[var(--Accent-default)]" />
                  ) : (
                    <Icon name="arrow-circle-right" />
                  ))
                }
                startIcon={
                  section?.state === "in-progress" &&
                  (loading ? <Spinner /> : <Icon name="play" />)
                }
                className={"cursor-pointer"}
              >
                {section?.state === "incomplete"
                  ? intl.formatMessage({ id: "button.startNow" })
                  : section?.state === "in-progress"
                  ? intl.formatMessage({ id: "button.continue" })
                  : intl.formatMessage({ id: "button.startAgain" })}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
