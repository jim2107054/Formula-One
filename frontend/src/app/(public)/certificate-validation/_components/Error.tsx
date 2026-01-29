"use client";

import { Button, Icon } from "@/components/ui";
import { redirect } from "next/navigation";

export default function Error({
  serialNumber = "",
}: {
  serialNumber?: string;
}) {
  return (
    <div className="flex flex-col items-center ">
      {" "}
      <Icon
        name="clarity_sad-face-solid"
        className="size-24 mt-[107px] mb-[29px]"
      />
      <div className="w-[463px] text-center justify-start text-2xl font-semibold">
        Your certificate is invalid !
      </div>
      <div className=" text-[var(--Primary-dark)] text-center justify-start mt-[29px] mb-8 xl:mb-[107px]">
        <span>This certificate </span>
        <span className="text-[var(--Accent-default)]">[{serialNumber}]</span>
        <span>
          {" "}
          could not be verified by EduAI.
          <br />
          The record does not match any valid certificate in our database, or it
          may have been entered incorrectly.
          <br />
          Please check the Certificate ID and try again, or contact EduAI for
          further assistance.
        </span>
      </div>
      <div className="flex items-center space-x-8 ">
        <button className="flex justify-center items-center space-x-2.5 rounded-lg border border-[var(--Primary-light)] py-2 ps-4 pe-6 font-semibold text-[var(--Primary-dark)] hover:bg-[var(--Primary-light)] hover:text-[var(--Accent-default)] transition-all duration-300 ease-in-out cursor-pointer">
          <p>Contact us</p>
        </button>
        <Button onClick={() => redirect(`/certificate-validation`)}>
          Check again
        </Button>
      </div>
    </div>
  );
}
