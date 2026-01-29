"use client";

import { Button, Icon } from "@/components/ui";
import Breadcrumbs from "@/components/ui/breadcrumb/Breadcrumb";
import OverviewCard from "@/components/ui/overview-card/OverviewCard";

import ItemCard from "./_components/ItemCard";
import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/spinner/Spinner";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import CurriculumCard from "../../../../_components/curriculum-card/CurriculumCard";
import { useCourseWithSections } from "@/hooks/queries/useCourseQueries";
import { useLessonWithItems } from "@/hooks/queries/useLessonQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useUpdateItemStatus } from "@/hooks/queries/useItemQueries";
import { useIntl } from "react-intl";

interface Item {
  id: string;
  order: number;
  status: string;
  title: string;
  type: string;
}

export default function LessonPage() {
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const { width, height } = window.screen;
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [filteredItem, setFilteredItem] = useState<Item>({} as Item);
  const intl = useIntl();

  const { moduleId, lessonId, sectionId } = useParams();

  const {
    data: coursesWithSections,
    isLoading: curriculumLoading,
    isError: curriculumError,
  } = useCourseWithSections(moduleId as string);

  const {
    data: currentLesson,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useLessonWithItems(lessonId as string);

  const updateItemStatus = useUpdateItemStatus();
  const lessonWithItems = useLessonWithItems(lessonId as string);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleMarkAsDone = async (itemId: string) => {
    if (!itemId) return;

    try {
      await updateItemStatus.mutateAsync(itemId);

      setTriggerConfetti(true);

      lessonWithItems.refetch();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while updating item status"
      );
    }
  };

  useEffect(() => {
    if (currentLesson && currentLesson.continueItemId) {
      const item = currentLesson.items.find(
        (item) => item.id === currentLesson.continueItemId
      );
      if (item) {
        setFilteredItem(item);
      }
    }
  }, [currentLesson]);

  if (isLoading || isFetching) {
    return <LoadingSpinner />;
  }
  if (isError) {
    return (
      <div className="text-center text-red-600">
        {intl.formatMessage({ id: "lessonPage.error" })}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1201px] mx-auto ">
        {triggerConfetti && (
          <Confetti
            className="mx-auto"
            recycle={false}
            width={width - 100}
            height={height}
            onConfettiComplete={() => setTriggerConfetti(false)}
          />
        )}
        {/* BreadCrumb  */}

        <div className="">
          <Breadcrumbs
            courseId={Array.isArray(moduleId) ? moduleId[0] : moduleId ?? ""}
            sectionId={
              Array.isArray(sectionId) ? sectionId[0] : sectionId ?? ""
            }
            lessonId={Array.isArray(lessonId) ? lessonId[0] : lessonId ?? ""}
            itemId={""}
          />
        </div>

        {/* main card  */}

        <main className="mt-9 flex max-md:flex-col md:space-x-[26px]">
          <div className="w-auto md:max-xl:w-[60%] xl:w-full">
            {currentLesson?.continueItemId !== null && (
              <OverviewCard
                title={`${intl.formatMessage({ id: "lesson" })} ${
                  currentLesson?.lessons.sectionId.order
                }.${currentLesson?.lessons.order}: ${
                  currentLesson?.lessons.title
                }`}
                itemName={intl.formatMessage({ id: "button.continue" })}
                lessonName={filteredItem?.title}
                isSectionOverview={true}
                path={`/student/student-dashboard/module/${currentLesson?.lessons.courseId.id}/section/${currentLesson?.lessons.sectionId.id}/lesson/${currentLesson?.lessons.id}/item/${currentLesson?.continueItemId}`}
                total={currentLesson?.totalItems}
                progress={currentLesson?.completedItems}
              ></OverviewCard>
            )}

            {currentLesson?.items?.length === 0 ? (
              <div className="w-full p-5  rounded-lg bg-[var(--Accent-default)] flex items-center justify-center text-4xl font-bold text-white">
                {intl.formatMessage({ id: "lessonPage.noItem" })}
              </div>
            ) : (
              currentLesson?.items?.map((item, index) => (
                <div key={index}>
                  <ItemCard
                    item={item}
                    isLoading={isLoading}
                    onhandleMarkAsDone={handleMarkAsDone}
                    moduleId={Array.isArray(moduleId) ? moduleId[0] : moduleId}
                    sectionId={
                      Array.isArray(sectionId) ? sectionId[0] : sectionId
                    }
                    lessonId={Array.isArray(lessonId) ? lessonId[0] : lessonId}
                  ></ItemCard>
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
          {currentLesson?.previousLesson && (
            <Link
              href={`/student/student-dashboard/module/${currentLesson.previousLesson.courseId}/section/${currentLesson.previousLesson.sectionId}/lesson/${currentLesson.previousLesson.id}`}
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
                  intl.formatMessage({ id: "lesson" })}
              </Button>
            </Link>
          )}
          {currentLesson?.nextLesson && (
            <Link
              href={`/student/student-dashboard/module/${currentLesson.nextLesson.courseId}/section/${currentLesson.nextLesson.sectionId}/lesson/${currentLesson.nextLesson.id}`}
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
                  intl.formatMessage({ id: "lesson" })}
              </Button>
            </Link>
          )}
        </section>
      </div>
    );
  }
}
