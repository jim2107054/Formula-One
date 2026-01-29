"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LoginImageSectionProps {
  className?: string;
  imageSrc?: string;
}

const LoginImageSection: React.FC<LoginImageSectionProps> = ({
  className,
  imageSrc,
}) => {
  return (
    <div className={cn(className, "w-[638px] h-[590px] rounded-lg relative")}>
      <div className="w-[598px] h-96 bg-gradient-to-b from-cyan-200/0 to-cyan-600 rounded-lg  absolute bottom-0 z-[1] " />
      <div className="w-44 justify-start text-white text-6xl font-semibold  absolute bottom-8 left-[43px] z-[2] ">
        Login
      </div>
      <Image
        className={`object-center object-cover rounded-lg `}
        src={`${imageSrc}`}
        fill
        alt="login image"
        priority
      ></Image>
    </div>
  );
};

export default LoginImageSection;
