"use client";

import { useState, useEffect } from "react";
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
  FaSpinner,
} from "react-icons/fa";
import { BiSolidSlideshow } from "react-icons/bi";
import contentService, { TheoryMaterial } from "@/services/content.service";

interface TheoryMaterialDisplay extends TheoryMaterial {
  tags?: string[];
  thumbnailUrl?: string;
}

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

// Default thumbnails for different content types
const defaultThumbnails = {
  slide: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  pdf: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop",
  notes: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop",
  reference: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
};

export default function TheoryMaterialsPage() {
  const [materials, setMaterials] = useState<TheoryMaterialDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");

  // Fetch materials from backend API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const data = await contentService.getTheoryMaterials({
          type: filterType !== "all" ? filterType : undefined,
          topic: filterTopic !== "all" ? filterTopic : undefined,
          search: searchQuery || undefined,
        });
        // Add thumbnail URLs if not present
        const materialsWithThumbnails = data.map(m => ({
          ...m,
          thumbnailUrl: m.thumbnail || defaultThumbnails[m.type as keyof typeof defaultThumbnails] || defaultThumbnails.notes,
          tags: [],
        }));
        setMaterials(materialsWithThumbnails);
      } catch (error) {
        console.error("Failed to fetch theory materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [filterType, filterTopic, searchQuery]);

  const topics = [...new Set(materials.map((m) => m.topic))];

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="w-8 h-8 text-[var(--Primary)] animate-spin" />
        </div>
      )}

      {/* Materials Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const TypeIcon = typeIcons[material.type as keyof typeof typeIcons];
            return (
              <div
                key={material.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={material.thumbnailUrl || defaultThumbnails.notes}
                    alt={material.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        typeColors[material.type as keyof typeof typeColors] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {TypeIcon && <TypeIcon className="inline w-3 h-3 mr-1" />}
                      {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                      <FaEye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                      onClick={() => material.fileUrl && window.open(material.fileUrl, '_blank')}
                    >
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
                      {material.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No materials found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
