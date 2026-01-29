"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Checkbox,
  ChevronDownIcon,
  Flex,
  Popover,
  Select,
  Text,
} from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
  CreateEnrollRequest,
  EnrollmentStatus,
  PopulatedCourseInsideEnroll,
  PopulatedUserInsideEnroll,
} from "@/zustand/types/enroll";

import {
  useCreateEnrollment,
  useUpdateEnrollment,
} from "@/hooks/queries/useEnrollmentQueries";
import { UserSearch } from "../../_components/search-selector";
import FormAction from "../../_components/form/form-action";
import ModuleSearch from "../../_components/search-selector/module-searchbar"; // Added
import { InputLabel } from "../../_components/input-label";
import { BiCalendar } from "react-icons/bi";

type FormValues = {
  course: string | PopulatedCourseInsideEnroll;
  status: EnrollmentStatus;
  expires_at: string | null;
  lifetime_access: boolean;
  certificate_id?: string;
  allow_download_certificate?: boolean;
};

interface EnrollFormProps {
  initialValues?: {
    user?: PopulatedUserInsideEnroll;
    course?: PopulatedCourseInsideEnroll;
    status?: EnrollmentStatus;
    expires_at?: string | null;
    lifetime_access?: boolean;
    certification_url?: string | null;
    certificate_id?: string | null;
    allow_download_certificate?: boolean;
  };
  isEdit?: boolean;
  enrollId?: string;
}

