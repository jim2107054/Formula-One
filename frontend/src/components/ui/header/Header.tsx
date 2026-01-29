"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { LangToggle, ProfileMenu, SearchBar, HeaderNav } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import styles from "../profile-menu/ProfileMenu.module.css";
import { cn } from "@/lib/utils";
import { FaCheck, FaHome, FaQuestionCircle } from "react-icons/fa";
import { redirect } from "next/navigation";
import { useIntl } from "react-intl";
import { useCmsByKey } from "@/hooks/queries/useCmsQueries";
import { GoLink } from "react-icons/go";
import Link from "next/link";
import { useLocaleStore } from "@/zustand/stores/locale";
import { Locale } from "@/providers/IntlProvider";

interface HeaderProps {
  onSearch: (value: string) => void;
  searchValue: string;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onNotifications: () => void;
}

type Language = "EN" | "DE" | "RO" | "ES";

const LANGUAGES: Record<Language, { name: string; src: string }> = {
  EN: { name: "English", src: "/images/flags/GB.svg" },
  DE: { name: "German", src: "/images/flags/DE.svg" },
  RO: { name: "Romanian", src: "/images/flags/RO.svg" },
  ES: { name: "Spanish", src: "/images/flags/ES.svg" },
} as const;

const FLAG_DIMENSIONS = { width: 28, height: 20 } as const;

/**
 * Reusable Avatar component with status indicator
 */
