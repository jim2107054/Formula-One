import { AlertDialog, Flex, Button as RadixButton } from "@radix-ui/themes";

interface DeleteEnrollDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  enrollToDelete: { id: string; label?: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const DeleteEnrollDialog = ({
  isOpen,
  onOpenChange,
  enrollToDelete,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteEnrollDialogProps) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete Enrollment</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete enrollment for &quot;
          {enrollToDelete?.label || "this user"}
          &quot;? This action cannot be undone.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <RadixButton
              variant="soft"
              color="gray"
              onClick={onCancel}
              className="!cursor-pointer"
            >
              Cancel
            </RadixButton>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <RadixButton
              variant="solid"
              color="red"
              onClick={onConfirm}
              disabled={isLoading}
              className="!cursor-pointer"
            >
              {isLoading ? "Deleting..." : "Delete Enrollment"}
            </RadixButton>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
