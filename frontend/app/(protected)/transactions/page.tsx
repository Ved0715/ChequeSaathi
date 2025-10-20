'use client';

import { useState, useEffect } from 'react';
import { transactionAPI, Transaction, TransactionType, PaymentMethod } from '@/lib/api/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreateTransactionDialog } from '@/components/transactions/create-transaction-dialog';
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionAPI.getAll({
          search,
          type: typeFilter || undefined,
          method: methodFilter || undefined,
          page,
          limit: 10,
        });
        setTransactions(response.transactions);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching transactions:', error);
        }
        const message = error instanceof Error ? error.message : 'Failed to load transactions';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [search, typeFilter, methodFilter, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll({
        search,
        type: typeFilter || undefined,
        method: methodFilter || undefined,
        page,
        limit: 10,
      });
      setTransactions(response.transactions);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching transactions:', error);
      }
      const message = error instanceof Error ? error.message : 'Failed to load transactions';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: TransactionType) => {
    return type === TransactionType.CREDIT ? (
      <Badge className="bg-green-500">Credit (Received)</Badge>
    ) : (
      <Badge className="bg-red-500">Debit (Paid)</Badge>
    );
  };

  const getMethodBadge = (method: PaymentMethod) => {
    const variants: Record<PaymentMethod, string> = {
      CASH: 'bg-gray-600',
      UPI: 'bg-purple-500',
      NEFT: 'bg-blue-500',
      RTGS: 'bg-blue-600',
      IMPS: 'bg-blue-400',
      CARD: 'bg-orange-500',
      OTHER: 'bg-gray-500',
    };
    return <Badge className={variants[method]}>{method}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track cash and digital payments</p>
        </div>
        <CreateTransactionDialog onSuccess={fetchTransactions} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Types</option>
          <option value="CREDIT">Credit (Received)</option>
          <option value="DEBIT">Debit (Paid)</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="NEFT">NEFT</option>
          <option value="RTGS">RTGS</option>
          <option value="IMPS">IMPS</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {format(new Date(transaction.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{transaction.customer.name}</TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell className={transaction.type === TransactionType.CREDIT ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {transaction.type === TransactionType.CREDIT ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getMethodBadge(transaction.paymentMethod)}</TableCell>
                  <TableCell>{transaction.category || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transaction.reference || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTransaction(transaction)}
                        title="Edit transaction"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingTransaction(transaction)}
                        title="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        onSuccess={fetchTransactions}
      />

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