const Avatar: React.FC<{
  userName?: string;
  avatarUrl?: string;
  status: "online" | "offline" | "away" | "busy";
  avatarBg: string;
  className?: string;
}> = ({ userName, avatarUrl, status, avatarBg, className }) => {
  const initials = useMemo(() => {
    if (!userName) return "";
    const compact = userName.replace(/\s+/g, "").toUpperCase();
    return compact.slice(0, 2);
  }, [userName]);

  const showInitials = !avatarUrl && !!initials;

  return (
    <div
      className={cn(styles.avatarOnlineWrapper, className)}
      role={userName}
      aria-label={userName ? userName : "User avatar"}
      style={{
        backgroundColor: showInitials ? "var(--Accent-default)" : undefined,
        backgroundImage: showInitials ? undefined : avatarBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={userName || "User avatar"}
          width={40}
          height={40}
          className={styles.avatar}
        />
      ) : showInitials ? (
        <span style={{ fontWeight: 600, color: "#ffffff" }}>{initials}</span>
      ) : null}

      {status !== "offline" && (
        <span
          className={cn(styles.avatarOnline, styles[status])}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onEditProfile,
  onChangePassword,
  onLogout,
  onNotifications,
  searchValue,
}) => {
  const intl = useIntl();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { locale, setLocale } = useLocaleStore();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    locale.toUpperCase() as Language
  );
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Add button ref
  const { data: usefulLinks } = useCmsByKey("useful-link");

  const handleMenuItemClick = useCallback((callback?: () => void) => {
    callback?.();
    setIsMobileMenuOpen(false);
  }, []);

  const toggleLanguageList = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLanguageExpanded((prev) => !prev);
  }, []);

  const selectLanguage = useCallback(
    (language: Language, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedLanguage(language);
      setIsLanguageExpanded(false);
    },
    []
  );

  const avatarBg = useMemo(
    () => `url(${user?.imageUrl ?? "/images/avatars/default-avatar.svg"})`,
    [user?.imageUrl]
  );

  const onMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const container = menuRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll('[role="menuitem"]')
    ) as HTMLElement[];
    if (!items.length) return;

    const active = document.activeElement as HTMLElement | null;
    const idx = active ? items.indexOf(active) : -1;

    if (e.key === "Escape") {
      setIsMobileMenuOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(idx + 1 + items.length) % items.length];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      prev?.focus();
    }
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both menu and button
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
        setIsLanguageExpanded(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="mb-6 max-md:px-5 flex items-center justify-between relative">
      {/* Logo and Navigation */}
      <div className="flex  items-center gap-4 sm:gap-6 xl:gap-20 ">
        <Link href={"/student/student-dashboard"}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-lg font-bold text-[var(--Primary)] hidden md:block">EduAI</span>
          </div>
        </Link>
        <h1 className="sr-only">EduAI Learning Platform</h1>
        <div className="hidden md:block">
          <HeaderNav />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 md:hidden">
        {/* search for mobile view */}
        <div className="hidden max-md:block scale-[65%] mr-[-20px] ">
          <SearchBar
            placeholder="Search"
            value={searchValue}
            onChange={(e) => {
              onSearch(e.target.value);
            }}
            className="!w-40   min-[800px]:!w-40 min-[1000px]:!w-80 "
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={buttonRef}
          className="md:hidden scale-150  rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 z-[100]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Search and User Actions */}
      <div className="hidden md:flex items-center gap-2 sm:gap-4">
        <div className="hidden md:block">
          <SearchBar
            placeholder={intl.formatMessage({
              id: "nav.searchBar.placeholder",
            })}
            value={searchValue}
            onChange={(e) => {
              onSearch(e.target.value);
            }}
            className="!w-32 min-[800px]:!w-40 min-[1000px]:!w-80"
          />
        </div>
        <LangToggle className="!hidden xl:!flex" />
        <ProfileMenu
          userName={user?.name}
          userEmail={user?.email}
          status="online"
          onEditProfile={onEditProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
          onNotifications={onNotifications}
          className="max-md:!hidden"
        />
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 mt-2 rounded-lg ">
          <nav
            className={cn(styles.dropdownMenu, "px-2")}
            aria-label="Mobile menu"
            ref={menuRef}
            onKeyDown={onMenuKeyDown}
            style={{ position: "relative", width: "100%", zIndex: 50 }}
          >
            <header className={cn(styles.dropdownListHeader, "-ml-1")}>
              <div className={styles.avatarLabelGroup}>
                <Avatar
                  userName={user?.name}
                  avatarUrl={user?.imageUrl}
                  status="online"
                  avatarBg={user?.imageUrl ? "" : avatarBg}
                />
                <div className={styles.textAndSupporting}>
                  {user?.name && (
                    <strong className={styles.text}>{user.name}</strong>
                  )}
                  {user?.email && (
                    <span className={styles.supportingText}>{user.email}</span>
                  )}
                </div>
              </div>
            </header>

            <hr className={styles.divider} />

            <ul className={styles.dropdownMenuBase}>
              <li
                className={styles.dropdownListItem}
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  redirect(`/student/student-dashboard`);
                }}
              >
                <FaHome className="text-primary-dark" />
                <span className={styles.textWrapper}>
                  {intl.formatMessage({ id: "nav.navOption.home" })}
                </span>
              </li>
              <li
                className={styles.dropdownListItem}
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  redirect(`/student/student-dashboard/faq`);
                }}
              >
                <FaQuestionCircle className="text-primary-dark" />
                <span className={styles.textWrapper}>FAQ</span>
              </li>
              {usefulLinks?.map((link, index) => (
                <li
                  key={index}
                  className={styles.dropdownListItem}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    redirect(link.bookingUrl);
                  }}
                >
                  <GoLink className="text-primary-dark" />
                  <span className={styles.textWrapper}>{link.title}</span>
                </li>
              ))}

              <li
                className={styles.dropdownListItem}
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  handleMenuItemClick(onEditProfile);
                  redirect(`/student/student-dashboard/edit-profile`);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Image
                  className={styles.img}
                  alt="Edit profile icon"
                  src="/images/icons/pencil-alt-outline.svg"
                  width={16}
                  height={16}
                  priority
                />
                <span className={styles.textWrapper}>
                  {intl.formatMessage({ id: "nav.navOption.editProfile" })}
                </span>
              </li>

              <hr className={styles.divider} />

              {/* Language Selector - Mobile Only */}
              <li
                className={cn(styles.dropdownListItem)}
                style={{ position: "relative", overflow: "visible" }}
                role="menuitem"
                tabIndex={-1}
              >
                <div
                  className="flex items-center justify-between w-full cursor-pointer"
                  onClick={toggleLanguageList}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className={styles.img}
                      alt={LANGUAGES[selectedLanguage].name}
                      src={LANGUAGES[selectedLanguage].src}
                      {...FLAG_DIMENSIONS}
                      priority
                    />
                    <span className={styles.textWrapper}>
                      {intl.formatMessage({ id: "language" })}
                    </span>
                  </div>
                  <Image
                    src="/images/icons/chevron-up-outline.svg"
                    alt="Toggle"
                    width={16}
                    height={16}
                    className={`transition-transform ${
                      isLanguageExpanded ? "" : "rotate-180"
                    }`}
                  />
                </div>

                {isLanguageExpanded && (
                  <div
                    className={styles.languageDropdown}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={cn(
                          styles.languageOption,
                          lang === selectedLanguage && styles.selected
                        )}
                        onClick={(e) => {
                          selectLanguage(lang, e);
                          setLocale(lang.toLowerCase() as Locale);
                          setIsMobileMenuOpen(false);
                          setIsLanguageExpanded(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            alt={LANGUAGES[lang].name}
                            src={LANGUAGES[lang].src}
                            {...FLAG_DIMENSIONS}
                          />
                          <span className="text-sm">
                            {LANGUAGES[lang].name}
                          </span>
                        </div>
                        {lang === selectedLanguage && <FaCheck />}
                      </button>
                    ))}
                  </div>
                )}
              </li>

              <hr className={styles.divider} />

              {/* Notifications - Mobile Only */}
              {/* <li
                className={styles.dropdownListItem}
                role="menuitem"
                tabIndex={-1}
                onClick={() => handleMenuItemClick(onNotifications)}
              >
                <Image
                  className={styles.img}
                  alt="Notifications icon"
                  src={"/images/icons/bell.svg"}
                  width={16}
                  height={16}
                  priority
                />
                <span className={styles.textWrapper}>
                  {intl.formatMessage({ id: "nav.navOption.notifications" })}
                </span>
              </li>

              <hr className={styles.divider} /> */}

              <li
                className={styles.dropdownListItem}
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  handleMenuItemClick(onChangePassword);
                  redirect(`/student/student-dashboard/change-password`);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Image
                  className={styles.img}
                  alt="Change password icon"
                  src="/images/icons/help-circle.svg"
                  width={16}
                  height={16}
                  priority
                />
                <span className={styles.textWrapper}>
                  {intl.formatMessage({ id: "nav.navOption.changePassword" })}
                </span>
              </li>

              <hr className={styles.divider} />

              <li
                className={styles.logout}
                role="menuitem"
                tabIndex={-1}
                onClick={() => handleMenuItemClick(onLogout)}
              >
                <Image
                  className={styles.img}
                  alt="Log out icon"
                  src="/images/icons/log-out.svg"
                  width={16}
                  height={16}
                  priority
                />
                <span className={styles.textWrapper}>
                  {intl.formatMessage({ id: "nav.navOption.logOut" })}
                </span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};
