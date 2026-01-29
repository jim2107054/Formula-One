"use client";

import React from "react";
import styles from "./ModuleSection.module.css";
import { ModuleCard } from "../module-card/ModuleCard";
import { Enroll } from "@/zustand/types/enroll";
import { useIntl } from "react-intl";

export const ModuleSection = ({ allModules }: { allModules: Enroll[] }) => {
  const intl = useIntl();

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.tabs}>
          {intl.formatMessage({ id: "dashboard.currentlyStudying" })}{" "}
          {`(${allModules.length})`}
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.list}>
          {Array.isArray(allModules) &&
            allModules.map((data: Enroll, index) => (
              <div key={data?._id || index} className={styles.itemWrapper}>
                <ModuleCard moduleDetail={data} property1="default" />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ModuleSection;
