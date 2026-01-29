"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaBook,
  FaSearch,
  FaRobot,
  FaCheckCircle,
  FaComments,
  FaFlask,
  FaHome,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaCog,
} from "react-icons/fa";
import Swal from "sweetalert2";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    href: "/student/student-dashboard",
    label: "Dashboard",
    icon: FaHome,
    description: "Overview & Quick Access",
  },
  {
    href: "/student/student-dashboard/theory",
    label: "Theory Materials",
    icon: FaBook,
    description: "Lectures, PDFs & Notes",
  },
  {
    href: "/student/student-dashboard/lab",
    label: "Lab Materials",
    icon: FaFlask,
    description: "Code Files & Exercises",
  },
  {
    href: "/student/student-dashboard/search",
    label: "Smart Search",
    icon: FaSearch,
    description: "AI-Powered Search",
  },
  {
    href: "/student/student-dashboard/generate",
    label: "AI Generate",
    icon: FaRobot,
    description: "Generate Learning Materials",
  },
  {
    href: "/student/student-dashboard/validate",
    label: "Validation",
    icon: FaCheckCircle,
    description: "Validate & Evaluate Content",
  },
  {
    href: "/student/student-dashboard/chat",
    label: "AI Chat",
    icon: FaComments,
    description: "Conversational Interface",
  },
];

export default function StudentSidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: "Log out of your account?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF0000",
      cancelButtonColor: "#009ba7",
      confirmButtonText: "Yes, Log Out",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const isActive = (href: string) => {
    if (href === "/student/student-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[var(--Primary)] text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white shadow-xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-72 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--Primary)]">EduAI</h1>
              <p className="text-xs text-gray-500">Learning Platform</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--Primary-light)] rounded-full flex items-center justify-center">
              <FaUser className="text-[var(--Primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || "Student"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    active
                      ? "bg-[var(--Primary)] text-white shadow-lg"
                      : "hover:bg-[var(--Primary-light)] text-gray-700"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-white" : "text-[var(--Primary)] group-hover:text-[var(--Primary-dark)]"
                    }`}
                  />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${active ? "text-white" : ""}`}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p
                        className={`text-xs ${
                          active ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/student/student-dashboard/edit-profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <FaCog className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
