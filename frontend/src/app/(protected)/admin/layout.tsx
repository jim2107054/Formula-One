"use client";

import SideNav from "./_components/sidebar";
import RoleProtectedLayout from "@/components/layout/RoleProtectedLayout";
import "@radix-ui/themes/styles.css";
import { Box, Flex, Theme } from "@radix-ui/themes";

import { useRouteTracking } from "@/hooks/useRouteTracking";
import { useUIStore } from "@/zustand/stores/ui";

export default function MainDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRouteTracking();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <RoleProtectedLayout role={2}>
      <Theme>
        <Flex className="h-screen overflow-hidden">
          <Box
            position="fixed"
            top="0"
            left="0"
            height="100%"
            style={{
              width: sidebarCollapsed ? "3rem" : "12rem",
              borderRight: "1px solid var(--gray-5)",
              boxShadow: "var(--shadow-4)",
              transition: "width 0.3s ease-in-out",
              zIndex: 10,
            }}
          >
            <SideNav />
          </Box>
          <main
            style={{
              marginLeft: sidebarCollapsed ? "3rem" : "12rem",
              transition: "margin-left 0.3s ease-in-out",
              overflowY: "auto",
              flex: 1,
              padding: 20,
              alignContent: "start",
            }}
          >
            {children}
          </main>
        </Flex>
      </Theme>
    </RoleProtectedLayout>
  );
}
