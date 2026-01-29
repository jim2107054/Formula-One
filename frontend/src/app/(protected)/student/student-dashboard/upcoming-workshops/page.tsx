"use client";

import { Icon } from "@/components/ui";
import { useState, FormEvent, useMemo } from "react";
import ListView from "./_components/ListView";
import GridView from "./_components/GridView";
import { FaFilter } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCmsByKey } from "@/hooks/queries/useCmsQueries";
import { useIntl } from "react-intl";

export default function UpcomingModules() {
  const [listView, setListView] = useState(false);
  const [workshopName, setWorkshopName] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const intl = useIntl();

  const [filters, setFilters] = useState<{
    sortBy?: "most-recent" | "previous" | "lowest-price" | "highest-price";
    language?: string;
    minPrice?: number;
    maxPrice?: number;
    fromDate?: string;
    toDate?: string;
    isFlexible?: boolean;
  }>({});

  const filterActive = Object.keys(filters).length > 0;

  const {
    data: upcomingModules,
    isLoading,
    isError,
  } = useCmsByKey("upcoming-module");

  const filteredWorkshops = useMemo(() => {
    if (!upcomingModules) return [];

    let data = [...upcomingModules];

    if (workshopName.trim()) {
      const term = workshopName.toLowerCase();
      data = data.filter((w) => w.title.toLowerCase().includes(term));
    }

    if (filters.language) {
      data = data.filter(
        (w) => w.language?.toLowerCase() === filters.language?.toLowerCase()
      );
    }

    if (filters.minPrice !== undefined) {
      data = data.filter((w) => w.standardPrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      data = data.filter((w) => w.standardPrice <= filters.maxPrice!);
    }

    const hasDateFilter = filters.fromDate || filters.toDate;
    const isFlexibleFilter = filters.isFlexible;

    if (hasDateFilter || isFlexibleFilter) {
      data = data.filter((w) => {
        const isFlexibleModule = !w.startDate;

        if (isFlexibleFilter && isFlexibleModule) {
          return true;
        }

        if (isFlexibleModule) {
          return false;
        }

        const moduleDate = new Date(w.startDate).getTime();
        let matchesDate = true;

        if (filters.fromDate) {
          const fromTs = new Date(filters.fromDate).getTime();
          matchesDate = matchesDate && moduleDate >= fromTs;
        }

        if (filters.toDate) {
          const toTs = new Date(filters.toDate).getTime();
          matchesDate = matchesDate && moduleDate <= toTs;
        }

        if (isFlexibleFilter && !hasDateFilter) {
          return false;
        }

        return matchesDate;
      });
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "most-recent":
          data.sort(
            (a, b) =>
              new Date(b.creationDate || 0).getTime() -
              new Date(a.creationDate || 0).getTime()
          );
          break;
        case "previous":
          data.sort(
            (a, b) =>
              new Date(a.creationDate || 0).getTime() -
              new Date(b.creationDate || 0).getTime()
          );
          break;
        case "lowest-price":
          data.sort((a, b) => a.standardPrice - b.standardPrice);
          break;
        case "highest-price":
          data.sort((a, b) => b.standardPrice - a.standardPrice);
          break;
      }
    }

    return data;
  }, [upcomingModules, workshopName, filters]);

  const clearFilters = () => {
    setFilters({});
  };

  const handleApplyFilters = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const sortBy = formData.get("sort-by") as typeof filters.sortBy | null;
    const language = formData.get("language") as string | null;

    const minPriceRaw = formData.get("min-price");
    const maxPriceRaw = formData.get("max-price");
    const fromDate = formData.get("from-date") as string | null;
    const toDate = formData.get("to-date") as string | null;
    const isFlexibleRaw = formData.get("is-flexible") as string | null;

    const nextFilters: typeof filters = {};

    if (sortBy) nextFilters.sortBy = sortBy;
    if (language) nextFilters.language = language;
    if (minPriceRaw) {
      const v = Number(minPriceRaw);
      if (!isNaN(v) && v >= 0 && minPriceRaw !== "") nextFilters.minPrice = v;
    }
    if (maxPriceRaw) {
      const v = Number(maxPriceRaw);
      if (!isNaN(v) && v >= 0 && maxPriceRaw !== "") nextFilters.maxPrice = v;
    }
    if (fromDate) nextFilters.fromDate = fromDate;
    if (toDate) nextFilters.toDate = toDate;
    if (isFlexibleRaw !== null) nextFilters.isFlexible = true;

    setFilters(nextFilters);
    setShowFilter(false);
  };

  const handleBackdropClick = () => {
    setShowFilter(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (isError) {
    return (
      <div className="text-center text-red-500">
        {intl.formatMessage({ id: "upcomingWorkshops.error" })}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1200px] mx-auto pb-40 relative">
        <div className="mt-20 flex max-xl:flex-col max-xl:space-y-6 xl:items-center xl:justify-between">
          <div className="flex flex-col text-left space-y-4">
            <h2 className="text-2xl font-bold ">
              {intl.formatMessage({ id: "upcomingWorkshops.title" })}
            </h2>
            <p className="text-[var(--Primary-dark)]">
              {intl.formatMessage({
                id: "upcomingWorkshops.withDirectBooking",
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative h-[48px] w-full">
              <input
                type="text"
                name="workshopName"
                placeholder={intl.formatMessage({
                  id: "upcomingWorkshops.searchPlaceholder",
                })}
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className="w-full xl:w-[494px] h-[48px] px-3.5 pe-2.5 ps-[42px] outline outline-[var(--Primary)] rounded-lg hover:outline-[var(--Primary-dark)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out  "
              />
              <Icon
                name="search"
                className="absolute top-1/2 left-3.5 transform -translate-y-1/2  "
              />
            </div>
            <div className="flex space-x-2">
              <div
                onClick={() => setListView(true)}
                className={`hidden w-12 h-12 rounded-lg border border-[var(--Primary)] xl:flex items-center justify-center hover:border-[var(--Primary-dark)] ${
                  listView
                    ? "bg-[var(--Accent-light-2)] border-[var(--Accent-default)]"
                    : ""
                } cursor-pointer transition-all duration-300 ease-in-out `}
              >
                {listView ? <Icon name="active-list" /> : <Icon name="list" />}
              </div>
              <div
                onClick={() => setListView(false)}
                className={`w-12 h-12 rounded-lg border border-[var(--Primary)] flex items-center justify-center hover:border-[var(--Primary-dark)] ${
                  !listView
                    ? "bg-[var(--Accent-light-2)] border-[var(--Accent-default)]"
                    : ""
                } cursor-pointer transition-all duration-300 ease-in-out `}
              >
                {!listView ? <Icon name="active-grid" /> : <Icon name="grid" />}
              </div>
              <div
                onClick={() =>
                  filterActive ? clearFilters() : setShowFilter(true)
                }
                className={`w-12 h-12 rounded-lg border border-[var(--Primary)] flex items-center justify-center hover:border-[var(--Primary-dark)] ${
                  filterActive
                    ? "bg-[var(--Accent-light-2)] border-[var(--Accent-default)]"
                    : ""
                } cursor-pointer transition-all duration-300 ease-in-out `}
              >
                {filterActive ? (
                  <RxCross2 className="text-[var(--Primary-dark)]" />
                ) : (
                  <Icon name="filter" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-[52px]">
          {listView ? (
            <ListView coursesData={filteredWorkshops} />
          ) : (
            <GridView coursesData={filteredWorkshops} />
          )}
        </div>

        {showFilter && (
          <div
            id="filter-modal"
            className="fixed top-0 left-0 w-full h-full bg-black/65 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
          >
            <div className="relative z-10 flex w-full items-center justify-center p-5">
              <div
                className="w-full max-w-[568px] rounded-lg border border-[var(--Accent-default)] bg-white px-8 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex w-full items-center justify-between">
                  <div></div>
                  <div className="flex items-center justify-center space-x-2 text-[var(--Accent-default)]">
                    <FaFilter className="size-6" />
                    <span className="text-[28px]">
                      {intl.formatMessage({
                        id: "upcomingWorkshops.filterModal.filter",
                      })}
                    </span>
                  </div>
                  <div onClick={() => setShowFilter(false)}>
                    <RxCross2 className="size-6 hover:text-[var(--Accent-default)] cursor-pointer" />
                  </div>
                </div>
                <hr className="my-4 border border-[var(--Primary-light)]" />
                <form onSubmit={handleApplyFilters}>
                  <div className="flex justify-around md:justify-between">
                    <div className="flex flex-col space-y-3.5 text-xs text-[var(--Primary-dark)]">
                      <h2 className="text-base font-medium text-black">
                        {intl.formatMessage({
                          id: "upcomingWorkshops.filterModal.sortBy",
                        })}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sort-by"
                          id="most-recent"
                          value="most-recent"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.sortBy === "most-recent"}
                        />
                        <label className="cursor-pointer" htmlFor="most-recent">
                          {intl.formatMessage({
                            id: "upcomingWorkshops.filterModal.sortBy.mostRecent",
                          })}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sort-by"
                          id="previous"
                          value="previous"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.sortBy === "previous"}
                        />
                        <label className="cursor-pointer" htmlFor="previous">
                          {intl.formatMessage({ id: "previous" })}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sort-by"
                          id="lowest-price"
                          value="lowest-price"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.sortBy === "lowest-price"}
                        />
                        <label
                          className="cursor-pointer"
                          htmlFor="lowest-price"
                        >
                          {intl.formatMessage({
                            id: "upcomingWorkshops.filterModal.sortBy.lowestPrice",
                          })}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="sort-by"
                          id="highest-price"
                          value="highest-price"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.sortBy === "highest-price"}
                        />
                        <label
                          className="cursor-pointer"
                          htmlFor="highest-price"
                        >
                          {intl.formatMessage({
                            id: "upcomingWorkshops.filterModal.sortBy.highestPrice",
                          })}
                        </label>
                      </div>
                    </div>

                    <div className="flex md:w-[154px] flex-col space-y-3.5 text-xs text-[var(--Primary-dark)]">
                      <h2 className="text-base font-medium text-black">
                        {intl.formatMessage({ id: "language" })}
                      </h2>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="language"
                          id="german"
                          value="german"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.language === "german"}
                        />
                        <label className="cursor-pointer" htmlFor="german">
                          German
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="language"
                          id="english"
                          value="english"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.language === "english"}
                        />
                        <label className="cursor-pointer" htmlFor="english">
                          English{" "}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="language"
                          id="spanish"
                          value="spanish"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.language === "spanish"}
                        />
                        <label className="cursor-pointer" htmlFor="spanish">
                          Spanish
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="language"
                          id="romanian"
                          value="romanian"
                          className="accent-[var(--Accent-default)] cursor-pointer"
                          defaultChecked={filters.language === "romanian"}
                        />
                        <label className="cursor-pointer" htmlFor="romanian">
                          Romanian
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="font-medium text-center">
                      {intl.formatMessage({
                        id: "upcomingWorkshops.listView.price",
                      })}
                    </h2>

                    <div className="mt-2 flex items-center justify-center space-x-8">
                      <div className="flex flex-col text-center space-y-2 relative">
                        <input
                          type="number"
                          name="min-price"
                          placeholder="0"
                          defaultValue={filters.minPrice}
                          min="0"
                          className="border border-[var(--Primary)] rounded-sm pl-8 px-3 w-[98px] py-2 text-sm"
                        />
                        <span className="absolute left-5 top-[30%] -translate-y-1/2">
                          $
                        </span>
                        <label className="text-xs  text-[var(--Primary-dark)]">
                          {intl.formatMessage({
                            id: "upcomingWorkshops.filterModal.minPrice",
                          })}
                        </label>
                      </div>
                      <span className="pb-6">-</span>
                      <div className="flex flex-col text-center space-y-2 relative">
                        <input
                          type="number"
                          name="max-price"
                          placeholder="9000"
                          defaultValue={filters.maxPrice}
                          min="0"
                          className="border border-[var(--Primary)] rounded-sm pl-8 px-3 w-[98px] py-2 text-sm"
                        />
                        <span className="absolute left-5 top-[30%] -translate-y-1/2">
                          $
                        </span>
                        <label className="text-xs  text-[var(--Primary-dark)]">
                          {intl.formatMessage({
                            id: "upcomingWorkshops.filterModal.maxPrice",
                          })}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-6">
                    <div className="">
                      <h2 className=" font-medium text-center">
                        {intl.formatMessage({
                          id: "upcomingWorkshops.filterModal.time",
                        })}
                      </h2>
                      <div className="mt-2 grid grid-cols-2 gap-2 accent-[var(--Accent-dark-2)]">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-[var(--Primary-dark)]">
                            {intl.formatMessage({
                              id: "upcomingWorkshops.filterModal.from",
                            })}
                          </span>
                          <input
                            type="date"
                            name="from-date"
                            defaultValue={filters.fromDate}
                            className="border border-[var(--Primary)] rounded-sm  px-3 w-auto py-2 text-sm cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-[var(--Primary-dark)]">
                            {intl.formatMessage({
                              id: "upcomingWorkshops.filterModal.to",
                            })}
                          </span>
                          <input
                            type="date"
                            name="to-date"
                            defaultValue={filters.toDate}
                            className="border border-[var(--Primary)] rounded-sm  px-3 w-auto py-2 text-sm cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      name="is-flexible"
                      id="is-flexible"
                      className="accent-[var(--Accent-default)] cursor-pointer"
                      defaultChecked={filters.isFlexible}
                    />
                    <p>Flexible</p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full rounded-md bg-[var(--Accent-default)] py-3 text-white cursor-pointer hover:bg-[var(--Accent-dark-1)] transition-colors"
                    >
                      {intl.formatMessage({ id: "button.applyFilter" })}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
