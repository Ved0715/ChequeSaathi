'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/lib/validations';
import { transactionAPI, Transaction, PaymentMethod, TransactionType } from '@/lib/api/transactions';
import { customerAPI, Customer } from '@/lib/api/customers';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onSuccess }: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(transactionSchema),
  });

  // Fetch customers when dialog opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      reset({
        customerId: transaction.customerId,
        amount: transaction.amount,
        date: new Date(transaction.date).toISOString().split('T')[0],
        method: transaction.paymentMethod,
        type: transaction.type,
        category: transaction.category || '',
        reference: transaction.reference || '',
        notes: transaction.notes || '',
      });
    }
  }, [transaction, reset]);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ limit: 100 });
      setCustomers(response.customers);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const onSubmit = async (data: any) => {
    if (!transaction) return;

    try {
      setIsLoading(true);
      await transactionAPI.update(transaction.id, {
        ...data,
        amount: parseFloat(data.amount),
      });
      toast.success('Transaction updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating transaction:', error);
      }
      const message = error instanceof Error ? error.message : 'Failed to update transaction';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Customer Selection */}
            <div className="grid gap-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.businessName || customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-sm text-destructive">{errors.customerId.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Transaction Type */}
              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREDIT">Credit (Received)</SelectItem>
                        <SelectItem value="DEBIT">Debit (Paid)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Amount */}
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="grid gap-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register('date')} disabled={isLoading} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message as string}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="grid gap-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Controller
                  name="method"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="NEFT">NEFT</SelectItem>
                        <SelectItem value="RTGS">RTGS</SelectItem>
                        <SelectItem value="IMPS">IMPS</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Advance, Payment, Refund..."
                {...register('category')}
                disabled={isLoading}
              />
            </div>

            {/* Reference Number */}
            <div className="grid gap-2">
              <Label htmlFor="reference">Reference Number (Optional)</Label>
              <Input
                id="reference"
                placeholder="Transaction ID, Receipt #, etc."
                {...register('reference')}
                disabled={isLoading}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} disabled={isLoading} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
