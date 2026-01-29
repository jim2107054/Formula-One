"use client";

import { Icon } from "@/components/ui";
import { IoIosArrowBack } from "react-icons/io";

export default function Success({
  serialNumber = "",
}: {
  serialNumber?: string;
}) {
  return (
    <div className="flex flex-col items-center ">
      {" "}
      <Icon
        name="icon-park-solid_success"
        className="size-24 mt-[107px] mb-[29px]"
      />
      <div className="w-[463px] text-center justify-start text-2xl font-semibold">
        Hurrah! your certificate is valid
      </div>
      <div className=" text-[var(--Primary-dark)] text-center justify-start mt-[29px] mb-8 xl:mb-[107px]">
        <span>This certificate </span>
        <span className="text-[var(--Accent-default)]">[{serialNumber}]</span>
        <span>
          {" "}
          is authentic and officially verified by IFEN.
          <br />
          The holder has successfully completed the course and fulfilled all
          academic requirements with excellence.
        </span>
      </div>
      <div className="flex items-center space-x-8 ">
        <button className="flex justify-center items-center space-x-2.5 rounded-lg border border-[var(--Primary-light)] py-2 ps-4 pe-6 font-semibold text-[var(--Primary-dark)] hover:bg-[var(--Primary-light)] hover:text-[var(--Accent-default)] transition-all duration-300 ease-in-out cursor-pointer">
          <IoIosArrowBack />
          <p>Return to home</p>
        </button>
      </div>
    </div>
  );
}
