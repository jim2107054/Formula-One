"use client";

import SectionTag from "@/components/ui/section-tag/SectionTag";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import MCQ from "./_components/MCQ";
import BothSideMatching from "./_components/BothSideMatching";
import { FaArrowRight } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { GiPartyPopper } from "react-icons/gi";
import Confetti from "react-confetti";
import { AnimatePresence, motion } from "motion/react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useItem, useUpdateItemStatus } from "@/hooks/queries/useItemQueries";
import { useState } from "react";
import { Button, Icon } from "@/components/ui";
import { useLessonWithItems } from "@/hooks/queries/useLessonQueries";
import { useSectionWithLessons } from "@/hooks/queries/useSectionQueries";
import { useCourseWithSections } from "@/hooks/queries/useCourseQueries";
import { useEnrollments } from "@/hooks/queries/useEnrollmentQueries";

export default function QuizPage() {
  const { quizId, lessonId, sectionId, moduleId } = useParams();

  const [triggerRight, setTriggerRight] = useState(false);
  const [triggerWrong, setTriggerWrong] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const { width, height } = window.screen;
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const { data: currentItem, isLoading, isError } = useItem(quizId as string);

  const updateItemStatus = useUpdateItemStatus();
  const { refetch: lessonRefetch } = useLessonWithItems(lessonId as string);
  const { refetch: sectionRefetch } = useSectionWithLessons(
    sectionId as string
  );
  const { refetch: moduleRefetch } = useCourseWithSections(moduleId as string);
  const { refetch: enrollmentRefetch } = useEnrollments();

  const handleNextQuestion = () => {
    const nextQuestion = questionNumber + 1;
    setQuestionNumber(nextQuestion);

    if (currentItem?.contentSummary.questionCount === nextQuestion) {
      updateItemStatus.mutateAsync(currentItem._id);
      setTimeout(() => {
        lessonRefetch();
        sectionRefetch();
        moduleRefetch();
        enrollmentRefetch();
      }, 2000);

      setTriggerConfetti(true);
      // refetch lesson, section, module, enrollment data to update progress
    } else {
      setQuestionNumber(nextQuestion);
    }

    setTriggerRight(false);
  };

  if (isLoading && !currentItem) {
    return <LoadingSpinner />;
  } else if (isError) {
    return <div className="text-center text-red-600"></div>;
  } else {
    return (
      <div
        className={` pt-6 ${
          !triggerConfetti && "overflow-x-hidden"
        }   xl:px-12 relative  ${
          currentItem?.contentSummary.questionCount === questionNumber
            ? ""
            : "pb-60"
        }`}
      >
        {triggerConfetti && (
          <Confetti
            recycle={false}
            className="mx-auto"
            width={width - 100}
            height={height - 100}
            onConfettiComplete={() => setTriggerConfetti(false)}
          />
        )}

        <div>
          {/* header  */}
          <section>
            <div className="flex items-center justify-between">
              <Link
                href={`/student/student-dashboard/module/${currentItem?.courseId?._id}/section/${currentItem?.sectionId?._id}/lesson/${currentItem?.lessonId?._id}`}
                className="flex justify-center items-center space-x-2.5 rounded-lg border border-[var(--Primary-light)] py-2 ps-4 pe-6 font-semibold text-[var(--Primary-dark)] hover:bg-[var(--Primary-light)] hover:text-[var(--Accent-default)] transition-all duration-300 ease-in-out cursor-pointer w-fit h-8 md:h-12 shrink-0"
              >
                <IoIosArrowBack />
                <p>Exit</p>
              </Link>
              {currentItem?.contentSummary?.questionCount !==
                questionNumber && (
                <div className="flex items-center justify-center space-x-[7px]">
                  {[
                    ...Array(currentItem?.contentSummary?.questionCount ?? 0),
                  ].map((_, index) => (
                    <span
                      key={index}
                      className={`w-2 md:w-5 h-2 md:h-5  ${
                        index === questionNumber
                          ? "bg-[var(--Accent-default)]"
                          : index < questionNumber
                          ? "bg-[var(--Accent-light)]"
                          : "bg-[var(--Accent-light-2)]"
                      }`}
                    ></span>
                  ))}
                </div>
              )}
              <Link href={"/student/student-dashboard"}>
                <Image
                  src="/images/logo.png"
                  alt="IFEN logo"
                  width={119}
                  height={44}
                  className="max-md:w-12 "
                />
              </Link>
            </div>
            {currentItem?.contentSummary?.questionCount !== questionNumber && (
              <p className="mt-4 text-[var(--Accent-default)] text-center">
                {questionNumber}/{currentItem?.contentSummary?.questionCount}{" "}
                Completed
              </p>
            )}
          </section>
          {/* section tag and title  */}
          {currentItem?.contentSummary?.questionCount !== questionNumber && (
            <section className="flex max-xl:flex-col  xl:items-center max-xl:space-y-3 xl:space-x-[31px]   mt-8 ">
              <SectionTag
                text={`Lesson  ${currentItem?.sectionId?.order}.${currentItem?.lessonId?.order}`}
                icon="lesson"
                className="w-fit"
              ></SectionTag>
              <h2 className="text-xl font-semibold">{currentItem?.title}</h2>
            </section>
          )}

          {/* question  */}

          <AnimatePresence mode="wait">
            {" "}
            <motion.div
              key={questionNumber}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentItem?.contentSummary?.questionCount === questionNumber ? (
                <div className="flex flex-col items-center justify-center mt-36 w-full">
                  <GiPartyPopper className="text-[var(--Accent-default)] text-9xl" />
                  <h2 className="text-2xl font-semibold mt-4 text-center">
                    Congratulations! You have completed the quiz.
                  </h2>
                  <Link
                    href={`/student/student-dashboard/module/${currentItem?.courseId?._id}/section/${currentItem?.sectionId?._id}/lesson/${currentItem?.lessonId?._id}`}
                    className="mt-8"
                  >
                    <Button endIcon={<Icon name="arrow-circle-right-3" />}>
                      Go to Lesson
                    </Button>
                  </Link>
                </div>
              ) : (
                <section className="mt-4  mx-auto">
                  <div className="flex max-xl:flex-col items-center justify-center max-xl:space-y-3 xl:space-x-4 text-xl font-semibold">
                    <p className="px-3 py-2 rounded-full bg-[var(--Accent-light)] text-[var(--Accent-dark-2)]">
                      {currentItem?.contentSummary?.exam?.quizzes?.[
                        questionNumber
                      ]?.answer_type == 3
                        ? "Both Side Matching"
                        : "MCQ"}
                    </p>
                    <p className="max-md:text-center">
                      {
                        currentItem?.contentSummary?.exam?.quizzes?.[
                          questionNumber
                        ]?.question
                      }
                    </p>
                  </div>
                  {currentItem?.contentSummary?.exam?.quizzes?.[questionNumber]
                    ?.answer_type == 2 && (
                    <p className="text-xl text-[var(--Primary-dark)] mt-4 text-center">
                      Choose the correct option
                    </p>
                  )}
                  {currentItem?.contentSummary?.exam?.quizzes?.[questionNumber]
                    ?.answer_type == 2 && currentItem !== null ? (
                    <MCQ
                      answers={
                        currentItem?.contentSummary?.exam?.quizzes?.[
                          questionNumber
                        ]?.answers ?? []
                      }
                      trigger={{ setTriggerRight, setTriggerWrong }}
                    />
                  ) : (
                    <BothSideMatching
                      answers={
                        currentItem?.contentSummary?.exam?.quizzes?.[
                          questionNumber
                        ]?.answers ?? []
                      }
                      trigger={{ setTriggerRight, setTriggerWrong }}
                    />
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {triggerRight && (
          <div className="bg-[var(--Light-green)] rounded-lg px-8 py-6 fixed bottom-[5%] md:right-0 w-[90%] md:max-w-[388px] drop-shadow-[4px_4px_7px_rgba(0,0,0,0.25)]">
            <div className="relative">
              {" "}
              <p className="text-2xl leading-[150%] text-white ">
                Correct! The core purpose of neurofeedback is to train the brain
                to manage its own functions effectively.
              </p>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 flex items-center justify-center space-x-2.5 border border-[var(--Light-green)] text-[var(--Light-green)] text-base font-semibold rounded-lg bg-white cursor-pointer absolute buttom-0 left-[30%] w-fit"
              >
                <span>Continue</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {triggerWrong && (
          <div className="bg-[var(--Yellow-default)] rounded-lg px-8 py-6 fixed bottom-[5%] md:right-0 w-[90%] md:max-w-[388px] drop-shadow-[4px_4px_7px_rgba(0,0,0,0.25)]">
            {" "}
            <p className="text-2xl leading-[150%] text-white ">
              Oops! That’s not the right one. Try again
            </p>
            <button
              onClick={() => setTriggerWrong(false)}
              className="p-1 flex items-center justify-center space-x-2.5 border border-[var(--Yellow-default)] text-[var(--Yellow-default)]  rounded-full bg-white cursor-pointer absolute top-[-15px] left-[-15px] w-fit"
            >
              <RxCross2 className="text-2xl" />
            </button>
          </div>
        )}
      </div>
    );
  }
}
