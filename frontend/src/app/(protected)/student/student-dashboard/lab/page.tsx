"use client";

import { Box, Card, Flex, Grid, Heading, Text, TextField, Select } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaCode, FaPython, FaJava, FaJs, FaFlask } from "react-icons/fa";
import api from "@/util/api";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

interface Content {
  _id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  topic: string;
  language: string;
  tags: string[];
  createdAt: string;
}

const LANG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  python: FaPython,
  java: FaJava,
  javascript: FaJs,
};

const LANG_COLORS: Record<string, { bg: string; text: string }> = {
  python: { bg: "bg-yellow-50", text: "text-yellow-600" },
  java: { bg: "bg-red-50", text: "text-red-600" },
  javascript: { bg: "bg-yellow-50", text: "text-yellow-600" },
  cpp: { bg: "bg-blue-50", text: "text-blue-600" },
  c: { bg: "bg-gray-50", text: "text-gray-600" },
};

export default function StudentLabPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/api/content?category=lab&limit=100");
        const data = response.data.data || [];
        setContents(data);
        
        // Extract unique languages
        const uniqueLangs = [...new Set(data.map((c: Content) => c.language).filter(Boolean))] as string[];
        setLanguages(uniqueLangs);
      } catch (error) {
        console.error("Error fetching lab content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const filteredContents = contents.filter((content) => {
    const matchesSearch = !search || 
      content.title.toLowerCase().includes(search.toLowerCase()) ||
      content.description?.toLowerCase().includes(search.toLowerCase()) ||
      content.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = languageFilter === "all" || content.language === languageFilter;
    return matchesSearch && matchesLang;
  });

  // Group by language
  const groupedByLanguage = filteredContents.reduce((acc, content) => {
    const lang = content.language || "other";
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(content);
    return acc;
  }, {} as Record<string, Content[]>);

  return (
    <Theme>
      <Box className="p-6">
        <Heading size="7" className="mb-2">Lab Materials</Heading>
        <Text className="text-gray-600 mb-6">
          Browse code examples, programming exercises, and lab materials.
        </Text>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <Flex gap="4" align="end" wrap="wrap">
            <Box className="flex-1 min-w-[200px]">
              <Text className="text-sm mb-2 block">Search</Text>
              <TextField.Root
                placeholder="Search lab materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            <Box>
              <Text className="text-sm mb-2 block">Language</Text>
              <Select.Root value={languageFilter} onValueChange={setLanguageFilter}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All Languages</Select.Item>
                  {languages.map((lang) => (
                    <Select.Item key={lang} value={lang} className="capitalize">{lang}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        </Card>

        <Flex gap="6" direction={{ initial: "column", lg: "row" }}>
          {/* Content List */}
          <Box className="flex-1">
            {loading ? (
              <Text>Loading...</Text>
            ) : filteredContents.length === 0 ? (
              <Card className="p-8 text-center">
                <FaFlask className="text-4xl text-gray-300 mx-auto mb-4" />
                <Text className="text-gray-500">No lab content found.</Text>
              </Card>
            ) : (
              <Flex direction="column" gap="6">
                {Object.entries(groupedByLanguage).map(([language, items]) => {
                  const LangIcon = LANG_ICONS[language] || FaCode;
                  const colors = LANG_COLORS[language] || { bg: "bg-green-50", text: "text-green-600" };
                  return (
                    <Box key={language}>
                      <Flex align="center" gap="2" className="mb-3">
                        <LangIcon className={colors.text} />
                        <Heading size="4" className="text-[var(--Accent-dark-2)] capitalize">
                          {language}
                        </Heading>
                      </Flex>
                      <Grid columns={{ initial: "1", md: "2" }} gap="3">
                        {items.map((content) => (
                          <Card 
                            key={content._id} 
                            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                              selectedContent?._id === content._id ? "ring-2 ring-[var(--Accent-default)]" : ""
                            }`}
                            onClick={() => setSelectedContent(content)}
                          >
                            <Flex gap="3" align="start">
                              <Box className={`p-2 rounded-lg ${colors.bg}`}>
                                <FaCode className={colors.text} />
                              </Box>
                              <Box className="flex-1">
                                <Text className="font-medium">{content.title}</Text>
                                <Text className="text-gray-500 text-sm line-clamp-1">
                                  {content.description || content.topic || "No description"}
                                </Text>
                                <Flex gap="1" className="mt-2" wrap="wrap">
                                  {content.tags.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </Flex>
                              </Box>
                            </Flex>
                          </Card>
                        ))}
                      </Grid>
                    </Box>
                  );
                })}
              </Flex>
            )}
          </Box>

          {/* Code Preview */}
          {selectedContent && (
            <Card className="p-6 flex-1 max-h-[700px] overflow-y-auto sticky top-6">
              <Heading size="5" className="mb-2">{selectedContent.title}</Heading>
              <Flex gap="2" className="mb-4" wrap="wrap">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  {selectedContent.language || "code"}
                </span>
                {selectedContent.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </Flex>

              {selectedContent.description && (
                <Box className="mb-4 p-3 bg-gray-50 rounded">
                  <Text className="text-gray-700">{selectedContent.description}</Text>
                </Box>
              )}

              <Box className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {selectedContent.content || "No code available."}
                </pre>
              </Box>
            </Card>
          )}
        </Flex>
      </Box>
    </Theme>
  );
}
