"use client";

import { Box, Button, Card, Flex, Heading, Select, Text, TextField } from "@radix-ui/themes";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FaSearch, FaFileAlt, FaCode, FaFilePdf, FaSlideshare } from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

interface SearchResult {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: string;
  topic: string;
  tags: string[];
  relevanceScore: number;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  slide: FaSlideshare,
  pdf: FaFilePdf,
  code: FaCode,
  note: FaFileAlt,
  reference: FaFileAlt,
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setSearching(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      const response = await api.get(`/api/search?${params.toString()}`);

      if (response.data.success) {
        setResults(response.data.data || []);
        if (response.data.data.length === 0) {
          toast("No results found", { icon: "🔍" });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  // Auto-search if query parameter exists
  useState(() => {
    if (initialQuery) {
      handleSearch();
    }
  });

  return (
    <Box className="p-6">
      <Heading size="7" className="mb-2">Search Course Materials</Heading>
      <Text className="text-gray-600 mb-6">
        Find relevant content using natural language search across all course materials.
      </Text>

      {/* Search Form */}
      <Card className="p-6 mb-6">
        <Flex gap="4" align="end" wrap="wrap">
          <Box className="flex-1 min-w-[300px]">
            <Text className="text-sm mb-2 block font-medium">Search Query</Text>
            <TextField.Root
              size="3"
              placeholder="What would you like to learn about? E.g., 'binary search', 'machine learning basics'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </Box>
          <Box>
            <Text className="text-sm mb-2 block font-medium">Category</Text>
            <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">All Materials</Select.Item>
                <Select.Item value="theory">Theory Only</Select.Item>
                <Select.Item value="lab">Lab Only</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Button 
            size="3" 
            onClick={handleSearch} 
            disabled={searching}
            className="!cursor-pointer"
          >
            <FaSearch /> {searching ? "Searching..." : "Search"}
          </Button>
        </Flex>
      </Card>

      {/* Results */}
      <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
        {/* Results List */}
        <Box className="flex-1">
          <Heading size="4" className="mb-4">
            {hasSearched ? `Results (${results.length})` : "Search Results"}
          </Heading>

          {!hasSearched ? (
            <Card className="p-8 text-center">
              <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
              <Text className="text-gray-500">
                Enter a search query to find relevant course materials
              </Text>
            </Card>
          ) : results.length === 0 ? (
            <Card className="p-8 text-center">
              <Text className="text-gray-500">
                No results found for your query. Try different keywords.
              </Text>
            </Card>
          ) : (
            <Flex direction="column" gap="3">
              {results.map((result) => {
                const TypeIcon = TYPE_ICONS[result.type] || FaFileAlt;
                return (
                  <Card 
                    key={result._id} 
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedContent?._id === result._id ? "ring-2 ring-[var(--Accent-default)]" : ""
                    }`}
                    onClick={() => setSelectedContent(result)}
                  >
                    <Flex justify="between" align="start">
                      <Flex gap="3" align="start" className="flex-1">
                        <Box className={`p-2 rounded ${
                          result.category === "theory" ? "bg-blue-50" : "bg-green-50"
                        }`}>
                          <TypeIcon className={
                            result.category === "theory" ? "text-blue-600" : "text-green-600"
                          } />
                        </Box>
                        <Box className="flex-1">
                          <Heading size="3">{result.title}</Heading>
                          <Text className="text-gray-600 text-sm line-clamp-2">
                            {result.description || result.content.substring(0, 150)}...
                          </Text>
                          <Flex gap="2" className="mt-2" wrap="wrap">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              result.category === "theory" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-green-100 text-green-700"
                            }`}>
                              {result.category}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {result.type}
                            </span>
                            {result.topic && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                {result.topic}
                              </span>
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                      <Box className="text-right ml-4">
                        <Text className="text-xs text-gray-500">Relevance</Text>
                        <Text className="font-bold text-[var(--Accent-default)]">
                          {Math.round(result.relevanceScore * 10)}%
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          )}
        </Box>

        {/* Content Preview */}
        {selectedContent && (
          <Card className="p-6 flex-1 max-h-[600px] overflow-y-auto">
            <Heading size="4" className="mb-4">Content Preview</Heading>
            <Box>
              <Heading size="5" className="mb-2">{selectedContent.title}</Heading>
              <Flex gap="2" className="mb-4" wrap="wrap">
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedContent.category === "theory" 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {selectedContent.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  {selectedContent.type}
                </span>
                {selectedContent.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-50 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </Flex>

              {selectedContent.description && (
                <Box className="mb-4">
                  <Text className="font-medium text-sm text-gray-500">Description</Text>
                  <Text>{selectedContent.description}</Text>
                </Box>
              )}

              <Box>
                <Text className="font-medium text-sm text-gray-500 mb-2">Content</Text>
                <Box className={`rounded-lg p-4 ${
                  selectedContent.category === "lab" 
                    ? "bg-gray-900" 
                    : "bg-gray-50"
                }`}>
                  <pre className={`whitespace-pre-wrap text-sm font-mono ${
                    selectedContent.category === "lab" 
                      ? "text-green-400" 
                      : "text-gray-800"
                  }`}>
                    {selectedContent.content}
                  </pre>
                </Box>
              </Box>
            </Box>
          </Card>
        )}
      </Flex>
    </Box>
  );
}

export default function StudentSearchPage() {
  return (
    <Theme>
      <Suspense fallback={<div className="p-6">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </Theme>
  );
}
