"use client";
import Swal from "sweetalert2";
import { Header, Icon } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

import { useAllEnrollmentData } from "@/hooks/queries/useEnrollmentQueries";
import { AllEnrolledrollmentData } from "@/zustand/types/enroll";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { itemTypes } from "@/zustand/types/item";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: allEnrollmentData, isLoading: searchLoading } =
    useAllEnrollmentData(debouncedSearchValue as string);

  const [clickedItemId, setClickedItemId] = useState<number | null>(null);
  const [enrolls, setEnrolls] = useState<AllEnrolledrollmentData[]>([]);
  const [searchClicked, setSearchClicked] = useState(false);

  useEffect(() => {
    if (!searchLoading && allEnrollmentData) {
      setEnrolls(allEnrollmentData);
    }
  }, [searchLoading, allEnrollmentData]);

  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push("/login");
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    setClickedItemId(null);
    setSearchClicked(false);
    setSearchValue("");
    setDebouncedSearchValue("");
  }, [pathname]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length > 0) {
      setSearchClicked(true);

      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearchValue(value);
      }, 500);
    } else {
      setSearchClicked(false);
      setDebouncedSearchValue("");
    }
  }, []);

  const handleEditProfile = () => {
    router.push(`/student/student-dashboard/edit-profile`);
  };

  const handleChangePassword = () => {
    router.push(`/student/student-dashboard/change-password`);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Log out of your account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF0000",
      cancelButtonColor: "#009ba7",
      confirmButtonText: "Yes, Log Out",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          logout();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleNotifications = () => {
    console.info("Notifications clicked (no-op)");
  };

  const handleItemClick = (itemId: number) => {
    setClickedItemId(itemId);
  };

  if (pathname.includes("quiz")) {
    return null;
  }

  return (
    <nav
      className={`max-w-[1200px] mx-auto pt-5 md:pt-12 relative ${
        pathname.includes("certificate-validation") ? "hidden" : ""
      }`}
    >
      <Header
        onSearch={handleSearch}
        searchValue={searchValue}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
        onNotifications={handleNotifications}
      />
      {searchClicked && (
        <div className="absolute z-10 top-[70%] xl:top-[120%] right-[-5%] xl:right-[14%]  w-[610px] max-w-[90vw] p-6 border border-[var(--Primary)] rounded-xl bg-[#FFFFFFB2] backdrop-blur-[120px] shadow-lg scale-75 xl:scale-100">
          <p className="font-semibold text-sm">Top results</p>
          {searchLoading && (
            <div className="mt-4 flex justify-center">
              <LoadingSpinner className="!min-h-[200px]" />
            </div>
          )}
          {!searchLoading && enrolls.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">No results found.</p>
          )}
          {!searchLoading &&
            enrolls.slice(0, 3).map((enroll, index) => (
              <Link
                onClick={() => handleItemClick(index)}
                href={`/student/student-dashboard${
                  enroll.mediaType === "quiz"
                    ? enroll.url.replace("item", "quiz")
                    : enroll.url
                }`}
                key={index}
                className="flex items-center mt-[18px] space-x-3 hover:bg-[var(--Primary-light)] p-2 rounded-lg transition-colors"
              >
                <div
                  className={`flex items-center justify-center rounded-full p-3 ${
                    enroll.mediaType === "quiz"
                      ? "bg-[var(--Orange-default)]"
                      : "bg-[var(--Accent-default)]"
                  } shrink-0`}
                >
                  {clickedItemId === index ? (
                    <Spinner className="!size-[30px] !text-white" />
                  ) : (
                    <Icon
                      name={
                        enroll.type === "item"
                          ? itemTypes.includes(enroll.mediaType)
                            ? enroll.mediaType
                            : "item"
                          : enroll.type
                      }
                      className="size-[30px]"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <p className="font-medium text-sm text-[var(--Primary-dark)] truncate">
                    {enroll.type.toUpperCase()}
                  </p>
                  <h2 className="text-lg font-semibold truncate">
                    {enroll.title}
                  </h2>
                </div>
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
}
