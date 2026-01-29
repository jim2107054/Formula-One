"use client";

import { useState } from "react";
import {
  FaFolder,
  FaBook,
  FaFlask,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFileAlt,
  FaFilePdf,
  FaCode,
} from "react-icons/fa";
import { BiSolidSlideshow } from "react-icons/bi";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string;
  type: "theory" | "lab";
  contentType: "slide" | "pdf" | "notes" | "code" | "reference";
  topic: string;
  week: number;
  tags: string[];
  status: "published" | "draft";
  views: number;
  createdAt: string;
  updatedAt: string;
}

const dummyContent: ContentItem[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    type: "theory",
    contentType: "slide",
    topic: "Machine Learning Basics",
    week: 1,
    tags: ["ML", "Introduction"],
    status: "published",
    views: 245,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Python Data Structures Lab",
    type: "lab",
    contentType: "code",
    topic: "Data Structures",
    week: 1,
    tags: ["Python", "Data Structures"],
    status: "published",
    views: 189,
    createdAt: "2024-01-16",
    updatedAt: "2024-01-18",
  },
  {
    id: "3",
    title: "Neural Networks Fundamentals",
    type: "theory",
    contentType: "pdf",
    topic: "Deep Learning",
    week: 2,
    tags: ["Neural Networks", "Deep Learning"],
    status: "published",
    views: 312,
    createdAt: "2024-01-22",
    updatedAt: "2024-01-22",
  },
];

const contentTypeIcons: Record<string, React.ComponentType<{className?: string}>> = {
  slide: BiSolidSlideshow,
  pdf: FaFilePdf,
  notes: FaFileAlt,
  code: FaCode,
  reference: FaBook,
};

const contentTypeColors: Record<string, string> = {
  slide: "bg-blue-100 text-blue-600",
  pdf: "bg-red-100 text-red-600",
  notes: "bg-green-100 text-green-600",
  code: "bg-orange-100 text-orange-600",
  reference: "bg-purple-100 text-purple-600",
};

export default function ContentManagerPage() {
  const [content] = useState<ContentItem[]>(dummyContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: content.length,
    theory: content.filter((c) => c.type === "theory").length,
    lab: content.filter((c) => c.type === "lab").length,
    published: content.filter((c) => c.status === "published").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--Primary)] to-[var(--Accent-default)] rounded-lg flex items-center justify-center">
              <FaFolder className="text-white" />
            </div>
            Content Manager
          </h1>
          <p className="text-gray-600 mt-1">Manage all course materials</p>
        </div>
        <Link href="/admin/upload" className="flex items-center gap-2 px-4 py-2 bg-[var(--Primary)] text-white rounded-lg hover:bg-[var(--Primary-dark)] transition-colors">
          <FaPlus /> Add New Content
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FaFolder, color: "text-[var(--Primary)]" },
          { label: "Theory", value: stats.theory, icon: FaBook, color: "text-blue-500" },
          { label: "Lab", value: stats.lab, icon: FaFlask, color: "text-green-500" },
          { label: "Published", value: stats.published, icon: FaEye, color: "text-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">All Types</option>
            <option value="theory">Theory</option>
            <option value="lab">Lab</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Content</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Topic</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((item) => {
              const ContentIcon = contentTypeIcons[item.contentType];
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${contentTypeColors[item.contentType]}`}>
                        <ContentIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">Week {item.week}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.type === "theory" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.topic}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><FaEye className="w-4 h-4 text-gray-500" /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><FaEdit className="w-4 h-4 text-blue-500" /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg"><FaTrash className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}