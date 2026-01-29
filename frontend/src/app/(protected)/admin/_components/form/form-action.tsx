"use client";

import { useState } from "react";
import { Flex, AlertDialog } from "@radix-ui/themes";
import { Button } from "../button";
import { BiSave } from "react-icons/bi";
import { MdOutlineCancel } from "react-icons/md";
import { useRouter } from "next/navigation";

interface FormActionProps {
  actionType?: "create" | "update" | "save";
  saveLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  hasUnsavedChanges?: boolean;
  onConfirmCancel?: () => void;
}

export default function FormAction({
  actionType = "save",
  saveLabel,
  loading = false,
  disabled = false,
  hasUnsavedChanges = false,
  onConfirmCancel,
}: FormActionProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const defaultLabel = (() => {
    switch (actionType) {
      case "create":
        return "Create";
      case "update":
        return "Update";
      case "save":
      default:
        return "Save Changes";
    }
  })();

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowDialog(true);
    } else {
      router.back();
    }
  };

  const handleConfirmCancel = () => {
    setShowDialog(false);

    if (onConfirmCancel) {
      onConfirmCancel();
    } else {
      router.back();
    }
  };

  return (
    <>
      <Flex gap="2" justify="between" mt="4" align="center">
        <Button type="submit" disabled={loading || disabled}>
          <BiSave className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : saveLabel ?? defaultLabel}
        </Button>
        <Button
          type="button"
          variant="danger-outline"
          onClick={handleCancel}
          className="cursor-pointer"
        >
          <MdOutlineCancel className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </Flex>

      {/* Unsaved changes dialog */}
      <AlertDialog.Root open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialog.Content>
          <AlertDialog.Title className="font-semibold text-lg">
            Unsaved Changes
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-primary-dark">
            You have unsaved changes. Are you sure you want to leave?
          </AlertDialog.Description>
          <Flex justify="end" gap="3" mt="5">
            <AlertDialog.Cancel>
              <Button variant="default">Stay</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                className="cursor-pointer"
              >
                Leave
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
