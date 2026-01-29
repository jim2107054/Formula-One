"use client";

import { playCorrectSound, playWrongSound } from "@/util/sfx/sfx";
import { Answer } from "@/zustand/types/item";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function MCQ({
  answers,
  trigger,
}: {
  answers: Answer[];
  trigger: {
    setTriggerRight: React.Dispatch<React.SetStateAction<boolean>>;
    setTriggerWrong: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [feedbackStates, setFeedbackStates] = useState<
    Record<number, "correct" | "wrong" | null>
  >({});
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const correctAnswersCount = answers.filter((a) => a.is_correct).length;
  const hasMultipleCorrect = correctAnswersCount > 1;

  const handleClick = (index: number, correct: boolean) => {
    if (isLocked) return;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (hasMultipleCorrect) {
      const newSelectedIndexes = selectedIndexes.includes(index)
        ? selectedIndexes.filter((i) => i !== index)
        : [...selectedIndexes, index];

      setSelectedIndexes(newSelectedIndexes);

      setFeedbackStates((prev) => ({
        ...prev,
        [index]: correct ? "correct" : "wrong",
      }));
      if (correct) {
        playCorrectSound();
      }
      if (!correct) {
        trigger.setTriggerWrong(true);
        playWrongSound();
        setIsLocked(true);
        resetTimerRef.current = setTimeout(() => {
          setSelectedIndexes((prev) => prev.filter((i) => i !== index));
          setFeedbackStates((prev) => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
          });
          setIsLocked(false);
          trigger.setTriggerWrong(false);
        }, 2000);
      }

      const allCorrectSelected = answers.every((answer, idx) => {
        if (answer.is_correct) {
          return newSelectedIndexes.includes(idx);
        }
        return true;
      });

      if (
        allCorrectSelected &&
        newSelectedIndexes.length === correctAnswersCount
      ) {
        setIsLocked(true);
        trigger.setTriggerRight(true);
      }
    } else {
      setSelectedIndexes([index]);
      setFeedbackStates({ [index]: correct ? "correct" : "wrong" });
      setIsLocked(true);
      if (correct) {
        trigger.setTriggerRight(true);
        playCorrectSound();
      } else {
        trigger.setTriggerWrong(true);
        playWrongSound();
      }

      if (!correct) {
        resetTimerRef.current = setTimeout(() => {
          setSelectedIndexes([]);
          setFeedbackStates({});
          setIsLocked(false);
          trigger.setTriggerWrong(false);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    setSelectedIndexes([]);
    setFeedbackStates({});
    setIsLocked(false);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, [answers]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return (
    <div className="mt-8  flex flex-col space-y-3 max-w-[640px] mx-auto">
      {answers?.map((a, index) => {
        const isSelected = selectedIndexes.includes(index);
        const feedback = feedbackStates[index];
        const selectedAndCorrect = isSelected && feedback === "correct";
        const selectedAndWrong = isSelected && feedback === "wrong";

        const bgClass = selectedAndCorrect
          ? "bg-[var(--Light-green)] text-white"
          : selectedAndWrong
          ? "bg-[var(--Yellow-default)] text-white"
          : "bg-[var(--Primary-light)]";

        return (
          <button
            type="button"
            disabled={isLocked && !isSelected}
            onClick={() => handleClick(index, a.is_correct)}
            key={index}
            className={`rounded-lg px-7 py-5 text-lg sm:text-2xl flex justify-between items-center cursor-pointer transition-colors ${
              !isLocked && !isSelected && "hover:bg-[var(--Accent-light-2)]"
            } ${bgClass} ${
              isLocked && !isSelected ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-pressed={isSelected}
            aria-label={`Option ${a.label}`}
          >
            <span className="flex items-center gap-3">{a.label}</span>
            <span className="text-white">
              {isSelected &&
                (feedback === "correct" ? (
                  <FaCheckCircle />
                ) : feedback === "wrong" ? (
                  <RxCross2 />
                ) : null)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
