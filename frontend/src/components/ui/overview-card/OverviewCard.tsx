"use client";

import styles from "./OverviewCard.module.css";
import { Button, Icon } from "@/components/ui";
import CircularProgress from "@/components/ui/circular-progress-bar/CircularProgressBar";
import Link from "next/link";
import { useState } from "react";
import Spinner from "../spinner/Spinner";

interface OverviewCardProps {
  title?: string;
  isSectionOverview?: boolean;
  lessonName?: string;
  itemName?: string;
  total?: number;
  progress?: number;
  path: string;
}

export default function OverviewCard({
  title,
  lessonName,
  itemName,
  path,
  progress,
  total,
}: OverviewCardProps) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="w-auto xl:w-[752px] h-auto px-4 xl:px-[32.5px] py-8 bg-[var(--Primary-light)] rounded-lg">
      <div className="grid grid-cols-1 xl:grid-cols-3">
        {/* left side */}

        <div className="col-span-2 w-auto xl:w-[449px] flex flex-col justify-between space-y-6">
          {/* title and date */}

          <div className="flex flex-col justify-center  ">
            <h2 className={styles.title}>{title}</h2>
          </div>

          <div className="flex  items-center justify-center xl:hidden ">
            {" "}
            <div className="">
              <CircularProgress
                progress={progress || 0}
                total={total || 0}
                sectionName="Section"
              ></CircularProgress>
            </div>
          </div>
          {/*conitnue button */}

          <div className="bg-white flex flex-col  xl:w-full  p-[31px] rounded-lg">
            <h2 className="text-xl mb-6">{lessonName}</h2>

            <Link href={path && path} className="">
              <Button
                className=" max-xl:w-full"
                onClick={() => setLoading(true)}
                startIcon={loading ? <Spinner /> : <Icon name="play" />}
              >
                {itemName}
              </Button>
            </Link>
          </div>
        </div>

        {/* right side */}

        <div className="flex flex-col  max-xl:hidden w-full h-full row-span-2">
          {" "}
          <div className="flex mx-auto my-auto">
            <CircularProgress
              progress={progress || 0}
              total={total || 0}
              sectionName="Section"
            ></CircularProgress>
          </div>
        </div>
      </div>
    </div>
  );
}
