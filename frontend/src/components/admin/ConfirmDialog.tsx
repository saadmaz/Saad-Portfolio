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
    <AlertDialogContent className="bg-white border-[#E5E7EB] text-[#0F172A] rounded-2xl shadow-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg font-black text-[#0F172A]">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-[#64748B] text-sm">{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel
          disabled={isLoading}
          className="bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] rounded-xl font-bold"
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
