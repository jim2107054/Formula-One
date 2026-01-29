"use client";

import { Button, Icon } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { FaCheck } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useIntl } from "react-intl";

interface CurriculumCardProps {
  sections: {
    id: string;
    title: string;
    order: number;
    isSpecial: boolean;
    lessons: {
      id: string;
      title: string;
      status: string;
      order: string;
    }[];
  }[];
  certificateData: {
    allow_download_certificate: boolean;
    certification_url: string;
    enrollId: string;
  };
  loading: boolean;
  error: boolean;
  hasCertificate: boolean;
}

export default function CurriculumCard({
  sections,
  loading,
  error,
  certificateData,
  hasCertificate,
}: CurriculumCardProps) {
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const intl = useIntl();
  return (
    <div className="bg-[var(--Primary-light)] w-auto xl:w-[423px] p-8 rounded-lg">
      {hasCertificate && (
        <div className="flex items-center space-x-[17px] md:w-[270px] xl:w-full mb-8">
          <div className="p-4 w-auto xl:w-[102px]   xl:h-[72px] relative rounded-[3.81px] flex justify-center items-center">
            <Image
              src="/images/Rectangle-175.png"
              alt="certificate image"
              fill
              sizes="50vw"
              className=" object-cover bg-center pointer-events-none"
            ></Image>
            {!certificateData.allow_download_certificate && (
              <Icon
                name="material-symbols-lock"
                className=" z-[1] size-8"
              ></Icon>
            )}
          </div>
          {certificateData.allow_download_certificate ? (
            <Link
              onClick={() => setLoadingCertificate(true)}
              href={`/student/student-dashboard/certificate/${certificateData.enrollId}`}
              className="mx-auto"
            >
              <Button
                endIcon={
                  loadingCertificate ? <Spinner /> : <IoIosArrowForward />
                }
              >
                {intl.formatMessage({ id: "curriculumCard.viewCertificate" })}
              </Button>
            </Link>
          ) : (
            <h2 className="font-semibold text-base md:max-lg:w-[100px]">
              {intl.formatMessage({ id: "curriculumCard.lockedMessage" })}
            </h2>
          )}
        </div>
      )}
      <h2 className="font-semibold text-2xl">
        {intl.formatMessage({ id: "curriculumCard.title" })}
      </h2>
      <div className="h-1 rounded-full mt-2 bg-[var(--Accent-default)]" />
      {loading && sections.length === 0 && (
        <p className="text-center text-2xl mt-5 font-semibold text-[var(--Accent-default)] animate-pulse">
          {intl.formatMessage({ id: "curriculumCard.loading" })}
        </p>
      )}
      {error && (
        <p className="text-center text-2xl mt-5 font-semibold text-red-500 ">
          {error}
        </p>
      )}
      {!loading && sections.length === 0 ? (
        <div className="w-full flex items-center justify-center p-6 text-2xl text-[var(--Primary)]">
          {intl.formatMessage({ id: "curriculumCard.noData" })}
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={index} className="mt-8">
            <div className="flex items-center space-x-2 font-semibold ">
              <p
                className={`flex items-center justify-center text-white  rounded-full w-5 h-5 text-center ${
                  section.isSpecial
                    ? "bg-[var(--Orange-default)]"
                    : "bg-[var(--Accent-default)]"
                }`}
              >
                {index + 1}
              </p>
              <h2>{section.title}</h2>
            </div>
            <div>
              {section?.lessons?.map((lesson, lessonIndex) => (
                <div
                  key={lesson?.id ?? lessonIndex}
                  className="flex items-center space-x-2 ml-6  group mt-[18.5px]"
                >
                  <div
                    className={`w-4 h-4 rounded-full  flex items-center justify-center ${
                      lesson?.status === "incomplete"
                        ? "border   "
                        : lesson?.status === "in-progress"
                        ? "border-[var(--Accent-default)] border"
                        : "bg-[var(--Accent-default)] "
                    } p-[3px] `}
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
                    className={`text-sm ${
                      lesson?.status === "in-progress"
                        ? " text-[var(--Accent-default)] "
                        : ""
                    }`}
                  >
                    {lesson?.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
