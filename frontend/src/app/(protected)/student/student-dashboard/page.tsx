"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ResumeCard, ModuleSection, Icon, Button } from "@/components/ui";
import FlagSelector from "@/components/ui/flag-selector/FlagSelector";
import Spinner from "@/components/ui/spinner/Spinner";
import { useCmsByKey } from "@/hooks/queries/useCmsQueries";
import { useEnrollments } from "@/hooks/queries/useEnrollmentQueries";
import { parseFilters } from "@/util/parseFilter";
import { Enroll } from "@/zustand/types/enroll";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

// import required modules
import { Pagination, Autoplay } from "swiper/modules";

// Custom styles for Swiper pagination
const swiperStyles = `
  .custom-swiper .swiper-pagination {
    position: relative !important;
    bottom: auto !important;
    margin-top: 1rem;
  }
  .custom-swiper .swiper-pagination-bullet {
    background-color: var(--Primary);
    opacity: 0.5;
  }
  .custom-swiper .swiper-pagination-bullet-active {
    background-color: var(--Accent-default);
    opacity: 1;
  }
`;

export default function StudentDashboard() {
  const intl = useIntl();
  const [gotToUpcomingModules, setGotToUpcomingModules] = useState(false);
  const [viewWorkshops, setViewWorkshops] = useState(false);
  const {
    data: upcomingModules,
    isLoading: isLoadingUpcomingModules,
    error: errorUpcomingModules,
  } = useCmsByKey("upcoming-module");

  const limit = 100;

  const searchParams = useSearchParams();

  const filters = useMemo(
    () =>
      parseFilters(searchParams ?? new URLSearchParams(), { page: 1, limit }),
    [searchParams, limit]
  );

  const {
    data: enrolls,
    isLoading,
    refetch,
    isFetching,
  } = useEnrollments(filters, {
    placeholderData: (prev) => prev,
  });
  const [allModules, setAllmodules] = useState<Enroll[]>([]);

  useEffect(() => {
    if (!isLoading && enrolls) {
      setAllmodules(enrolls.data);
    }
  }, [isLoading, enrolls]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading || isFetching) {
    return <LoadingSpinner />;
  } else if (!isLoading && enrolls?.data.length === 0) {
    return (
      <div className="my-12 md:my-32 ">
        <div className="grid gap-12 justify-items-center">
          <Icon name="no-enrolls" className="size-45 md:size-84" />
          <div className="grid gap-7 md:gap-12 justify-items-center">
            <div className="grid gap-4 text-center">
              {" "}
              <h2 className="max-w-[500px] text-3xl md:text-5xl font-semibold ">
                {intl.formatMessage({ id: "dashboard.noModules.title" })}
              </h2>
              <p className="text-[var(--Primary-dark)]">
                {intl.formatMessage({ id: "dashboard.noModules.description" })}
              </p>
            </div>
            <div className="flex max-md:flex-col gap-4">
              <Link href={"/student/student-dashboard/upcoming-workshops"}>
                <Button>
                  {intl.formatMessage({ id: "button.exploreWorkshops" })}
                </Button>
              </Link>
              <Button variant="light">
                {intl.formatMessage({ id: "button.getSupport" })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <style>{swiperStyles}</style>
        <div className="max-w-[1200px] mx-auto  space-y-10">
          <section className="block xl:hidden">
            <ResumeCard property1="default" enrolls={allModules} />
          </section>
          <div className="grid grid-cols-1 xl:grid-cols-5 xl:gap-6 mt-10 mb-20 ">
            {/* Left column: main content */}
            <main className="lg:col-span-3 order-2 xl:order-1 ">
              <section className="xl:block hidden">
                <ResumeCard property1="default" enrolls={allModules} />
              </section>

              <ModuleSection allModules={allModules} />
            </main>

            {/* Right column: sidebar */}
            <aside className=" max-xl:grid md:max-xl:grid-cols-1 max-xl:mb-6 xl:col-span-2 xl:space-y-6 xl:order-2 order-1 w-full max-xl:gap-8">
              {/* <ZoomCard
            time="09:00 - 18:00"
            title="Zoom introductory lecture"
            subtitle="Certified Neurofeedback Therapist"
            meetingType="Zoom Meeting"
            buttonText="Start Now"
            onStartClick={handleStartMeeting}
            className="max-xl:h-auto "
          /> */}

              <div className="flex  md:justify-between max-md:w-fit xl:mt-11">
                <h2 className="text-xl font-bold text-[var(--Primary)]">
                  {intl.formatMessage({
                    id: "upcomingWorkshops.recentWorkshops",
                  })}
                </h2>
                <Link
                  className="max-md:hidden block"
                  onClick={() => setViewWorkshops(true)}
                  href={"/student/student-dashboard/upcoming-workshops"}
                >
                  <Button endIcon={viewWorkshops && <Spinner />}>
                    {intl.formatMessage({
                      id: "upcomingWorkshops.viewAllWorkshops",
                    })}
                  </Button>
                </Link>
              </div>
              {isLoadingUpcomingModules ? (
                <LoadingSpinner />
              ) : errorUpcomingModules ? (
                <p className="text-red-500">
                  {intl.formatMessage({
                    id: "upcomingWorkshops.errorLoading",
                  })}
                </p>
              ) : (
                <div className="max-md:w-[90%]">
                  <div className="xl:block hidden">
                    <div className="grid gap-4 mt-6">
                      {upcomingModules &&
                        upcomingModules.slice(0, 4).map((module) => (
                          <Link
                            href={module.bookingUrl}
                            key={module.id}
                            target="_blank"
                            className="p-6 group rounded-lg border border-[var(--Primary)] hover:border-[var(--Accent-light)] transition-all duration-300 ease-in-out grid gap-6"
                          >
                            <div className="flex items-center gap-2">
                              <FlagSelector name={module.language} />
                              <p>{module.language}</p>
                            </div>
                            <h2 className="font-semibold leading-[150%] tracking-[-0.02em] group-hover:text-[var(--Accent-default)] duration-300 transition-all ease-in-out">
                              {module.title}
                            </h2>
                          </Link>
                        ))}
                    </div>
                  </div>
                  {/* slider */}
                  <div className="xl:hidden block max-w-screen overflow-x-hidden items-start relative">
                    <Swiper
                      loop={true}
                      autoplay={{ delay: 2000, disableOnInteraction: false }}
                      pagination={{ clickable: true }}
                      modules={[Pagination, Autoplay]}
                      slidesPerView={1}
                      spaceBetween={16}
                      breakpoints={{
                        480: { slidesPerView: 1, spaceBetween: 16 },
                        640: { slidesPerView: 1, spaceBetween: 20 },
                        768: { slidesPerView: 1, spaceBetween: 24 },
                        1024: { slidesPerView: 1, spaceBetween: 24 },
                      }}
                      className="custom-swiper"
                    >
                      {upcomingModules &&
                        upcomingModules.slice(0, 4).map((module) => (
                          <SwiperSlide key={module.id}>
                            <Link
                              href={module.bookingUrl}
                              target="_blank"
                              className="p-6 group rounded-lg border border-[var(--Primary)] hover:border-[var(--Accent-light)] transition-all duration-300 ease-in-out grid gap-6 "
                            >
                              <div className="flex items-center gap-2">
                                <FlagSelector name={module.language} />
                                <p>{module.language}</p>
                              </div>
                              <h2 className="font-semibold leading-[150%] tracking-[-0.02em] group-hover:text-[var(--Accent-default)] duration-300 transition-all ease-in-out">
                                {module.title}
                              </h2>
                            </Link>
                          </SwiperSlide>
                        ))}
                    </Swiper>
                  </div>
                </div>
              )}

              <Link
                href={`/student/student-dashboard/upcoming-workshops`}
                onClick={() => setGotToUpcomingModules(!gotToUpcomingModules)}
                className={`p-6 ${
                  gotToUpcomingModules
                    ? "bg-[var(--Accent-light)]"
                    : "bg-[var(--Primary-light)]"
                } border border-[var(--Primary-light)] hover:border-[var(--Accent-default)]  transition-all duration-300 ease-in-out rounded-[9px] flex items-center space-x-4 cursor-pointer max-md:w-[90%]`}
              >
                <div className="bg-[var(--Accent-default)] p-4 rounded-full w-fit">
                  {gotToUpcomingModules ? (
                    <Spinner className="!size-[50px]" />
                  ) : (
                    <Icon name="graduation" className="size-[58px]" />
                  )}
                </div>
                <div className="flex flex-col  space-y-2.5">
                  <h2 className="text-2xl font-bold text-[var(--Accent-default)]">
                    {intl.formatMessage({ id: "dashboard.workshops" })}
                  </h2>
                  <h2 className="text-[var(--Primary-dark)] text-xl ">
                    {intl.formatMessage({ id: "dashboard.workshops.visit" })}
                  </h2>
                </div>
              </Link>
              {/* <div>
            <h3 className="primary-title">Upcoming Workshops</h3>
            <div className="flex flex-col gap-4 mt-6">
              <Frame
                backSrc="/images/image-15.png"
                frontSrc="/images/gradient-layer.png"
                title="What is Neurofeedback and how it works?"
              />
              <Frame
                backSrc="/images/image-16.png"
                frontSrc="/images/gradient-layer.png"
                title="Advancing Neurofeedback Practice"
              />
            </div>
          </div> */}
            </aside>
          </div>
        </div>
      </>
    );
  }
}
