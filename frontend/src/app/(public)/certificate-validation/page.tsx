"use client";

import CertificateValidationHeader from "./_components/CertificateValidationHeader";

import VerificationForm from "./_components/VerificationForm";

export default function CertificateValidation() {
  return (
    <div className="max-w-[1920px] flex flex-col pb-40  justify-center ">
      <CertificateValidationHeader></CertificateValidationHeader>
      <div className="px-5">
        <VerificationForm></VerificationForm>
      </div>
    </div>
  );
}
