"use client";

import { Box, Card, Flex, Grid, Heading, Text, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaFileAlt, FaSlideshare, FaFilePdf, FaBook, FaPlus } from "react-icons/fa";
import api from "@/util/api";
import Link from "next/link";

interface Content {
  _id: string;
  title: string;
  description: string;
  type: string;
  topic: string;
  week: number | null;
  tags: string[];
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  slide: FaSlideshare,
  pdf: FaFilePdf,
  note: FaFileAlt,
  reference: FaBook,
};

export default function TheoryPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get("/cms/content?category=theory&limit=50");
        setContents(response.data.data || response.data || []);
      } catch (error) {
        console.error("Error fetching theory content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Group by topic
  const groupedByTopic = contents.reduce((acc, content) => {
    const topic = content.topic || "General";
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(content);
    return acc;
  }, {} as Record<string, Content[]>);

  return (
    <Box className="p-6">
      <Flex justify="between" align="center" className="mb-6">
        <Box>
          <Heading size="7">Theory Materials</Heading>
          <Text className="text-gray-600">
            Lecture slides, PDFs, notes, and supplementary references for theory content.
          </Text>
        </Box>
        <Link href="/admin/content">
          <Button className="!cursor-pointer">
            <FaPlus /> Add Content
          </Button>
        </Link>
      </Flex>

      {loading ? (
        <Text>Loading...</Text>
      ) : contents.length === 0 ? (
        <Card className="p-8 text-center">
          <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
          <Heading size="4" className="text-gray-400 mb-2">No Theory Content</Heading>
          <Text className="text-gray-400 mb-4">
            Add theory materials like slides, PDFs, and notes.
          </Text>
          <Link href="/admin/content">
            <Button className="!cursor-pointer">
              <FaPlus /> Add Theory Content
            </Button>
          </Link>
        </Card>
      ) : (
        <Flex direction="column" gap="6">
          {Object.entries(groupedByTopic).map(([topic, items]) => (
            <Box key={topic}>
              <Heading size="4" className="mb-3 text-[var(--Accent-dark-2)]">
                {topic}
              </Heading>
              <Grid columns={{ initial: "1", md: "2", lg: "3" }} gap="4">
                {items.map((content) => {
                  const TypeIcon = TYPE_ICONS[content.type] || FaFileAlt;
                  return (
                    <Card key={content._id} className="p-4 hover:shadow-lg transition-shadow">
                      <Flex gap="3" align="start">
                        <Box className="p-3 rounded-lg bg-blue-50">
                          <TypeIcon className="text-blue-600 text-xl" />
                        </Box>
                        <Box className="flex-1">
                          <Heading size="3" className="mb-1">{content.title}</Heading>
                          <Text className="text-gray-600 text-sm line-clamp-2">
                            {content.description || "No description"}
                          </Text>
                          <Flex gap="2" className="mt-2" wrap="wrap">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {content.type}
                            </span>
                            {content.week && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                Week {content.week}
                              </span>
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                    </Card>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
}
