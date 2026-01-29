"use client";

import { Icon } from "@/components/ui";
import Image from "next/image";

export default function CertificateValidationHeader() {
  return (
    <div>
      <span className="w-full flex justify-center">
        {" "}
        <Image
          src="/images/logo.png"
          alt="ifen logo"
          width={119}
          height={44}
          className="my-12 "
        ></Image>
      </span>

      <div className="w-full flex items-center justify-center bg-[var(--Accent-default)] py-5 space-x-2.5 ">
        <Icon name="mdi_shield-tick-outline" className="size-10" />
        <span className="text-2xl md:text-4xl font-semibold text-white">
          Certificate Verification{" "}
          <span className="max-xl:hidden">- Neurofeedback Academy</span>
        </span>
      </div>
    </div>
  );
}
