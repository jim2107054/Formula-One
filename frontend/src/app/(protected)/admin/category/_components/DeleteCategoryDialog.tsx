import { AlertDialog, Flex, Button as RadixButton } from "@radix-ui/themes";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToDelete: { _id: string; title: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const DeleteCategoryDialog = ({
  isOpen,
  onOpenChange,
  categoryToDelete,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteCategoryDialogProps) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete Category</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete &quot;{categoryToDelete?.title}&quot;?
          This action cannot be undone.
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
              {isLoading ? "Deleting..." : "Delete Category"}
            </RadixButton>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
