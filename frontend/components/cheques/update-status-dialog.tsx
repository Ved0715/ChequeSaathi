'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { chequeAPI, Cheque, ChequeStatus } from '@/lib/api/cheques';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface UpdateStatusDialogProps {
  cheque: Cheque | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateStatusDialog({ cheque, open, onOpenChange, onSuccess }: UpdateStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<ChequeStatus>(ChequeStatus.RECEIVED);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Reset form when cheque changes
  useEffect(() => {
    if (cheque) {
      // Determine next possible status
      const nextStatus = getNextStatus(cheque.status);
      setNewStatus(nextStatus);

      reset({
        depositDate: new Date().toISOString().split('T')[0],
        clearedDate: new Date().toISOString().split('T')[0],
        bouncedDate: new Date().toISOString().split('T')[0],
        bounceReason: '',
      });
    }
  }, [cheque, reset]);

  const getNextStatus = (currentStatus: ChequeStatus): ChequeStatus => {
    switch (currentStatus) {
      case ChequeStatus.RECEIVED:
        return ChequeStatus.DEPOSITED;
      case ChequeStatus.DEPOSITED:
        return ChequeStatus.CLEARED;
      default:
        return currentStatus;
    }
  };

  const getStatusOptions = (currentStatus: ChequeStatus): ChequeStatus[] => {
    switch (currentStatus) {
      case ChequeStatus.RECEIVED:
        return [ChequeStatus.DEPOSITED];
      case ChequeStatus.DEPOSITED:
        return [ChequeStatus.CLEARED, ChequeStatus.BOUNCED];
      case ChequeStatus.CLEARED:
      case ChequeStatus.BOUNCED:
        return []; // Final states
      default:
        return [];
    }
  };

  const onSubmit = async (data: any) => {
    if (!cheque) return;

    try {
      setIsLoading(true);

      const updateData: any = { status: newStatus };

      // Add status-specific fields
      if (newStatus === ChequeStatus.DEPOSITED) {
        updateData.depositDate = data.depositDate;
      } else if (newStatus === ChequeStatus.CLEARED) {
        updateData.clearedDate = data.clearedDate;
      } else if (newStatus === ChequeStatus.BOUNCED) {
        updateData.bouncedDate = data.bouncedDate;
        updateData.bounceReason = data.bounceReason;
      }

      await chequeAPI.updateStatus(cheque.id, updateData);
      toast.success(`Cheque status updated to ${newStatus}`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating cheque status:', error);
      }
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cheque) return null;

  const statusOptions = getStatusOptions(cheque.status);

  // If cheque is in final state, don't allow status update
  if (statusOptions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Cheque Status</DialogTitle>
            <DialogDescription>
              This cheque is in a final state ({cheque.status}) and cannot be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Cheque Status</DialogTitle>
          <DialogDescription>
            Current status: <strong>{cheque.status}</strong>
            <br />
            Cheque #{cheque.chequeNumber} - ₹{cheque.amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Status Selection */}
            <div className="grid gap-2">
              <Label htmlFor="status">New Status *</Label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ChequeStatus)}
                className="px-3 py-2 border rounded-md"
                disabled={isLoading}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Deposit Date - shown when status is DEPOSITED */}
            {newStatus === ChequeStatus.DEPOSITED && (
              <div className="grid gap-2">
                <Label htmlFor="depositDate">Deposit Date *</Label>
                <Input
                  id="depositDate"
                  type="date"
                  {...register('depositDate', { required: true })}
                  disabled={isLoading}
                />
                {errors.depositDate && (
                  <p className="text-sm text-destructive">Deposit date is required</p>
                )}
              </div>
            )}

            {/* Cleared Date - shown when status is CLEARED */}
            {newStatus === ChequeStatus.CLEARED && (
              <div className="grid gap-2">
                <Label htmlFor="clearedDate">Cleared Date *</Label>
                <Input
                  id="clearedDate"
                  type="date"
                  {...register('clearedDate', { required: true })}
                  disabled={isLoading}
                />
                {errors.clearedDate && (
                  <p className="text-sm text-destructive">Cleared date is required</p>
                )}
              </div>
            )}

            {/* Bounced fields - shown when status is BOUNCED */}
            {newStatus === ChequeStatus.BOUNCED && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="bouncedDate">Bounced Date *</Label>
                  <Input
                    id="bouncedDate"
                    type="date"
                    {...register('bouncedDate', { required: true })}
                    disabled={isLoading}
                  />
                  {errors.bouncedDate && (
                    <p className="text-sm text-destructive">Bounced date is required</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bounceReason">Bounce Reason</Label>
                  <Textarea
                    id="bounceReason"
                    placeholder="e.g., Insufficient funds, signature mismatch..."
                    {...register('bounceReason')}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
