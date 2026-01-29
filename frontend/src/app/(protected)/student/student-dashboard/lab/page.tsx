"use client";

import { useState, useEffect } from "react";
import {
  FaFlask,
  FaPython,
  FaJava,
  FaJs,
  FaDownload,
  FaSearch,
  FaCode,
  FaPlay,
  FaCopy,
  FaCheckCircle,
  FaCalendar,
  FaFolder,
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import { SiTypescript, SiCplusplus } from "react-icons/si";
import contentService, { LabMaterial } from "@/services/content.service";

interface LabMaterialDisplay extends LabMaterial {
  tags?: string[];
  codePreview?: string;
  exercises?: number;
}

const languageIcons: Record<string, React.ComponentType<{className?: string}>> = {
  python: FaPython,
  java: FaJava,
  javascript: FaJs,
  typescript: SiTypescript,
  cpp: SiCplusplus,
};

const languageColors: Record<string, string> = {
  python: "bg-yellow-100 text-yellow-700 border-yellow-200",
  java: "bg-red-100 text-red-700 border-red-200",
  javascript: "bg-amber-100 text-amber-700 border-amber-200",
  typescript: "bg-blue-100 text-blue-700 border-blue-200",
  cpp: "bg-purple-100 text-purple-700 border-purple-200",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function LabMaterialsPage() {
  const [materials, setMaterials] = useState<LabMaterialDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch materials from backend API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const data = await contentService.getLabMaterials({
          language: filterLanguage !== "all" ? filterLanguage : undefined,
          difficulty: filterDifficulty !== "all" ? filterDifficulty : undefined,
          search: searchQuery || undefined,
        });
        // Add extra fields for display
        const materialsWithExtras = data.map(m => ({
          ...m,
          codePreview: m.code || "",
          tags: [],
          exercises: 3,
        }));
        setMaterials(materialsWithExtras);
      } catch (error) {
        console.error("Failed to fetch lab materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [filterLanguage, filterDifficulty, searchQuery]);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaFlask className="text-green-600" />
            </div>
            Lab Materials
          </h1>
          <p className="text-gray-600 mt-1">
            Code files, exercises, and programming resources for hands-on learning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            {filteredMaterials.length} Lab Files
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
              placeholder="Search lab materials by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)] focus:border-transparent"
            />
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <FaCode className="text-gray-400" />
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
            >
              <option value="all">All Languages</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--Primary)]"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-[var(--Primary)]" />
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12">
          <FaFlask className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No Lab Materials Yet</h3>
          <p className="text-gray-500 mt-2">Lab materials will appear here once uploaded by administrators.</p>
        </div>
      ) : (
      <div className="space-y-4">
        {filteredMaterials.map((material) => {
          const LanguageIcon = languageIcons[material.language];
          return (
            <div
              key={material.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Info Section */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                            languageColors[material.language]
                          }`}
                        >
                          <LanguageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg hover:text-[var(--Primary)] transition-colors">
                            {material.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                difficultyColors[material.difficulty]
                              }`}
                            >
                              {material.difficulty.charAt(0).toUpperCase() +
                                material.difficulty.slice(1)}
                            </span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-500 text-xs">
                              {material.exercises} exercises
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{material.description}</p>

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
                    </div>

                    {/* Tags */}
                    {material.tags && material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {material.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    )}
                  </div>

                  {/* Code Preview */}
                  {material.codePreview && (
                  <div className="lg:w-96">
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                        <span className="text-gray-400 text-xs">Preview</span>
                        <button
                          onClick={() => handleCopyCode(material.id, material.codePreview!)}
                          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors"
                        >
                          {copiedId === material.id ? (
                            <>
                              <FaCheckCircle className="w-3 h-3 text-green-400" />
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <FaCopy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-xs text-gray-300 overflow-x-auto max-h-32">
                        <code>{material.codePreview}</code>
                      </pre>
                    </div>
                  </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--Primary)] text-white rounded-lg hover:bg-[var(--Primary-dark)] transition-colors text-sm">
                    <FaEye className="w-4 h-4" />
                    View Full Code
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <FaDownload className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm">
                    <FaPlay className="w-4 h-4" />
                    Run in Playground
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Empty State for filtered results */}
      {!loading && materials.length > 0 && filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <FaFlask className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No lab materials found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
