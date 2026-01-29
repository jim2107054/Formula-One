import { AlertDialog, Flex, Button as RadixButton } from "@radix-ui/themes";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete: { id: string; name: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const DeleteUserDialog = ({
  isOpen,
  onOpenChange,
  userToDelete,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteUserDialogProps) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete User</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete &quot;{userToDelete?.name}&quot;? This
          action cannot be undone.
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
              {isLoading ? "Deleting..." : "Delete User"}
            </RadixButton>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
