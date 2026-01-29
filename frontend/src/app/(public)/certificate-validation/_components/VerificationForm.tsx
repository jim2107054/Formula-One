"use client";

import { Button, Icon } from "@/components/ui";
import Spinner from "@/components/ui/spinner/Spinner";
import { certificateService } from "@/services/certificate.service";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerificationForm() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const serialNumber = formData.get("serialNumber") as string;

    if (!serialNumber || serialNumber.trim() === "") {
      setLoading(false);
      return;
    }

    try {
      const response = await certificateService.verifyCertificate(serialNumber);
      if (response.status === 200) {
        router.push(`/certificate-validation/verified/${serialNumber}`);
      } else {
        router.push(`/certificate-validation/invalid/${serialNumber}`);
      }
    } catch (err) {
      console.log(err);

      router.push(`/certificate-validation/invalid/${serialNumber}`);
    }
  };

  return (
    <div className="flex flex-col items-center mt-[107px]">
      <h2 className="text-2xl font-bold">Verify Certificate</h2>
      <div className="max-w-[509px] text-center justify-start text-[var(--Primary-dark)] text-sm mt-[29px] mb-[42px]">
        Please ensure the certificate serial number is entered correctly.
        <br />
        Verification results depend on the accuracy of the provided information.
      </div>
      <form onSubmit={handleVerification} className="w-full max-w-[477px]">
        <div>
          <label
            htmlFor="serialNumber"
            className="block text-[var(--Primary-dark)] mb-3"
          >
            Enter certificate serial number
          </label>
          <input
            type="text"
            id="serialNumber"
            required
            name="serialNumber"
            placeholder="Enter serial number"
            disabled={loading}
            className="w-full h-[57px] outline-4 outline-[var(--Primary-light)] p-3 pe-12 hover:outline-[var(--Primary)] focus:outline-[var(--Accent-light)] transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--Primary-light)]"
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-[42px]"
          endIcon={
            loading ? <Spinner /> : <Icon name="bitcoin-icons_verify-filled" />
          }
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
