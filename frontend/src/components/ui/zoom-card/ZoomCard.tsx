import React from "react";
import Image from "next/image";
import { Button } from "../button";
import { Icon } from "../icon/Icon";
import styles from "./ZoomCard.module.css";
import { cn } from "@/lib/utils";

interface ZoomCardProps {
  time?: string;
  title?: string;
  subtitle?: string;
  meetingType?: string;
  buttonText?: string;
  onStartClick?: () => void;
  className?: string;
}

export const ZoomCard: React.FC<ZoomCardProps> = ({
  time = "",
  title = "",
  subtitle = "",
  meetingType = "",
  buttonText = "",
  onStartClick,
  className = "",
}) => {
  return (
    <section className={`${styles.zoom} ${className}`}>
      <article className={styles.frame}>
        <header
          className={cn(
            styles.header,
            "max-xl:flex-col max-xl:items-start items-center justify-between"
          )}
        >
          <time className={styles.time} dateTime="09:00">
            {time}
          </time>
          <div className={styles.meetingTag}>
            <Image
              className={styles.icon}
              alt="Zoom icon"
              src="/images/icons/akar-icons_zoom-fill.svg"
              width={18}
              height={18}
              priority
            />
            <span className={styles.meetingText}>{meetingType}</span>
          </div>
        </header>

        <div className={styles.details}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <Button
          variant="light"
          endIcon={<Icon name="arrow-circle-right" />}
          aria-label="Start Zoom meeting"
          className="w-fit"
          onClick={onStartClick}
        >
          {buttonText}
        </Button>
      </article>
    </section>
  );
};
