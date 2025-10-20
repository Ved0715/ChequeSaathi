'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chequeSchema } from '@/lib/validations';
import { chequeAPI, ChequeType, ChequeDirection } from '@/lib/api/cheques';
import { customerAPI, Customer } from '@/lib/api/customers';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CreateChequeDialogProps {
  onSuccess?: () => void;
}

export function CreateChequeDialog({ onSuccess }: CreateChequeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(chequeSchema),
    defaultValues: {
      customerId: '',
      chequeNumber: '',
      amount: 0,
      bankName: '',
      branchName: '',
      ifscCode: '',
      chequeType: 'POST_DATED' as ChequeType,
      direction: 'RECEIVABLE' as ChequeDirection,
      drawerName: '',
      payeeName: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // Fetch customers when dialog opens
  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll({ limit: 100 });
      setCustomers(response.customers);
    } catch (error: any) {
      toast.error('Failed to load customers');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await chequeAPI.create({
        ...data,
        amount: parseFloat(data.amount),
      });
      toast.success('Cheque created successfully');
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating cheque:', error);
      }
      toast.error(error.message || 'Failed to create cheque');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Cheque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Cheque</DialogTitle>
          <DialogDescription>
            Record a new cheque. All fields marked with * are required.
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
              {/* Cheque Number */}
              <div className="grid gap-2">
                <Label htmlFor="chequeNumber">Cheque Number *</Label>
                <Input id="chequeNumber" {...register('chequeNumber')} disabled={isLoading} />
                {errors.chequeNumber && (
                  <p className="text-sm text-destructive">{errors.chequeNumber.message as string}</p>
                )}
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

            {/* Bank Name */}
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input id="bankName" {...register('bankName')} disabled={isLoading} />
              {errors.bankName && (
                <p className="text-sm text-destructive">{errors.bankName.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Branch Name */}
              <div className="grid gap-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input id="branchName" {...register('branchName')} disabled={isLoading} />
              </div>

              {/* IFSC Code */}
              <div className="grid gap-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" {...register('ifscCode')} disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Cheque Type */}
              <div className="grid gap-2">
                <Label htmlFor="chequeType">Cheque Type *</Label>
                <Controller
                  name="chequeType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AT_SIGHT">At Sight</SelectItem>
                        <SelectItem value="POST_DATED">Post Dated (PDC)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Direction */}
              <div className="grid gap-2">
                <Label htmlFor="direction">Direction *</Label>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECEIVABLE">Receivable (We Receive)</SelectItem>
                        <SelectItem value="PAYABLE">Payable (We Pay)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Drawer Name */}
              <div className="grid gap-2">
                <Label htmlFor="drawerName">Drawer Name *</Label>
                <Input id="drawerName" placeholder="Who wrote the cheque" {...register('drawerName')} disabled={isLoading} />
                {errors.drawerName && (
                  <p className="text-sm text-destructive">{errors.drawerName.message as string}</p>
                )}
              </div>

              {/* Payee Name */}
              <div className="grid gap-2">
                <Label htmlFor="payeeName">Payee Name *</Label>
                <Input id="payeeName" placeholder="Beneficiary" {...register('payeeName')} disabled={isLoading} />
                {errors.payeeName && (
                  <p className="text-sm text-destructive">{errors.payeeName.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Issue Date */}
              <div className="grid gap-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input id="issueDate" type="date" {...register('issueDate')} disabled={isLoading} />
                {errors.issueDate && (
                  <p className="text-sm text-destructive">{errors.issueDate.message as string}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" {...register('dueDate')} disabled={isLoading} />
                {errors.dueDate && (
                  <p className="text-sm text-destructive">{errors.dueDate.message as string}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} disabled={isLoading} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Cheque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
