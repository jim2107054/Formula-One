import React, { useState } from "react";
import { Button } from "../button";
import { Icon } from "../icon/Icon";
import styles from "./ResumeCard.module.css";
import SectionTag from "../section-tag/SectionTag";
import Spinner from "../spinner/Spinner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Enroll } from "@/zustand/types/enroll";
import { useIntl } from "react-intl";

interface Props {
  property1: "default";
  enrolls: Enroll[];
}

export const ResumeCard = ({ property1 = "default", enrolls }: Props) => {
  const [loading, setLoading] = useState(false);
  const intl = useIntl();
  const filteredEnrolls = enrolls.filter(
    (enroll) => enroll.continued_course === true
  );

  return (
    <section>
      {filteredEnrolls &&
        filteredEnrolls.length > 0 &&
        filteredEnrolls[0].course?.currentSection && (
          <div className=" mb-8 xl:mb-20">
            <h2 className="primary-title">
              {intl.formatMessage({ id: "dashboard.continueWhereYouLeftOff" })}
            </h2>
            <div
              className={`${styles.resumeCard} ${styles[property1]} group`}
              aria-label="Resume Module Card"
            >
              {filteredEnrolls &&
                filteredEnrolls.length > 0 &&
                filteredEnrolls.map((enroll) => (
                  <div
                    key={enroll.course?._id}
                    className={styles.resumeCardContent}
                  >
                    <header className={styles.resumeCardHeader}>
                      <div className={styles.resumeCardModuleInfo}>
                        <SectionTag
                          icon="module"
                          status="default"
                          className="group-hover:bg-[var(--Accent-default)]"
                        />
                        <p className={styles.resumeCardModuleTitle}>
                          {enroll.course?.title}
                        </p>
                      </div>
                    </header>

                    <div
                      className={cn(
                        styles.resumeCardBody,
                        "max-md:flex-col max-md:items-start items-center "
                      )}
                    >
                      <h2 className={styles.resumeCardDescription}>
                        {enroll?.course?.currentSection?.title}
                      </h2>
                      <Link
                        href={`/student/student-dashboard/module/${enroll.course?._id}`}
                        className="max-md:mt-4"
                      >
                        <Button
                          onClick={() => setLoading(true)}
                          variant="default"
                          startIcon={
                            loading ? <Spinner /> : <Icon name="play" />
                          }
                          className={styles.resumeBtnInstance}
                        >
                          {intl.formatMessage({ id: "button.resume" })}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
    </section>
  );
};
