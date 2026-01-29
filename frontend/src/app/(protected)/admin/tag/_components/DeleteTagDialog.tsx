import { AlertDialog, Flex, Button as RadixButton } from "@radix-ui/themes";

interface DeleteTagDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tagToDelete: { id: string; title: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const DeleteTagDialog = ({
  isOpen,
  onOpenChange,
  tagToDelete,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteTagDialogProps) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>Delete Tag</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure you want to delete &quot;{tagToDelete?.title}&quot;? This
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
              {isLoading ? "Deleting..." : "Delete Tag"}
            </RadixButton>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
