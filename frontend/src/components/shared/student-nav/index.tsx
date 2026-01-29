"use client";

import { Box, Button, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaHome, 
  FaBook, 
  FaFlask, 
  FaSearch, 
  FaRobot,
  FaGraduationCap 
} from "react-icons/fa";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pattern: string;
}

const navItems: NavItem[] = [
  { 
    href: "/student/student-dashboard", 
    label: "Dashboard", 
    icon: FaHome,
    pattern: "/student/student-dashboard$" 
  },
  { 
    href: "/student/student-dashboard/theory", 
    label: "Theory", 
    icon: FaBook,
    pattern: "theory" 
  },
  { 
    href: "/student/student-dashboard/lab", 
    label: "Lab", 
    icon: FaFlask,
    pattern: "lab" 
  },
  { 
    href: "/student/student-dashboard/search", 
    label: "Search", 
    icon: FaSearch,
    pattern: "search" 
  },
  { 
    href: "/student/student-dashboard/chat", 
    label: "AI Assistant", 
    icon: FaRobot,
    pattern: "chat" 
  },
];

export default function StudentNav() {
  const pathname = usePathname();

  const isActive = (pattern: string) => {
    if (pattern === "/student/student-dashboard$") {
      return pathname === "/student/student-dashboard";
    }
    return pathname.includes(pattern);
  };

  return (
    <Box className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <Flex 
        className="max-w-[1200px] mx-auto px-4 py-3" 
        justify="between" 
        align="center"
      >
        {/* Logo / Brand */}
        <Flex align="center" gap="2">
          <FaGraduationCap className="text-2xl text-[var(--Accent-default)]" />
          <Text weight="bold" size="4" className="hidden sm:block">
            Learning Platform
          </Text>
        </Flex>

        {/* Navigation Items */}
        <Flex gap="1" className="overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(item.pattern);
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "solid" : "ghost"}
                  size="2"
                  className="!cursor-pointer whitespace-nowrap"
                >
                  <Icon className="mr-1" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
}
