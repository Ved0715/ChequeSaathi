'use client';

import { useState } from 'react';
import { transactionAPI, Transaction } from '@/lib/api/transactions';
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

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTransactionDialog({ transaction, open, onOpenChange, onSuccess }: DeleteTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!transaction) return;

    try {
      setIsLoading(true);
      await transactionAPI.delete(transaction.id);
      toast.success('Transaction deleted successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting transaction:', error);
      }
      const message = error instanceof Error ? error.message : 'Failed to delete transaction';
      toast.error(message);
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
            This will delete the transaction of <strong>₹{transaction?.amount.toLocaleString()}</strong>{' '}
            ({transaction?.type}) from <strong>{transaction?.customer.name}</strong>.
            <br />
            <br />
            This action cannot be undone. The transaction will be permanently removed from the system.
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
