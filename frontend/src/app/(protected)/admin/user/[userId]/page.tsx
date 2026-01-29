"use client";

import { Container, Flex, Text } from "@radix-ui/themes";
import { useParams, useRouter } from "next/navigation";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import FormHeader from "../../_components/form/form-header";
import UserForm, { UserFormData } from "../_components/user-form";
import { useUser, useUpdateUser } from "@/hooks/queries/useUserQueries";

export default function EditUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const { data: currentUser, isLoading, error, refetch } = useUser(userId);

  const updateUser = useUpdateUser({
    onSuccess: () => router.push("/admin/user"),
  });

  if (isLoading) return <LoadingSpinner />;

  if (error || !currentUser?.data) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Text color="red" mb="4">
          {error instanceof Error ? error.message : "User not found"}
        </Text>
        <button onClick={() => refetch()}>Retry</button>
      </Flex>
    );
  }

  const user = currentUser.data;
  const initialValues: Partial<UserFormData> = {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role,
    gender: (user.gender as "male" | "female") || "male",
    password: user.pass || "",
    email_verified: user.email_verified || false,
    phone_verified: user.phone_verified || false,
    is_custom: user.is_custom || false,
    teacher_verified: user.teacher_verified || false,
  };

  const handleSubmit = (data: UserFormData) => {
    const payload = {
      id: user._id,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        gender: data.gender,
        password: data.password,
        email_verified: data.email_verified,
        phone_verified: data.phone_verified,
        is_custom: data.is_custom,
        teacher_verified: data.teacher_verified,
      },
    };
    updateUser.mutate(payload);
  };

  return (
    <Container size="3">
      <FormHeader
        title="Edit User"
        subtitle="Update user details and permissions"
      />
      <UserForm
        mode="edit"
        initialValues={initialValues}
        loading={updateUser.isPending}
        onSubmit={handleSubmit}
        onChange={() => {}}
      />
    </Container>
  );
}
