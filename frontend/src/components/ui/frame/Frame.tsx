"use client";

import React from "react";
import Image from "next/image";
import styles from "./Frame.module.css";

interface FrameProps {
  backSrc?: string;
  frontSrc?: string;
  title?: string;
}

export const Frame = ({
  backSrc = "/images/image-15.png",
  frontSrc = "/images/gradient-layer.png",
  title = "What is Neurofeedback and how it works?",
}: FrameProps) => {
  return (
    <div className={styles.frame}>
      <div className={styles.inner}>
        <div className={styles.blank} />

        <Image
          className={styles.imgBack}
          src={backSrc}
          alt="Workshop image back"
          fill
          style={{ objectFit: "cover" }}
          priority
        />

        <Image
          className={styles.imgFront}
          src={frontSrc}
          alt="Front layer"
          fill
          style={{ objectFit: "cover" }}
          priority
        />

        <p className={styles.title}>{title}</p>
      </div>
    </div>
  );
};
