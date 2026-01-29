"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/zustand/stores/ui";
import {
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Separator,
  Text,
  Tooltip,
} from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BiCategory } from "react-icons/bi";
import {
  FaBook,
  FaChevronLeft,
  FaChevronRight,
  FaFolder,
  FaTags,
  FaUsers,
  FaFlask,
  FaUpload,
  FaCog,
  FaChartBar,
} from "react-icons/fa";
import { ImExit } from "react-icons/im";

interface NavItem {
  href: string;
  label: string;
  pattern: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/admin/content", label: "Content Manager", pattern: "content", icon: FaFolder },
  { href: "/admin/theory", label: "Theory Materials", pattern: "/theory", icon: FaBook },
  { href: "/admin/lab", label: "Lab Materials", pattern: "/lab", icon: FaFlask },
  { href: "/admin/upload", label: "Upload Content", pattern: "upload", icon: FaUpload },
  { href: "/admin/user", label: "Users", pattern: "user", icon: FaUsers },
  { href: "/admin/analytics", label: "Analytics", pattern: "analytics", icon: FaChartBar },
  {
    href: "/admin/category",
    label: "Categories",
    pattern: "category",
    icon: BiCategory,
  },
  { href: "/admin/tag", label: "Tags", pattern: "tag", icon: FaTags },
  {
    href: "/admin/settings",
    label: "Settings",
    pattern: "settings",
    icon: FaCog,
  },
];

export default function SideNav() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleConfirmLogout = async () => {
    await logout();
    setLogoutOpen(false);
  };

  return (
    <Flex direction="column" className="min-h-screen w-full shadow-xl">
      {/* Header */}
      <Flex
        align="center"
        justify={sidebarCollapsed ? "center" : "between"}
        p={sidebarCollapsed ? "5" : "3"}
      >
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-lg font-bold text-[var(--Primary)]">EduAI</span>
          </div>
        )}
        <IconButton
          variant="ghost"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          color="cyan"
        >
          {sidebarCollapsed ? (
            <FaChevronRight className="cursor-pointer" />
          ) : (
            <FaChevronLeft className="cursor-pointer" />
          )}
        </IconButton>
      </Flex>

      <Separator style={{ width: "100%" }} />

      {/* Navigation */}
      <Flex direction="column" gap="1" className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.pattern);
          const IconComponent = item.icon;

          const itemNode = (
            <Flex
              align="center"
              justify={sidebarCollapsed ? "center" : "start"}
              gap="3"
              className={`
                w-full px-3 py-2 rounded-md transition-all duration-200 cursor-pointer select-none
                ${
                  isActive
                    ? "bg-[var(--Accent-default)] text-white"
                    : "text-gray-12 hover:bg-[var(--Accent-light)] hover:text-accent-dark-2"
                }
                ${sidebarCollapsed ? "justify-center" : "gap-3"}
              `}
            >
              <Box>
                <IconComponent />
              </Box>
              {!sidebarCollapsed && (
                <Text size="3" weight="medium" className="truncate">
                  {item.label}
                </Text>
              )}
            </Flex>
          );

          return (
            <Box key={item.href}>
              {sidebarCollapsed ? (
                <Tooltip content={item.label} side="right" align="center">
                  <Link href={item.href}>{itemNode}</Link>
                </Tooltip>
              ) : (
                <Link href={item.href}>{itemNode}</Link>
              )}
            </Box>
          );
        })}
      </Flex>

      {/* Footer */}
      <Flex direction="column" gap="1" p={sidebarCollapsed ? "" : "2"}>
        <Box>
          {sidebarCollapsed ? (
            <Tooltip content="Logout" side="right" align="center">
              <Flex
                align="center"
                justify="center"
                className="w-full px-3 py-2 rounded-md cursor-pointer text-red-400 bg-red-50"
                onClick={() => setLogoutOpen(true)}
              >
                <ImExit />
              </Flex>
            </Tooltip>
          ) : (
            <Flex
              align="center"
              gap="2"
              className="
          w-full px-3 py-2 rounded-md cursor-pointer
          text-red-400 bg-red-50 hover:bg-red-100 transition duration-300
        "
              onClick={() => setLogoutOpen(true)}
            >
              <ImExit />
              <Text size="3" weight="medium">
                Logout
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>

      <Dialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
        <Dialog.Content maxWidth="420px">
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Description size="2" mt="2">
            Are you sure you want to log out?
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" className="!cursor-pointer">
                Cancel
              </Button>
            </Dialog.Close>

            <Button
              color="red"
              onClick={handleConfirmLogout}
              className="!cursor-pointer"
            >
              Logout
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Flex>
  );
}
