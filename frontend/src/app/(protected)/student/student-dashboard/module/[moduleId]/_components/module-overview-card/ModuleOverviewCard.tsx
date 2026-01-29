"use client";

import styles from "./ModuleOverviewCard.module.css";

import { Button, Icon } from "@/components/ui";
import CircularProgress from "@/components/ui/circular-progress-bar/CircularProgressBar";
import Spinner from "@/components/ui/spinner/Spinner";
import { Section } from "@/zustand/types/section";
import Link from "next/link";
import { useState } from "react";
import { useIntl } from "react-intl";

interface ModuleOverviewCardProps {
  moduleTitle?: string;
  section: Section;
  courseId?: string;
  total: number;
  progress: number;
}

export default function ModuleOverviewCard({
  moduleTitle,
  section,
  courseId,
  progress,
  total,
}: ModuleOverviewCardProps) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  return (
    <div className=" w-auto xl:w-[752px] h-auto px-4 xl:px-[32.5px] py-8 bg-[var(--Primary-light)] rounded-lg">
      <div className="grid grid-cols-1 xl:grid-cols-3">
        {/* left side */}

        <div className="col-span-2 w-auto xl:w-[449px] flex flex-col justify-between space-y-6">
          {/* title and date */}

          <div className="flex flex-col justify-center  ">
            <h2 className={styles.title}>{moduleTitle}</h2>

            {/* <div className={styles.dateWrapper}>
              <Image
                className={styles.calendarIcon}
                src="/images/icons/calendar.svg"
                alt="Calendar icon"
                width={24}
                height={24}
              />
              <time className={styles.dateText}>25/08/25 - 25/09/25</time>
            </div> */}
          </div>

          <div className="flex  items-center justify-center xl:hidden  ">
            {" "}
            <div className="">
              <CircularProgress
                progress={progress}
                total={total}
                sectionName="Section"
              ></CircularProgress>
            </div>
          </div>

          {/* conitnue button */}

          <div className="xl:bg-white flex flex-col  xl:w-full  xl:p-[31px] rounded-lg">
            <span className=" text-xl ">{section?.title}</span>

            <Link
              href={`/student/student-dashboard/module/${courseId}/section/${section?.id}`}
            >
              {" "}
              <Button
                onClick={() => setLoading(true)}
                className="mt-6 max-xl:w-full"
                startIcon={loading ? <Spinner /> : <Icon name="play" />}
              >
                {intl.formatMessage({ id: "continueTo" })}{" "}
                {intl.formatMessage({ id: "section" })} {section?.order}
              </Button>
            </Link>
          </div>
        </div>

        {/* right side */}

        <div className="flex flex-col max-xl:hidden  w-full h-full row-span-2">
          {" "}
          <div className="flex mx-auto my-auto">
            <CircularProgress
              progress={progress}
              total={total}
              sectionName="Section"
            ></CircularProgress>
          </div>
        </div>
      </div>
    </div>
  );
}
