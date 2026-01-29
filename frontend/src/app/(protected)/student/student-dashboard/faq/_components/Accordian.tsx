"use client";

import { useState } from "react";
import { IoIosArrowUp } from "react-icons/io";

const Accordion = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={toggleAccordion}
        className={`flex justify-between items-center w-full px-8 py-6 text-left hover:bg-[var(--Accent-light)] cursor-pointer transition-all duration-300 ease-in-out ${
          isOpen ? "bg-[var(--Accent-light-2)] " : "bg-[var(--Primary-light)] "
        }`}
        aria-expanded={isOpen}
        aria-controls="accordion-content"
      >
        <h2 className="text-base font-normal ">{title}</h2>
        <IoIosArrowUp
          className={`text-xl  transform transition-transform duration-300 ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      <div
        id="accordion-content"
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className="px-8 py-6 bg-[var(--Primary-light)]"
            dangerouslySetInnerHTML={{ __html: content }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
