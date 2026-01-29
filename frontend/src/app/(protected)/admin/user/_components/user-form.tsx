"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  RadioGroup,
  Separator,
  Select,
  Checkbox,
  Grid,
  Tooltip,
  IconButton,
} from "@radix-ui/themes";
import { FaRegQuestionCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import FormAction from "../../_components/form/form-action";
import { InputLabel } from "../../_components/input-label";
import { UserRole } from "@/zustand/types/user";

const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Please enter a valid phone number"
    )
    .optional()
    .or(z.literal("")),
  role: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  gender: z.enum(["male", "female"]),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must not exceed 20 characters"),
  // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  // .regex(/[0-9]/, "Password must contain at least one number"),
  email_verified: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
  is_custom: z.boolean().optional(),
  teacher_verified: z.boolean().optional(),
});

export type CreateUserRequest = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  gender: "male" | "female";
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  password: string;
  role?: UserRole;
  gender?: "male" | "female";
  email_verified?: boolean;
  phone_verified?: boolean;
  is_custom?: boolean;
  teacher_verified?: boolean;
};

export type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  mode: "create" | "edit";
  initialValues: Partial<UserFormData>;
  loading?: boolean;
  onSubmit: (data: UserFormData) => void;
  onChange: (
    field: keyof UserFormData,
    value: UserFormData[keyof UserFormData]
  ) => void;
}

