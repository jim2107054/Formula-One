"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  FaBook,
  FaSearch,
  FaRobot,
  FaCheckCircle,
  FaComments,
  FaFlask,
  FaArrowRight,
  FaFileAlt,
  FaCode,
  FaLightbulb,
  FaClock,
} from "react-icons/fa";

const features = [
  {
    title: "Theory Materials",
    description: "Access lecture slides, PDFs, and supplementary notes organized by topics and weeks.",
    href: "/student/student-dashboard/theory",
    icon: FaBook,
    color: "from-blue-500 to-blue-600",
    stats: "50+ Resources",
  },
  {
    title: "Lab Materials",
    description: "Browse code files, exercises, and programming resources for hands-on learning.",
    href: "/student/student-dashboard/lab",
    icon: FaFlask,
    color: "from-green-500 to-green-600",
    stats: "30+ Lab Files",
  },
  {
    title: "Smart Search",
    description: "Use AI-powered semantic search to find relevant content across all course materials.",
    href: "/student/student-dashboard/search",
    icon: FaSearch,
    color: "from-purple-500 to-purple-600",
    stats: "RAG-Based",
  },
  {
    title: "AI Generate",
    description: "Generate new learning materials, notes, or code based on course topics.",
    href: "/student/student-dashboard/generate",
    icon: FaRobot,
    color: "from-orange-500 to-orange-600",
    stats: "GPT Powered",
  },
  {
    title: "Validation",
    description: "Validate and evaluate AI-generated content for accuracy and correctness.",
    href: "/student/student-dashboard/validate",
    icon: FaCheckCircle,
    color: "from-teal-500 to-teal-600",
    stats: "Quality Check",
  },
  {
    title: "AI Chat",
    description: "Interact with an AI assistant for explanations, summaries, and questions.",
    href: "/student/student-dashboard/chat",
    icon: FaComments,
    color: "from-pink-500 to-pink-600",
    stats: "24/7 Available",
  },
];

const recentActivities = [
  {
    title: "Introduction to Machine Learning",
    type: "Theory",
    icon: FaFileAlt,
    time: "2 hours ago",
  },
  {
    title: "Python Data Structures Lab",
    type: "Lab",
    icon: FaCode,
    time: "Yesterday",
  },
  {
    title: "Neural Networks Overview",
    type: "Generated",
    icon: FaLightbulb,
    time: "2 days ago",
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[var(--Primary)] to-[var(--Accent-default)] rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || "Student"}! 👋
        </h1>
        <p className="text-white/80 text-lg">
          Your AI-powered learning journey continues. Explore course materials, generate content, and get instant help.
        </p>
        <div className="flex gap-4 mt-6">
          <Link
            href="/student/student-dashboard/search"
            className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <FaSearch /> Quick Search
          </Link>
          <Link
            href="/student/student-dashboard/chat"
            className="bg-white text-[var(--Primary)] px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
          >
            <FaComments /> Start Chat
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Theory Topics", value: "24", icon: FaBook, color: "text-blue-500" },
          { label: "Lab Exercises", value: "18", icon: FaFlask, color: "text-green-500" },
          { label: "AI Generations", value: "12", icon: FaRobot, color: "text-orange-500" },
          { label: "Chat Sessions", value: "45", icon: FaComments, color: "text-pink-500" },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--Primary)] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                    <span className="inline-block text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                      {feature.stats}
                    </span>
                  </div>
                  <FaArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--Primary)] group-hover:translate-x-1 transition-all mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FaClock className="text-[var(--Primary)]" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-[var(--Primary-light)] rounded-lg flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-[var(--Primary)]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.type}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Tips */}
        <div className="bg-gradient-to-br from-[var(--Primary-light)] to-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Learning Tips
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[var(--Primary)] text-white rounded-full flex items-center justify-center text-xs shrink-0">1</span>
              <p className="text-sm text-gray-700">Use <strong>Smart Search</strong> to find specific concepts across all materials.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[var(--Primary)] text-white rounded-full flex items-center justify-center text-xs shrink-0">2</span>
              <p className="text-sm text-gray-700">Generate study notes using <strong>AI Generate</strong> for better revision.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[var(--Primary)] text-white rounded-full flex items-center justify-center text-xs shrink-0">3</span>
              <p className="text-sm text-gray-700">Always <strong>validate</strong> AI-generated code before using it.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 bg-[var(--Primary)] text-white rounded-full flex items-center justify-center text-xs shrink-0">4</span>
              <p className="text-sm text-gray-700">Ask the <strong>AI Chat</strong> for explanations and follow-up questions.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
