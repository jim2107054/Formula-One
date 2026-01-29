"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface RouteLoadingProps {
  children: React.ReactNode;
}

export default function RouteLoading({ children }: RouteLoadingProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (loading) {
    return <LoadingSpinner />;
  } else {
    return <>{children}</>;
  }
}
