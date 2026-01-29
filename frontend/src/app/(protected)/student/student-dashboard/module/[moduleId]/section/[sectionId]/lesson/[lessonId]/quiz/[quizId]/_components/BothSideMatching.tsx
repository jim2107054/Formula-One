"use client";

import { playCorrectSound, playWrongSound } from "@/util/sfx/sfx";
import { Answer } from "@/zustand/types/item";
import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function BothSideMatching({
  answers,
  trigger,
}: {
  answers: Answer[];
  trigger: {
    setTriggerRight: React.Dispatch<React.SetStateAction<boolean>>;
    setTriggerWrong: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);
  const [selectedLeftIndex, setSelectedLeftIndex] = useState<number | null>(
    null
  );

  const [matches, setMatches] = useState<Record<number, number>>({});
  const [wrongFlash, setWrongFlash] = useState<{
    leftIndex: number;
    rightIndex: number;
  } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isWrongLocked, setIsWrongLocked] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rights = answers.map((a) => a.right);
    const shuffled = [...rights];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledRights(shuffled);
    setSelectedLeftIndex(null);
    setMatches({});
    setWrongFlash(null);
    setIsLocked(false);
    setIsWrongLocked(false);
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

  const allMatched = Object.keys(matches).length === answers.length;

  useEffect(() => {
    if (allMatched) {
      setIsLocked(true);
      trigger.setTriggerRight(true);
    }
  }, [allMatched, trigger]);

  const handleLeftClick = (index: number) => {
    if (isLocked || isWrongLocked) return;
    if (matches[index] !== undefined) return;
    setSelectedLeftIndex(index === selectedLeftIndex ? null : index);
    setWrongFlash(null);
  };

  const handleRightClick = (rightIndex: number) => {
    if (isLocked || isWrongLocked) return;
    if (selectedLeftIndex === null) return;
    const alreadyUsed = Object.values(matches).includes(rightIndex);
    if (alreadyUsed) return;

    const leftWord = answers[selectedLeftIndex].left;
    const rightWord = shuffledRights[rightIndex];

    const correct = answers.some(
      (pair) => pair.left === leftWord && pair.right === rightWord
    );

    if (correct) {
      setMatches((prev) => ({ ...prev, [selectedLeftIndex]: rightIndex }));
      setSelectedLeftIndex(null);
      setWrongFlash(null);
      playCorrectSound();
    } else {
      setWrongFlash({ leftIndex: selectedLeftIndex, rightIndex });
      setIsWrongLocked(true);
      trigger.setTriggerWrong(true);
      playWrongSound();

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeftIndex(null);
        setIsWrongLocked(false);
        trigger.setTriggerWrong(false);
      }, 2000);
    }
  };

  return (
    <div className="mt-8  w-full max-w-[1040px] mx-auto">
      {answers.length === 0 ? (
        <p className="text-sm text-gray-500">No matching data.</p>
      ) : (
        <div className="flex max-md:flex-col items-stretch gap-8 w-full">
          {/* LEFT COLUMN */}
          <div className="flex-1">
            <ul className="space-y-3">
              {answers.map((item, idx) => {
                const matched = matches[idx] !== undefined;
                const selected = selectedLeftIndex === idx;
                const isWrong = wrongFlash?.leftIndex === idx;
                const base =
                  "w-full px-5 py-5 rounded-lg text-lg sm:text-2xl font-medium transition-colors flex justify-between items-center";

                const bgClass = matched
                  ? "bg-[var(--Light-green)] text-white"
                  : isWrong
                  ? "bg-[var(--Yellow-default)] text-white"
                  : selected
                  ? "bg-[var(--Accent-default)] text-white"
                  : "bg-[var(--Primary-light)]";

                const cursorClass =
                  matched || isLocked || isWrongLocked || selected
                    ? "cursor-not-allowed"
                    : "cursor-pointer hover:bg-[var(--Accent-light-2)]";

                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleLeftClick(idx)}
                      disabled={matched || isLocked || isWrongLocked}
                      className={`${base} ${bgClass} ${cursorClass} ${
                        (isLocked || isWrongLocked) &&
                        !matched &&
                        !selected &&
                        !isWrong
                          ? "opacity-50"
                          : ""
                      }`}
                      aria-pressed={selected}
                    >
                      <span>{item.left}</span>
                      {matched && (
                        <span className="text-white">
                          <FaCheckCircle />
                        </span>
                      )}
                      {isWrong && (
                        <span className="text-white">
                          <RxCross2 />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MIDDLE DIVIDER */}
          <div className="flex items-center md:self-stretch">
            <div className="w-full md:w-2.5 h-2.5 md:h-full bg-[var(--Accent-default)] rounded-[15px] md:min-h-[200px]"></div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1">
            <ul className="space-y-3">
              {shuffledRights.map((word, rIdx) => {
                const matchedLeftIndex = Object.entries(matches).find(
                  ([, rightIndex]) => rightIndex === rIdx
                );
                const isMatched = matchedLeftIndex !== undefined;
                const isWrong = wrongFlash?.rightIndex === rIdx;
                const isSelectable =
                  selectedLeftIndex !== null &&
                  !Object.values(matches).includes(rIdx) &&
                  !isMatched &&
                  !isLocked &&
                  !isWrongLocked;

                const base =
                  "w-full px-5 py-5 rounded-lg text-lg sm:text-2xl font-medium transition-colors relative flex justify-between items-center";

                const bgClass = isMatched
                  ? "bg-[var(--Light-green)] text-white"
                  : isWrong
                  ? "bg-[var(--Yellow-default)] text-white"
                  : "bg-[var(--Primary-light)]";

                const cursorClass = isSelectable
                  ? "cursor-pointer hover:bg-[var(--Accent-light-2)]"
                  : "cursor-not-allowed";

                return (
                  <li key={rIdx}>
                    <button
                      type="button"
                      disabled={!isSelectable}
                      onClick={() => handleRightClick(rIdx)}
                      className={`${base} ${bgClass} ${cursorClass} ${
                        !isSelectable && !isMatched && !isWrong
                          ? "opacity-50"
                          : ""
                      }`}
                      aria-disabled={!isSelectable}
                      aria-label={`Right option ${word}`}
                    >
                      <span>{word}</span>
                      {isMatched && (
                        <span className="text-white">
                          <FaCheckCircle />
                        </span>
                      )}
                      {isWrong && (
                        <span className="text-white">
                          <RxCross2 />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
