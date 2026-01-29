"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  useDeleteEnrollment,
  useEnrollment,
} from "@/hooks/queries/useEnrollmentQueries";
import {
  AlertDialog,
  Box,
  Container,
  DropdownMenu,
  Flex,
  Text,
} from "@radix-ui/themes";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiDotsVertical, BiTrash } from "react-icons/bi";
import { MdEditSquare, MdKeyboardBackspace } from "react-icons/md";
import { Button } from "../../_components/button";
import EnrollForm from "../_components/EnrollForm";
import FormHeader from "../../_components/form/form-header";

export default function EnrollmentDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollId = params.id as string;
  const isEditMode = searchParams.get("edit") === "true";

  const { data: currentEnroll, isLoading, error } = useEnrollment(enrollId);

  const deleteEnrollment = useDeleteEnrollment({
    onSuccess: () => {
      router.push("/admin/enrollment");
    },
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditMode);

  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  const handleEditToggle = () => {
    router.push(`/admin/enrollment/${enrollId}?edit=true`);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!currentEnroll) return;
    deleteEnrollment.mutate(currentEnroll._id);
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: "100vh", width: "100%" }}
      >
        <Box style={{ textAlign: "center" }}>
          <Text color="red" mb="4">
            Failed to load enrollment: {error.message}
          </Text>
          <Link href="/admin/enroll">
            <Button>Back to Enrollments</Button>
          </Link>
        </Box>
      </Flex>
    );
  }

  if (!currentEnroll) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ minHeight: "100vh", width: "100%" }}
      >
        <Flex direction="column" align="center">
          <Text color="gray" mb="4">
            Enrollment not found
          </Text>
          <Link href="/admin/enrollment">
            <Button>
              <MdKeyboardBackspace />
              Back to Enrollments
            </Button>
          </Link>
        </Flex>
      </Flex>
    );
  }

  return (
    <Container size="3">
      <FormHeader
        title="Edit Enrollment"
        subtitle="Update enrollment details"
      />

      <Box position="relative">
        {!isEditing && (
          <Box position="absolute" top="4" right="4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="icon">
                  <BiDotsVertical style={{ height: "16px", width: "16px" }} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" style={{ width: "192px" }}>
                <DropdownMenu.Item onClick={handleEditToggle}>
                  <MdEditSquare
                    style={{
                      marginRight: "8px",
                      height: "16px",
                      width: "16px",
                    }}
                  />
                  Edit enrollment
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  color="red"
                  onClick={handleDeleteClick}
                  disabled={deleteEnrollment.isPending}
                >
                  <BiTrash
                    style={{
                      marginRight: "8px",
                      height: "16px",
                      width: "16px",
                    }}
                  />
                  Delete enrollment
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>
        )}

        {isEditing ? (
          <EnrollForm
            initialValues={{
              user: currentEnroll.user,
              course: currentEnroll.course,
              status: currentEnroll.status,
              expires_at: currentEnroll.expires_at,
              lifetime_access: currentEnroll.lifetime_access,
              certification_url: currentEnroll.certification_url,
              certificate_id: currentEnroll.certificate_id,
              allow_download_certificate:
                currentEnroll.allow_download_certificate,
            }}
            isEdit
            enrollId={currentEnroll?._id}
          />
        ) : (
          <Box className="space-y-6">
            <div>
              <Text weight="bold" size="5" mb="2">
                {currentEnroll.user?.name}
              </Text>
              <Text color="gray" size="2">
                {currentEnroll.user?.email}
              </Text>
            </div>

            <div>
              <Text weight="medium" mb="1">
                Course
              </Text>
              <Text>{currentEnroll.course?.title}</Text>
            </div>

            <div>
              <Text weight="medium" mb="1">
                Status
              </Text>
              <Text className="capitalize">{currentEnroll.status}</Text>
            </div>

            <div>
              <Text weight="medium" mb="1">
                Access Type
              </Text>
              <Text>
                {currentEnroll.lifetime_access
                  ? "Lifetime Access"
                  : "Limited Time"}
              </Text>
            </div>

            {!currentEnroll.lifetime_access && currentEnroll.expires_at && (
              <div>
                <Text weight="medium" mb="1">
                  Expires At
                </Text>
                <Text>
                  {new Date(currentEnroll.expires_at).toLocaleDateString()}
                </Text>
              </div>
            )}

            <div>
              <Text weight="medium" mb="1">
                Enrolled On
              </Text>
              <Text>
                {new Date(currentEnroll.createdAt).toLocaleDateString()}
              </Text>
            </div>
          </Box>
        )}
      </Box>

      <AlertDialog.Root
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Enrollment</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this enrollment? This action cannot
            be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="default">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deleteEnrollment.isPending}
              >
                {deleteEnrollment.isPending ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Container>
  );
}
