"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Text, TextField, Button, Select } from "@radix-ui/themes";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaBook } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuthStore } from "@/zustand/stores/auth";
import { UserRole } from "@/zustand/types/user";

interface RegisterFormProps {
  mainTitle: string;
  subtitle: string;
  buttonText: string;
}

export default function RegisterForm({
  mainTitle,
  subtitle,
  buttonText,
}: RegisterFormProps) {
  const router = useRouter();
  const { signup, loading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "0", // Default to student
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: parseInt(formData.role) as UserRole,
      });

      // Redirect based on role
      const role = parseInt(formData.role);
      if (role === 2) {
        router.push("/admin/content");
      } else {
        router.push("/student/student-dashboard");
      }
    } catch (error) {
      // Error is handled by the store
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <FaBook className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          EduAI
        </span>
      </div>

      {/* Title */}
      <Text as="p" size="6" weight="bold" className="text-gray-900 mb-2">
        {mainTitle}
      </Text>
      <Text as="p" size="2" className="text-gray-500 mb-8">
        {subtitle}
      </Text>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Text as="label" size="2" weight="medium" className="text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Text>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <TextField.Root
              size="3"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="pl-10"
              style={{ paddingLeft: "40px" }}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Text as="label" size="2" weight="medium" className="text-gray-700">
            Email <span className="text-red-500">*</span>
          </Text>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <TextField.Root
              size="3"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={{ paddingLeft: "40px" }}
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Text as="label" size="2" weight="medium" className="text-gray-700">
            Account Type <span className="text-red-500">*</span>
          </Text>
          <Select.Root value={formData.role} onValueChange={handleRoleChange}>
            <Select.Trigger placeholder="Select account type" className="w-full" />
            <Select.Content>
              <Select.Item value="0">Student</Select.Item>
              <Select.Item value="2">Admin / Instructor</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Text as="label" size="2" weight="medium" className="text-gray-700">
            Password <span className="text-red-500">*</span>
          </Text>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <TextField.Root
              size="3"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              style={{ paddingLeft: "40px", paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Text as="label" size="2" weight="medium" className="text-gray-700">
            Confirm Password <span className="text-red-500">*</span>
          </Text>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <TextField.Root
              size="3"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ paddingLeft: "40px", paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="3"
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          style={{ width: "100%", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Creating Account..." : buttonText}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <Text size="2" className="text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
