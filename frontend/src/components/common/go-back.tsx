"use client"

import { useRouter } from "next/navigation";
import { MdKeyboardBackspace } from "react-icons/md";
import { Button } from "@/app/(protected)/admin/_components/button";

interface GoBackProps {
  text?: string;
  href?: string;
}

export default function GoBack({ text = "Go Back", href }: GoBackProps) {
  const router = useRouter();
  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };
  return (
    <Button onClick={handleClick}>
      <MdKeyboardBackspace />
      {text}
    </Button>
  );
}
