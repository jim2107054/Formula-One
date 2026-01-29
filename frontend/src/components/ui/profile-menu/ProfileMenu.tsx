"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";

import { FaCheck } from "react-icons/fa";
import { useIntl } from "react-intl";
import { cn } from "@/lib/utils";
import styles from "./ProfileMenu.module.css";
import { useAuth } from "@/hooks/useAuth";

/**
 * Props for ProfileMenu.
 * All values are optional; callers should provide the content they want shown.
 */
interface ProfileMenuProps {
  className?: string;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  status?: "online" | "offline" | "away" | "busy";
  onEditProfile?: () => void;
  onChangePassword?: () => void;
  onLogout?: () => void;
  onNotifications?: () => void;
}

type Language = "EN" | "DE" | "RO" | "ES";

const LANGUAGES: Record<Language, { name: string; src: string }> = {
  EN: { name: "English (UK)", src: "/images/flags/GB.svg" },
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

/**
 * ProfileMenu
 * - Renders an avatar trigger that opens a dropdown menu when action callbacks are provided.
 * - The dropdown position is computed to remain within the viewport.
 */
export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  className,
  userName,
  userEmail,
  status = "offline",
  onEditProfile,
  onChangePassword,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("EN");
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | undefined>(
    undefined
  );
  const rafRef = useRef<number | null>(null);
  const lastStyleRef = useRef<string | null>(null);
  const intl = useIntl();
  const { user } = useAuth();

  // Memoize computed values
  const hasCallbacks = useMemo(
    () => Boolean(onEditProfile || onChangePassword || onLogout),
    [onEditProfile, onChangePassword, onLogout]
  );
  const isDropdownVisible = hasCallbacks;

  const avatarBg = useMemo(
    () => `url(${user?.imageUrl ?? "/images/avatars/default-avatar.svg"})`,
    [user?.imageUrl]
  );

  // Memoize event handlers
  const toggleDropdown = useCallback(() => setIsDropdownOpen((v) => !v), []);

  const handleMenuItemClick = useCallback((callback?: () => void) => {
    callback?.();
    setIsDropdownOpen(false);
  }, []);

  // Removed redundant event listener - handled by click-outside logic below

  // const handleNotificationsClick = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     onNotifications?.();
  //   },
  //   [onNotifications]
  // );

  // const toggleLanguageList = useCallback((e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setIsLanguageExpanded((prev) => !prev);
  // }, []);

  const selectLanguage = useCallback(
    (language: Language, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedLanguage(language);
      setIsLanguageExpanded(false);
    },
    []
  );

  const onAvatarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isDropdownVisible) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsDropdownOpen((v) => !v);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
    },
    [isDropdownVisible]
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
      setIsDropdownOpen(false);
      (containerRef.current as HTMLElement | null)?.focus();
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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsLanguageExpanded(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Compute dropdown position to stay within viewport
  const computePosition = useCallback(() => {
    const container = containerRef.current;
    const menu = menuRef.current as HTMLElement | null;
    if (!container || !menu) return null;

    const cRect = container.getBoundingClientRect();
    const mRect = menu.getBoundingClientRect();
    const spacing = 8;

    let top = cRect.bottom + spacing;
    let left = cRect.right - mRect.width;

    if (left < 8) left = Math.max(8, cRect.left);
    if (top + mRect.height > window.innerHeight - 8) {
      top = cRect.top - mRect.height - spacing;
    }
    if (top < 8) top = 8;

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000,
    } as React.CSSProperties;
  }, []);

  // Update menu position on resize/scroll
  useEffect(() => {
    if (!isDropdownOpen) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastStyleRef.current = null;
      setMenuStyle(undefined);
      return;
    }

    const schedulePosition = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const style = computePosition();
        if (!style) return;
        const key = JSON.stringify(style);
        if (lastStyleRef.current !== key) {
          lastStyleRef.current = key;
          setMenuStyle(style);
        }
      });
    };

    schedulePosition();

    const onWinChange = () => schedulePosition();
    window.addEventListener("resize", onWinChange, { passive: true });
    window.addEventListener("scroll", onWinChange, { passive: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("resize", onWinChange);
      window.removeEventListener("scroll", onWinChange);
    };
  }, [isDropdownOpen, computePosition]);

  // Focus first menu item when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && menuRef.current) {
      const first = menuRef.current.querySelector(
        '[role="menuitem"]'
      ) as HTMLElement | null;
      first?.focus();
    }
  }, [isDropdownOpen]);

  return (
    <section className={cn(styles.profileMenu, className)}>
      <div className={cn(styles.actionsRow)}>
        {/* <Button
          variant="icon"
          aria-label="Notifications"
          onClick={handleNotificationsClick}
          type="button"
          className="max-xl:hidden group"
        >
          <FaRegBell className="size-5 shrink-0 group-hover:text-white" />
        </Button> */}

        <div
          className={cn(styles.avatarContainer)}
          ref={containerRef}
          onClick={isDropdownVisible ? toggleDropdown : undefined}
          onKeyDown={isDropdownVisible ? onAvatarKeyDown : undefined}
          role={isDropdownVisible ? "button" : undefined}
          tabIndex={isDropdownVisible ? 0 : undefined}
          aria-haspopup={isDropdownVisible ? "menu" : undefined}
          aria-expanded={isDropdownVisible ? isDropdownOpen : undefined}
          style={{ cursor: isDropdownVisible ? "pointer" : "default" }}
        >
          <Avatar
            userName={userName}
            avatarUrl={user?.imageUrl}
            status={status}
            avatarBg={avatarBg}
          />

          {isDropdownOpen && (
            <nav
              className={styles.dropdownMenu}
              aria-label="Profile menu"
              ref={menuRef}
              onKeyDown={onMenuKeyDown}
              style={menuStyle}
              id="nav-dropdown"
            >
              <header className={styles.dropdownListHeader}>
                <div className={styles.avatarLabelGroup}>
                  <Avatar
                    userName={userName}
                    avatarUrl={user?.imageUrl}
                    status={status}
                    avatarBg={avatarBg}
                  />
                  <div className={styles.textAndSupporting}>
                    {userName && (
                      <strong className={styles.text}>{userName}</strong>
                    )}
                    {userEmail && (
                      <span className={styles.supportingText}>{userEmail}</span>
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
                    setIsDropdownOpen(false);
                    setTimeout(() => {
                      handleMenuItemClick(onEditProfile);
                    }, 50);
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
                  className={cn(styles.dropdownListItem, "xl:!hidden !block")}
                  style={{ position: "relative", overflow: "visible" }}
                  role="menuitem"
                  tabIndex={-1}
                >
                  <div
                    className="flex items-center justify-between w-full cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLanguageExpanded((prev) => !prev);
                    }}
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
                        isLanguageExpanded ? "rotate-180" : ""
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
                            setIsDropdownOpen(false);
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

                <hr className={cn(styles.divider, "xl:!hidden")} />

                {/* Notifications - Mobile Only */}
                {/* <li
                  className={cn(styles.dropdownListItem, "xl:!hidden !flex")}
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

                <hr className={cn(styles.divider, "xl:!hidden")} /> */}

                <li
                  className={styles.dropdownListItem}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setTimeout(() => {
                      handleMenuItemClick(onChangePassword);
                    }, 50);
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
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setTimeout(() => {
                      handleMenuItemClick(onLogout);
                    }, 50);
                  }}
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
          )}
        </div>
      </div>
    </section>
  );
};
