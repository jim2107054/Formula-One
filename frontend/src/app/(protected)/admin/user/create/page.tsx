"use client";

import { useCreateUser } from "@/hooks/queries/useUserQueries";
import { Container } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormHeader from "../../_components/form/form-header";
import UserForm, { UserFormData } from "../_components/user-form";

export default function CreateUserPage() {
  const router = useRouter();

  const createUser = useCreateUser({
    onSuccess: () => {
      router.push("/admin/user");
    },
  });

  const [formData, setFormData] = useState<UserFormData>({
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
  });

  const handleSubmit = (data: UserFormData) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      password: data.password,
      role: data.role,
      gender: data.gender,
    };
    createUser.mutate(payload);
  };

  return (
    <Container size="3">
      <FormHeader
        title="Create New User"
        subtitle="Add a new user to the system with their details and permissions"
      />
      <UserForm
        mode="create"
        initialValues={formData}
        loading={createUser.isPending}
        onSubmit={handleSubmit}
        onChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
      />
    </Container>
  );
}
