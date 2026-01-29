"use client";

import { useParams } from "next/navigation";
import CertificateValidationHeader from "../../_components/CertificateValidationHeader";
import Success from "../../_components/Success";

export default function VerifiedPage() {
  const { serialNumber } = useParams<{ serialNumber: string }>();
  return (
    <div className="max-w-[1920px] flex flex-col pb-40  justify-center ">
      <CertificateValidationHeader></CertificateValidationHeader>
      <div className="px-5">
        <Success serialNumber={serialNumber}></Success>
      </div>
    </div>
  );
}
