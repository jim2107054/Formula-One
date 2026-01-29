"use client";

import { Button, Icon } from "@/components/ui";
import Breadcrumbs from "@/components/ui/breadcrumb/Breadcrumb";
import OverviewCard from "@/components/ui/overview-card/OverviewCard";

import LessonCard from "./_components/lesson-card/LessonCard";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import Link from "next/link";
import Spinner from "@/components/ui/spinner/Spinner";
import { Lesson } from "@/zustand/types/lesson";
import CurriculumCard from "../../_components/curriculum-card/CurriculumCard";
import { useSectionWithLessons } from "@/hooks/queries/useSectionQueries";
import { useCourseWithSections } from "@/hooks/queries/useCourseQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useIntl } from "react-intl";

export default function SectionPage() {
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [filteredLesson, setFilteredLesson] = useState<Lesson>({} as Lesson);
  const intl = useIntl();

  const { moduleId, sectionId } = useParams();
  const {
    data: currentSection,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useSectionWithLessons(sectionId as string);
  const {
    data: coursesWithSections,
    isLoading: curriculumLoading,
    isError: curriculumError,
  } = useCourseWithSections(moduleId as string);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (currentSection && currentSection.continueLessonId) {
      const lesson = currentSection.lessons.find(
        (lesson) => lesson.id === currentSection.continueLessonId
      );
      if (lesson) {
        setFilteredLesson(lesson);
      }
    }
  }, [currentSection]);

  if (isLoading || isFetching) {
    return <LoadingSpinner />;
  } else if (isError) {
    return (
      <div className="text-center text-red-600">
        {intl.formatMessage({ id: "sectionPage.error" })}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1201px] mx-auto ">
        {/* BreadCrumb  */}

        <div>
          <Breadcrumbs
            courseId={Array.isArray(moduleId) ? moduleId[0] : moduleId ?? ""}
            sectionId={
              Array.isArray(sectionId) ? sectionId[0] : sectionId ?? ""
            }
            lessonId={""}
            itemId={""}
          />
        </div>

        {/* main card  */}

        <main className="mt-9 flex max-md:flex-col md:space-x-[26px] ">
          <div className="w-auto md:max-xl:w-[60%] xl:w-full">
            {currentSection?.continueLessonId !== null && (
              <OverviewCard
                title={`${intl.formatMessage({ id: "section" })} ${
                  currentSection?.sections.order
                }: ${currentSection?.sections.title}`}
                lessonName={filteredLesson?.title}
                itemName={`${intl.formatMessage({
                  id: "continueTo",
                })} ${intl.formatMessage({ id: "lesson" })} ${
                  currentSection?.sections.order
                }.${filteredLesson?.order}`}
                isSectionOverview={true}
                progress={currentSection?.completedLessons}
                total={currentSection?.totalLessons}
                path={`/student/student-dashboard/module/${currentSection?.sections.courseId.id}/section/${currentSection?.sections.id}/lesson/${currentSection?.continueLessonId}`}
              ></OverviewCard>
            )}

            {currentSection?.lessons.length === 0 ? (
              <div className="w-full p-5  rounded-lg bg-[var(--Accent-default)] flex items-center justify-center text-4xl font-bold text-white">
                {intl.formatMessage({ id: "sectionPage.noLesson" })}
              </div>
            ) : (
              currentSection?.lessons?.map((lesson, index) => (
                <div key={index}>
                  <LessonCard
                    lesson={lesson}
                    sectionOrder={currentSection.sections.order}
                    moduleId={Array.isArray(moduleId) ? moduleId[0] : moduleId}
                    sectionId={
                      Array.isArray(sectionId) ? sectionId[0] : sectionId
                    }
                  ></LessonCard>
                </div>
              ))
            )}
          </div>
          <aside className="md:max-xl:w-[40%]">
            {" "}
            <CurriculumCard
              hasCertificate={
                !!coursesWithSections?.course?.isCertificateAvailable
              }
              certificateData={
                coursesWithSections?.certificate ?? {
                  allow_download_certificate: false,
                  certification_url: "",
                  enrollId: "",
                }
              }
              loading={curriculumLoading}
              error={curriculumError}
              sections={(coursesWithSections?.sections ?? []).map(
                (section) => ({
                  ...section,
                  lessons: section.lessons?.map((lesson) => ({
                    ...lesson,
                    order: String(lesson.order),
                  })),
                })
              )}
            ></CurriculumCard>
          </aside>
        </main>
        <section className="flex items-center justify-center space-x-[23px] my-[88px]">
          {currentSection?.previousSectionId && (
            <Link
              href={`/student/student-dashboard/module/${currentSection.sections.courseId.id}/section/${currentSection.previousSectionId}`}
              onClick={() => setLoadingPrev(true)}
            >
              {" "}
              <Button
                variant="light"
                startIcon={
                  loadingPrev ? (
                    <Spinner className="!text-[var(--Accent-default)]" />
                  ) : (
                    <Icon name="grommet-icons_link-next" />
                  )
                }
              >
                {intl.formatMessage({ id: "previous" }) +
                  " " +
                  intl.formatMessage({ id: "section" })}
              </Button>
            </Link>
          )}
          {currentSection?.nextSectionId && (
            <Link
              href={`/student/student-dashboard/module/${currentSection.sections.courseId.id}/section/${currentSection.nextSectionId}`}
              onClick={() => setLoadingNext(true)}
            >
              <Button
                variant="light"
                endIcon={
                  loadingNext ? (
                    <Spinner className="!text-[var(--Accent-default)]" />
                  ) : (
                    <Icon name="grommet-icons_link-next (1)" />
                  )
                }
              >
                {intl.formatMessage({ id: "next" }) +
                  " " +
                  intl.formatMessage({ id: "section" })}
              </Button>
            </Link>
          )}
        </section>
      </div>
    );
  }
}
