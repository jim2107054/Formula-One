"use client";

import { Button, Icon } from "@/components/ui";
import Breadcrumbs from "@/components/ui/breadcrumb/Breadcrumb";
import SectionTag from "@/components/ui/section-tag/SectionTag";
import { FaCheck } from "react-icons/fa";
import Confetti from "react-confetti";
import { useState } from "react";
import { GoDownload } from "react-icons/go";
import { useParams } from "next/navigation";

import toast from "react-hot-toast";
import Spinner from "@/components/ui/spinner/Spinner";
import Link from "next/link";
import VideoItem from "./_components/VideoItem";
import PdfItem from "./_components/PdfItem";
import AudioItem from "./_components/AudioItem";
import LinkItem from "./_components/LinkItem";
import TextItem from "./_components/TextItem";
import { useItem, useUpdateItemStatus } from "@/hooks/queries/useItemQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useIntl } from "react-intl";
import ImageItem from "./_components/ImageItem";
import { useLessonWithItems } from "@/hooks/queries/useLessonQueries";
import { useSectionWithLessons } from "@/hooks/queries/useSectionQueries";
import { useCourseWithSections } from "@/hooks/queries/useCourseQueries";
import { useEnrollments } from "@/hooks/queries/useEnrollmentQueries";

export default function ItemPage() {
  const intl = useIntl();
  const { width, height } = window.screen;
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const { moduleId, lessonId, sectionId, itemId } = useParams();

  const [loadingNext, setLoadingNext] = useState(false);

  const { data: currentItem, isLoading, isError } = useItem(itemId as string);

  const updateItemStatus = useUpdateItemStatus();
  const { refetch: lessonRefetch } = useLessonWithItems(lessonId as string);
  const { refetch: sectionRefetch } = useSectionWithLessons(
    sectionId as string
  );
  const { refetch: moduleRefetch } = useCourseWithSections(moduleId as string);
  const { refetch: enrollmentRefetch } = useEnrollments();

  const handleMarkAsDone = async (id: string) => {
    if (!id) return;
    try {
      await updateItemStatus.mutateAsync(id);
      setTriggerConfetti(true);
      lessonRefetch();
      sectionRefetch();
      moduleRefetch();
      enrollmentRefetch();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while updating item status"
      );
    }
  };

  const formattedDuration = (duration: number) => {
    const hour = Math.floor(duration / 60);
    const minute = duration % 60;
    return `${hour}h ${minute}min`;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (isError) {
    return (
      <div className="text-center text-red-600">
        {intl.formatMessage({ id: "itemPage.error" })}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1200px] mx-auto pb-40">
        {triggerConfetti && (
          <Confetti
            className="mx-auto"
            recycle={false}
            width={width - 100}
            height={height}
            onConfettiComplete={() => setTriggerConfetti(false)}
          />
        )}
        <div className="">
          <Breadcrumbs
            courseId={Array.isArray(moduleId) ? moduleId[0] : moduleId ?? ""}
            sectionId={
              Array.isArray(sectionId) ? sectionId[0] : sectionId ?? ""
            }
            lessonId={Array.isArray(lessonId) ? lessonId[0] : lessonId ?? ""}
            itemId={Array.isArray(itemId) ? itemId[0] : itemId ?? ""}
          />
        </div>
        <SectionTag
          text={`${intl.formatMessage({ id: "lesson" })}  ${
            currentItem?.sectionId.order
          }.${currentItem?.lessonId.order}`}
          icon="lesson"
          className="w-fit mt-12 mb-[31px]"
        ></SectionTag>
        <div className="flex max-xl:flex-col max-xl:space-y-4 xl:justify-between xl:gap-10 ">
          <div className="flex flex-col gap-5  max-w-[800px]">
            <h2 className="text-[32px] font-semibold">{currentItem?.title}</h2>
            {currentItem?.contentSummary?.mediaType === "link" &&
              currentItem?.contentSummary?.description && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentItem?.contentSummary.description,
                  }}
                ></div>
              )}
            {["audio", "video"].includes(currentItem?.type ?? "other") && (
              <p className=" flex space-x-2 items-center ">
                <span>
                  <Icon name="gridicons_time" />
                </span>

                <span className="text-[var(--Primary-dark)] font-medium">
                  {formattedDuration(currentItem?.contentSummary.duration || 0)}
                </span>
              </p>
            )}
          </div>

          <div className="flex max-md:flex-col gap-2.5 md:items-start">
            {currentItem?.status === "completed" ? (
              <div className="flex items-center gap-2 p-5">
                <span className="font-semibold text-[var(--Accent-default)]">
                  {intl.formatMessage({ id: "completed" })}
                </span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    currentItem?.status !== "completed"
                      ? "border-[var(--Accent-default)] border"
                      : "bg-[var(--Accent-default)] "
                  } p-[3px] `}
                >
                  <FaCheck
                    className={`${
                      currentItem?.status === "completed"
                        ? "text-white "
                        : "text-[var(--Accent-default)]"
                    }`}
                  />
                </div>
              </div>
            ) : (
              <Button
                variant="light"
                onClick={() => handleMarkAsDone(currentItem?.id || "")}
                endIcon={
                  updateItemStatus.isPending ? (
                    <Spinner className="!text-[var(--Accent-default)]" />
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        currentItem?.status !== "completed"
                          ? "border-[var(--Accent-default)] border"
                          : "bg-[var(--Accent-default)] "
                      } p-[3px] `}
                    >
                      <FaCheck
                        className={`${
                          currentItem?.status === "completed"
                            ? "text-white "
                            : "text-[var(--Accent-default)]"
                        }`}
                      />
                    </div>
                  )
                }
                className={
                  currentItem?.status === "completed"
                    ? "pointer-events-none"
                    : "cursor-pointer w-fit"
                }
              >
                {intl.formatMessage({ id: "markAsDone" })}
              </Button>
            )}
            {currentItem?.contentSummary.downloadable &&
              currentItem?.contentSummary.url && (
                <a
                  href={currentItem.contentSummary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button
                    variant="light"
                    endIcon={<GoDownload className="size-5" />}
                  >
                    {intl.formatMessage({ id: "download" })}
                  </Button>
                </a>
              )}
          </div>
        </div>
        {(currentItem?.contentSummary?.mediaType === "" ||
          (currentItem?.contentSummary?.url === "" &&
            currentItem?.contentSummary.mediaType !== "quiz" &&
            currentItem?.contentSummary.mediaType !== "" &&
            currentItem?.contentSummary.mediaType !== "text" &&
            currentItem?.contentSummary.mediaType !== null) ||
          currentItem?.contentSummary?.mediaType === null) && (
          <div className="my-12 md:my-32 ">
            <div className="grid gap-12 justify-items-center">
              <Icon name="emptyItem" className="size-45 md:size-84" />
              <div className="grid gap-7 md:gap-12 justify-items-center">
                <div className="grid gap-4 text-center">
                  {" "}
                  <h2 className="max-w-[500px] text-3xl md:text-5xl font-semibold ">
                    {intl.formatMessage({ id: "itemPage.noItem.title" })}
                  </h2>
                  <p className="text-[var(--Primary-dark)]">
                    {intl.formatMessage({
                      id: "itemPage.noItem.description",
                    })}
                  </p>
                </div>
                <div className="flex max-md:flex-col gap-4">
                  <Link
                    href={`/student/student-dashboard/module/${currentItem.lessonId.courseId}/section/${currentItem.lessonId.sectionId}/lesson/${currentItem.lessonId._id}`}
                  >
                    <Button>
                      {intl.formatMessage({
                        id: "itemPage.exploreLessonButton",
                      })}
                    </Button>
                  </Link>
                  <Button variant="light">
                    {intl.formatMessage({ id: "button.getSupport" })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentItem?.contentSummary?.mediaType === "document" &&
          currentItem?.contentSummary?.url && (
            <div className="rounded-lg bg-primary-light flex flex-col gap-5 items-center justify-center p-10 w-full my-10">
              <h2 className="text-3xl font-semibold text-accent-dark-2">
                DOCUMENT
              </h2>
              <p className="text-primary-dark">
                Download the document to view it.
              </p>
            </div>
          )}
        {currentItem?.contentSummary?.mediaType === "image" &&
          currentItem?.contentSummary?.url && (
            <ImageItem url={currentItem.contentSummary.url} />
          )}
        {currentItem?.contentSummary?.mediaType === "text" &&
          currentItem?.contentSummary?.text && (
            <TextItem text={currentItem.contentSummary.text} />
          )}
        {currentItem?.contentSummary?.mediaType === "audio" &&
          currentItem?.contentSummary?.url && (
            <AudioItem url={currentItem.contentSummary.url} />
          )}
        {currentItem?.contentSummary?.url &&
          currentItem?.contentSummary.mediaType === "video" && (
            <VideoItem
              title={currentItem.title}
              url={currentItem.contentSummary.url}
            />
          )}
        {currentItem?.contentSummary?.mediaType === "link" &&
          currentItem?.contentSummary.url && (
            <LinkItem
              url={currentItem.contentSummary.url}
              title={currentItem.title}
            />
          )}

        {currentItem?.contentSummary?.url &&
          currentItem?.contentSummary.mediaType === "pdf" && (
            <PdfItem url={currentItem.contentSummary.url} />
          )}
        {currentItem?.nextItem !== null && (
          <div>
            <p className="mt-12 mb-4 text-[var(--Primary-dark-2)] font-medium">
              Up next:
            </p>
            <div className="bg-[var(--Primary-light)] rounded-lg py-[34px] px-4 md:px-[46px]">
              <p>
                {intl.formatMessage({ id: "lesson" })}{" "}
                {currentItem?.nextItem.sectionId.order}.
                {currentItem?.nextItem.lessonId.order}:{" "}
                {currentItem?.nextItem.lessonId.title}
              </p>
              <div className="flex max-md:flex-col max-md:space-y-4 md:justify-between  md:items-center mt-4 md:mt-[33.5px]">
                <h2 className="text-2xl font-semibold md:max-w-[350px] lg:max-w-[600px] xl:max-w-[800px]">
                  {currentItem?.nextItem.title}
                </h2>
                <Link
                  href={`/student/student-dashboard/module/${
                    currentItem?.nextItem.courseId._id
                  }/section/${currentItem?.nextItem.sectionId._id}/lesson/${
                    currentItem?.nextItem.lessonId._id
                  }/${
                    currentItem?.nextItem.mediaType === "quiz" ? "quiz" : "item"
                  }/${currentItem?.nextItem._id}`}
                >
                  <Button
                    onClick={() => setLoadingNext(true)}
                    startIcon={loadingNext ? <Spinner /> : <Icon name="play" />}
                  >
                    {intl.formatMessage({ id: "button.startNow" })}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