export default function EnrollForm({
  initialValues,
  isEdit = false,
  enrollId,
}: EnrollFormProps) {
  const router = useRouter();

  const createEnrollment = useCreateEnrollment({
    onSuccess: () => {
      router.push("/admin/enrollment");
    },
  });

  const updateEnrollment = useUpdateEnrollment({
    onSuccess: () => {
      router.push("/admin/enrollment");
    },
  });

  const [selectedUserId, setSelectedUserId] = useState(
    initialValues?.user?._id || ""
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialValues?.course?._id || ""
  );
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      course: initialValues?.course?._id || "",
      status: initialValues?.status || "pending",
      expires_at: initialValues?.expires_at
        ? new Date(initialValues.expires_at).toISOString().split("T")[0]
        : null,
      lifetime_access:
        initialValues?.lifetime_access ??
        (isEdit ? !initialValues?.expires_at : false),
      certificate_id: initialValues?.certificate_id || "",
      allow_download_certificate:
        initialValues?.allow_download_certificate ?? false,
    },
  });

  const isCertificateAvailable = initialValues?.course?.isCertificateAvailable;

  useEffect(() => {
    if (initialValues && isEdit) {
      const hasExpiryDate = !!initialValues.expires_at;
      reset({
        course: initialValues.course?._id || "",
        status: initialValues.status || "pending",
        expires_at:
          hasExpiryDate && initialValues.expires_at
            ? new Date(initialValues.expires_at).toISOString().split("T")[0]
            : null,
        lifetime_access: !hasExpiryDate, // If no expiry date, it's lifetime access
        certificate_id: initialValues.certificate_id || "",
        allow_download_certificate:
          initialValues.allow_download_certificate ?? false,
      });
      if (initialValues.user?._id) setSelectedUserId(initialValues.user._id);
      if (initialValues.course?._id)
        setSelectedCourseId(initialValues.course._id);
    }
  }, [initialValues, reset, isEdit]);

  const handleCourseChange = (id: string) => {
    if (id) {
      setSelectedCourseId(id);
    } else {
      setSelectedCourseId("");
    }
  };

  const handleUserChange = (id: string) => {
    if (id) {
      setSelectedUserId(id);
    } else {
      setSelectedUserId("");
    }
  };

  const onSubmit = async (data: FormValues) => {
    const courseId = isEdit ? initialValues?.course?._id : selectedCourseId;

    const userId = isEdit ? initialValues?.user?._id : selectedUserId;

    if (!userId || !courseId) {
      console.warn("❌ Missing user or module!");
      toast.error("Please select both a user and a module");
      return;
    }

    if (isEdit && enrollId) {
      if (certificateFile || data.certificate_id) {
        const formData = new FormData();
        formData.append("status", data.status || "pending");
        formData.append(
          "expires_at",
          data.lifetime_access ? "" : data.expires_at || ""
        );

        if (certificateFile) {
          formData.append("certificate", certificateFile);
        }

        if (data.certificate_id) {
          formData.append("certificate_id", data.certificate_id);
        }

        if (data.allow_download_certificate !== undefined) {
          formData.append(
            "allow_download_certificate",
            String(data.allow_download_certificate)
          );
        }

        updateEnrollment.mutate({ id: enrollId, data: formData });
      } else {
        // Regular update without file upload
        const enrollData: CreateEnrollRequest = {
          user: userId,
          course: courseId,
          status: data.status || "pending",
          expires_at: data.lifetime_access
            ? null
            : data.expires_at || undefined,
        };

        updateEnrollment.mutate({ id: enrollId, data: enrollData });
      }
    } else {
      const enrollData: CreateEnrollRequest = {
        user: userId,
        course: courseId,
        status: data.status || "pending",
        expires_at: data.lifetime_access ? null : data.expires_at || undefined,
      };

      createEnrollment.mutate(enrollData);
    }
  };

  const DisabledField = ({
    label,
    value,
  }: {
    label: string;
    value?: string;
  }) => (
    <Box mb="6">
      <Text
        as="label"
        size="3"
        weight="bold"
        mb="2"
        style={{ display: "block" }}
      >
        {label}
      </Text>
      <input
        value={value || ""}
        disabled
        className="w-full p-2 rounded bg-gray-100"
      />
    </Box>
  );

  // Check if all prerequisites are selected (only for create mode)
  const allPrerequisitesSelected = Boolean(selectedUserId && selectedCourseId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card mt="4">
        <Flex direction="column" justify="between" p="4">
          {/* User */}
          {isEdit ? (
            <DisabledField
              label="Enrolled Student"
              value={initialValues?.user?.name}
            />
          ) : (
            <Box mb="6">
              <InputLabel required>Select Student</InputLabel>
              <UserSearch
                role={0}
                value={selectedUserId}
                onChange={handleUserChange}
                placeholder="Search for a student..."
              />
            </Box>
          )}

          {/* Module */}
          {isEdit ? (
            <DisabledField
              label="Enrolled module"
              value={initialValues?.course?.title}
            />
          ) : (
            <Box mb="6">
              <InputLabel required>Select Module</InputLabel>
              <ModuleSearch
                value={selectedCourseId}
                onSelectModule={handleCourseChange}
                placeholder="Search or select a module..."
                width="100%"
              />
            </Box>
          )}

          {/* Status and other fields - Show in reduced opacity when prerequisites not selected */}
          <Box
            style={{
              opacity: !isEdit && !allPrerequisitesSelected ? 0.5 : 1,
              pointerEvents:
                !isEdit && !allPrerequisitesSelected ? "none" : "auto",
              transition: "opacity 0.2s ease",
              cursor:
                !isEdit && !allPrerequisitesSelected ? "not-allowed" : "auto",
            }}
          >
            {/* Status */}
            <Box mb="6">
              <InputLabel required>Status</InputLabel>
              <Select.Root
                value={watch("status")}
                onValueChange={(value: EnrollmentStatus) =>
                  setValue("status", value)
                }
                disabled={!isEdit && !allPrerequisitesSelected}
              >
                <Select.Trigger
                  placeholder="Select status"
                  variant="surface"
                  style={{ width: "100%" }}
                  className="!cursor-pointer"
                />
                <Select.Content>
                  <Select.Item
                    value="pending"
                    className="!cursor-pointer hover:!bg-accent"
                  >
                    Pending
                  </Select.Item>
                  <Select.Item
                    value="paid"
                    className="!cursor-pointer hover:!bg-accent"
                  >
                    Paid
                  </Select.Item>
                  <Select.Item
                    value="canceled"
                    className="!cursor-pointer hover:!bg-accent"
                  >
                    Canceled
                  </Select.Item>
                  <Select.Item
                    value="refunded"
                    className="!cursor-pointer hover:!bg-accent"
                  >
                    Refunded
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            {/* Lifetime Access - hide if expiry date is set */}
            {!watch("expires_at") && (
              <Box mb="6" className="w-fit">
                <Flex gap="2" align="center">
                  <Checkbox
                    checked={watch("lifetime_access")}
                    onCheckedChange={(checked) =>
                      setValue("lifetime_access", checked === true, {
                        shouldDirty: true,
                      })
                    }
                    disabled={!isEdit && !allPrerequisitesSelected}
                    variant="surface"
                    color="cyan"
                    size="1"
                    className="!cursor-pointer"
                    mb="2"
                  />
                  <InputLabel tooltip="Grant lifetime access to this module">
                    Lifetime Access
                  </InputLabel>
                </Flex>
              </Box>
            )}

            {/* Expiry Date - hide if lifetime access is checked */}
            {!watch("lifetime_access") && (
              <Box mb="6">
                <InputLabel>Expiry Date</InputLabel>
                <Popover.Root>
                  <Popover.Trigger>
                    <Button
                      variant="soft"
                      disabled={!isEdit && !allPrerequisitesSelected}
                      className="!cursor-pointer"
                    >
                      <Flex align="center" gap="2" className="text-accent">
                        <BiCalendar />
                        {watch("expires_at")
                          ? format(new Date(watch("expires_at")!), "PPP")
                          : "Select expiry date"}
                      </Flex>
                      <ChevronDownIcon />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content align="center">
                    <DayPicker
                      mode="single"
                      selected={
                        watch("expires_at")
                          ? (() => {
                              const [year, month, day] = watch("expires_at")!
                                .split("-")
                                .map(Number);
                              return new Date(year, month - 1, day);
                            })()
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          // Convert to local date string (YYYY-MM-DD) without timezone conversion
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          const localDateString = `${year}-${month}-${day}`;

                          setValue("expires_at", localDateString, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      disabled={(date) => {
                        // Disable dates before today (compare only the date part, not time)
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      // Use native DayPicker styling classes (rdp-*)
                      className="rdp"
                      styles={{
                        root: {
                          margin: 0,
                          fontFamily: "var(--font-family)",
                        },
                        day: {
                          fontSize: "var(--font-size-2)",
                          padding: "var(--space-1)",
                        },
                      }}
                      showOutsideDays={true}
                    />
                  </Popover.Content>
                </Popover.Root>
                {errors.expires_at && (
                  <Text size="1" color="red" mt="1">
                    {errors.expires_at.message}
                  </Text>
                )}
              </Box>
            )}

            {/* Certificate Section - Only show in edit mode if module has certificates */}
            {isEdit && isCertificateAvailable && (
              <>
                <Box mb="6">
                  <Text
                    as="label"
                    size="3"
                    weight="bold"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    Certificate ID
                  </Text>
                  <input
                    type="text"
                    {...register("certificate_id")}
                    placeholder="Enter unique certificate ID"
                    className="w-full p-2 border rounded"
                  />
                  <Text size="1" color="gray" mt="1">
                    Unique identifier for this certificate
                  </Text>
                </Box>

                <Box mb="6">
                  <Text
                    as="label"
                    size="3"
                    weight="bold"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    Certificate File
                  </Text>
                  {initialValues?.certification_url && (
                    <Box mb="2">
                      <Text size="2" color="gray">
                        Current certificate:{" "}
                        <a
                          href={initialValues.certification_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Certificate
                        </a>
                      </Text>
                    </Box>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCertificateFile(file);
                      }
                    }}
                    className="w-full p-2 border rounded"
                  />
                  <Text size="1" color="gray" mt="1">
                    Upload PDF, JPG, or PNG file (optional - only if updating)
                  </Text>
                </Box>

                <Box mb="6">
                  <Text
                    as="label"
                    size="3"
                    weight="bold"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    Allow Certificate Download
                  </Text>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register("allow_download_certificate")}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                    />
                    <Text size="2">
                      Allow student to download the certificate
                    </Text>
                  </div>
                </Box>
              </>
            )}
          </Box>
        </Flex>
      </Card>

      {/* Form Actions - Show only when prerequisites are selected or in edit mode */}
      {(isEdit || allPrerequisitesSelected) && (
        <FormAction
          saveLabel={
            isEdit
              ? updateEnrollment.isPending
                ? "Updating..."
                : "Update Enrollment"
              : createEnrollment.isPending
              ? "Creating..."
              : "Create Enrollment"
          }
          loading={createEnrollment.isPending || updateEnrollment.isPending}
          hasUnsavedChanges={isDirty}
        />
      )}
    </form>
  );
}
