'use client';

import { useState } from 'react';
import { chequeAPI, Cheque } from '@/lib/api/cheques';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteChequeDialogProps {
  cheque: Cheque | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteChequeDialog({ cheque, open, onOpenChange, onSuccess }: DeleteChequeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!cheque) return;

    try {
      setIsLoading(true);
      await chequeAPI.delete(cheque.id);
      toast.success('Cheque deleted successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting cheque:', error);
      }
      toast.error(error.message || 'Failed to delete cheque');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete cheque <strong>#{cheque?.chequeNumber}</strong> from{' '}
            <strong>{cheque?.customer.name}</strong> for{' '}
            <strong>₹{cheque?.amount.toLocaleString()}</strong>.
            <br />
            <br />
            This action cannot be undone. The cheque will be permanently removed from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
