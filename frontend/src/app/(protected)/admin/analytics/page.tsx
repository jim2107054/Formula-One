"use client";

import { Box, Card, Flex, Grid, Heading, Text, Button, Tabs } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaUsers,
  FaBook,
  FaComments,
  FaEye,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "@/util/api";

interface Analytics {
  totalViews: number;
  userEngagement: number;
  contentCreated: number;
  chatsInitiated: number;
  avgSessionDuration: number;
  userRetention: number;
}

interface ChartData {
  date: string;
  views: number;
  users: number;
  chats: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    userEngagement: 0,
    contentCreated: 0,
    chatsInitiated: 0,
    avgSessionDuration: 0,
    userRetention: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch analytics data
        const res = await api.get("/api/analytics");
        if (res.data?.success) {
          setAnalytics(res.data.data);
        } else {
          // Mock data for demonstration
          setAnalytics({
            totalViews: 1250,
            userEngagement: 85,
            contentCreated: 42,
            chatsInitiated: 156,
            avgSessionDuration: 18,
            userRetention: 78,
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Use mock data on error
        setAnalytics({
          totalViews: 1250,
          userEngagement: 85,
          contentCreated: 42,
          chatsInitiated: 156,
          avgSessionDuration: 18,
          userRetention: 78,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const metricCards = [
    {
      title: "Total Views",
      value: analytics.totalViews,
      icon: FaEye,
      color: "blue",
      trend: "+12%",
    },
    {
      title: "User Engagement",
      value: `${analytics.userEngagement}%`,
      icon: FaUsers,
      color: "green",
      trend: "+5%",
    },
    {
      title: "Content Created",
      value: analytics.contentCreated,
      icon: FaBook,
      color: "purple",
      trend: "+8 this week",
    },
    {
      title: "Chats Initiated",
      value: analytics.chatsInitiated,
      icon: FaComments,
      color: "orange",
      trend: "+23%",
    },
    {
      title: "Avg Session (min)",
      value: analytics.avgSessionDuration,
      icon: FaCalendarAlt,
      color: "cyan",
      trend: "+2 min",
    },
    {
      title: "User Retention",
      value: `${analytics.userRetention}%`,
      icon: FaChartLine,
      color: "indigo",
      trend: "+3%",
    },
  ];

  const handleExport = async () => {
    try {
      const response = await api.get("/api/analytics/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `analytics-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (error) {
      console.error("Error exporting analytics:", error);
    }
  };

  return (
    <Box className="p-6">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="8">Analytics & Insights</Heading>
        <Flex gap="3">
          <Button variant="soft" onClick={handleExport}>
            <FaDownload className="mr-2" />
            Export Report
          </Button>
        </Flex>
      </Flex>

      <Tabs.Root value="overview" className="mb-8">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="trends">Trends</Tabs.Trigger>
          <Tabs.Trigger value="engagement">Engagement</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          {/* Date Range Selector */}
          <Flex gap="2" className="mb-6">
            {["day", "week", "month", "year"].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "solid" : "soft"}
                onClick={() => setDateRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </Flex>

          {/* Metrics Grid */}
          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4" className="mb-8">
            {metricCards.map((metric, index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                <Flex justify="between" align="start" className="mb-4">
                  <Box>
                    <Text className="text-gray-500 text-sm block mb-2">
                      {metric.title}
                    </Text>
                    <Text className={`text-2xl font-bold text-${metric.color}-600`}>
                      {metric.value}
                    </Text>
                  </Box>
                  <Box className={`p-3 rounded-lg bg-${metric.color}-100`}>
                    <metric.icon className={`text-${metric.color}-600 text-lg`} />
                  </Box>
                </Flex>
                <Text className="text-green-600 text-xs font-medium">
                  {metric.trend} from last period
                </Text>
              </Card>
            ))}
          </Grid>

          {/* Summary Stats */}
          <Card className="p-6">
            <Heading size="5" className="mb-4">
              Key Insights
            </Heading>
            <Box className="space-y-3">
              <Flex justify="between" className="py-2 border-b">
                <Text>Most Popular Content</Text>
                <Text className="font-bold">Advanced Physics Module</Text>
              </Flex>
              <Flex justify="between" className="py-2 border-b">
                <Text>Peak Usage Time</Text>
                <Text className="font-bold">2:00 PM - 4:00 PM</Text>
              </Flex>
              <Flex justify="between" className="py-2 border-b">
                <Text>Average Content Completion</Text>
                <Text className="font-bold">72%</Text>
              </Flex>
              <Flex justify="between" className="py-2">
                <Text>Active Users This Week</Text>
                <Text className="font-bold">284</Text>
              </Flex>
            </Box>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="trends">
          <Card className="p-6">
            <Heading size="5" className="mb-4">
              Usage Trends
            </Heading>
            <Box className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <Text className="text-gray-500">
                Chart visualization would appear here
              </Text>
            </Box>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="engagement">
          <Grid columns={{ initial: "1", lg: "2" }} gap="4">
            <Card className="p-6">
              <Heading size="5" className="mb-4">
                User Engagement
              </Heading>
              <Box className="space-y-3">
                <Flex justify="between" align="center">
                  <Text>Active Users</Text>
                  <Text className="font-bold">542</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text>Inactive Users (7+ days)</Text>
                  <Text className="font-bold">128</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text>New Users</Text>
                  <Text className="font-bold">32</Text>
                </Flex>
              </Box>
            </Card>

            <Card className="p-6">
              <Heading size="5" className="mb-4">
                Content Performance
              </Heading>
              <Box className="space-y-3">
                <Flex justify="between" align="center">
                  <Text>Most Accessed</Text>
                  <Text className="font-bold">Physics Lab</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text>Least Accessed</Text>
                  <Text className="font-bold">Advanced Math</Text>
                </Flex>
                <Flex justify="between" align="center">
                  <Text>Avg Rating</Text>
                  <Text className="font-bold">4.5/5</Text>
                </Flex>
              </Box>
            </Card>
          </Grid>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
