"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HeaderNav.module.css";
import { IoIosArrowDown } from "react-icons/io";
import { MdHome } from "react-icons/md";
import { useIntl } from "react-intl";
import { useCmsByKey } from "@/hooks/queries/useCmsQueries";
import { FaQuestionCircle } from "react-icons/fa";
import { GoLink } from "react-icons/go";

export const HeaderNav = () => {
  const intl = useIntl();
  const pathname = usePathname();
  const [showLinks, setShowLinks] = useState(false);
  const { data: usefulLinks } = useCmsByKey("useful-link");

  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  const inferred = pathname?.includes("/student/student-dashboard/")
    ? ""
    : "home";

  const items = [
    {
      key: "home",
      href: "/student/student-dashboard",
      icon: <MdHome className="size-5" />,
      label: intl.formatMessage({ id: "nav.navOption.home" }),
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setShowLinks(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={styles.container}
      role="navigation"
      aria-label="Main Navigation"
    >
      {items.map((it) => {
        const activeClass =
          inferred === it.key ? styles.active : styles.inactive;
        return (
          <Link
            key={it.key}
            href={it.href}
            aria-label={it.label}
            className={`${styles.item} ${activeClass}`}
          >
            {it.icon && <span>{it.icon}</span>}
            <span className={styles.text}>{it.label}</span>
            {!it.icon && <IoIosArrowDown />}
          </Link>
        );
      })}

      <div
        ref={dropdownContainerRef}
        className="relative flex items-center h-full"
      >
        <div
          className={`${styles.item} ${styles.inactive} cursor-pointer`}
          onClick={() => setShowLinks(!showLinks)}
        >
          <span className={styles.text}>
            {intl.formatMessage({ id: "nav.navOption.usefulLinks" })}
          </span>
          <IoIosArrowDown
            className={`transition-all duration-300 ease-in-out ${
              showLinks ? "rotate-180" : ""
            }`}
          />
        </div>

        {showLinks && (
          <div
            id="useful-link-dropdown"
            className="absolute top-full left-0 mt-2 min-w-[250px] z-50 rounded-lg bg-[var(--Primary-light)] flex flex-col shadow-md"
          >
            <Link
              target="_blank"
              onClick={() => setShowLinks(false)}
              href={"/student/student-dashboard/faq"}
              className="text-[var(--Primary-dark)] hover:text-[var(--Accent-default)] rounded-lg transition-all duration-300 ease-in-out font-medium px-4 py-2 hover:bg-[var(--Accent-light)] flex items-center gap-2"
            >
              <FaQuestionCircle />
              <span>FAQ</span>
            </Link>
            {usefulLinks?.map((link, index) => (
              <Link
                target="_blank"
                onClick={() => setShowLinks(false)}
                href={link.bookingUrl}
                key={index}
                className="text-[var(--Primary-dark)] hover:text-[var(--Accent-default)] rounded-lg transition-all duration-300 ease-in-out font-medium px-4 py-2 hover:bg-[var(--Accent-light)] flex items-center gap-2"
              >
                <GoLink />
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderNav;
