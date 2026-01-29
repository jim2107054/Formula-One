"use client";

import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Button,
  TextField,
  Select,
  Switch,
  Tabs,
  Dialog,
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
  FaCog,
  FaShieldAlt,
  FaBell,
  FaDatabase,
  FaKey,
  FaSave,
  FaTrash,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";

interface SystemSettings {
  appName: string;
  appUrl: string;
  maintenanceMode: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableAIFeatures: boolean;
}

interface UserNotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SystemSettings>({
    appName: "EduAI Learning Platform",
    appUrl: "http://localhost:3001",
    maintenanceMode: false,
    maxUploadSize: 100,
    sessionTimeout: 30,
    enableAnalytics: true,
    enableNotifications: true,
    enableAIFeatures: true,
  });

  const [notificationSettings, setNotificationSettings] =
    useState<UserNotificationSettings>({
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      dailyDigest: false,
      weeklyReport: true,
    });

  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/admin/settings");
        if (res.data?.success) {
          setSettings(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNotificationChange = (
    key: keyof UserNotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/admin/settings", settings);
      if (res.data?.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/admin/notification-settings", notificationSettings);
      if (res.data?.success) {
        toast.success("Notification settings saved!");
      } else {
        toast.error("Failed to save notification settings");
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Error saving notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/admin/clear-cache");
      if (res.data?.success) {
        toast.success("Cache cleared successfully!");
      }
    } catch (error) {
      toast.error("Error clearing cache");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/admin/reset-to-defaults");
      if (res.data?.success) {
        toast.success("Settings reset to defaults");
        setSettings({
          appName: "EduAI Learning Platform",
          appUrl: "http://localhost:3001",
          maintenanceMode: false,
          maxUploadSize: 100,
          sessionTimeout: 30,
          enableAnalytics: true,
          enableNotifications: true,
          enableAIFeatures: true,
        });
      }
    } catch (error) {
      toast.error("Error resetting settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="p-6">
      <Heading size="8" className="mb-6">System Settings</Heading>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="general">
            <FaCog className="mr-2" /> General
          </Tabs.Trigger>
          <Tabs.Trigger value="features">
            <FaShieldAlt className="mr-2" /> Features
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications">
            <FaBell className="mr-2" /> Notifications
          </Tabs.Trigger>
          <Tabs.Trigger value="maintenance">
            <FaDatabase className="mr-2" /> Maintenance
          </Tabs.Trigger>
        </Tabs.List>

        {/* General Settings */}
        <Tabs.Content value="general">
          <Card className="p-6">
            <Heading size="5" className="mb-6">General Settings</Heading>

            <Box className="space-y-6">
              {/* Application Name */}
              <Box>
                <Text as="label" className="block text-sm font-medium mb-2">
                  Application Name
                </Text>
                <TextField.Root
                  value={settings.appName}
                  onChange={(e) =>
                    handleSettingChange("appName", e.target.value)
                  }
                  placeholder="Enter application name"
                />
              </Box>

              {/* Application URL */}
              <Box>
                <Text as="label" className="block text-sm font-medium mb-2">
                  Application URL
                </Text>
                <TextField.Root
                  value={settings.appUrl}
                  onChange={(e) =>
                    handleSettingChange("appUrl", e.target.value)
                  }
                  placeholder="Enter application URL"
                />
              </Box>

              {/* Session Timeout */}
              <Box>
                <Text as="label" className="block text-sm font-medium mb-2">
                  Session Timeout (minutes)
                </Text>
                <TextField.Root
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleSettingChange("sessionTimeout", parseInt(e.target.value))
                  }
                  placeholder="30"
                />
              </Box>

              {/* Max Upload Size */}
              <Box>
                <Text as="label" className="block text-sm font-medium mb-2">
                  Max Upload Size (MB)
                </Text>
                <TextField.Root
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) =>
                    handleSettingChange("maxUploadSize", parseInt(e.target.value))
                  }
                  placeholder="100"
                />
              </Box>

              {/* Maintenance Mode */}
              <Flex justify="between" align="center" className="py-3 border-t">
                <Text className="font-medium">Maintenance Mode</Text>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    handleSettingChange("maintenanceMode", checked)
                  }
                />
              </Flex>

              {settings.maintenanceMode && (
                <Box className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-800 text-sm flex gap-2">
                  <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                  Maintenance mode is enabled. Users will see a maintenance page.
                </Box>
              )}

              <Flex gap="3" className="pt-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <FaSave className="mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </Flex>
            </Box>
          </Card>
        </Tabs.Content>

        {/* Features Settings */}
        <Tabs.Content value="features">
          <Card className="p-6">
            <Heading size="5" className="mb-6">Feature Settings</Heading>

            <Box className="space-y-4">
              <Flex justify="between" align="center" className="py-3 border-b">
                <Box>
                  <Text className="font-medium">Analytics</Text>
                  <Text className="text-sm text-gray-500">
                    Track user behavior and content performance
                  </Text>
                </Box>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableAnalytics", checked)
                  }
                />
              </Flex>

              <Flex justify="between" align="center" className="py-3 border-b">
                <Box>
                  <Text className="font-medium">Notifications</Text>
                  <Text className="text-sm text-gray-500">
                    Enable user notifications
                  </Text>
                </Box>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableNotifications", checked)
                  }
                />
              </Flex>

              <Flex justify="between" align="center" className="py-3">
                <Box>
                  <Text className="font-medium">AI Features</Text>
                  <Text className="text-sm text-gray-500">
                    Enable AI-powered content generation
                  </Text>
                </Box>
                <Switch
                  checked={settings.enableAIFeatures}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableAIFeatures", checked)
                  }
                />
              </Flex>

              <Flex gap="3" className="pt-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <FaSave className="mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </Flex>
            </Box>
          </Card>
        </Tabs.Content>

        {/* Notification Settings */}
        <Tabs.Content value="notifications">
          <Card className="p-6">
            <Heading size="5" className="mb-6">Notification Preferences</Heading>

            <Box className="space-y-4">
              <Flex justify="between" align="center" className="py-3 border-b">
                <Text className="font-medium">Email Notifications</Text>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("emailNotifications", checked)
                  }
                />
              </Flex>

              <Flex justify="between" align="center" className="py-3 border-b">
                <Text className="font-medium">SMS Notifications</Text>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("smsNotifications", checked)
                  }
                />
              </Flex>

              <Flex justify="between" align="center" className="py-3 border-b">
                <Text className="font-medium">Push Notifications</Text>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("pushNotifications", checked)
                  }
                />
              </Flex>

              <Flex justify="between" align="center" className="py-3 border-b">
                <Text className="font-medium">Daily Digest</Text>
                <Switch
                  checked={notificationSettings.dailyDigest}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("dailyDigest", checked)
                  }
                />
              </Flex>

              <Flex justify="between" align="center" className="py-3">
                <Text className="font-medium">Weekly Report</Text>
                <Switch
                  checked={notificationSettings.weeklyReport}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("weeklyReport", checked)
                  }
                />
              </Flex>

              <Flex gap="3" className="pt-4">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  <FaSave className="mr-2" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </Flex>
            </Box>
          </Card>
        </Tabs.Content>

        {/* Maintenance */}
        <Tabs.Content value="maintenance">
          <Box className="space-y-4">
            {/* Clear Cache */}
            <Card className="p-6">
              <Heading size="5" className="mb-4">Clear Cache</Heading>
              <Text className="text-gray-600 mb-4">
                Clear all cached data to free up space and refresh the system.
              </Text>
              <Button
                onClick={handleClearCache}
                disabled={loading}
                variant="soft"
                color="orange"
                className="cursor-pointer"
              >
                <FaDatabase className="mr-2" />
                {loading ? "Clearing..." : "Clear Cache"}
              </Button>
            </Card>

            {/* Reset to Defaults */}
            <Card className="p-6">
              <Heading size="5" className="mb-4">Reset Settings</Heading>
              <Text className="text-gray-600 mb-4">
                Reset all settings to default values. This cannot be undone.
              </Text>
              <Button
                onClick={handleReset}
                disabled={loading}
                variant="soft"
                color="red"
                className="cursor-pointer"
              >
                Reset to Defaults
              </Button>
            </Card>

            {/* System Info */}
            <Card className="p-6">
              <Heading size="5" className="mb-4">System Information</Heading>
              <Box className="space-y-3">
                <Flex justify="between">
                  <Text>Version</Text>
                  <Text className="font-bold">1.50.0</Text>
                </Flex>
                <Flex justify="between">
                  <Text>Node Version</Text>
                  <Text className="font-bold">v22.15.0</Text>
                </Flex>
                <Flex justify="between">
                  <Text>Database Status</Text>
                  <Text className="font-bold text-green-600">Connected</Text>
                </Flex>
                <Flex justify="between">
                  <Text>API Status</Text>
                  <Text className="font-bold text-green-600">Running</Text>
                </Flex>
              </Box>
            </Card>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}
