"use client";

import ModuleOverviewCard from "@/app/(protected)/student/student-dashboard/module/[moduleId]/_components/module-overview-card/ModuleOverviewCard";

import SectionCard from "@/app/(protected)/student/student-dashboard/module/[moduleId]/_components/section-card/SectionCard";
import Breadcrumbs from "@/components/ui/breadcrumb/Breadcrumb";

import { Section } from "@/zustand/types/section";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CurriculumCard from "./_components/curriculum-card/CurriculumCard";
import { useCourseWithSections } from "@/hooks/queries/useCourseQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useIntl } from "react-intl";

export default function ModulePage() {
  const [filteredSection, setFilteredSection] = useState<Section[]>([]);
  const intl = useIntl();
  const { moduleId } = useParams();
  const {
    data: coursesWithSections,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useCourseWithSections(moduleId as string);

  useEffect(() => {
    if (!isLoading && !isError && coursesWithSections)
      setFilteredSection(
        coursesWithSections?.sections.filter(
          (section) => section.id === coursesWithSections.continueSectionId
        )
      );
  }, [isLoading, isError, coursesWithSections]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading || isFetching) {
    return <LoadingSpinner />;
  } else if (isError) {
    return (
      <div className="text-center text-red-600">
        {intl.formatMessage({ id: "modulePage.error" })}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1200px] mx-auto pb-10 ">
        {/* BreadCrumb  */}

        <div>
          <Breadcrumbs
            courseId={Array.isArray(moduleId) ? moduleId[0] : moduleId ?? ""}
            sectionId={""}
            lessonId={""}
            itemId={""}
          />
        </div>

        {/* main card  */}

        <main className="mt-9 flex max-md:flex-col gap-5 md:gap-6.5 ">
          <div className="xl:w-full md:max-xl:w-[60%] w-auto flex flex-col gap-6  ">
            {coursesWithSections?.continueSectionId && (
              <ModuleOverviewCard
                section={filteredSection[0]}
                moduleTitle={coursesWithSections.course.title}
                courseId={Array.isArray(moduleId) ? moduleId[0] : moduleId}
                progress={coursesWithSections.completedSections}
                total={coursesWithSections.totalSections}
              ></ModuleOverviewCard>
            )}

            {!isLoading && coursesWithSections?.sections.length === 0 ? (
              <div className=" xl:w-full w-auto p-5  rounded-lg bg-[var(--Accent-default)] flex items-center justify-center text-4xl font-bold text-white">
                {intl.formatMessage({ id: "modulePage.noSection" })}
              </div>
            ) : (
              coursesWithSections?.sections.map((section, index) => (
                <SectionCard
                  key={index}
                  section={section}
                  moduleId={Array.isArray(moduleId) ? moduleId[0] : moduleId}
                  className=""
                />
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
              loading={isLoading}
              error={isError}
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
      </div>
    );
  }
}
