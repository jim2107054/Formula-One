"use client";

import { useParams } from "next/navigation";
import CertificateValidationHeader from "../../_components/CertificateValidationHeader";
import Error from "../../_components/Error";

export default function InvalidPage() {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  return (
    <div className="max-w-[1920px] flex flex-col pb-40  justify-center ">
      <CertificateValidationHeader></CertificateValidationHeader>
      <div className="px-5">
        <Error serialNumber={serialNumber}></Error>
      </div>
    </div>
  );
}
