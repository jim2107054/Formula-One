"use client";

import { Icon } from "@/components/ui";

export default function CertificateValidationHeader() {
  return (
    <div>
      <span className="w-full flex justify-center my-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <span className="text-2xl font-bold text-[var(--Primary)]">EduAI</span>
        </div>
      </span>

      <div className="w-full flex items-center justify-center bg-[var(--Accent-default)] py-5 space-x-2.5 ">
        <Icon name="mdi_shield-tick-outline" className="size-10" />
        <span className="text-2xl md:text-4xl font-semibold text-white">
          Certificate Verification{" "}
          <span className="max-xl:hidden">- EduAI Learning Academy</span>
        </span>
      </div>
    </div>
  );
}
