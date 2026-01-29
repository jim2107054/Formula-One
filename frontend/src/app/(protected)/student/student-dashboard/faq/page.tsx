"use client";

import Image from "next/image";
import Accordion from "./_components/Accordian";
import { Button } from "@/components/ui";
import { FaArrowRight } from "react-icons/fa";
import { useCmsByKey } from "@/hooks/queries/useCmsQueries";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useIntl } from "react-intl";

export interface FAQ {
  order: number;
  question: string;
  answer: string;
  isPublished: boolean;
}

export default function FAQpage() {
  const { data: faqs, isLoading, isError } = useCmsByKey("faq");
  const intl = useIntl();

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (isError) {
    return (
      <div className="text-center text-red-500">
        {intl.formatMessage({ id: "faq.error" })}
      </div>
    );
  } else {
    return (
      <div className="max-w-[1200px] mx-auto py-[100px] flex flex-col items-center justify-center">
        <h1 className="text-5xl font-semibold max-w-[370px] text-center leading-[120%] mb-12">
          {intl.formatMessage({ id: "faq.title" })}
        </h1>
        <div className="grid gap-4 max-w-[789px]">
          {faqs?.map((faq: FAQ) => (
            <div key={faq.order}>
              <Accordion title={faq.question} content={faq.answer} />
            </div>
          ))}
        </div>

        <Image
          src={"/images/icons/faq.svg"}
          alt="FAQ Icon"
          width={269}
          height={269}
          className="mt-16 mb-11"
        />
        <h1 className="text-[40px] font-semibold text-center">
          {intl.formatMessage({ id: "faq.stillHaveQuestions" })}
        </h1>
        <p className="text-[var(--Primary-dark)] text-2xl mt-4 max-w-[596px] text-center">
          {intl.formatMessage({ id: "faq.cantFindQuestion" })}
        </p>
        <Button
          endIcon={<FaArrowRight className="text-xl" />}
          className="max-w-[305px] w-full mt-8 "
        >
          {intl.formatMessage({ id: "button.sendEmail" })}
        </Button>
      </div>
    );
  }
}