export default function UserForm({
  mode,
  initialValues,
  onChange,
  onSubmit,
  loading,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: 0,
      gender: "male",
      password: "",
      email_verified: false,
      phone_verified: false,
      is_custom: false,
      teacher_verified: false,
      ...initialValues,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    setShowPassword(false);
  }, [loading]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card mt="4">
        <Flex direction="column" gap="6" p="4">
          {/* Personal Information */}
          <Box>
            <Heading size="3">Personal Information</Heading>
            <Separator
              orientation="horizontal"
              my="4"
              style={{ width: "100%" }}
            />

            <Grid columns={{ initial: "1", sm: "2" }} gap="6">
              {/* Name */}
              <Box>
                <InputLabel required>Full Name</InputLabel>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root
                      placeholder="John Doe"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onChange("name", e.target.value);
                      }}
                    />
                  )}
                />
                {errors.name && (
                  <Text color="red" size="2">
                    {errors.name.message}
                  </Text>
                )}
              </Box>

              {/* Email */}
              <Box>
                <InputLabel
                  required
                  tooltip="This email will be used for login, notifications, and password recovery"
                >
                  Email Address
                </InputLabel>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onChange("email", e.target.value);
                      }}
                    />
                  )}
                />
                {errors.email && (
                  <Text color="red" size="2">
                    {errors.email.message}
                  </Text>
                )}
              </Box>

              {/* Phone */}
              <Box>
                <InputLabel>Phone Number</InputLabel>
                <TextField.Root
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={watch("phone") || ""}
                  onChange={(e) => {
                    setValue("phone", e.target.value, { shouldDirty: true });
                    onChange("phone", e.target.value);
                  }}
                />
                {errors.phone && (
                  <Text color="red" size="2">
                    {errors.phone.message}
                  </Text>
                )}
              </Box>

              {/* Gender */}
              <Box>
                <InputLabel required>Gender</InputLabel>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup.Root
                      value={field.value || "male"}
                      onValueChange={(value) => {
                        field.onChange(value);
                        onChange("gender", value);
                      }}
                      size="2"
                      color="cyan"
                    >
                      <Flex direction="row" gap="4">
                        <Text as="label" size="2" className="cursor-pointer">
                          <RadioGroup.Item value="male" />
                          Male
                        </Text>
                        <Text as="label" size="2" className="cursor-pointer">
                          <RadioGroup.Item value="female" />
                          Female
                        </Text>
                      </Flex>
                    </RadioGroup.Root>
                  )}
                />
                {errors.gender && (
                  <Text color="red" size="2">
                    {errors.gender.message}
                  </Text>
                )}
              </Box>
            </Grid>
          </Box>

          {/* Account Settings */}
          <Box>
            <Heading size="3">Account Settings</Heading>
            <Separator
              orientation="horizontal"
              my="4"
              style={{ width: "100%" }}
            />

            <Grid columns={{ initial: "1", sm: "2" }} gap="6">
              {/* Role */}
              <Box>
                <InputLabel
                  required
                  tooltip={
                    <>
                      <Text weight="medium" mb="1">
                        Role permissions:
                      </Text>
                      <br />
                      <Text size="1">
                        • <Text weight="medium">Learner:</Text> Can access and
                        enroll in courses
                      </Text>
                      <br />
                      <Text size="1">
                        • <Text weight="medium">Instructor:</Text> Can create,
                        edit, and manage courses
                      </Text>
                      <br />
                      <Text size="1">
                        • <Text weight="medium">Admin:</Text> Full system access
                        and user management
                      </Text>
                    </>
                  }
                >
                  User Role
                </InputLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value?.toString() || "0"}
                      onValueChange={(value) => {
                        const roleNumber = parseInt(value, 10) as UserRole;
                        field.onChange(roleNumber);
                        onChange("role", roleNumber);
                      }}
                    >
                      <Select.Trigger
                        style={{ width: "100%" }}
                        className="!cursor-pointer"
                      />
                      <Select.Content>
                        <Select.Item
                          value="0"
                          className="!cursor-pointer hover:!bg-accent"
                        >
                          Learner
                        </Select.Item>
                        <Select.Item
                          value="1"
                          className="!cursor-pointer hover:!bg-accent"
                        >
                          Instructor
                        </Select.Item>
                        <Select.Item
                          value="2"
                          className="!cursor-pointer hover:!bg-accent"
                        >
                          Admin
                        </Select.Item>
                      </Select.Content>
                    </Select.Root>
                  )}
                />
                {errors.role && (
                  <Text color="red" size="2">
                    {errors.role.message}
                  </Text>
                )}
              </Box>

              <Box>
                <InputLabel
                  required
                  tooltip={
                    <>
                      <Text weight="medium" mb="1">
                        Password requirements:
                      </Text>
                      <br />
                      <Text size="1">• Minimum 6 characters</Text>
                      <br />
                      <Text size="1">• At least one lowercase letter</Text>
                      <br />
                      <Text size="1">• At least one number</Text>
                      <br />
                      <Text size="1">• Maximum 100 characters</Text>
                    </>
                  }
                >
                  Password
                </InputLabel>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField.Root
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      size="2"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        onChange("password", e.target.value);
                      }}
                    >
                      <TextField.Slot />
                      <TextField.Slot>
                        <IconButton
                          type="button"
                          size="1"
                          variant="ghost"
                          onClick={togglePasswordVisibility}
                          className="!cursor-pointer"
                          color="gray"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </TextField.Slot>
                    </TextField.Root>
                  )}
                />
                {errors.password && (
                  <Text color="red" size="2">
                    {errors.password.message}
                  </Text>
                )}
              </Box>
            </Grid>

            {/* Verification Fields (Edit mode only) */}
            {mode === "edit" && (
              <Box mt="6">
                <Text size="2" weight="medium" mb="2">
                  Account Verification
                </Text>
                <Grid columns={{ initial: "2", sm: "2" }} gap="4">
                  <Flex direction="column" gap="2">
                    <Text as="label" size="2" className="!cursor-pointer">
                      <Flex as="span" gap="2" align="center">
                        <Controller
                          name="email_verified"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                onChange("email_verified", checked);
                              }}
                              color="cyan"
                            />
                          )}
                        />
                        Email Verified
                      </Flex>
                    </Text>
                    <Text as="label" size="2" className="!cursor-pointer">
                      <Flex as="span" gap="2" align="center">
                        <Controller
                          name="phone_verified"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                onChange("phone_verified", checked);
                              }}
                              color="cyan"
                            />
                          )}
                        />
                        Phone Verified
                      </Flex>
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="2">
                    <Text as="label" size="2" className="!cursor-pointer">
                      <Flex as="span" gap="2" align="center">
                        <Controller
                          name="is_custom"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                onChange("is_custom", checked);
                              }}
                              color="cyan"
                            />
                          )}
                        />
                        Is Custom
                        <Tooltip content="Custom users have special permissions or custom configurations">
                          <button
                            type="button"
                            aria-label="More information"
                            className="!cursor-pointer"
                          >
                            <FaRegQuestionCircle color="gray" />
                          </button>
                        </Tooltip>
                      </Flex>
                    </Text>
                    <Text as="label" size="2" className="!cursor-pointer">
                      <Flex as="span" gap="2" align="center">
                        <Controller
                          name="teacher_verified"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                onChange("teacher_verified", checked);
                              }}
                              color="cyan"
                            />
                          )}
                        />
                        Teacher Verified
                      </Flex>
                    </Text>
                  </Flex>
                </Grid>
              </Box>
            )}
          </Box>
        </Flex>
      </Card>

      <FormAction
        saveLabel={
          loading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update User"
            : "Create User"
        }
        loading={loading}
        hasUnsavedChanges={isDirty}
      />
    </form>
  );
}
