"use client";

import { Box, Button, Card, Dialog, Flex, Heading, Select, Table, Text, TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import api from "@/util/api";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: number;
  createdAt: string;
}

const ROLE_LABELS: Record<number, string> = {
  0: "Student",
  1: "Instructor",
  2: "Admin",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      params.append("limit", "50");

      const response = await api.get(`/api/users?${params.toString()}`);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearch = () => {
    fetchUsers();
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        role: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await api.put("/api/users", {
          _id: editingUser._id,
          ...formData,
        });
        toast.success("User updated successfully");
      } else {
        await api.post("/api/signup", formData);
        toast.success("User created successfully");
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await api.delete(`/api/users?id=${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <Box className="p-6">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="7">User Management</Heading>
        <Button onClick={() => handleOpenDialog()} className="!cursor-pointer">
          <FaPlus /> Add User
        </Button>
      </Flex>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <Flex gap="4" align="end" wrap="wrap">
          <Box className="flex-1 min-w-[200px]">
            <Text className="text-sm mb-2 block">Search</Text>
            <TextField.Root
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </Box>
          <Box>
            <Text className="text-sm mb-2 block">Role</Text>
            <Select.Root value={roleFilter} onValueChange={setRoleFilter}>
              <Select.Trigger />
              <Select.Content>
                <Select.Item value="all">All Roles</Select.Item>
                <Select.Item value="0">Student</Select.Item>
                <Select.Item value="1">Instructor</Select.Item>
                <Select.Item value="2">Admin</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          <Button onClick={handleSearch} className="!cursor-pointer">
            <FaSearch /> Search
          </Button>
        </Flex>
      </Card>

      {/* Users Table */}
      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Username</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-8">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-8">
                  No users found
                </Table.Cell>
              </Table.Row>
            ) : (
              users.map((user) => (
                <Table.Row key={user._id}>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 2 ? "bg-purple-100 text-purple-700" :
                      user.role === 1 ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2">
                      <Button size="1" variant="soft" onClick={() => handleOpenDialog(user)} className="!cursor-pointer">
                        <FaEdit />
                      </Button>
                      <Button size="1" variant="soft" color="red" onClick={() => handleDelete(user._id)} className="!cursor-pointer">
                        <FaTrash />
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content maxWidth="450px">
          <Dialog.Title>{editingUser ? "Edit User" : "Add New User"}</Dialog.Title>
          
          <Flex direction="column" gap="3" className="mt-4">
            <Box>
              <Text className="text-sm mb-1 block">Name</Text>
              <TextField.Root
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            </Box>
            <Box>
              <Text className="text-sm mb-1 block">Username</Text>
              <TextField.Root
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username"
              />
            </Box>
            <Box>
              <Text className="text-sm mb-1 block">Email</Text>
              <TextField.Root
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email address"
              />
            </Box>
            <Box>
              <Text className="text-sm mb-1 block">Password {editingUser && "(leave empty to keep current)"}</Text>
              <TextField.Root
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
              />
            </Box>
            <Box>
              <Text className="text-sm mb-1 block">Role</Text>
              <Select.Root 
                value={formData.role.toString()} 
                onValueChange={(v) => setFormData({ ...formData, role: parseInt(v) })}
              >
                <Select.Trigger className="w-full" />
                <Select.Content>
                  <Select.Item value="0">Student</Select.Item>
                  <Select.Item value="1">Instructor</Select.Item>
                  <Select.Item value="2">Admin</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" className="!cursor-pointer">Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleSubmit} className="!cursor-pointer">
              {editingUser ? "Update" : "Create"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
