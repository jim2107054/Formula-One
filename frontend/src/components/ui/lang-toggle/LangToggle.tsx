"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./LangToggle.module.css";
import { FaCheck } from "react-icons/fa";
import { useLocaleStore } from "@/zustand/stores/locale";

interface LangToggleProps {
  variant?: "frame-46" | "variant-3";
  className?: string;
}

type Language = "en" | "de" | "ro" | "es";

const LANGUAGES: Record<Language, { name: string; src: string }> = {
  en: { name: "English", src: "/images/flags/GB.svg" },
  de: { name: "German", src: "/images/flags/DE.svg" },
  ro: { name: "Romanian", src: "/images/flags/RO.svg" },
  es: { name: "Spanish", src: "/images/flags/ES.svg" },
} as const;

const FLAG_DIMENSIONS = { width: 28, height: 20 } as const;
const CHEVRON_DIMENSIONS = { width: 24, height: 24 } as const;

export const LangToggle = ({
  variant = "frame-46",
  className = "",
}: LangToggleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerRef = useRef<HTMLElement>(null);

  const { setLocale } = useLocaleStore();

  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");

  const toggleLanguageList = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSelectLanguage = useCallback(
    (lang: Language) => {
      setSelectedLanguage(lang);
      setLocale(lang);
      setIsExpanded(false);
    },
    [setLocale]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const variantClass =
    variant === "frame-46" ? styles.frame46 : styles.variant3;

  return (
    <section
      ref={containerRef}
      className={`${styles.langToggle} ${variantClass} ${className}`}
      onClick={toggleLanguageList}
      role="button"
      aria-expanded={isExpanded}
      aria-haspopup="listbox"
    >
      <div className={styles.leftContent}>
        <Image
          className={styles.flag}
          alt={LANGUAGES[selectedLanguage].name}
          src={LANGUAGES[selectedLanguage].src}
          {...FLAG_DIMENSIONS}
        />

        {isExpanded && (
          <ul
            id="language-dropdown"
            className={styles.languageList}
            role="listbox"
            onClick={(e) => e.stopPropagation()}
          >
            {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
              <li
                key={lang}
                onClick={() => handleSelectLanguage(lang)}
                className="hover:bg-[var(--Accent-light)] px-4 py-2 first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                role="option"
                aria-selected={lang === selectedLanguage}
              >
                <div
                  className={`${styles.languageOption} ${
                    lang === selectedLanguage ? styles.selectedLanguage : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      className={styles.flag}
                      alt={LANGUAGES[lang].name}
                      src={LANGUAGES[lang].src}
                      {...FLAG_DIMENSIONS}
                    />
                    <span className="text-left">{LANGUAGES[lang].name}</span>
                  </div>
                  {lang === selectedLanguage && (
                    <FaCheck className="text-lg text-[var(--Accent-default)] ml-2" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Image
        className={`${styles.chevron} ${
          isExpanded ? styles.chevronRotated : ""
        }`}
        alt="Toggle language list"
        src="/images/icons/chevron-up-outline.svg"
        {...CHEVRON_DIMENSIONS}
      />
    </section>
  );
};
