"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FaBook,
  FaFilePdf,
  FaFileAlt,
  FaDownload,
  FaEye,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaFolder,
} from "react-icons/fa";
import { BiSolidSlideshow } from "react-icons/bi";

interface TheoryMaterial {
  id: string;
  title: string;
  description: string;
  type: "slide" | "pdf" | "notes" | "reference";
  topic: string;
  week: number;
  tags: string[];
  fileUrl: string;
  thumbnailUrl: string;
  uploadedAt: string;
  views: number;
}

const dummyMaterials: TheoryMaterial[] = [
  {
    id: "1",
    title: "Introduction to Machine Learning",
    description: "Overview of ML concepts, types of learning, and basic algorithms.",
    type: "slide",
    topic: "Machine Learning Basics",
    week: 1,
    tags: ["ML", "Introduction", "Algorithms"],
    fileUrl: "#",
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    uploadedAt: "2024-01-15",
    views: 245,
  },
  {
    id: "2",
    title: "Neural Networks Fundamentals",
    description: "Deep dive into neural network architectures and backpropagation.",
    type: "pdf",
    topic: "Deep Learning",
    week: 2,
    tags: ["Neural Networks", "Deep Learning", "Backpropagation"],
    fileUrl: "#",
    thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop",
    uploadedAt: "2024-01-22",
    views: 189,
  },
  {
    id: "3",
    title: "Data Preprocessing Techniques",
    description: "Comprehensive notes on data cleaning, normalization, and feature engineering.",
    type: "notes",
    topic: "Data Engineering",
    week: 3,
    tags: ["Data", "Preprocessing", "Feature Engineering"],
    fileUrl: "#",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    uploadedAt: "2024-01-29",
    views: 312,
  },
  {
    id: "4",
    title: "Supervised Learning Algorithms",
    description: "Detailed explanation of regression, classification, and decision trees.",
    type: "slide",
    topic: "Machine Learning Basics",
    week: 4,
    tags: ["Supervised Learning", "Regression", "Classification"],
    fileUrl: "#",
    thumbnailUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop",
    uploadedAt: "2024-02-05",
    views: 276,
  },
  {
    id: "5",
    title: "Convolutional Neural Networks",
    description: "Understanding CNNs for image recognition and computer vision tasks.",
    type: "pdf",
    topic: "Deep Learning",
    week: 5,
    tags: ["CNN", "Computer Vision", "Image Recognition"],
    fileUrl: "#",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
    uploadedAt: "2024-02-12",
    views: 198,
  },
  {
    id: "6",
    title: "Natural Language Processing Basics",
    description: "Introduction to NLP, tokenization, and text processing techniques.",
    type: "reference",
    topic: "NLP",
    week: 6,
    tags: ["NLP", "Text Processing", "Tokenization"],
    fileUrl: "#",
    thumbnailUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
    uploadedAt: "2024-02-19",
    views: 167,
  },
];

const typeIcons = {
  slide: BiSolidSlideshow,
  pdf: FaFilePdf,
  notes: FaFileAlt,
  reference: FaBook,
};

const typeColors = {
  slide: "bg-blue-100 text-blue-600",
  pdf: "bg-red-100 text-red-600",
  notes: "bg-green-100 text-green-600",
  reference: "bg-purple-100 text-purple-600",
};

export default function TheoryMaterialsPage() {
  const [materials] = useState<TheoryMaterial[]>(dummyMaterials);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");

  const topics = [...new Set(dummyMaterials.map((m) => m.topic))];

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || material.type === filterType;
    const matchesTopic = filterTopic === "all" || material.topic === filterTopic;
    return matchesSearch && matchesType && matchesTopic;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaBook className="text-blue-600" />
            </div>
            Theory Materials
          </h1>
          <p className="text-gray-600 mt-1">
            Access lecture slides, PDFs, notes, and supplementary references
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-[var(--Primary-light)] text-[var(--Primary)] rounded-lg text-sm font-medium">
            {filteredMaterials.length} Materials
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)] focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
            >
              <option value="all">All Types</option>
              <option value="slide">Slides</option>
              <option value="pdf">PDFs</option>
              <option value="notes">Notes</option>
              <option value="reference">References</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
            >
              <option value="all">All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => {
          const TypeIcon = typeIcons[material.type];
          return (
            <div
              key={material.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Thumbnail */}
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={material.thumbnailUrl}
                  alt={material.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      typeColors[material.type]
                    }`}
                  >
                    <TypeIcon className="inline w-3 h-3 mr-1" />
                    {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <FaEye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <FaDownload className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-[var(--Primary)] transition-colors">
                  {material.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {material.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FaFolder className="w-3 h-3" />
                    {material.topic}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendar className="w-3 h-3" />
                    Week {material.week}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaEye className="w-3 h-3" />
                    {material.views}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {material.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No materials found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
