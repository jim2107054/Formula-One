"use client";

import { Button, Icon } from "@/components/ui";

import { useParams } from "next/navigation";

import PdfItem from "../../module/[moduleId]/section/[sectionId]/lesson/[lessonId]/item/[itemId]/_components/PdfItem";
import { GoDownload } from "react-icons/go";
import { useCertificate } from "@/hooks/queries/useCertificateQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useIntl } from "react-intl";

export default function CertificatePage() {
  const { enrollId } = useParams();
  const intl = useIntl();

  const {
    data: currentCertificate,
    isLoading,
    isError,
  } = useCertificate(enrollId as string);

  if (isLoading) {
    return <LoadingSpinner></LoadingSpinner>;
  }
  if (isError) {
    return (
      <div className="text-center text-red-500 mt-10">
        {intl.formatMessage({ id: "certificatePage.error" })}
      </div>
    );
  } else {
    return (
      <div className="pb-[120px]">
        {" "}
        <div>
          <div className="w-full flex items-center justify-center bg-[var(--Accent-default)] py-5 space-x-2.5 my-20">
            <Icon name="bxs_party" className="size-10" />
            <span className="text-2xl md:text-4xl font-semibold text-white">
              {intl.formatMessage({ id: "certificatePage.congratulations" })}{" "}
              <span className="max-xl:hidden">
                {intl.formatMessage({ id: "certificatePage.unlocked" })}
              </span>
            </span>
          </div>
          <PdfItem url={currentCertificate?.certification_url} />
          <a
            className="w-full flex justify-center"
            href={currentCertificate?.download_link}
            download
            target="_blank"
          >
            {" "}
            <Button endIcon={<GoDownload className="size-5" />}>
              {intl.formatMessage({ id: "download" })}
            </Button>
          </a>
        </div>
      </div>
    );
  }
}
