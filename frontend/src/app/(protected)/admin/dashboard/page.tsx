"use client";

import { Box, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaUsers, FaBook, FaFlask, FaFileAlt, FaComments, FaRobot } from "react-icons/fa";
import api from "@/util/api";

interface Stats {
  totalUsers: number;
  totalContent: number;
  theoryContent: number;
  labContent: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalContent: 0,
    theoryContent: 0,
    labContent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, contentRes, theoryRes, labRes] = await Promise.all([
          api.get("/api/users?limit=1"),
          api.get("/api/content?limit=1"),
          api.get("/api/content?category=theory&limit=1"),
          api.get("/api/content?category=lab&limit=1"),
        ]);

        setStats({
          totalUsers: usersRes.data.pagination?.total || 0,
          totalContent: contentRes.data.pagination?.total || 0,
          theoryContent: theoryRes.data.pagination?.total || 0,
          labContent: labRes.data.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: FaUsers, color: "blue" },
    { title: "Total Content", value: stats.totalContent, icon: FaBook, color: "green" },
    { title: "Theory Materials", value: stats.theoryContent, icon: FaFileAlt, color: "purple" },
    { title: "Lab Materials", value: stats.labContent, icon: FaFlask, color: "orange" },
  ];

  const features = [
    {
      title: "Content Management",
      description: "Upload, organize, and manage course materials including slides, PDFs, code files, and notes.",
      icon: FaBook,
      href: "/admin/content",
    },
    {
      title: "AI Content Generation",
      description: "Generate learning materials using AI - create notes, slides, and code examples automatically.",
      icon: FaRobot,
      href: "/admin/ai-generate",
    },
    {
      title: "Intelligent Search",
      description: "Semantic search across all course materials with relevance-based results.",
      icon: FaBook,
      href: "/admin/search",
    },
    {
      title: "Chat Assistant",
      description: "AI-powered chat interface for answering questions and providing learning support.",
      icon: FaComments,
      href: "/admin/chat",
    },
  ];

  return (
    <Box className="p-6">
      <Heading size="8" className="mb-6">Admin Dashboard</Heading>
      <Text className="text-gray-600 mb-8">
        Welcome to the AI-Powered Learning Platform. Manage content, users, and AI features.
      </Text>

      {/* Stats Grid */}
      <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="4" className="mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-4">
            <Flex align="center" gap="3">
              <Box className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600 text-xl`} />
              </Box>
              <Box>
                <Text className="text-gray-500 text-sm">{stat.title}</Text>
                <Heading size="5">
                  {loading ? "..." : stat.value}
                </Heading>
              </Box>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Features Section */}
      <Heading size="5" className="mb-4">Platform Features</Heading>
      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        {features.map((feature, index) => (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <a href={feature.href}>
              <Flex align="start" gap="3">
                <Box className="p-3 rounded-lg bg-[var(--Accent-light)]">
                  <feature.icon className="text-[var(--Accent-default)] text-xl" />
                </Box>
                <Box>
                  <Heading size="3" className="mb-1">{feature.title}</Heading>
                  <Text className="text-gray-600 text-sm">{feature.description}</Text>
                </Box>
              </Flex>
            </a>
          </Card>
        ))}
      </Grid>

      {/* Quick Info */}
      <Card className="mt-8 p-6 bg-[var(--Accent-light)]">
        <Heading size="4" className="mb-2">🎓 Platform Credentials</Heading>
        <Text className="text-gray-700">
          <strong>Admin Login:</strong> admin@learning.com / admin123<br />
          <strong>Student Login:</strong> student@learning.com / student123
        </Text>
      </Card>
    </Box>
  );
}
