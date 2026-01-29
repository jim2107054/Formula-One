import { Button, Icon } from "@/components/ui";
import SectionTag from "@/components/ui/section-tag/SectionTag";
import Spinner from "@/components/ui/spinner/Spinner";
import { Lesson } from "@/zustand/types/lesson";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { motion } from "motion/react";
import { IoIosArrowDown } from "react-icons/io";
import { itemTypes } from "@/zustand/types/item";

interface LessonCardProps {
  lesson: Lesson;
  sectionOrder?: number;
  moduleId?: string;
  sectionId?: string;
}

export default function LessonCard({
  lesson,
  sectionOrder,
  moduleId,
  sectionId,
}: LessonCardProps) {
  const [loading, setLoading] = useState(false);
  const intl = useIntl();

  const [expanded, setExpanded] = useState(false);

  const [visibleItems, setVisibleItems] = useState(
    () => lesson.items?.slice(0, 4) ?? []
  );

  const contentRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLDivElement | null>(null);

  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current || !firstItemRef.current) return;

    setVisibleItems(lesson.items);

    const observer = new ResizeObserver(() => {
      const full = contentRef.current?.scrollHeight || 0;
      setFullHeight(full);

      if (firstItemRef.current) {
        const itemHeight = firstItemRef.current.offsetHeight;
        const collapsed = itemHeight * 2.5;
        setCollapsedHeight(collapsed);
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [lesson.items]);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="border border-[var(--Primary)] hover:border-[var(--Accent-default)] hover:shadow-md transition-all duration-300 rounded-lg py-6 px-[26px] my-6 shadow-sm flex max-xl:flex-col">
      <div className="xl:w-[401px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex max-xl:flex-col items-center gap-[18px]">
            <SectionTag
              text={`${intl.formatMessage({ id: "lesson" })} ${sectionOrder}.${
                lesson.order
              }`}
              icon="lesson"
              status={lesson.state}
            />

            <div className="flex flex-col xl:items-center">
              <span className="text-sm text-[var(--Primary-dark)] mb-2">
                {lesson.totalItems === 0
                  ? "0"
                  : Math.round(
                      (lesson.completedItems / lesson.totalItems) * 100
                    )}
                % {intl.formatMessage({ id: "completed" })}
              </span>

              <div className="w-40 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[var(--Accent-default)] h-1.5 rounded-full"
                  style={{
                    width: `${
                      lesson.totalItems === 0
                        ? "0"
                        : (lesson.completedItems / lesson.totalItems) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold my-6">{lesson.title}</h2>

        {/* Responsive Collapse Animation */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? fullHeight : collapsedHeight }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          onAnimationStart={() => setVisibleItems(lesson.items)}
          onAnimationComplete={() => {
            if (!expanded) {
              setVisibleItems(lesson.items);
            }
          }}
          className="overflow-hidden"
        >
          <div ref={contentRef} className="flex flex-wrap gap-1.5 pt-2">
            {visibleItems.map((item, index) => (
              <div
                key={index}
                ref={index === 0 ? firstItemRef : null}
                className={`flex items-center gap-3 border border-[var(--Accent-light-2)]
                  ${
                    item.status === "in-progress"
                      ? "bg-[var(--Accent-light)]"
                      : ""
                  }
                  rounded-full py-[6.5px] ps-1.5 pe-3 mb-2`}
              >
                <div
                  className={`rounded-full p-2 flex items-center justify-center ${
                    item.mediaType !== "quiz"
                      ? "bg-[var(--Accent-default)]"
                      : "bg-[var(--Orange-default)]"
                  }`}
                >
                  <Icon
                    name={
                      itemTypes.includes(item.mediaType)
                        ? item.mediaType
                        : "item"
                    }
                    className="size-4 shrink-0"
                  />
                </div>
                <span className="text-sm line-clamp-1">{item.title}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* See more / See less */}
        {fullHeight > collapsedHeight + 10 && (
          <button
            onClick={toggleExpanded}
            className="text-[var(--Primary-dark)] hover:text-[var(--Accent-default)] text-sm flex items-center mt-4 xl:mt-[21.5px] transition-all max-xl:mb-4"
          >
            <span>
              {expanded
                ? intl.formatMessage({ id: "seeLess" })
                : intl.formatMessage({ id: "seeMore" })}
            </span>
            <IoIosArrowDown
              className={`${expanded ? "rotate-180" : ""} transition-all ml-2`}
            />
          </button>
        )}
      </div>

      {/* Right Side Button */}
      <div className="flex xl:justify-center xl:items-center">
        <div className="xl:ml-[88px] max-xl:mt-4">
          <Link
            href={`/student/student-dashboard/module/${moduleId}/section/${sectionId}/lesson/${lesson.id}`}
          >
            <Button
              variant={lesson.state === "in-progress" ? "default" : "light"}
              onClick={() => setLoading(true)}
              endIcon={
                (lesson.state === "completed" ||
                  lesson.state === "incomplete") &&
                (loading ? (
                  <Spinner className="text-accent!" />
                ) : (
                  <Icon name="arrow-circle-right" />
                ))
              }
              startIcon={
                lesson.state === "in-progress" &&
                (loading ? <Spinner /> : <Icon name="play" />)
              }
            >
              {lesson.state === "incomplete"
                ? intl.formatMessage({ id: "button.startNow" })
                : lesson.state === "in-progress"
                ? intl.formatMessage({ id: "button.continue" })
                : intl.formatMessage({ id: "button.startAgain" })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
