"use client";

import { useState } from "react";
import {
  FaSearch,
  FaBook,
  FaFlask,
  FaFileAlt,
  FaCode,
  FaLightbulb,
  FaClock,
  FaArrowRight,
  FaStar,
  FaHistory,
} from "react-icons/fa";
import { BiSolidMagicWand } from "react-icons/bi";

interface SearchResult {
  id: string;
  title: string;
  type: "theory" | "lab" | "notes" | "code";
  relevanceScore: number;
  excerpt: string;
  source: string;
  matchedKeywords: string[];
  week?: number;
}

const dummySearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Introduction to Neural Networks",
    type: "theory",
    relevanceScore: 0.95,
    excerpt: "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes or 'neurons' that process information using connectionist approaches...",
    source: "Week 2 - Deep Learning Fundamentals.pdf",
    matchedKeywords: ["neural networks", "neurons", "deep learning"],
    week: 2,
  },
  {
    id: "2",
    title: "Building a Neural Network in Python",
    type: "lab",
    relevanceScore: 0.89,
    excerpt: "In this lab, we'll implement a basic neural network from scratch using NumPy. We'll cover forward propagation, activation functions, and backpropagation...",
    source: "Lab 3 - Neural Network Implementation",
    matchedKeywords: ["neural network", "python", "implementation"],
    week: 3,
  },
  {
    id: "3",
    title: "Activation Functions Explained",
    type: "notes",
    relevanceScore: 0.82,
    excerpt: "Activation functions introduce non-linearity into neural networks. Common types include ReLU, Sigmoid, and Tanh. Each has specific use cases and trade-offs...",
    source: "Supplementary Notes - Chapter 4",
    matchedKeywords: ["activation functions", "ReLU", "neural networks"],
    week: 2,
  },
  {
    id: "4",
    title: "PyTorch Neural Network Example",
    type: "code",
    relevanceScore: 0.78,
    excerpt: "import torch\nimport torch.nn as nn\n\nclass SimpleNN(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.layers = nn.Sequential(...)",
    source: "Code Examples - PyTorch Basics",
    matchedKeywords: ["PyTorch", "neural network", "code"],
    week: 4,
  },
];

const recentSearches = [
  "machine learning algorithms",
  "python data structures",
  "convolutional neural networks",
  "REST API design",
];

const suggestedTopics = [
  "Introduction to AI",
  "Python Fundamentals",
  "Data Preprocessing",
  "Model Evaluation",
  "Deep Learning Basics",
];

const typeIcons = {
  theory: FaBook,
  lab: FaFlask,
  notes: FaFileAlt,
  code: FaCode,
};

const typeColors = {
  theory: "bg-blue-100 text-blue-600",
  lab: "bg-green-100 text-green-600",
  notes: "bg-purple-100 text-purple-600",
  code: "bg-orange-100 text-orange-600",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setQuery(searchQuery);
    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Filter dummy results based on query
    const filtered = dummySearchResults.filter(
      (result) =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.matchedKeywords.some((kw) =>
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    setResults(filtered.length > 0 ? filtered : dummySearchResults);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4">
          <BiSolidMagicWand className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Intelligent Search</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Use AI-powered semantic search to find relevant content across all course materials.
          Ask questions in natural language!
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or search for topics..."
                className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              onClick={() => handleSearch(query)}
              disabled={isSearching || !query.trim()}
              className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Before Search - Show Suggestions */}
      {!hasSearched && (
        <div className="max-w-3xl mx-auto space-y-8 mt-8">
          {/* Recent Searches */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <FaHistory className="w-4 h-4" />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Topics */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <FaLightbulb className="w-4 h-4" />
              Suggested Topics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {suggestedTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(topic)}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-left group"
                >
                  <span className="font-medium group-hover:text-purple-600 transition-colors">
                    {topic}
                  </span>
                  <FaArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 mt-2 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="font-medium mb-3">💡 Search Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Try asking questions like "What is backpropagation?"</li>
              <li>• Search for code examples: "Python sorting algorithms"</li>
              <li>• Find related concepts: "difference between CNN and RNN"</li>
              <li>• Look for specific topics: "Week 3 neural networks"</li>
            </ul>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !isSearching && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found <span className="font-medium text-gray-900">{results.length}</span> results
              for "<span className="font-medium text-purple-600">{query}</span>"
            </p>
          </div>

          {results.map((result) => {
            const TypeIcon = typeIcons[result.type];
            return (
              <div
                key={result.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      typeColors[result.type]
                    }`}
                  >
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg hover:text-purple-600 cursor-pointer transition-colors">
                          {result.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span className="capitalize">{result.type}</span>
                          {result.week && (
                            <>
                              <span>•</span>
                              <span>Week {result.week}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{result.source}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <FaStar className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {Math.round(result.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mt-3 line-clamp-2">{result.excerpt}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-500">Matched:</span>
                      {result.matchedKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {results.length === 0 && (
            <div className="text-center py-12">
              <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
