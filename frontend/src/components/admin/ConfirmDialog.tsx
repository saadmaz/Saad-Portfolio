/**
 * Shared delete-confirmation dialog used across all admin pages.
 * Replaces all window.confirm() calls with a styled AlertDialog.
 */
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title = 'Delete Item?',
  description = 'This action is permanent and cannot be undone.',
  confirmLabel = 'Delete',
  isLoading = false,
  onConfirm,
}) => (
  <AlertDialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
    <AlertDialogContent className="bg-[#111] border-white/10 text-white rounded-2xl shadow-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg font-black">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-white/50 text-sm">{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel
          disabled={isLoading}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          disabled={isLoading}
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-black border-0 shadow-lg shadow-red-500/20"
        >
          {isLoading ? 'Deleting…' : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
